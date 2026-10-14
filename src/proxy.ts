import { NextResponse, type NextRequest } from 'next/server'

const MAINTENANCE_ASSETS = new Set([
  '/apple-touch-icon.png',
  '/brand/logo-full-dark.svg',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-16.png',
  '/favicon-32.png',
  '/favicon-48.png',
])

/** Bloqueio temporário global enquanto a nova experiência está em desenvolvimento. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (MAINTENANCE_ASSETS.has(pathname)) return NextResponse.next()

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Serviço temporariamente indisponível durante a atualização.' },
      { status: 503, headers: { 'Retry-After': '3600' } },
    )
  }

  if (pathname === '/') return NextResponse.next()

  const maintenanceUrl = request.nextUrl.clone()
  maintenanceUrl.pathname = '/'
  maintenanceUrl.search = ''
  return NextResponse.rewrite(maintenanceUrl)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image).*)',
  ],
}
