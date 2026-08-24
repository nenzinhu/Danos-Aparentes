'use client';
import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'
import { supabaseEnabled } from '@/src/lib/supabase'
import { clearTenantContextCache } from '@/src/lib/tenant/resolveTenant'
import Login from '@/src/views/Login'

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 text-center">
      {children}
    </div>
  )
}

function AcceptInvite() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const { session, loading: authLoading, signIn, signUp, resetPassword } = useAuth()
  const [state, setState] = useState<'idle' | 'accepting' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.access_token || state !== 'idle') return
    ;(async () => {
      try {
        const res = await fetch('/api/team-accept-invite', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error || 'Não foi possível aceitar o convite')
        }
        clearTenantContextCache(session.user.id)
        setState('done')
        setTimeout(() => router.replace('/app'), 1500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao aceitar convite')
        setState('error')
      }
    })()
  }, [session?.access_token, state, token, router])

  if (supabaseEnabled && authLoading) {
    return <Centered>Carregando…</Centered>
  }

  if (supabaseEnabled && !session) {
    return <Login onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />
  }

  if (state === 'error') {
    return (
      <Centered>
        <div>
          <div className="text-2xl mb-2">❌</div>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </Centered>
    )
  }

  if (state === 'done') {
    return (
      <Centered>
        <div>
          <div className="text-2xl mb-2">✅</div>
          <p className="text-sm text-[var(--text-muted)]">Convite aceito! Redirecionando…</p>
        </div>
      </Centered>
    )
  }

  return <Centered>Aceitando convite…</Centered>
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<Centered>Carregando…</Centered>}>
      <AcceptInvite />
    </Suspense>
  )
}
