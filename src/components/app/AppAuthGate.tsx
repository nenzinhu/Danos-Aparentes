'use client';
import React, { Suspense, ViewTransition } from 'react'
import { DirectionalTransition } from '@/src/app/DirectionalTransition'
import Header from '@/src/components/Header'
import Paywall from '@/src/components/Paywall'
import Login from '@/src/views/Login'
import { supabaseEnabled } from '@/src/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { SubscriptionInfo } from '@/src/hooks/useSubscription'

interface AppAuthGateProps {
  session: Session | null
  authLoading: boolean
  subLoading: boolean
  subscription: SubscriptionInfo | null
  syncStatus: 'synced' | 'pending' | 'offline' | 'error'
  onRetrySync?: () => void
  darkMode: boolean
  toggleDarkMode: () => void
  openSavedModal: () => void
  onOpenSettings: () => void
  signOut: () => Promise<void>
  onManageSubscription: () => void
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
  onResetPassword: (email: string) => Promise<void>
  children: React.ReactNode
}

export default function AppAuthGate({
  session,
  authLoading,
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
  onSignIn,
  onSignUp,
  onResetPassword,
  children,
}: AppAuthGateProps) {
  if (supabaseEnabled && (authLoading || (session && subLoading))) {
    return (
      <DirectionalTransition>
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center pb-12">
          <ViewTransition name="persistent-nav" default="none">
            <Header
              darkMode={darkMode}
              onToggleDark={toggleDarkMode}
              onOpenSaved={openSavedModal}
              onOpenSettings={onOpenSettings}
              onSignOut={supabaseEnabled && session ? signOut : undefined}
              syncStatus={supabaseEnabled && session ? syncStatus : undefined}
              onRetrySync={supabaseEnabled && session ? onRetrySync : undefined}
              subscription={undefined}
              onManageSubscription={onManageSubscription}
            />
          </ViewTransition>
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">Carregando…</div>
        </div>
      </DirectionalTransition>
    )
  }

  if (supabaseEnabled && !session) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center">Carregando…</div>}>
        <Login onSignIn={onSignIn} onSignUp={onSignUp} onResetPassword={onResetPassword} />
      </Suspense>
    )
  }

  if (supabaseEnabled && session && subscription && !subscription.hasAccess) {
    return <Paywall status={subscription.status} onSignOut={signOut} />
  }

  return <>{children}</>
}
