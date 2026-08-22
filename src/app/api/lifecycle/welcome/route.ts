import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendTrialEndingEmail } from '@/src/lib/server/lifecycleEmails'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Dispara e-mail de lifecycle (welcome / trial-ending) após a criação da conta.
 * Chamado no cliente após signup bem-sucedido.
 */
export async function POST(req: NextRequest) {
  let body: { type?: 'welcome' | 'trial-ending'; email?: string; name?: string; daysLeft?: number; trialEndsAt?: string }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const type = body.type
  const email = body.email?.trim()
  if (!type || !email) {
    return errorJson('type e email obrigatórios', 400)
  }

  try {
    if (type === 'welcome') {
      const r = await sendWelcomeEmail(email, { name: body.name })
      if (!r.sent) return errorJson(r.skipped || 'Falha ao enviar e-mail', 502)
      return NextResponse.json({ ok: true })
    }
    if (type === 'trial-ending') {
      const r = await sendTrialEndingEmail(email, {
        daysLeft: Number(body.daysLeft ?? 0),
        trialEndsAt: body.trialEndsAt || new Date().toISOString(),
      })
      if (!r.sent) return errorJson(r.skipped || 'Falha ao enviar e-mail', 502)
      return NextResponse.json({ ok: true })
    }
    return errorJson('tipo de e-mail inválido', 400)
  } catch (err) {
    return errorJson(err instanceof Error ? err.message : 'Falha ao enviar e-mail', 500)
  }
}
