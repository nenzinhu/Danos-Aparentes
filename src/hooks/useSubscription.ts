'use client';
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'
import {
  hasActiveSubscriptionAccess,
  type SubscriptionStatus,
} from '../lib/subscriptionAccess'

export type { SubscriptionStatus }
export type PlanTier = 'pro' | 'corporativo'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  trialEndsAt: string
  hasAccess: boolean
  trialDaysLeft: number
  trialEnded: boolean
  planTier: PlanTier
  isCorporate: boolean
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    if (body && typeof body.error === 'string') return body.error
  } catch {
    // ignore parse failures, use fallback
  }
  return fallback
}

export function useSubscription(userId?: string, accessToken?: string) {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestUserIdRef = useRef<string | undefined>(undefined)

  const refresh = useCallback(async () => {
    requestUserIdRef.current = userId

    if (!supabaseEnabled || !supabase || !userId) {
      setLoading(false)
      return
    }

    const { data, error: queryError } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at, plan_tier, expires_at')
      .eq('user_id', userId)
      .maybeSingle()

    // Ignore stale responses (userId changed or refresh() was called again).
    if (requestUserIdRef.current !== userId) return

    if (queryError) {
      // Transient failure: keep previous known-good info, just surface the error.
      setError(queryError.message)
      setLoading(false)
      return
    }

    if (!data) {
      // Fail-closed: sem linha de assinatura (ex: trigger falhou), sem acesso.
      setInfo({
        status: 'canceled',
        trialEndsAt: '',
        hasAccess: false,
        trialDaysLeft: 0,
        trialEnded: true,
        planTier: 'pro',
        isCorporate: false,
      })
      setError(null)
      setLoading(false)
      return
    }

    const status = data.status as SubscriptionStatus
    const trialEndsAt = data.trial_ends_at as string
    const expiresAt = (data.expires_at as string | null) ?? null
    const planTier = (data.plan_tier as PlanTier) || 'pro'
    const now = Date.now()
    const trialEndsTime = new Date(trialEndsAt).getTime()
    const trialActive = Number.isFinite(trialEndsTime) && trialEndsTime > now
    const trialEnded = !trialActive
    const hasAccess = hasActiveSubscriptionAccess({
      status,
      trialEndsAt,
      expiresAt,
      now,
    })
    const trialDaysLeft = Math.min(7, Math.max(0, Math.ceil((trialEndsTime - now) / 86_400_000)))

    setInfo({
      status,
      trialEndsAt,
      hasAccess,
      trialDaysLeft,
      trialEnded,
      planTier,
      isCorporate: hasAccess && planTier === 'corporativo',
    })
    setError(null)
    setLoading(false)
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  const startCheckout = useCallback(async () => {
    if (!accessToken) throw new Error('Não autenticado')
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(await readErrorMessage(res, 'Não foi possível iniciar o checkout'))
    const { url } = await res.json()
    window.location.href = url
  }, [accessToken])

  const openPortal = useCallback(async () => {
    if (!accessToken) throw new Error('Não autenticado')
    const res = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(await readErrorMessage(res, 'Não foi possível abrir o portal de gerenciamento'))
    const { url } = await res.json()
    window.location.href = url
  }, [accessToken])

  const startPixCheckout = useCallback(async (
    durationMonths = 1,
    provider: 'mercadopago' | 'asaas' = 'mercadopago',
  ): Promise<{ qrCode: string; copyPaste: string; provider: string }> => {
    if (!accessToken) throw new Error('Não autenticado')
    const months = Number.isFinite(durationMonths) && durationMonths > 0
      ? Math.min(Math.floor(durationMonths), 24)
      : 1
    const res = await fetch(`/api/create-pix-charge?duration=${months}&provider=${provider}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(await readErrorMessage(res, 'Não foi possível gerar a cobrança PIX'))
    const { qrCode, copyPaste, provider: usedProvider } = await res.json()
    return { qrCode, copyPaste, provider: usedProvider || provider }
  }, [accessToken])

  return { info, loading, error, refresh, startCheckout, openPortal, startPixCheckout }
}
