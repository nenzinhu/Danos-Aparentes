// Rate limiter: Upstash Redis / Vercel KV quando configurado; fallback em memória.
// Em multi-instance Vercel o fallback só protege cada instância quente.

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 5000

const limiterCache = new Map<string, Ratelimit>()
let redisClient: Redis | null | undefined

export type RateLimitResult = { allowed: boolean; retryAfterSec: number }

/** True quando UPSTASH_* ou KV_REST_* estão definidos. */
export function isDistributedRateLimitConfigured(): boolean {
  return Boolean(getRedisRestCredentials())
}

function getRedisRestCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return { url, token }
}

function getRedisClient(): Redis | null {
  if (redisClient !== undefined) return redisClient
  const creds = getRedisRestCredentials()
  if (!creds) {
    redisClient = null
    return null
  }
  redisClient = new Redis({ url: creds.url, token: creds.token })
  return redisClient
}

function getDistributedLimiter(limit: number, windowMs: number): Ratelimit | null {
  const redis = getRedisClient()
  if (!redis) return null

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000))
  const cacheKey = `${limit}:${windowSec}`
  let limiter = limiterCache.get(cacheKey)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(limit, `${windowSec} s`),
      prefix: 'rl',
    })
    limiterCache.set(cacheKey, limiter)
  }
  return limiter
}

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

async function checkRateLimitDistributed(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult | null> {
  const limiter = getDistributedLimiter(limit, windowMs)
  if (!limiter) return null

  try {
    const { success, reset } = await limiter.limit(key)
    const retryAfterSec = success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return { allowed: success, retryAfterSec }
  } catch (err) {
    console.warn('[rateLimit] Upstash falhou, usando memória:', err)
    return null
  }
}

/** Preferencialmente async — usa Redis/KV se credenciais estiverem no env. */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const distributed = await checkRateLimitDistributed(key, limit, windowMs)
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

/** Limpa estado in-memory entre testes unitários. */
export function resetRateLimitMemoryForTests(): void {
  buckets.clear()
  limiterCache.clear()
  redisClient = undefined
}

function pruneExpired(now: number) {
  for (const [k, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(k)
  }
}
