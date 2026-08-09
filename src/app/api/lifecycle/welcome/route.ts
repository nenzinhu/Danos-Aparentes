import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { isMailerConfigured } from '@/src/lib/server/mailer'
import { sendWelcomeEmail } from '@/src/lib/server/lifecycleEmails'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { captureServerException } from '@/src/lib/monitoring/capture'

export const runtime = 'nodejs'

/** POST — envia welcome 1× por usuário (após signup). Requer Bearer. */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { allowed } = await checkRateLimit(`welcome-email:${user.id}`, 3, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Limite de e-mails' }, { status: 429 })
  }

  if (!isMailerConfigured()) {
    return NextResponse.json({ ok: true, skipped: 'smtp_not_configured' })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  try {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('welcome_email_sent_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (sub?.welcome_email_sent_at) {
      return NextResponse.json({ ok: true, skipped: 'already_sent' })
    }

    const result = await sendWelcomeEmail(user.email, {
      name: user.email.split('@')[0],
    })

    if (result.sent) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq('user_id', user.id)
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    await captureServerException(err, { route: 'lifecycle-welcome' })
    console.error('[lifecycle/welcome]', err)
    return NextResponse.json({ error: 'Falha ao enviar welcome' }, { status: 500 })
  }
}
