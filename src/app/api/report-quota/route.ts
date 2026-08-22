import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { hasActiveSubscriptionAccess } from '@/src/lib/subscriptionAccess'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/** Limite mensal de laudos para contas sem assinatura ativa (free/trial vencido). */
const FREE_MONTHLY_LIMIT = 3

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user?.id) {
    // Fail-open: o cliente permite PDF offline sem token.
    return NextResponse.json({ allowed: true })
  }

  try {
    if (!supabaseAdmin) {
      // Sem backend: libera (fail-open) para não travar a emissão.
      return NextResponse.json({ allowed: true, plan_tier: 'unknown' })
    }

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('status, trial_ends_at, expires_at, plan_tier, tier')
      .eq('user_id', user.id)
      .maybeSingle()

    const planTier = (sub?.plan_tier || sub?.tier || 'free') as string
    const hasAccess = sub
      ? hasActiveSubscriptionAccess({
          status: sub.status as string,
          trialEndsAt: sub.trial_ends_at as string | null,
          expiresAt: sub.expires_at as string | null,
        })
      : false

    // Plano pago/trial ativo: sem teto rígido aqui (a app respeita o plano).
    if (hasAccess) {
      return NextResponse.json({ allowed: true, limit: null, plan_tier: planTier })
    }

    // Free/trial vencido: conta laudos do mês corrente.
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count, error } = await supabaseAdmin
      .from('report_hashes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    if (error) {
      return NextResponse.json({ allowed: true, plan_tier: planTier, reason: 'quota_unavailable' })
    }

    const used = count ?? 0
    if (used >= FREE_MONTHLY_LIMIT) {
      return NextResponse.json(
        { allowed: false, reason: 'limit_reached', limit: FREE_MONTHLY_LIMIT, plan_tier: planTier },
        { status: 403 },
      )
    }
    return NextResponse.json({ allowed: true, limit: FREE_MONTHLY_LIMIT, plan_tier: planTier })
  } catch (err) {
    console.error('[report-quota]', err)
    return NextResponse.json({ allowed: true, reason: 'quota_unavailable' })
  }
}
