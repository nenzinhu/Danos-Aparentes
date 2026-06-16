import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  throw new Error('VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas')
}

// Cliente com a service role key: ignora RLS, só deve ser usado no backend
// (Vercel Functions), nunca exposto ao navegador.
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
