// Rate limiter simples em memória (janela fixa). Suficiente como freio básico
// contra abuso das APIs pagas (Gemini/ElevenLabs/Google TTS); não é distribuído
// entre instâncias serverless, mas limita o estrago dentro de cada instância
// "quente" e custa zero infraestrutura extra.
type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

const MAX_BUCKETS = 5000

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) pruneExpired(now)
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSec: 0 }
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { allowed: true, retryAfterSec: 0 }
}

function pruneExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}
