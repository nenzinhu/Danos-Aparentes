'use client';
import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/src/hooks/useAuth'
import { supabaseEnabled } from '@/src/lib/supabase'
import AppLoadingShell from '@/src/components/app/AppLoadingShell'
import Login from '@/src/views/Login'

// ponytail: heavy app shell (diagrams, sync, TTS, overlays) loads only after auth resolves —
// unauthenticated mobile visitors skip ~200KB+ parse on first /app paint.
const AppAuthenticatedShell = dynamic(
  () => import('@/src/components/app/AppAuthenticatedShell'),
  { loading: () => <AppLoadingShell /> },
)

export default function AppMainPage() {
  const { session, loading, signIn, signUp, signOut, resetPassword } = useAuth()

  if (supabaseEnabled && loading) {
    return <AppLoadingShell />
  }

  if (supabaseEnabled && !session) {
    return (
      <Suspense fallback={<AppLoadingShell />}>
        <Login onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />
      </Suspense>
    )
  }

  return (
    <AppAuthenticatedShell session={session} signOut={signOut} />
  )
}
