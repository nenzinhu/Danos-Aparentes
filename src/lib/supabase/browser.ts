import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseEnv'

const url = getSupabaseUrl()
const anonKey = getSupabaseAnonKey()

export const supabaseBrowserEnabled = Boolean(url && anonKey)

let browserClient: SupabaseClient | null = null

/** Cliente browser com sessão em cookies (sincroniza com o proxy). */
export function createBrowserSupabase(): SupabaseClient | null {
  if (!supabaseBrowserEnabled) return null
  if (!browserClient) {
    browserClient = createBrowserClient(url!, anonKey!)
  }
  return browserClient
}
