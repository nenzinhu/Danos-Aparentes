/**
 * Gemini vision helper — model fallback chain for damage photo analysis.
 * Default: gemini-2.5-flash (same family as chat-support, proven in prod).
 */

const DEFAULT_VISION_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'] as const

export function getGeminiVisionModels(): string[] {
  const preferred = process.env.GEMINI_VISION_MODEL?.trim()
  const chain = preferred ? [preferred, ...DEFAULT_VISION_MODELS] : [...DEFAULT_VISION_MODELS]
  return [...new Set(chain.filter(Boolean))]
}

export function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_TTS_API_KEY || null
}

export interface GeminiVisionRequest {
  contents: unknown[]
  systemInstruction: { parts: { text: string }[] }
  generationConfig: {
    temperature: number
    maxOutputTokens: number
    thinkingConfig?: { thinkingBudget: number }
  }
}

export async function callGeminiVision(
  requestBody: GeminiVisionRequest,
  logLabel: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    return { ok: false, status: 500, error: 'Chave GEMINI_API_KEY não configurada' }
  }

  let lastStatus = 502
  let lastError = 'Não foi possível analisar a foto agora.'

  for (const modelName of getGeminiVisionModels()) {
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
      console.error(`Erro Gemini API (${logLabel}, model=${modelName}):`, errText)
      lastStatus = response.status
      lastError = 'Não foi possível analisar a foto agora.'
      // Model not found / unsupported — try next in chain.
      if (response.status === 404 || errText.includes('not found') || errText.includes('NOT_FOUND')) {
        continue
      }
      return { ok: false, status: lastStatus >= 400 && lastStatus < 600 ? lastStatus : 502, error: lastError }
    }

    const responseData = await response.json()
    const text: string = responseData.candidates?.[0]?.content?.parts?.[0]?.text || ''
    if (!text.trim()) {
      console.error(`Gemini resposta vazia (${logLabel}, model=${modelName})`)
      continue
    }
    return { ok: true, text }
  }

  return { ok: false, status: lastStatus >= 400 && lastStatus < 600 ? lastStatus : 502, error: lastError }
}
