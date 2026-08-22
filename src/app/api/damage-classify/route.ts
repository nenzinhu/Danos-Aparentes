import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { buildDamageClassifyPrompt, parseDamageClassifyResponse } from '@/src/lib/server/damageClassify'
import { callGroqVision } from '@/src/lib/server/groqVision'

export const runtime = 'nodejs'

const RATE_LIMIT = 25
const RATE_WINDOW_MS = 10 * 60 * 1000

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: NextRequest) {
  let body: { photo?: string; partName?: string; allowNoDamage?: boolean }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const photo = typeof body.photo === 'string' ? body.photo : ''
  if (!photo || !photo.startsWith('data:')) {
    return errorJson('Foto inválida', 400)
  }

  const rateKey = `damage-vision:${req.headers.get('x-forwarded-for') || 'anon'}`
  const rate = await checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições de IA. Tente novamente em alguns minutos.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec || 60) } },
    )
  }

  const prompt = buildDamageClassifyPrompt(body.partName, body.allowNoDamage !== false)
  const res = await callGroqVision(prompt, photo, 'damage-classify')
  if (!res.ok) {
    return errorJson(res.error, res.status)
  }

  const parsed = parseDamageClassifyResponse(res.text)
  return NextResponse.json({
    type: parsed.type,
    severity: parsed.severity,
    description: parsed.description,
    noDamage: parsed.noDamage,
  })
}
