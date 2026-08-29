'use client';
import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { db } from '../lib/db'

/**
 * True when the browser already has a Supabase auth cookie.
 * Used to decide whether to show Login immediately (guest) vs a spinner
 * (likely returning session) before INITIAL_SESSION resolves.
 */
export function hasSupabaseAuthCookieHint(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((part) => {
    const name = part.trim().split('=')[0] ?? ''
    return name.startsWith('sb-') && name.includes('auth-token')
  })
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(supabaseEnabled)

  useEffect(() => {
    if (!supabase) return
    // Single INITIAL_SESSION event — avoids getSession()+listener double work
    // on cold /app entry (noticeable on mobile networks).
    const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'INITIAL_SESSION') setLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    // Isolamento de dados entre contas no mesmo dispositivo/navegador.
    // O repositório local (IndexedDB) é compartilhado por dispositivo e os
    // SavedReport não carregam userId/tenantId, então não há filtro de posse
    // possível no cliente. Limpar os dados locais no logout evita que a próxima
    // conta que logar no mesmo browser herde inspeções/veículos da anterior.
    try {
      await db.clearAllLocalData()
    } catch {
      // falha ao limpar storage local não deve impedir o logout da sessão
    }
  }

  async function resetPassword(email: string) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return { session, loading, signUp, signIn, signOut, resetPassword }
}
