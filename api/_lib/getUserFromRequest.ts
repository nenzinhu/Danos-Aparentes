import type { VercelRequest } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseUrl, requireSupabaseAnonKey } from './supabaseEnv.js'

// Valida o JWT enviado pelo client (header Authorization: Bearer <token>) e
// devolve o usuário autenticado, ou null se o token for inválido/ausente.
export async function getUserFromRequest(req: VercelRequest) {
  const url = requireSupabaseUrl()
  const anonKey = requireSupabaseAnonKey()

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice('Bearer '.length)
  const supabase = createClient(url, anonKey)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}
