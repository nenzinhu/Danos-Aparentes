'use client';
import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseEnabled } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(supabaseEnabled)

  useEffect(() => {
    if (!supabase) return
    // ponytail: single INITIAL_SESSION event avoids getSession()+listener double round-trip on cold /app entry.
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
  }

  async function resetPassword(email: string) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return { session, loading, signUp, signIn, signOut, resetPassword }
}
