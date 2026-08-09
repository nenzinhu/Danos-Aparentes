import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseEnv'

function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.includes('auth-token'),
  )
}

/**
 * Renova tokens de sessão nos cookies da request/response.
 * Login fica embutido em /app — não redireciona; só sincroniza cookies.
 *
 * Guests (sem cookie sb-*-auth-token) pulam getUser() — evita round-trip
 * ao Auth server no caminho quente Entrar → painel email/senha no mobile.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  if (!url || !anonKey) return supabaseResponse

  // Fast path for unauthenticated visitors tapping "Entrar".
  if (!hasAuthCookie(request)) return supabaseResponse

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Valida JWT no Auth server (não usar getSession aqui).
  await supabase.auth.getUser()

  return supabaseResponse
}
