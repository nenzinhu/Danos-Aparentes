import { createHmac, timingSafeEqual } from 'crypto'

export function parseMercadoPagoSignatureHeader(
  header: string,
): { ts: string; v1: string } | null {
  const parts = Object.fromEntries(
    header.split(',').map((part) => {
      const [key, ...rest] = part.trim().split('=')
      return [key.trim(), rest.join('=').trim()]
    }),
  )
  if (!parts.ts || !parts.v1) return null
  return { ts: parts.ts, v1: parts.v1 }
}

export function buildMercadoPagoManifest(
  dataId: string,
  requestId: string,
  ts: string,
): string {
  return `id:${dataId};request-id:${requestId};ts:${ts};`
}

export function verifyMercadoPagoHmac(
  secret: string,
  manifest: string,
  providedHex: string,
): boolean {
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')
  try {
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(providedHex, 'hex')
    if (a.length === 0 || a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
