import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { synthTts } from '@/src/lib/server/tts'

export const runtime = 'nodejs'

const RATE_LIMIT = 40
const RATE_WINDOW_MS = 10 * 60 * 1000

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: NextRequest) {
  let body: {
    text?: string
    engine?: 'google-tts' | 'elevenlabs'
    voiceId?: string
    rate?: number
    pitch?: number
    volume?: number
  }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const text = (body.text || '').trim()
  if (!text) return errorJson('Texto vazio', 400)
  if (text.length > 4000) return errorJson('Texto muito longo (máx 4000)', 400)

  const rateKey = `tts:${req.headers.get('x-forwarded-for') || 'anon'}`
  const rate = await checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Limite de síntese de voz atingido. Tente novamente em alguns minutos.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec || 60) } },
    )
  }

  const res = await synthTts({
    text,
    engine: body.engine,
    voiceId: body.voiceId,
    rate: body.rate,
    pitch: body.pitch,
    volume: body.volume,
  })
  if (!res.ok) {
    return errorJson(res.error, res.status)
  }

  return new NextResponse(Buffer.from(res.audio), {
    status: 200,
    headers: {
      'Content-Type': res.contentType,
      'Content-Disposition': 'inline; filename="tts.mp3"',
      'Cache-Control': 'no-store',
    },
  })
}
