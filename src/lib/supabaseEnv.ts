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
