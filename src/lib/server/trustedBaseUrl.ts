const PRODUCTION_HOSTS = new Set([
  'danosaparentes.com.br',
  'www.danosaparentes.com.br',
  'danosaparentes.vercel.app',
])

const VERCEL_PREVIEW_SUFFIX = '.vercel.app'
const DEFAULT_PRODUCTION_ORIGIN = 'https://danosaparentes.com.br'

function normalizeHost(host: string): string {
  return host.toLowerCase().split(':')[0]
}

export function isAllowedAppHost(host: string): boolean {
  const normalized = normalizeHost(host)
  if (PRODUCTION_HOSTS.has(normalized)) return true
  if (normalized.endsWith(VERCEL_PREVIEW_SUFFIX)) return true
  if (
    process.env.NODE_ENV === 'development' &&
    (normalized === 'localhost' || normalized === '127.0.0.1')
  ) {
    return true
  }
  return false
}

function originFromCandidate(candidate: string): string | null {
  const trimmed = candidate.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    if (!isAllowedAppHost(parsed.host)) return null
    const protocol =
      process.env.NODE_ENV === 'development' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
        ? 'http:'
        : 'https:'
    return `${protocol}//${parsed.host}`
  } catch {
    return null
  }
}

export type TrustedBaseUrlOptions = {
  origin?: string | null
  host?: string | null
}

/** Trusted app origin for absolute redirect/notification URLs (never blind Origin trust). */
export function getTrustedBaseUrl(options: TrustedBaseUrlOptions = {}): string {
  const fromEnv = originFromCandidate(process.env.NEXT_PUBLIC_BASE_URL || '')
  if (fromEnv) return fromEnv

  const fromVercel = originFromCandidate(process.env.VERCEL_URL || '')
  if (fromVercel) return fromVercel

  if (process.env.NODE_ENV === 'development') {
    const fromOrigin = originFromCandidate(options.origin || '')
    if (fromOrigin) return fromOrigin

    const host = options.host?.trim()
    if (host && isAllowedAppHost(host)) {
      const normalized = normalizeHost(host)
      const protocol = normalized === 'localhost' || normalized === '127.0.0.1' ? 'http' : 'https'
      return `${protocol}://${normalized}`
    }
  }

  return DEFAULT_PRODUCTION_ORIGIN
}
