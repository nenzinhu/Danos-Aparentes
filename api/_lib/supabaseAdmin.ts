import { createClient } from '@supabase/supabase-js'
import { requireSupabaseUrl } from './supabaseEnv.js'

const url = requireSupabaseUrl()
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada')
}

// Cliente com a service role key: ignora RLS, só deve ser usado no backend
// (Vercel Functions), nunca exposto ao navegador.
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
