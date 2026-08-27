/**
 * Lê variáveis Supabase (NEXT_PUBLIC_*).
 * Fallback VITE_* mantido só para deploys legados — preferir sempre NEXT_PUBLIC_*.
 */
export function getSupabaseUrl(): string | undefined {
  return (
    process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['VITE_SUPABASE_URL']
  )
}

export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
    process.env['VITE_SUPABASE_ANON_KEY']
  )
}
