'use client'
import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/src/hooks/useAuth'
import { supabaseEnabled } from '@/src/lib/supabase'
import Login from '@/src/views/Login'

/**
 * Entrada leve de /app: visitantes sem sessão veem o Login sem baixar o shell
 * autenticado (InspectTab, veículos, sync, etc.). Isso corta a demora no mobile
 * ao tocar "Entrar" na landing — o painel de email/senha aparece assim que o
 * chunk fino + getSession terminam, em vez de esperar o bundle inteiro do app.
 */
const AuthenticatedApp = dynamic(() => import('@/src/components/app/AuthenticatedApp'), {
  loading: () => (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center">
      Carregando…
    </div>
  ),
})

function AuthBootScreen() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center">
      Carregando…
    </div>
  )
}

export default function AppMainPage() {
  const { session, loading: authLoading, signIn, signUp, resetPassword } = useAuth()

  if (supabaseEnabled && authLoading) {
    return <AuthBootScreen />
  }

  if (supabaseEnabled && !session) {
    return (
      <Suspense fallback={<AuthBootScreen />}>
        <Login onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />
      </Suspense>
    )
  }

  return <AuthenticatedApp />
}
