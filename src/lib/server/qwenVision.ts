/**
 * Qwen vision helper (DashScope / Alibaba) — classificação de dano por foto.
 * Modelo: qwen3.7-flash (multimodal + JSON no DashScope compatible-mode).
 * Usa fetch direto (sem dependência openai) para evitar mudança de deps.
 */

const QWEN_ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const QWEN_VISION_MODEL_DEFAULT = 'qwen3.7-flash'
export const QWEN_VISION_MODEL = process.env.QWEN_VISION_MODEL?.trim() || QWEN_VISION_MODEL_DEFAULT
/** Stable label for trail; bump if prompt/contract changes independently of model id. */
export const QWEN_VISION_MODEL_VERSION = 'qwen3.7-flash-v1'
const MAX_ATTEMPTS = 3

export function getQwenApiKey(): string | null {
  return process.env.QWEN_API_KEY?.trim() || null
}

export async function callQwenVision(
  systemPrompt: string,
  imageDataUrl: string,
  logLabel: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
  const apiKey = getQwenApiKey()
  if (!apiKey) {
    return { ok: false, status: 500, error: 'Chave QWEN_API_KEY não configurada' }
  }

  const body = JSON.stringify({
    model: QWEN_VISION_MODEL,
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
    max_tokens: 600,
    // Qwen pode devolver bloco de think; pedimos JSON direto e limpamos depois.
    response_format: { type: 'json_object' },
  })

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(QWEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body,
      })

      if (response.ok) {
        const data = await response.json()
        const text = data?.choices?.[0]?.message?.content
        if (typeof text !== 'string' || !text.trim()) {
          return { ok: false, status: 502, error: 'Resposta vazia da IA.' }
        }
        return { ok: true, text: text.trim() }
      }

      const errText = await response.text().catch(() => '')
      console.error(`Erro Qwen API (${logLabel}) attempt ${attempt}:`, response.status, errText.slice(0, 300))

      // Retry simples em 429 / 5xx
      if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 800 * attempt))
        continue
      }
      const clientStatus = response.status >= 500 ? response.status : 502
      return { ok: false, status: clientStatus, error: 'Não foi possível analisar a foto agora.' }
    } catch (e) {
      console.error(`Falha de rede Qwen (${logLabel}) attempt ${attempt}:`, e)
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 800 * attempt))
        continue
      }
      return { ok: false, status: 502, error: 'Falha de conexão com a IA.' }
    }
  }

  return { ok: false, status: 502, error: 'Não foi possível analisar a foto agora.' }
}
