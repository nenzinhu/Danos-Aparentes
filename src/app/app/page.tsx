'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth, hasSupabaseAuthCookieHint } from '@/src/hooks/useAuth'
import { supabaseEnabled } from '@/src/lib/supabase'
import Login from '@/src/views/Login'
import AppLoadingShell from '@/src/components/app/AppLoadingShell'

/**
 * Entrada de /app otimizada para mobile "Entrar":
 * - Visitantes sem cookie de sessão veem o formulário email/senha imediatamente
 *   (não esperam INITIAL_SESSION).
 * - Shell autenticado só baixa depois que há sessão.
 * - loading.tsx + este shell dão feedback instantâneo na navegação.
 */
const AuthenticatedApp = dynamic(() => import('@/src/components/app/AuthenticatedApp'), {
  loading: () => <AppLoadingShell />,
})

export default function AppMainPage() {
  const { session, loading: authLoading, signIn, signUp, resetPassword } = useAuth()
  const [likelyAuthed] = useState(() => hasSupabaseAuthCookieHint())

  if (supabaseEnabled && authLoading && likelyAuthed) {
    return <AppLoadingShell />
  }

  if (supabaseEnabled && !session) {
    return <Login onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />
  }

  return <AuthenticatedApp />
}
