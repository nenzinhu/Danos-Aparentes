import { type NextRequest } from 'next/server'
import { updateSession } from '@/src/lib/supabase/middleware'

/** Next.js 16+: `proxy` substitui `middleware` (mesma capacidade de sessão). */
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Renova sessão só onde cookies importam — pula getUser() nas páginas de marketing.
    '/app/:path*',
    '/api/:path*',
    '/pagamento-pix',
    '/pagamento-cartao',
    '/historico/:path*',
    '/assinar/:path*',
  ],
}
