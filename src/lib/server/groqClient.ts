/**
 * Groq API client helper — usa fetch nativo sem dependências extras.
 * Modelo padrão: llama-3.3-70b-versatile (texto) e qwen/qwen3.6-27b (visão).
 */

import {
  GROQ_RATE_LIMIT_USER_MESSAGE,
  isGroqRateLimit,
  parseGroqRetryAfterMs,
  sleep,
} from './groqRetry'

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
  /** Ferramentas do modelo compound (groq/compound): web_search, code_interpreter, visit_website. */
  compoundTools?: string[]
  stream?: boolean
}

/** Tools habilitadas por padrão no modelo compound, conforme exemplo Groq. */
const DEFAULT_COMPOUND_TOOLS = ['web_search', 'code_interpreter', 'visit_website']

const MAX_ATTEMPTS = 3

export async function callGroqChat(
  options: GroqCompletionOptions,
): Promise<{ ok: true; content: string } | { ok: false; status: number; error: string }> {
  const apiKey = getGroqApiKey()
  if (!apiKey) {
    return { ok: false, status: 500, error: 'Chave GROQ_API_KEY não configurada no .env' }
  }

  const model = options.model || getGroqModel()
  const isCompound = model.startsWith('groq/') || model.includes('compound')
  const compoundTools = options.compoundTools ?? (isCompound ? DEFAULT_COMPOUND_TOOLS : [])

  const payload: Record<string, unknown> = {
    model,
    messages: options.messages,
    temperature: options.temperature ?? 0.6,
    max_tokens: options.maxTokens ?? 2048,
    top_p: options.topP ?? 0.95,
  }

  if (compoundTools.length > 0) {
    payload.compound_custom = {
      tools: { enabled_tools: compoundTools },
    }
  }

  const body = JSON.stringify(payload)

  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body,
      })

      if (res.ok) {
        const data = await res.json()
        let content = data?.choices?.[0]?.message?.content || ''
        // Remove blocos de "thinking" de modelos Qwen 3 / reasoning que vazam para o output.
        content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
        return { ok: true, content }
      }

      const errText = await res.text()
      const rateLimited = isGroqRateLimit(res.status, errText)

      if (rateLimited && attempt < MAX_ATTEMPTS) {
        const waitMs = parseGroqRetryAfterMs(errText, res.headers)
        await sleep(waitMs)
        continue
      }

      if (rateLimited) {
        return { ok: false, status: 429, error: GROQ_RATE_LIMIT_USER_MESSAGE }
      }

      return { ok: false, status: res.status, error: `Groq API Error (${res.status}): ${errText}` }
    }

    return { ok: false, status: 429, error: GROQ_RATE_LIMIT_USER_MESSAGE }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return { ok: false, status: 500, error: errorMsg }
  }
}
