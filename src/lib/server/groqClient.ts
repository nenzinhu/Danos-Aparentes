/**
 * Groq API client helper — usa fetch nativo sem dependências extras.
 * Modelo padrão: llama-3.3-70b-versatile (texto) e qwen/qwen3.6-27b (visão).
 */

export function getGroqApiKey(): string | null {
  return process.env.GROQ_API_KEY?.trim() || null
}

export function getGroqModel(): string {
  return process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile'
}

export function getGroqVisionModel(): string {
  return process.env.GROQ_VISION_MODEL?.trim() || 'qwen/qwen3.6-27b'
}

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}

export interface GroqCompletionOptions {
  messages: GroqChatMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
}

export async function callGroqChat(
  options: GroqCompletionOptions,
): Promise<{ ok: true; content: string } | { ok: false; status: number; error: string }> {
  const apiKey = getGroqApiKey()
  if (!apiKey) {
    return { ok: false, status: 500, error: 'Chave GROQ_API_KEY não configurada no .env' }
  }

  const model = options.model || getGroqModel()

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.6,
        max_tokens: options.maxTokens ?? 2048,
        top_p: options.topP ?? 0.95,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return { ok: false, status: res.status, error: `Groq API Error (${res.status}): ${errText}` }
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content || ''
    return { ok: true, content }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return { ok: false, status: 500, error: errorMsg }
  }
}
