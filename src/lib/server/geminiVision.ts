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

/** Aceita data URLs de imagem; trata octet-stream / mime vazio como JPEG. */
export function parseImageDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const trimmed = dataUrl.trim()
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(trimmed)
  if (match) {
    return { mimeType: match[1].toLowerCase(), base64: match[2].replace(/\s/g, '') }
  }
  // FileReader às vezes gera data:;base64,... ou application/octet-stream
  const loose = /^data:(?:application\/octet-stream)?;base64,([A-Za-z0-9+/=\s]+)$/i.exec(trimmed)
  if (loose?.[1]) {
    return { mimeType: 'image/jpeg', base64: loose[1].replace(/\s/g, '') }
  }
  return null
}

/** Junta partes de texto; ignora blocos de thinking (thought: true). */
export function extractGeminiText(responseData: unknown): string {
  const parts = (responseData as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>
  })?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts
    .filter((p) => typeof p?.text === 'string' && p.text && !p.thought)
    .map((p) => p.text as string)
    .join('')
    .trim()
}

function withoutThinkingConfig(body: GeminiVisionRequest): GeminiVisionRequest {
  const { thinkingConfig: _ignored, ...generationConfig } = body.generationConfig
  return { ...body, generationConfig }
}

function shouldTryNextModel(status: number, errText: string): boolean {
  // Mesma chave / cota — não adianta trocar de modelo.
  if (status === 429) return false
  if (/API_KEY_INVALID|api key not valid|PERMISSION_DENIED|CONSUMER_INVALID/i.test(errText)) {
    return false
  }
  // 404/400 (modelo indisponível, quota do modelo, schema) e 5xx → tenta próximo.
  return status === 404 || status === 400 || status === 500 || status === 503 ||
    /not found|not_found|unsupported|not supported|quota|resource_exhausted/i.test(errText)
}

async function postGemini(
  modelName: string,
  apiKey: string,
  body: GeminiVisionRequest,
): Promise<Response> {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
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
    let bodyToSend = requestBody
    let response = await postGemini(modelName, apiKey, bodyToSend)

    if (!response.ok) {
      let errText = await response.text()
      // thinkingConfig inválido em alguns modelos → tenta de novo sem o campo
      if (
        response.status === 400 &&
        requestBody.generationConfig.thinkingConfig &&
        /thinking|invalid|unknown/i.test(errText)
      ) {
        console.error(
          `Erro Gemini API (${logLabel}, model=${modelName}) com thinkingConfig — retry sem thinking:`,
          errText,
        )
        bodyToSend = withoutThinkingConfig(requestBody)
        response = await postGemini(modelName, apiKey, bodyToSend)
        if (!response.ok) {
          errText = await response.text()
        }
      }

      if (!response.ok) {
        console.error(`Erro Gemini API (${logLabel}, model=${modelName}):`, errText)
        lastStatus = response.status
        lastError = 'Não foi possível analisar a foto agora.'
        if (shouldTryNextModel(response.status, errText)) {
          continue
        }
        // Não vazar 400 do Gemini para o cliente (parece erro do payload do app)
        const clientStatus =
          response.status === 429
            ? 429
            : response.status >= 500 && response.status < 600
              ? response.status
              : 502
        return { ok: false, status: clientStatus, error: lastError }
      }
    }

    const responseData = await response.json()
    const text = extractGeminiText(responseData)
    if (!text) {
      console.error(`Gemini resposta vazia (${logLabel}, model=${modelName})`, {
        finishReason: responseData?.candidates?.[0]?.finishReason,
        parts: responseData?.candidates?.[0]?.content?.parts?.length,
      })
      continue
    }
    return { ok: true, text }
  }

  return { ok: false, status: lastStatus >= 400 && lastStatus < 600 ? lastStatus : 502, error: lastError }
}
