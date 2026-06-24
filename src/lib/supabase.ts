import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabaseEnv'
import { createClient } from '@supabase/supabase-js'

const url = getSupabaseUrl()
const anonKey = getSupabaseAnonKey()

export const supabaseEnabled = Boolean(url && anonKey)

export const supabase = supabaseEnabled
  ? createClient(url!, anonKey!)
  : null
