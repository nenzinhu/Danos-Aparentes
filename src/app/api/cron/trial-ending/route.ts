import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { isMailerConfigured } from '@/src/lib/server/mailer'
import { sendTrialEndingEmail } from '@/src/lib/server/lifecycleEmails'
import { captureServerException } from '@/src/lib/monitoring/capture'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * GET — cron diário: trials que terminam em ≤48h e ainda não receberam aviso.
 * Header: Authorization: Bearer $CRON_SECRET
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization') || ''
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isMailerConfigured()) {
    return NextResponse.json({ ok: true, skipped: 'smtp_not_configured', sent: 0 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const now = Date.now()
  const in48h = new Date(now + 48 * 60 * 60 * 1000).toISOString()
  const nowIso = new Date(now).toISOString()

  try {
    const { data: rows, error } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, trial_ends_at, trial_ending_email_sent_at, status')
      .eq('status', 'trialing')
      .is('trial_ending_email_sent_at', null)
      .gte('trial_ends_at', nowIso)
      .lte('trial_ends_at', in48h)
      .limit(80)

    if (error) throw error

    let sent = 0
    let failed = 0

    for (const row of rows || []) {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(row.user_id)
      if (userErr || !userData.user?.email) {
        failed++
        continue
      }
      const ends = new Date(row.trial_ends_at).getTime()
      const daysLeft = Math.max(0, Math.ceil((ends - now) / 86_400_000))
      try {
        const result = await sendTrialEndingEmail(userData.user.email, {
          daysLeft,
          trialEndsAt: row.trial_ends_at,
        })
        if (result.sent) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ trial_ending_email_sent_at: new Date().toISOString() })
            .eq('user_id', row.user_id)
          sent++
        }
      } catch (err) {
        failed++
        await captureServerException(err, { route: 'cron-trial-ending', user_id: row.user_id })
      }
    }

    return NextResponse.json({ ok: true, candidates: rows?.length ?? 0, sent, failed })
  } catch (err) {
    await captureServerException(err, { route: 'cron-trial-ending' })
    console.error('[cron/trial-ending]', err)
    return NextResponse.json({ error: 'Falha no cron' }, { status: 500 })
  }
}
