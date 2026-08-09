/** Retry helpers for Groq TPM / 429 rate limits. */

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Parse Groq "Please try again in X.Ys" or Retry-After header.
 * Caps wait so serverless functions don't hang forever.
 */
export function parseGroqRetryAfterMs(
  errBody: string,
  headers?: Headers | null,
  caps = { min: 500, max: 12_000 },
): number {
  const headerRaw = headers?.get('retry-after')
  if (headerRaw) {
    const asNum = Number(headerRaw)
    if (Number.isFinite(asNum) && asNum >= 0) {
      return Math.min(caps.max, Math.max(caps.min, asNum * 1000))
    }
    const asDate = Date.parse(headerRaw)
    if (Number.isFinite(asDate)) {
      const delta = asDate - Date.now()
      if (delta > 0) return Math.min(caps.max, Math.max(caps.min, delta))
    }
  }

  const m = errBody.match(/try again in\s+(\d+(?:\.\d+)?)\s*s/i)
  if (m) {
    const sec = Number(m[1])
    if (Number.isFinite(sec) && sec >= 0) {
      return Math.min(caps.max, Math.max(caps.min, Math.ceil(sec * 1000) + 150))
    }
  }

  return caps.min
}

export function isGroqRateLimit(status: number, body: string): boolean {
  if (status === 429) return true
  return /rate_limit_exceeded|tokens per minute|tpm/i.test(body)
}

export const GROQ_RATE_LIMIT_USER_MESSAGE =
  'A IA está temporariamente ocupada (limite de uso). Aguarde alguns segundos e tente de novo.'
