import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient, type User } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabaseEnv'
import { hasActiveSubscriptionAccess } from '@/src/lib/subscriptionAccess'
import { supabaseAdmin } from './supabaseAdmin'

if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as unknown as Record<string, unknown>).WebSocket = class DummyWebSocket {}
}

// Valida o JWT (Bearer) ou, em fallback, a sessão nos cookies (@supabase/ssr).
export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  if (!url || !anonKey) return null

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length)
    const supabase = createClient(url, anonKey)
    const { data, error } = await supabase.auth.getUser(token)
    if (!error && data.user) return data.user
  }

  // Fallback cookie (útil quando a chamada vem do App Router sem Bearer).
  const cookieSupabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll() {
        // Route Handler: cookies de refresh ficam a cargo do middleware.
      },
    },
  })
  const { data, error } = await cookieSupabase.auth.getUser()
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
