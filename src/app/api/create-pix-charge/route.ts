// src/app/api/create-pix-charge/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { getClientIp, getUserFromRequest } from '@/src/lib/server/auth'
import { createPixCharge } from '@/src/lib/server/pixClient'
import { createAsaasPixCharge } from '@/src/lib/server/asaasPix'
import { getAsaasApiKey } from '@/src/lib/server/asaasClient'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { hasActiveSubscriptionAccess } from '@/src/lib/subscriptionAccess'

/** Máx. cobranças PIX por usuário — evita spam e pending_pix repetido. */
const PIX_CHARGE_LIMIT_PER_USER = 8
const PIX_CHARGE_LIMIT_PER_IP = 12
const PIX_CHARGE_WINDOW_MS = 10 * 60 * 1000

export type PixProvider = 'mercadopago' | 'asaas'

type MpPixChargeResponse = {
  id?: string | number
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
    }
  }
}

function resolveProvider(req: NextRequest): PixProvider {
  const fromQuery = (req.nextUrl.searchParams.get('provider') || '').toLowerCase()
  if (fromQuery === 'asaas' || fromQuery === 'mercadopago') {
    return fromQuery
  }
  const fromEnv = (process.env.PIX_PROVIDER || '').toLowerCase()
  if (fromEnv === 'asaas') return 'asaas'
  return 'mercadopago'
}

/**
 * Cria cobrança PIX (Mercado Pago ou Asaas), grava pending na subscription
 * e devolve QR / copia-e-cola para a UI.
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

  const provider = resolveProvider(req)
  if (provider === 'asaas' && !getAsaasApiKey()) {
    return NextResponse.json(
      { error: 'PIX Asaas não configurado (ASAAS_API_KEY).' },
      { status: 503 },
    )
  }
  if (provider === 'mercadopago' && !process.env.PIX_MERCADO_PAGO_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'PIX Mercado Pago não configurado.' },
      { status: 503 },
    )
  }

  const durationRaw = Number(req.nextUrl.searchParams.get('duration') ?? '1')
  const duration = Number.isFinite(durationRaw) && durationRaw > 0 ? Math.min(Math.floor(durationRaw), 24) : 1
  const amountCents = 4990 * duration

  let chargeId: string
  let qrCode: string | undefined
  let copyPaste: string | undefined

  try {
    if (provider === 'asaas') {
      const charge = await createAsaasPixCharge(amountCents, user.email, {
        customerName: user.email.split('@')[0],
        description: `Assinatura Danos Aparentes (${duration} mês${duration > 1 ? 'es' : ''})`,
        externalReference: user.id,
      })
      chargeId = charge.id
      qrCode = charge.qrCodeBase64
      copyPaste = charge.copyPaste
    } else {
      const charge = (await createPixCharge(amountCents, user.email)) as MpPixChargeResponse
      chargeId = String(charge.id ?? '')
      const tx = charge.point_of_interaction?.transaction_data
      qrCode = tx?.qr_code_base64
      copyPaste = tx?.qr_code
    }
  } catch (err) {
    console.error(`[create-pix-charge] ${provider}:`, err)
    const msg = err instanceof Error ? err.message : 'Erro ao criar cobrança PIX'
    const statusMatch = msg.match(/request failed \((\d+)\)/i)
    const status = statusMatch ? Number(statusMatch[1]) : 502
    return NextResponse.json(
      {
        error:
          status === 400
            ? 'Não foi possível criar o PIX. Tente novamente em instantes.'
            : 'Erro ao criar cobrança PIX',
      },
      { status: status >= 400 && status < 600 ? status : 502 },
    )
  }

  if (!chargeId) {
    console.error('[create-pix-charge] cobrança sem id')
    return NextResponse.json({ error: 'Erro ao criar cobrança PIX' }, { status: 502 })
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('subscriptions')
    .select('status, trial_ends_at, expires_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) {
    console.error('Erro ao obter subscription para PIX:', fetchError)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  if (!existing) {
    return NextResponse.json({ error: 'Assinatura não encontrada para o usuário' }, { status: 404 })
  }

  const hasAccess = hasActiveSubscriptionAccess({
    status: existing.status as string,
    trialEndsAt: existing.trial_ends_at as string | null,
    expiresAt: existing.expires_at as string | null,
  })

  const updatePayload: {
    pix_charge_id: string
    pending_months: number
    updated_at: string
    status?: 'pending_pix'
  } = {
    pix_charge_id: chargeId,
    pending_months: duration,
    updated_at: new Date().toISOString(),
  }
  if (!hasAccess) {
    updatePayload.status = 'pending_pix'
  }

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .update(updatePayload)
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

  return NextResponse.json({
    qrCode,
    copyPaste,
    provider,
    message: 'Cobrança PIX criada – escaneie o QR Code ou copie o código para pagar.',
  })
}
