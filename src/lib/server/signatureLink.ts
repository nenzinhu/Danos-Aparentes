import { createHmac, timingSafeEqual } from 'crypto'

/** Assinatura remota: token curto, HMAC + expiração (não expõe o UUID da vistoria). */

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000
/** ~150KB PNG base64 é o máximo razoável para signature pad. */
export const MAX_SIGNATURE_DATA_URL_CHARS = 220_000

function getSecret(): string {
  const secret = process.env.SIGNATURE_LINK_SECRET?.trim() ?? ''
  if (!secret) {
    throw new Error('SIGNATURE_LINK_SECRET não configurado')
  }
  return secret
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input
  return buf.toString('base64url')
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

/**
 * Token: base64url(inspectionId).expiresMs.hmac
 * Legível só no servidor; o cliente trata como string opaca.
 */
export function createSignatureToken(
  inspectionId: string,
  opts?: { ttlMs?: number; now?: number },
): { token: string; expiresAt: number } {
  const now = opts?.now ?? Date.now()
  const ttlMs = opts?.ttlMs ?? DEFAULT_TTL_MS
  const expiresAt = now + ttlMs
  const secret = getSecret()
  const idPart = b64url(inspectionId)
  const payload = `${idPart}.${expiresAt}`
  const token = `${payload}.${sign(payload, secret)}`
  return { token, expiresAt }
}

/** Valida HMAC + expiração. Retorna inspectionId ou null. */
export function verifySignatureToken(
  token: string,
  opts?: { now?: number },
): string | null {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [idPart, expiresStr, mac] = parts
  const expiresAt = Number(expiresStr)
  if (!idPart || !mac || !Number.isFinite(expiresAt)) return null

  const now = opts?.now ?? Date.now()
  if (expiresAt < now) return null

  let secret: string
  try {
    secret = getSecret()
  } catch {
    return null
  }

  const payload = `${idPart}.${expiresStr}`
  const expected = sign(payload, secret)
  if (!safeEqual(expected, mac)) return null

  try {
    return Buffer.from(idPart, 'base64url').toString('utf8')
  } catch {
    return null
  }
}

export function isSignaturePayloadTooLarge(signature: string): boolean {
  return signature.length > MAX_SIGNATURE_DATA_URL_CHARS
}
