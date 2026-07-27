import { type NextRequest } from 'next/server'
import { updateSession } from '@/src/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Só rotas que precisam de cookie de sessão — marketing pages não
    // pagam getUser() no edge (acelera o tap em Entrar a partir da home).
    '/app/:path*',
    '/api/:path*',
    '/pagamento-pix',
    '/pagamento-cartao',
    '/historico/:path*',
    '/assinar/:path*',
  ],
}
