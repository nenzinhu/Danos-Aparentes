import { NextRequest } from 'next/server'
import { createClient, type User } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabaseEnv'
import { hasActiveSubscriptionAccess } from '@/src/lib/subscriptionAccess'
import { supabaseAdmin } from './supabaseAdmin'

// Valida o JWT enviado pelo client (header Authorization: Bearer <token>) e
// devolve o usuário autenticado, ou null se o token for inválido/ausente.
export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  if (!url || !anonKey) return null

  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice('Bearer '.length)
  const supabase = createClient(url, anonKey)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

// Mesma regra de `hasActiveSubscriptionAccess` / useSubscription / SQL RLS.
export async function userHasActiveSubscription(userId: string): Promise<boolean> {
  if (!supabaseAdmin) return false

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('status, trial_ends_at, expires_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return false

  return hasActiveSubscriptionAccess({
    status: data.status as string,
    trialEndsAt: data.trial_ends_at as string | null,
    expiresAt: data.expires_at as string | null,
  })
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
