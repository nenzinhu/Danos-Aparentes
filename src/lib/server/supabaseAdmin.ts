import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '@/lib/supabaseEnv'

// Polyfill minimal WebSocket constructor para ambientes Node < 22 sem WebSocket nativo (ex: GitHub Actions CI em Node 20)
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as unknown as Record<string, unknown>).WebSocket = class DummyWebSocket {}
}

const url = getSupabaseUrl()
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Cliente com a service role key: ignora RLS, só pode ser usado em código
// que roda no servidor (Route Handlers), nunca em componentes de cliente.
export const supabaseAdmin =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null
