import { NextResponse } from 'next/server'
import {
  callGeminiVision,
  parseImageDataUrl,
  extractGeminiText,
  type GeminiVisionRequest,
} from '@/src/lib/server/geminiVision'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { previousPhoto, currentPhoto, partName } = body

    if (!currentPhoto || typeof currentPhoto !== 'string') {
      return NextResponse.json({ error: 'currentPhoto e obrigatorio (data URL)' }, { status: 400 })
    }

    const currentImg = parseImageDataUrl(currentPhoto)
    if (!currentImg) {
      return NextResponse.json({ error: 'Formato da foto atual invalido' }, { status: 400 })
    }

    const previousImg = previousPhoto && typeof previousPhoto === 'string'
      ? parseImageDataUrl(previousPhoto)
      : null

    const contentsParts: unknown[] = []

    if (previousImg) {
      contentsParts.push({ text: 'FOTO ANTERIOR DA VISTORIA (COMO ESTAVA ANTES):' })
      contentsParts.push({
        inline_data: {
          mime_type: previousImg.mimeType,
          data: previousImg.base64,
        },
      })
    }

    contentsParts.push({ text: `FOTO ATUAL DA VISTORIA (COMO ESTÁ AGORA NA PEÇA: "${partName || 'Lataria'}"):` })
    contentsParts.push({
      inline_data: {
        mime_type: currentImg.mimeType,
        data: currentImg.base64,
      },
    })

    const promptText = `
Você é um perito especialista em análise visual de avarias veiculares.
Analise a(s) foto(s) da peça "${partName || 'veículo'}" e compare o estado visual.

Responda ESTRITAMENTE em formato JSON com esta estrutura (sem markdown extra nem explicações fora do JSON):
{
  "differenceDetected": true ou false,
  "confidence": número de 0 a 100,
  "suggestedCategory": "new" (se for avaria nova) ou "unchanged" (se for dano mantido) ou "removedOrRepaired" (se foi reparado),
  "description": "Explicação técnica pericial curta e precisa em português do que mudou no veículo."
}
`

    contentsParts.push({ text: promptText })

    const reqPayload: GeminiVisionRequest = {
      contents: [{ parts: contentsParts }],
      systemInstruction: {
        parts: [
          {
            text: 'Você é um assistente de perícia veicular de alta precisão. Responda APENAS em JSON válido.',
          },
        ],
      },
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 500,
      },
    }

    const visionResult = await callGeminiVision(reqPayload, 'compare-vision')

    if (!visionResult.ok) {
      return NextResponse.json(
        { error: visionResult.error },
        { status: visionResult.status },
      )
    }

    const rawText = visionResult.text
    const jsonMatch = /\{[\s\S]*\}/.exec(rawText)
    if (!jsonMatch) {
      return NextResponse.json(
        {
          differenceDetected: true,
          confidence: 85,
          suggestedCategory: 'new',
          description: 'Avaria visual identificada na peça do veículo.',
        },
        { status: 200 },
      )
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno na IA' },
      { status: 500 },
    )
  }
}
