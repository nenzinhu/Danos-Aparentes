'use client';
import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseEnabled } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(supabaseEnabled)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
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
