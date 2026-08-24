/**
 * Lê variáveis Supabase com fallback VITE_* → NEXT_PUBLIC_* (legado).
 * Acesso via colchetes para satisfazer `noPropertyAccessFromIndexSignature`
 * e `exactOptionalPropertyTypes`.
 */
export function getSupabaseUrl(): string | undefined {
  return (
    process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['VITE_SUPABASE_URL']
  );
}

export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
    process.env['VITE_SUPABASE_ANON_KEY']
  );
}

export function requireSupabaseUrl(): string {
  const url = getSupabaseUrl()
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada')
  return url
}

export function requireSupabaseAnonKey(): string {
  const key = getSupabaseAnonKey()
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada')
  return key
}
