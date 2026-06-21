'use client';
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  trialEndsAt: string
  hasAccess: boolean
  trialDaysLeft: number
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
      .select('status, trial_ends_at')
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
      setInfo({ status: 'canceled', trialEndsAt: '', hasAccess: false, trialDaysLeft: 0 })
      setError(null)
      setLoading(false)
      return
    }

    const status = data.status as SubscriptionStatus
    const trialEndsAt = data.trial_ends_at as string
    const trialActive = new Date(trialEndsAt).getTime() > Date.now()
    const hasAccess = status === 'active' || (status === 'trialing' && trialActive)
    const trialDaysLeft = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))

    setInfo({ status, trialEndsAt, hasAccess, trialDaysLeft })
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

  return { info, loading, error, refresh, startCheckout, openPortal }
}
