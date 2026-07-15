// Rate limiter: Upstash Redis REST quando configurado; fallback em memória.
// Em multi-instance Vercel o fallback só protege cada instância quente.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 5000

export type RateLimitResult = { allowed: boolean; retryAfterSec: number }

function checkRateLimitMemory(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
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
  for (const [k, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(k)
  }
}

async function checkRateLimitUpstash(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult | null> {
  const base = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!base || !token) return null

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000))
  const windowId = Math.floor(Date.now() / windowMs)
  const redisKey = `rl:${key}:${windowId}`

  try {
    const res = await fetch(`${base}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', redisKey],
        ['EXPIRE', redisKey, windowSec],
      ]),
    })
    if (!res.ok) {
      console.warn('[rateLimit] Upstash HTTP', res.status)
      return null
    }
    const data = (await res.json()) as { result?: number }[]
    const count = Number(data?.[0]?.result ?? 0)
    if (!Number.isFinite(count) || count <= 0) return null
    if (count > limit) {
      const retryAfterSec = Math.max(1, windowSec - Math.floor(((Date.now() % windowMs) / 1000)))
      return { allowed: false, retryAfterSec }
    }
    return { allowed: true, retryAfterSec: 0 }
  } catch (err) {
    console.warn('[rateLimit] Upstash falhou, usando memória:', err)
    return null
  }
}

/** Preferencialmente async — usa Redis se UPSTASH_* estiver no env. */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const distributed = await checkRateLimitUpstash(key, limit, windowMs)
  if (distributed) return distributed
  return checkRateLimitMemory(key, limit, windowMs)
}

/** Sync legado (só memória) — preferir a versão async nas rotas. */
export function checkRateLimitSync(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  return checkRateLimitMemory(key, limit, windowMs)
}
