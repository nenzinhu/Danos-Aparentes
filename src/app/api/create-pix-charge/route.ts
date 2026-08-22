import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, getClientIp } from '@/src/lib/server/auth'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { createPixCharge } from '@/src/lib/server/pixClient'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { hasActiveSubscriptionAccess } from '@/src/lib/subscriptionAccess'
import { PLANS, parsePixPlan, type PlanTierId } from '@/src/lib/billing/plans'

// Budget: 8 cobranças / 10min por usuário (espelha rateLimit.test.ts).
const RATE_LIMIT = 8
const RATE_WINDOW_MS = 10 * 60 * 1000

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function upsertPixPending(
  userId: string,
  chargeId: string,
  months: number,
  planTier: PlanTierId,
) {
  if (!supabaseAdmin) return

  // Lê a subscription atual para decidir se mantém acesso (ex.: em trial) ou vira pending_pix.
  const { data: existing, error: readError } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, status, trial_ends_at, expires_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (readError) {
    console.error('[create-pix-charge] erro ao ler subscription:', readError)
    return
  }

  const hasAccess = hasActiveSubscriptionAccess({
    status: existing?.status as string | null | undefined,
    trialEndsAt: existing?.trial_ends_at as string | null | undefined,
    expiresAt: existing?.expires_at as string | null | undefined,
  })

  const payload: Record<string, unknown> = {
    pix_charge_id: chargeId,
    pending_months: months,
    pending_plan_tier: planTier,
    updated_at: new Date().toISOString(),
  }
  // Mantém status (ex.: trialing) quando já há acesso; senão marca pending_pix.
  payload.status = hasAccess ? (existing?.status as string) : 'pending_pix'

  // Update por user_id (espelha o padrão do projeto e o mock de teste).
  const { error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update(payload)
    .eq('user_id', userId)
    .select('user_id')
    .maybeSingle()

  if (updateError?.code === 'PGRST204' || /pending_plan_tier/i.test(updateError?.message || '')) {
    const { pending_plan_tier: _omit, ...without } = payload
    const retry = await supabaseAdmin
      .from('subscriptions')
      .update(without as Record<string, unknown>)
      .eq('user_id', userId)
      .select('user_id')
      .maybeSingle()
    if (retry.error) {
      console.error('[create-pix-charge] erro no update (retry):', retry.error)
    }
  } else if (updateError) {
    console.error('[create-pix-charge] erro no update:', updateError)
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return errorJson('Não autenticado', 401)
  }

  const rateKey = `create-pix-charge:${user.id}`
  const rate = await checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec || 60) } },
    )
  }

  const url = new URL(req.url)
  const durationParam = Number.parseInt(url.searchParams.get('duration') || '1', 10)
  const months = Number.isFinite(durationParam) && durationParam > 0
    ? Math.min(Math.floor(durationParam), 24)
    : 1
  const planTier = parsePixPlan(url.searchParams.get('plan'))

  void getClientIp(req) // utilitário disponível para futura telemetria

  const amountCents = PLANS[planTier].amountBrlCents * months

  try {
    const charge = (await createPixCharge(amountCents, user.email || '')) as {
      id: string
      point_of_interaction?: {
        transaction_data?: { qr_code?: string; qr_code_base64?: string }
      }
    }

    const tid = charge?.point_of_interaction?.transaction_data
    await upsertPixPending(user.id, String(charge?.id ?? ''), months, planTier)

    return NextResponse.json({
      copyPaste: tid?.qr_code ?? '',
      qrCode: tid?.qr_code_base64 ?? '',
      provider: process.env.PIX_PROVIDER || 'mercadopago',
    })
  } catch (err) {
    console.error('[create-pix-charge] falha ao criar cobrança:', err)
    return errorJson('Não foi possível gerar a cobrança PIX', 500)
  }
}
