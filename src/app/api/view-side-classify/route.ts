import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { parseViewSideResponse, buildViewSideClassifyPrompt } from '@/src/lib/server/viewSideClassify'
import { callGroqVision } from '@/src/lib/server/groqVision'
import type { ViewType } from '@/src/types'

export const runtime = 'nodejs'

const RATE_LIMIT = 15
const RATE_WINDOW_MS = 10 * 60 * 1000

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: NextRequest) {
  let body: { photos?: string[]; accessToken?: string }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const photos = Array.isArray(body.photos) ? body.photos.filter((p) => typeof p === 'string') : []
  if (photos.length === 0) {
    return errorJson('Nenhuma foto enviada para classificação', 400)
  }

  const rateKey = `view-side-classify:${req.headers.get('x-forwarded-for') || 'anon'}`
  const rate = await checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições de IA. Tente novamente em alguns minutos.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec || 60) } },
    )
  }

  const prompt = buildViewSideClassifyPrompt(photos.length)
  const res = await callGroqVision(prompt, photos[0], 'view-side-classify')
  if (!res.ok) {
    return errorJson(res.error, res.status)
  }

  const suggestions = parseViewSideResponse(res.text, photos.length).map((s) => ({
    index: s.index,
    view: s.view as ViewType,
  }))

  return NextResponse.json({ suggestions })
}
