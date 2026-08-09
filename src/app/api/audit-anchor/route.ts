import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/src/lib/server/rateLimit'

/**
 * FASE 19 — Carimbo de tempo da âncora em calendários OpenTimestamps.
 * Recebe um digest SHA-256 (hex) e envia os bytes crus aos calendários
 * públicos. As provas retornadas (pendentes de atestação Bitcoin) são
 * devolvidas em base64 para armazenamento em audit_anchors.
 *
 * Best-effort: se nenhum calendário responder, retorna { proofs: [] }.
 */

const CALENDARS = [
  'https://alice.btc.calendar.opentimestamps.org',
  'https://bob.btc.calendar.opentimestamps.org',
  'https://finney.calendar.eternitywall.com',
]

const CALENDAR_TIMEOUT_MS = 5000

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
  )
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

async function stampAtCalendar(
  calendar: string,
  digestBytes: Uint8Array,
): Promise<{ calendar: string; proof_base64: string } | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), CALENDAR_TIMEOUT_MS)
    const res = await fetch(`${calendar}/digest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/vnd.opentimestamps.v1',
      },
      body: new Uint8Array(digestBytes),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    if (buf.byteLength === 0 || buf.byteLength > 16_384) return null
    return {
      calendar,
      proof_base64: Buffer.from(buf).toString('base64'),
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await checkRateLimit(`audit-anchor:${ip}`, 20, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas ancoragens. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  let body: { digest?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const digest = (body.digest || '').trim().toLowerCase()
  if (!/^[0-9a-f]{64}$/.test(digest)) {
    return NextResponse.json({ error: 'Digest SHA-256 inválido' }, { status: 400 })
  }

  const digestBytes = hexToBytes(digest)
  const results = await Promise.all(
    CALENDARS.map((c) => stampAtCalendar(c, digestBytes)),
  )
  const proofs = results.filter((p): p is NonNullable<typeof p> => p !== null)

  return NextResponse.json({ proofs })
}
