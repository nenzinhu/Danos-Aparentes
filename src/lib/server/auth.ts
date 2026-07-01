import { NextRequest } from 'next/server'
import { createClient, type User } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabaseEnv'
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

// Mesma lógica de acesso usada em src/hooks/useSubscription.ts, replicada
// no servidor para que as rotas de IA/TTS não confiem só na checagem do client.
export async function userHasActiveSubscription(userId: string): Promise<boolean> {
  if (!supabaseAdmin) return false

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('status, trial_ends_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return false

  const trialActive = new Date(data.trial_ends_at as string).getTime() > Date.now()
  return data.status === 'active' || (data.status === 'trialing' && trialActive)
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
