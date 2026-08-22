import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { extendSubscriptionExpiry } from '@/src/lib/subscriptionAccess'
import { parsePixPlan, type PlanTierId } from '@/src/lib/billing/plans'

export type ActivatePixOptions = {
  /** Fallback quando pix_charge_id não bate (ex.: externalReference = user_id|plan). */
  userIdFallback?: string
  /** Plano embutido no externalReference do provedor PIX. */
  planTierFallback?: PlanTierId
}

/** Parse `userId` ou `userId|plan` do externalReference do provedor PIX. */
export function parsePixExternalReference(raw: string | null | undefined): {
  userId?: string
  plan?: PlanTierId
} {
  const value = (raw || '').trim()
  if (!value) return {}
  const pipe = value.indexOf('|')
  if (pipe <= 0) return { userId: value }
  return {
    userId: value.slice(0, pipe),
    plan: parsePixPlan(value.slice(pipe + 1)),
  }
}

/**
 * Ativa assinatura PIX após confirmação do provedor (Mercado Pago).
 * Idempotente: se já estiver active_pix com pending_months=0, só confirma.
 */
export async function activatePixSubscriptionByChargeId(
  chargeId: string,
  options: ActivatePixOptions = {},
): Promise<{
  ok: boolean
  userId?: string
  error?: string
  status?: number
}> {
  if (!supabaseAdmin) {
    return { ok: false, error: 'Supabase not configured', status: 500 }
  }

  let { data: sub, error } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, expires_at, pending_months, status, pending_plan_tier, pix_charge_id')
    .eq('pix_charge_id', chargeId)
    .maybeSingle()

  // Schema sem pending_plan_tier: PostgREST pode falhar o select — tenta sem a coluna.
  if (error?.code === 'PGRST204' || /pending_plan_tier/i.test(error?.message || '')) {
    const retry = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, expires_at, pending_months, status, pix_charge_id')
      .eq('pix_charge_id', chargeId)
      .maybeSingle()
    sub = retry.data
      ? { ...retry.data, pending_plan_tier: null }
      : null
    error = retry.error
  }

  if (error) {
    console.error('[activatePix] erro ao obter subscription:', error)
    return { ok: false, error: 'Failed to find subscription', status: 500 }
  }

  // Fallback: cobrança criada com externalReference = user_id(|plan).
  if (!sub && options.userIdFallback) {
    let fallback = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, expires_at, pending_months, status, pending_plan_tier, pix_charge_id')
      .eq('user_id', options.userIdFallback)
      .maybeSingle()

    if (fallback.error?.code === 'PGRST204' || /pending_plan_tier/i.test(fallback.error?.message || '')) {
      const retry = await supabaseAdmin
        .from('subscriptions')
        .select('user_id, expires_at, pending_months, status, pix_charge_id')
        .eq('user_id', options.userIdFallback)
        .maybeSingle()
      fallback = {
        data: retry.data ? { ...retry.data, pending_plan_tier: null } : null,
        error: retry.error,
      } as typeof fallback
    }

    if (fallback.error) {
      console.error('[activatePix] erro no fallback por user_id:', fallback.error)
      return { ok: false, error: 'Failed to find subscription', status: 500 }
    }

    const candidate = fallback.data
    const pending = Number(candidate?.pending_months ?? 0)
    if (
      candidate &&
      (pending > 0 || candidate.status === 'pending_pix' || candidate.pix_charge_id)
    ) {
      sub = candidate
      await supabaseAdmin
        .from('subscriptions')
        .update({ pix_charge_id: chargeId, updated_at: new Date().toISOString() })
        .eq('user_id', candidate.user_id)
    }
  }

  if (!sub) {
    console.error('[activatePix] nenhuma subscription com pix_charge_id=', chargeId)
    return { ok: false, error: 'Subscription not found', status: 404 }
  }

  if (sub.status === 'active_pix' && Number(sub.pending_months ?? 0) === 0) {
    return { ok: true, userId: sub.user_id as string }
  }

  const extraMonths = sub.pending_months ?? 1
  const newExpires = extendSubscriptionExpiry(
    sub.expires_at as string | null,
    Number(extraMonths) || 1,
  )

  const pendingTier = sub.pending_plan_tier as string | null
  const planTier: PlanTierId =
    pendingTier === 'starter' || pendingTier === 'pro' || pendingTier === 'corporativo'
      ? pendingTier
      : options.planTierFallback || 'pro'

  const updatePayload: Record<string, unknown> = {
    status: 'active_pix',
    expires_at: newExpires.toISOString(),
    pending_months: 0,
    plan_tier: planTier,
    pix_charge_id: chargeId,
    updated_at: new Date().toISOString(),
    pending_plan_tier: null,
  }

  let { data: updated, error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update(updatePayload)
    .eq('user_id', sub.user_id)
    .select('user_id')
    .maybeSingle()

  if (updateError?.code === 'PGRST204' && /pending_plan_tier/i.test(updateError.message || '')) {
    const { pending_plan_tier: _omit, ...without } = updatePayload
    const retry = await supabaseAdmin
      .from('subscriptions')
      .update(without)
      .eq('user_id', sub.user_id)
      .select('user_id')
      .maybeSingle()
    updated = retry.data
    updateError = retry.error
  }

  if (updateError) {
    console.error('[activatePix] erro ao atualizar subscription:', updateError)
    return { ok: false, error: 'Failed to update subscription', status: 500 }
  }

  return { ok: true, userId: updated?.user_id as string | undefined }
}
