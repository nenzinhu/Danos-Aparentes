import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { createSignatureToken } from '@/src/lib/server/signatureLink'
import { getTrustedBaseUrl } from '@/src/lib/server/trustedBaseUrl'

/**
 * Gera um link de assinatura remota com token HMAC (7 dias).
 * Só o dono da vistoria (JWT) pode criar.
 */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const body = await req.json().catch(() => ({}))
  const inspectionId = String(body.inspectionId || body.id || '').trim()
  if (!inspectionId) {
    return NextResponse.json({ error: 'inspectionId obrigatório' }, { status: 400 })
  }

  const { data: inspection, error } = await supabaseAdmin
    .from('vehicle_inspections')
    .select('id')
    .eq('id', inspectionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[create-signature-link]', error)
    return NextResponse.json({ error: 'Erro ao validar vistoria' }, { status: 500 })
  }
  if (!inspection) {
    return NextResponse.json({ error: 'Vistoria não encontrada' }, { status: 404 })
  }

  try {
    const { token, expiresAt } = createSignatureToken(inspectionId)
    const origin = getTrustedBaseUrl({
      origin: req.headers.get('origin'),
      host: req.headers.get('host'),
    })
    const url = `${origin}/assinar/${encodeURIComponent(token)}`
    return NextResponse.json({ url, token, expiresAt })
  } catch (err) {
    console.error('[create-signature-link] secret:', err)
    return NextResponse.json({ error: 'Serviço de links não configurado' }, { status: 500 })
  }
}
