import { NextRequest, NextResponse } from 'next/server'
import { supabaseEnabled } from '@/src/lib/supabase'
import { getClientIp, getUserFromRequest, userHasActiveSubscription } from '@/src/lib/server/auth'
import { callGroqVision, getGroqApiKey, GROQ_VISION_MODEL, GROQ_VISION_MODEL_VERSION } from '@/src/lib/server/groqVision'
import { parseImageDataUrl } from '@/src/lib/server/geminiVision'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import {
  buildViewSideClassifyPrompt,
  parseViewSideResponse,
} from '@/src/lib/server/viewSideClassify'

const LIMIT_PER_USER = 15
const LIMIT_PER_IP = 8
const WINDOW_MS = 10 * 60 * 1000
const MAX_PHOTO_BASE64_LENGTH = 4_000_000
const MAX_PHOTOS = 4

export async function POST(req: NextRequest) {
  try {
    if (supabaseEnabled) {
      const user = await getUserFromRequest(req)
      if (!user) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
      }
      const hasAccess = await userHasActiveSubscription(user.id)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Assinatura inativa' }, { status: 403 })
      }
      const { allowed, retryAfterSec } = await checkRateLimit(
        `view-side-classify:${user.id}`,
        LIMIT_PER_USER,
        WINDOW_MS,
      )
      if (!allowed) {
        return NextResponse.json(
          { error: 'Muitas análises em pouco tempo. Tente novamente em instantes.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
        )
      }
    } else {
      const ip = getClientIp(req)
      const { allowed, retryAfterSec } = await checkRateLimit(
        `view-side-classify-ip:${ip}`,
        LIMIT_PER_IP,
        WINDOW_MS,
      )
      if (!allowed) {
        return NextResponse.json(
          { error: 'Muitas análises em pouco tempo. Tente novamente em instantes.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
        )
      }
    }

    const body = await req.json()
    const photosRaw = Array.isArray(body.photos) ? body.photos : []
    const photos = photosRaw.map((p: unknown) => String(p || '')).filter(Boolean).slice(0, MAX_PHOTOS)

    if (photos.length < 1) {
      return NextResponse.json({ error: 'Envie pelo menos uma foto.' }, { status: 400 })
    }

    for (const photo of photos) {
      if (photo.length > MAX_PHOTO_BASE64_LENGTH) {
        return NextResponse.json({ error: 'Foto muito grande' }, { status: 400 })
      }
      if (!parseImageDataUrl(photo)) {
        return NextResponse.json({ error: 'Formato de foto inválido' }, { status: 400 })
      }
    }

    if (!getGroqApiKey()) {
      return NextResponse.json({ error: 'Chave GROQ_API_KEY não configurada' }, { status: 500 })
    }

    const prompt = buildViewSideClassifyPrompt(photos.length)
    // Uma chamada por foto (mais estável que multi-image); agrega no parse final.
    const perPhotoTexts: string[] = []
    for (let i = 0; i < photos.length; i += 1) {
      const parsed = parseImageDataUrl(photos[i])!
      const imageDataUrl = `data:${parsed.mimeType};base64,${parsed.base64}`
      const singlePrompt = `${prompt}

Analise SOMENTE a foto de índice ${i} (esta imagem). Responda com suggestions contendo só esse índice.`
      const groq = await callGroqVision(singlePrompt, imageDataUrl, `view-side-classify:${i}`)
      if (!groq.ok) {
        return NextResponse.json({ error: groq.error }, { status: groq.status })
      }
      perPhotoTexts.push(groq.text)
    }

    const merged: { index: number; view: string }[] = []
    for (const text of perPhotoTexts) {
      for (const s of parseViewSideResponse(text, photos.length)) {
        if (!merged.some((m) => m.index === s.index)) {
          merged.push(s)
        }
      }
    }

    // Fallback: se alguma foto não veio, tenta um parse conjunto do último texto (já coberto).
    const analyzedAt = new Date().toISOString()
    return NextResponse.json({
      suggestions: merged,
      model: GROQ_VISION_MODEL,
      modelVersion: GROQ_VISION_MODEL_VERSION,
      analyzedAt,
    })
  } catch (err) {
    console.error('Erro no endpoint view-side-classify:', err)
    return NextResponse.json({ error: 'Não foi possível identificar os lados agora.' }, { status: 500 })
  }
}
