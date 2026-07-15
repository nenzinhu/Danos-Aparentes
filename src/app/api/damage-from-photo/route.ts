import { NextRequest, NextResponse } from 'next/server'
import { supabaseEnabled } from '@/src/lib/supabase'
import { getUserFromRequest, userHasActiveSubscription, getClientIp } from '@/src/lib/server/auth'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import {
  isKnownVehicleType,
  parsePhotoDamageSuggestions,
} from '@/src/lib/damageFromPhoto'
import { formatPartsCatalogForPrompt, getPartsForVehicle } from '@/src/lib/vehiclePartsCatalog'

const MAX_PHOTO_BASE64_LENGTH = 4_000_000

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const match = /^data:(image\/[a-z]+);base64,(.+)$/i.exec(dataUrl)
  if (!match) return null
  return { mimeType: match[1], base64: match[2] }
}

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
      const { allowed, retryAfterSec } = checkRateLimit(`damage-from-photo:${user.id}`, 15, 10 * 60 * 1000)
      if (!allowed) {
        return NextResponse.json(
          { error: 'Muitas análises em pouco tempo. Tente novamente em instantes.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
        )
      }
    } else {
      const ip = getClientIp(req)
      const { allowed, retryAfterSec } = checkRateLimit(`damage-from-photo-ip:${ip}`, 8, 10 * 60 * 1000)
      if (!allowed) {
        return NextResponse.json(
          { error: 'Muitas análises em pouco tempo. Tente novamente em instantes.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
        )
      }
    }

    const body = await req.json()
    const photo = String(body.photo || '')
    const vehicleType = body.vehicleType

    if (!isKnownVehicleType(vehicleType)) {
      return NextResponse.json({ error: 'Tipo de veículo inválido' }, { status: 400 })
    }

    if (getPartsForVehicle(vehicleType).length === 0) {
      return NextResponse.json({ error: 'Catálogo de peças indisponível para este veículo' }, { status: 400 })
    }

    if (photo.length > MAX_PHOTO_BASE64_LENGTH) {
      return NextResponse.json({ error: 'Foto muito grande' }, { status: 400 })
    }

    const parsed = parseDataUrl(photo)
    if (!parsed) {
      return NextResponse.json({ error: 'Formato de foto inválido' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_TTS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Chave GEMINI_API_KEY não configurada' }, { status: 500 })
    }

    const catalogText = formatPartsCatalogForPrompt(vehicleType)

    const systemPrompt = `Você é um perito técnico de vistoria veicular. Sua tarefa é analisar UMA foto de avaria e mapear o dano para o catálogo de peças do aplicativo (diagrama SVG).

Veículo: ${vehicleType}

Catálogo de peças (formato: partId|view|nome):
${catalogText}

Regras estritas:
1. Responda SOMENTE em JSON válido, sem markdown, no formato:
{"suggestions":[{"partId":"...","type":"scratch"|"dent"|"broken","severity":"low"|"medium"|"high","description":"...","confidence":"high"|"medium"|"low"}]}

2. Escolha APENAS partId que exista no catálogo acima. Nunca invente IDs.

3. "type":
   - scratch = risco/arranhão/abrasão
   - dent = amassado/deformação de chapa
   - broken = quebra/trinca/fratura/peça partida

4. "severity":
   - low = superficial, sem exposição de metal relevante
   - medium = amassado ou risco profundo visível, sem aparente dano estrutural
   - high = quebra, fragmento solto, exposição de metal com corrosão, ou dano estrutural

5. "description": até 40 palavras, PT-BR, técnica e objetiva. Sem medidas em cm/mm; use proporção relativa à peça. Sem preço/orçamento.

6. "confidence":
   - high = peça e lado claramente identificáveis
   - medium = razoável, mas com alguma ambiguidade (ângulo/zoom)
   - low = incerto (foto colada, pouco contexto, lado duvidoso)

7. Retorne 1 sugestão normalmente. Só retorne até 3 se a foto mostrar claramente avarias em peças distintas.

8. Se a imagem NÃO mostrar avaria de veículo identificável, retorne {"suggestions":[]}.

9. Em caso de dúvida entre esquerda/direita, prefira confidence "low" ou "medium" e a peça mais provável pelo contexto da foto (espelhos, faróis, placa, etc.).`

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: parsed.mimeType, data: parsed.base64 } },
            { text: 'Identifique a(s) peça(s) danificada(s) e classifique a avaria conforme as instruções.' },
          ],
        },
      ],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 600,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }

    const modelName = 'gemini-2.5-flash'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      },
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Erro Gemini API (damage-from-photo):', errText)
      return NextResponse.json({ error: 'Não foi possível analisar a foto agora.' }, { status: 502 })
    }

    const responseData = await response.json()
    const rawText: string = responseData.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleaned = rawText.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()

    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Não foi possível interpretar a análise.' }, { status: 502 })
    }

    const suggestions = parsePhotoDamageSuggestions(vehicleType, parsedJson)
    return NextResponse.json({ suggestions })
  } catch (err) {
    console.error('Erro no endpoint de damage-from-photo:', err)
    return NextResponse.json({ error: 'Não foi possível analisar a foto agora.' }, { status: 500 })
  }
}
