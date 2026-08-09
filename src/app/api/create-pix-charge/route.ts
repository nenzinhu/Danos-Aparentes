// src/app/api/create-pix-charge/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { getClientIp, getUserFromRequest } from '@/src/lib/server/auth'
import {
  assertPixProviderConfigured,
  createUnifiedPixCharge,
  resolvePixProvider,
} from '@/src/lib/server/billing'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { hasActiveSubscriptionAccess } from '@/src/lib/subscriptionAccess'
import { PLANS, parsePixPlan } from '@/src/lib/billing/plans'

/** Máx. cobranças PIX por usuário — evita spam e pending_pix repetido. */
const PIX_CHARGE_LIMIT_PER_USER = 8
const PIX_CHARGE_LIMIT_PER_IP = 12
const PIX_CHARGE_WINDOW_MS = 10 * 60 * 1000

/**
 * Cria cobrança PIX via BillingProvider unificado (Asaas canônico, MP opcional),
 * grava pending na subscription e devolve QR / copia-e-cola para a UI.
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

  const provider = resolvePixProvider(req.nextUrl.searchParams.get('provider'))
  const configError = assertPixProviderConfigured(provider)
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 })
  }

  const durationRaw = Number(req.nextUrl.searchParams.get('duration') ?? '1')
  const duration = Number.isFinite(durationRaw) && durationRaw > 0 ? Math.min(Math.floor(durationRaw), 24) : 1

  const planParam = req.nextUrl.searchParams.get('plan')
  const plan = parsePixPlan(planParam)
  const unitPriceCents = PLANS[plan].amountBrlCents
  const amountCents = unitPriceCents * duration

  let chargeId: string
  let qrCode: string | undefined
  let copyPaste: string | undefined

  try {
    const charge = await createUnifiedPixCharge({
      amountCents,
      email: user.email,
      plan,
      durationMonths: duration,
      // userId|plan — fallback se pending_plan_tier ainda não existir no DB
      externalReference: `${user.id}|${plan}`,
      customerName: user.email.split('@')[0],
      provider,
    })
    chargeId = charge.id
    qrCode = charge.qrCodeBase64
    copyPaste = charge.copyPaste
  } catch (err) {
    console.error(`[create-pix-charge] ${provider}:`, err)
    const msg = err instanceof Error ? err.message : 'Erro ao criar cobrança PIX'
    const statusMatch = msg.match(/request failed \((\d+)\)/i)
    const status = statusMatch ? Number(statusMatch[1]) : 502

    let detail: string | undefined
    const asaasDesc = msg.match(/\[\{"code":"[^"]+","description":"([^"]+)"\}/)
    if (asaasDesc?.[1]) detail = asaasDesc[1]
    else if (/chave Pix/i.test(msg)) {
      detail = 'Conta Asaas sem chave PIX. Cadastre uma chave aleatória (EVP) no painel sandbox.'
    }

    return NextResponse.json(
      {
        error: detail
          || (status === 400
            ? 'Não foi possível criar o PIX. Tente novamente em instantes.'
            : 'Erro ao criar cobrança PIX'),
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

  const updatePayload: Record<string, unknown> = {
    pix_charge_id: chargeId,
    pending_months: duration,
    pending_plan_tier: plan,
    updated_at: new Date().toISOString(),
  }
  if (!hasAccess) {
    updatePayload.status = 'pending_pix'
  }

  let { data, error } = await supabaseAdmin
    .from('subscriptions')
    .update(updatePayload)
    .eq('user_id', user.id)
    .select('user_id')
    .maybeSingle()

  // Produção sem migration 20260724: coluna pending_plan_tier ausente (PGRST204).
  if (error?.code === 'PGRST204' && /pending_plan_tier/i.test(error.message || '')) {
    console.warn('[create-pix-charge] pending_plan_tier ausente — gravando sem a coluna (plano no externalReference)')
    const { pending_plan_tier: _omit, ...withoutTier } = updatePayload
    const retry = await supabaseAdmin
      .from('subscriptions')
      .update(withoutTier)
      .eq('user_id', user.id)
      .select('user_id')
      .maybeSingle()
    data = retry.data
    error = retry.error
  }

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
