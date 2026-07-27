'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/src/hooks/useAuth'
import { supabaseEnabled } from '@/src/lib/supabase'
import Login from '@/src/views/Login'
import AppLoadingShell from '@/src/components/app/AppLoadingShell'

const AppWorkspace = dynamic(() => import('@/src/components/app/AppWorkspace'), {
  loading: () => <AppLoadingShell />,
})

export default function AppPage() {
  const { session, loading, signIn, signUp, resetPassword } = useAuth()

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

  return <AppWorkspace />
}
