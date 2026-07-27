/**
 * Groq vision helper — classificação de dano por foto (tipo + severidade + descrição).
 * Modelo: qwen/qwen3.6-27b (multimodal, JSON mode nativo via response_format).
 */

export const GROQ_VISION_MODEL = 'qwen/qwen3.6-27b'
/** Stable label for trail; bump if prompt/contract changes independently of model id. */
export const GROQ_VISION_MODEL_VERSION = 'qwen/qwen3.6-27b'
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

export function getGroqApiKey(): string | null {
  return process.env.GROQ_API_KEY || null
}

export async function callGroqVision(
  systemPrompt: string,
  imageDataUrl: string,
  logLabel: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
  const apiKey = getGroqApiKey()
  if (!apiKey) {
    return { ok: false, status: 500, error: 'Chave GROQ_API_KEY não configurada' }
  }

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
      temperature: 0.2,
      max_completion_tokens: 512,
      reasoning_effort: 'none',
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error(`Erro Groq API (${logLabel}):`, errText)
    const clientStatus = response.status === 429 ? 429 : response.status >= 500 ? response.status : 502
    return { ok: false, status: clientStatus, error: 'Não foi possível analisar a foto agora.' }
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) {
    return { ok: false, status: 502, error: 'Resposta vazia da IA.' }
  }
  return { ok: true, text: text.trim() }
}
