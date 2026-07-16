// src/app/api/create-pix-charge/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { getClientIp, getUserFromRequest } from '@/src/lib/server/auth'
import { createPixCharge } from '@/src/lib/server/pixClient'
import { checkRateLimit } from '@/src/lib/server/rateLimit'

/** Máx. cobranças PIX por usuário — evita spam no MP e pending_pix repetido. */
const PIX_CHARGE_LIMIT_PER_USER = 8
const PIX_CHARGE_LIMIT_PER_IP = 12
const PIX_CHARGE_WINDOW_MS = 10 * 60 * 1000

type PixChargeResponse = {
  id?: string | number
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
    }
  }
}

/**
 * Endpoint called from the front‑end when the user selects "PIX" as payment method.
 * It creates a PIX charge via Mercado Pago, stores a pending subscription in Supabase
 * and returns the QR code / copy‑paste string to the client.
 */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (!user.email) {
    return NextResponse.json(
      { error: 'Sua conta não tem e-mail. Atualize o perfil antes de pagar com PIX.' },
      { status: 400 },
    )
  }

  const { allowed, retryAfterSec } = await checkRateLimit(
    `pix-charge:${user.id}`,
    PIX_CHARGE_LIMIT_PER_USER,
    PIX_CHARGE_WINDOW_MS,
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    )
  }

  const ip = getClientIp(req)
  const ipLimit = await checkRateLimit(
    `pix-charge-ip:${ip}`,
    PIX_CHARGE_LIMIT_PER_IP,
    PIX_CHARGE_WINDOW_MS,
  )
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSec) } },
    )
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const durationRaw = Number(req.nextUrl.searchParams.get('duration') ?? '1')
  const duration = Number.isFinite(durationRaw) && durationRaw > 0 ? Math.min(Math.floor(durationRaw), 24) : 1
  const amountCents = 4990 * duration

  let charge: PixChargeResponse
  try {
    charge = (await createPixCharge(amountCents, user.email)) as PixChargeResponse
  } catch (err) {
    console.error('[create-pix-charge] Mercado Pago:', err)
    const msg = err instanceof Error ? err.message : 'Erro ao criar cobrança PIX'
    // Evita vazar token/corpo longo; mantém status HTTP do MP se presente.
    const statusMatch = msg.match(/MercadoPago request failed \((\d+)\)/)
    const status = statusMatch ? Number(statusMatch[1]) : 502
    return NextResponse.json(
      { error: status === 400 ? 'Não foi possível criar o PIX. Tente novamente em instantes.' : 'Erro ao criar cobrança PIX' },
      { status: status >= 400 && status < 600 ? status : 502 },
    )
  }

  const chargeId = String(charge.id ?? '')
  if (!chargeId) {
    console.error('[create-pix-charge] cobrança sem id', charge)
    return NextResponse.json({ error: 'Erro ao criar cobrança PIX' }, { status: 502 })
  }

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'pending_pix',
      pix_charge_id: chargeId,
      pending_months: duration,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select('user_id')
    .maybeSingle()

  if (error) {
    console.error('Erro ao atualizar subscription PIX:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Assinatura não encontrada para o usuário' }, { status: 404 })
  }

  const tx = charge.point_of_interaction?.transaction_data
  return NextResponse.json({
    qrCode: tx?.qr_code_base64,
    copyPaste: tx?.qr_code,
    message: 'Cobrança PIX criada – escaneie o QR Code ou copie o código para pagar.',
  })
}
