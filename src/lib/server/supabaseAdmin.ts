import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '@/lib/supabaseEnv'

const url = getSupabaseUrl()
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Cliente com a service role key: ignora RLS, só pode ser usado em código
// que roda no servidor (Route Handlers), nunca em componentes de cliente.
export const supabaseAdmin =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null
