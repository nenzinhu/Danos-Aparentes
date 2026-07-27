'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth, hasSupabaseAuthCookieHint } from '@/src/hooks/useAuth'
import { supabaseEnabled } from '@/src/lib/supabase'
import AppLoadingShell from '@/src/components/app/AppLoadingShell'
import Login from '@/src/views/Login'

// Heavy app shell loads only after auth resolves — guests skip it on first /app paint.
const AppAuthenticatedShell = dynamic(
  () => import('@/src/components/app/AppAuthenticatedShell'),
  { loading: () => <AppLoadingShell /> },
)

/**
 * Guests without an auth cookie see Login immediately (no wait for INITIAL_SESSION).
 * Returning users with a cookie hint keep the loading shell until session restores.
 */
export default function AppMainPage() {
  const { session, loading, signIn, signUp, signOut, resetPassword } = useAuth()
  const [likelyAuthed] = useState(() => hasSupabaseAuthCookieHint())

  if (supabaseEnabled && loading && likelyAuthed) {
    return <AppLoadingShell />
  }

  if (supabaseEnabled && !session) {
    return <Login onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />
  }

  return <AppAuthenticatedShell session={session} signOut={signOut} />
}
