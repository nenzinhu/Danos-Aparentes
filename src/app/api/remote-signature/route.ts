import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { getClientIp } from '@/src/lib/server/auth'
import {
  isSignaturePayloadTooLarge,
  verifySignatureToken,
} from '@/src/lib/server/signatureLink'

// Rota pública — o cliente assina pelo celular a partir de um link com token
// HMAC de curta duração (não o UUID cru da vistoria).

function resolveInspectionId(req: NextRequest, bodyToken?: string): string | null {
  const token =
    bodyToken ||
    req.nextUrl.searchParams.get('token') ||
    req.nextUrl.searchParams.get('id') ||
    ''
  if (!token) return null
  return verifySignatureToken(token)
}

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const ip = getClientIp(req)
  const { allowed, retryAfterSec } = await checkRateLimit(`remote-sig-get:${ip}`, 30, 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    )
  }

  const id = resolveInspectionId(req)
  if (!id) {
    return NextResponse.json({ error: 'Link inválido ou expirado' }, { status: 400 })
  }

  const { data: inspection } = await supabaseAdmin
    .from('vehicle_inspections')
    .select('id, plate, brand, vehicle_type_desc, owner, client_signature')
    .eq('id', id)
    .maybeSingle()

  if (!inspection) {
    return NextResponse.json({ error: 'Vistoria não encontrada' }, { status: 404 })
  }

  const { data: damages } = await supabaseAdmin
    .from('damages')
    .select('part_name, type_name, severity')
    .eq('inspection_id', id)

  return NextResponse.json({
    plate: inspection.plate,
    brand: inspection.brand,
    vehicleTypeDesc: inspection.vehicle_type_desc,
    owner: inspection.owner,
    alreadySigned: !!inspection.client_signature,
    damages: (damages ?? []).map((d) => ({
      partName: d.part_name,
      typeName: d.type_name,
      severity: d.severity,
    })),
  })
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const ip = getClientIp(req)
  const { allowed, retryAfterSec } = await checkRateLimit(`remote-sig:${ip}`, 10, 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    )
  }

  const body = await req.json().catch(() => ({}))
  const token = String(body.token || body.id || '')
  const signature = String(body.signature || '')
  const id = verifySignatureToken(token)

  if (!id || !signature.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Dados inválidos ou link expirado' }, { status: 400 })
  }

  if (isSignaturePayloadTooLarge(signature)) {
    return NextResponse.json({ error: 'Assinatura muito grande' }, { status: 413 })
  }

  const { data: updated, error } = await supabaseAdmin
    .from('vehicle_inspections')
    .update({ client_signature: signature })
    .eq('id', id)
    .eq('client_signature', '')
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('Erro ao registrar assinatura remota:', error)
    return NextResponse.json({ error: 'Não foi possível registrar a assinatura' }, { status: 500 })
  }

  if (!updated) {
    return NextResponse.json({ error: 'Esta vistoria já foi assinada ou não existe' }, { status: 409 })
  }

  return NextResponse.json({ success: true })
}
