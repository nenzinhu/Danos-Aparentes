import { useState, useEffect, useCallback } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  trialEndsAt: string
  hasAccess: boolean
  trialDaysLeft: number
}

export function useSubscription(userId?: string, accessToken?: string) {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!supabaseEnabled || !supabase || !userId) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (!data) {
      // Fail-closed: sem linha de assinatura (ex: trigger falhou), sem acesso.
      setInfo({ status: 'canceled', trialEndsAt: '', hasAccess: false, trialDaysLeft: 0 })
      setLoading(false)
      return
    }

    const status = data.status as SubscriptionStatus
    const trialEndsAt = data.trial_ends_at as string
    const trialActive = new Date(trialEndsAt).getTime() > Date.now()
    const hasAccess = status === 'active' || (status === 'trialing' && trialActive)
    const trialDaysLeft = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))

    setInfo({ status, trialEndsAt, hasAccess, trialDaysLeft })
    setLoading(false)
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  async function startCheckout() {
    if (!accessToken) throw new Error('Não autenticado')
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error('Não foi possível iniciar o checkout')
    const { url } = await res.json()
    window.location.href = url
  }

  async function openPortal() {
    if (!accessToken) throw new Error('Não autenticado')
    const res = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error('Não foi possível abrir o portal de gerenciamento')
    const { url } = await res.json()
    window.location.href = url
  }

  return { info, loading, refresh, startCheckout, openPortal }
}
