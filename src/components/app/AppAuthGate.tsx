'use client';
import React, { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Paywall from '@/src/components/Paywall'
import AppLoadingShell from '@/src/components/app/AppLoadingShell'
import { supabaseEnabled } from '@/src/lib/supabase'
import { getSafeReturnTo } from '@/src/lib/safeReturnTo'
import type { Session } from '@supabase/supabase-js'
import type { SubscriptionInfo } from '@/src/hooks/useSubscription'

function ReturnToRedirect({ session }: { session: Session | null }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const raw = searchParams.get('returnTo')
    if (!session || !raw) return
    const returnTo = getSafeReturnTo(raw)
    if (returnTo === '/app') return
    router.replace(returnTo)
  }, [session, searchParams, router])

  return null
}

interface AppAuthGateProps {
  session: Session | null
  subLoading: boolean
  subscription: SubscriptionInfo | null
  syncStatus: 'synced' | 'pending' | 'offline' | 'error'
  onRetrySync?: () => void
  darkMode: boolean | null
  toggleDarkMode: () => void
  openSavedModal: () => void
  onOpenSettings: () => void
  signOut: () => Promise<void>
  onManageSubscription: () => void
  children: React.ReactNode
}

function withReturnToRedirect(session: Session | null, node: React.ReactNode) {
  return (
    <>
      <Suspense fallback={null}>
        <ReturnToRedirect session={session} />
      </Suspense>
      {node}
    </>
  )
}

export default function AppAuthGate({
  session,
  subLoading,
  subscription,
  syncStatus,
  onRetrySync,
  darkMode,
  toggleDarkMode,
  openSavedModal,
  onOpenSettings,
  signOut,
  onManageSubscription,
  children,
}: AppAuthGateProps) {
  if (supabaseEnabled && session && subLoading) {
    return withReturnToRedirect(session, <AppLoadingShell />)
  }

  if (supabaseEnabled && session && subscription && !subscription.hasAccess) {
    return withReturnToRedirect(session, (
      <Paywall status={subscription.status} onSignOut={signOut} />
    ))
  }

  return withReturnToRedirect(session, children)
}
