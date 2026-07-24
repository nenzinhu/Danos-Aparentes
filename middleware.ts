import { type NextRequest } from 'next/server'
import { updateSession } from '@/src/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Exclui estáticos e assets — só rotas que precisam de cookie de sessão.
     */
    '/((?!_next/static|_next/image|favicon.ico|icons/|vendor/|videos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|js|css|woff2?)$).*)',
  ],
}
