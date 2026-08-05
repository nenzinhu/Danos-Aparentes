import { type NextRequest } from 'next/server'
import { updateSession } from '@/src/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // ponytail: session refresh only where cookies matter — skips Supabase getUser() on marketing pages.
    '/app/:path*',
    '/api/:path*',
    '/pagamento-pix',
    '/pagamento-cartao',
    '/historico/:path*',
    '/assinar/:path*',
  ],
}
