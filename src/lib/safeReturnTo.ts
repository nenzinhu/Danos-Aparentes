/** Internal paths allowed as post-auth redirect targets (open redirect protection). */
const ALLOWED_PREFIXES = ['/pagamento-pix', '/app', '/planos'] as const

const DEFAULT_RETURN = '/app'

function isAllowedPath(pathname: string): boolean {
  return ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/**
 * Validates a relative returnTo path from query params.
 * Rejects absolute URLs, protocol-relative paths, and paths outside the allowlist.
 */
export function getSafeReturnTo(raw: string | null | undefined, fallback = DEFAULT_RETURN): string {
  if (!raw?.trim()) return fallback

  let decoded: string
  try {
    decoded = decodeURIComponent(raw.trim())
  } catch {
    return fallback
  }

  if (!decoded.startsWith('/') || decoded.startsWith('//')) return fallback
  if (decoded.includes('://') || decoded.includes('@') || decoded.includes('\\')) return fallback

  const pathname = decoded.split('?')[0].split('#')[0]
  if (!isAllowedPath(pathname)) return fallback

  return decoded
}

/** Builds `/app?returnTo=…` for login/signup with a safe encoded target. */
export function loginUrlWithReturnTo(returnPath: string): string {
  const safe = getSafeReturnTo(returnPath, DEFAULT_RETURN)
  return `/app?returnTo=${encodeURIComponent(safe)}`
}
