import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { createHmac } from 'crypto'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://danosaparentes.com.br'

function makeInviteToken(email: string, secret: string): string {
  const payload = `${email.toLowerCase()}.${Date.now() + 7 * 24 * 60 * 60 * 1000}`
  return `${Buffer.from(payload).toString('base64url')}.${createHmac('sha256', secret).update(payload).digest('base64url')}`
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user?.id) return errorJson('Não autenticado', 401)
  if (!supabaseAdmin) return errorJson('Serviço indisponível', 503)

  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }
  const email = (body.email || '').trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return errorJson('E-mail inválido', 400)
  }

  try {
    // Dono da empresa (tenant) convida.
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (!company) {
      return errorJson('Apenas o responsável pela empresa pode convidar membros.', 403)
    }

    // Evita duplicar convite pendente.
    const { data: existing } = await supabaseAdmin
      .from('team_members')
      .select('invited_email, status')
      .eq('company_id', company.id)
      .eq('invited_email', email)
      .maybeSingle()
    if (existing && existing.status === 'pending') {
      const token = makeInviteToken(email, process.env.SIGNATURE_LINK_SECRET || user.id)
      return NextResponse.json({ inviteUrl: `${APP_URL.replace(/\/$/, '')}/convite?token=${token}` })
    }

    await supabaseAdmin
      .from('team_members')
      .upsert(
        { company_id: company.id, invited_email: email, status: 'pending', invited_at: new Date().toISOString() },
        { onConflict: 'company_id,invited_email' },
      )

    const token = makeInviteToken(email, process.env.SIGNATURE_LINK_SECRET || user.id)
    return NextResponse.json({ inviteUrl: `${APP_URL.replace(/\/$/, '')}/convite?token=${token}` })
  } catch (err) {
    console.error('[team-invite]', err)
    return errorJson('Falha ao gerar convite', 500)
  }
}
