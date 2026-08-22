import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { callGroqVision } from '@/src/lib/server/groqVision'

export const runtime = 'nodejs'

const RATE_LIMIT = 15
const RATE_WINDOW_MS = 10 * 60 * 1000

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

const PROMPT = `Você é um perito de inspeção veicular. Compare a FOTO ANTES e a FOTO DEPOIS de uma mesma peça.
Responda SOMENTE JSON válido, sem markdown:
{"differenceDetected": true|false, "confidence": 0-100, "suggestedCategory": "new"|"worsened"|"same"|"repaired", "description": "descrição curta em português da diferença observada"}`

export async function POST(req: NextRequest) {
  let body: { previousPhoto?: string; currentPhoto?: string; partName?: string }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  if (!body.currentPhoto || !body.currentPhoto.startsWith('data:')) {
    return errorJson('Foto atual inválida', 400)
  }

  const rateKey = `compare-vision:${req.headers.get('x-forwarded-for') || 'anon'}`
  const rate = await checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições de IA. Tente novamente em alguns minutos.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec || 60) } },
    )
  }

  // Groq vision aceita múltiplas imagens no content.
  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    { type: 'text', text: PROMPT },
  ]
  if (body.previousPhoto) content.push({ type: 'image_url', image_url: { url: body.previousPhoto } })
  content.push({ type: 'image_url', image_url: { url: body.currentPhoto } })

  const res = await callGroqVisionWithImages(content)
  if (!res.ok) {
    return errorJson(res.error, res.status)
  }

  const parsed = parseCompareResponse(res.content)
  return NextResponse.json(parsed)
}

async function callGroqVisionWithImages(content: unknown) {
  const { callGroqChat } = await import('@/src/lib/server/groqClient')
  return callGroqChat({
    messages: [{ role: 'user', content: content as never }],
    model: undefined,
    temperature: 0.2,
    maxTokens: 600,
  })
}

function parseCompareResponse(text: string): {
  differenceDetected: boolean
  confidence: number
  suggestedCategory: string
  description: string
} {
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  try {
    const o = JSON.parse(cleaned) as Record<string, unknown>
    return {
      differenceDetected: o.differenceDetected === true || o.differenceDetected === 'true',
      confidence: typeof o.confidence === 'number' ? o.confidence : 80,
      suggestedCategory: typeof o.suggestedCategory === 'string' ? o.suggestedCategory : 'new',
      description: typeof o.description === 'string' ? o.description : 'Alteração visual identificada na peça.',
    }
  } catch {
    return {
      differenceDetected: true,
      confidence: 80,
      suggestedCategory: 'new',
      description: 'Alteração visual identificada na peça.',
    }
  }
}
