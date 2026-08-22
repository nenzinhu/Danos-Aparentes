import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Token curto e opaco para o histórico público de um veículo (por placa).
 * HMAC(placa) + expiração. Não expõe a placa nem o UUID.
 */

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000

function getSecret(): string {
  return process.env.SIGNATURE_LINK_SECRET?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || 'da-vehicle-qr-secret'
}

function b64url(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64url')
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

export function createVehicleQrToken(plate: string, opts?: { ttlMs?: number; now?: number }): string {
  const now = opts?.now ?? Date.now()
  const ttl = opts?.ttlMs ?? DEFAULT_TTL_MS
  const expiresAt = now + ttl
  const plateNorm = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const secret = getSecret()
  const payload = `${b64url(plateNorm)}.${expiresAt}`
  return `${payload}.${sign(payload, secret)}`
}

export function verifyVehicleQrToken(token: string, opts?: { now?: number }): string | null {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [platePart, expiresStr, mac] = parts
  const expiresAt = Number(expiresStr)
  if (!platePart || !mac || !Number.isFinite(expiresAt)) return null
  const now = opts?.now ?? Date.now()
  if (expiresAt < now) return null
  const secret = getSecret()
  const payload = `${platePart}.${expiresStr}`
  if (!safeEqual(sign(payload, secret), mac)) return null
  try {
    return Buffer.from(platePart, 'base64url').toString('utf8')
  } catch {
    return null
  }
}
