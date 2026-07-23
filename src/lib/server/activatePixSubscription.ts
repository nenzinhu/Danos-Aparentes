import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { extendSubscriptionExpiry } from '@/src/lib/subscriptionAccess'

/**
 * Ativa assinatura PIX após confirmação do provedor (MP ou Asaas).
 * Idempotente: se já estiver active_pix com pending_months=0, só confirma.
 */
export async function activatePixSubscriptionByChargeId(chargeId: string): Promise<{
  ok: boolean
  userId?: string
  error?: string
  status?: number
}> {
  if (!supabaseAdmin) {
    return { ok: false, error: 'Supabase not configured', status: 500 }
  }

  const { data: sub, error } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, expires_at, pending_months, status')
    .eq('pix_charge_id', chargeId)
    .maybeSingle()

  if (error) {
    console.error('[activatePix] erro ao obter subscription:', error)
    return { ok: false, error: 'Failed to find subscription', status: 500 }
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
    Number(extraMonths),
  )

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'active_pix',
      expires_at: newExpires.toISOString(),
      pending_months: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('pix_charge_id', chargeId)
    .select('user_id')
    .maybeSingle()

  if (updateError) {
    console.error('[activatePix] erro ao atualizar subscription:', updateError)
    return { ok: false, error: 'Failed to update subscription', status: 500 }
  }

  return { ok: true, userId: updated?.user_id as string | undefined }
}
