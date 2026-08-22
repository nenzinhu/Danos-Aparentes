import { afterEach, describe, expect, it } from 'vitest'
import {
  checkRateLimit,
  checkRateLimitSync,
  isDistributedRateLimitConfigured,
  resetRateLimitMemoryForTests,
} from './rateLimit'

describe('rateLimit (memória)', () => {
  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
    resetRateLimitMemoryForTests()
  })

  it('permite até o limite e bloqueia depois', async () => {
    const key = `test-${Date.now()}`
    const limit = 3
    const windowMs = 60_000

    for (let i = 0; i < limit; i += 1) {
      const result = await checkRateLimit(key, limit, windowMs)
      expect(result.allowed).toBe(true)
      expect(result.retryAfterSec).toBe(0)
    }

    const blocked = await checkRateLimit(key, limit, windowMs)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
  })

  it('isolates keys independently', async () => {
    const limit = 2
    const windowMs = 60_000
    const keyA = `a-${Date.now()}`
    const keyB = `b-${Date.now()}`

    await checkRateLimit(keyA, limit, windowMs)
    await checkRateLimit(keyA, limit, windowMs)
    const blockedA = await checkRateLimit(keyA, limit, windowMs)
    const allowedB = await checkRateLimit(keyB, limit, windowMs)

    expect(blockedA.allowed).toBe(false)
    expect(allowedB.allowed).toBe(true)
  })

  it('checkRateLimitSync mirrors memory behavior', () => {
    const key = `sync-${Date.now()}`
    const limit = 2
    const windowMs = 60_000

    expect(checkRateLimitSync(key, limit, windowMs).allowed).toBe(true)
    expect(checkRateLimitSync(key, limit, windowMs).allowed).toBe(true)
    expect(checkRateLimitSync(key, limit, windowMs).allowed).toBe(false)
  })
})

describe('rateLimit (config)', () => {
  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
    resetRateLimitMemoryForTests()
  })

  it('isDistributedRateLimitConfigured is false without env', () => {
    expect(isDistributedRateLimitConfigured()).toBe(false)
  })

  it('detects Upstash env vars', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token'
    expect(isDistributedRateLimitConfigured()).toBe(true)
  })

  it('detects Vercel KV env vars', () => {
    process.env.KV_REST_API_URL = 'https://example.upstash.io'
    process.env.KV_REST_API_TOKEN = 'token'
    expect(isDistributedRateLimitConfigured()).toBe(true)
  })

  it('prefers Upstash vars when both are set', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://upstash.example'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'upstash-token'
    process.env.KV_REST_API_URL = 'https://kv.example'
    process.env.KV_REST_API_TOKEN = 'kv-token'
    expect(isDistributedRateLimitConfigured()).toBe(true)
  })
})

/** Budgets usados nas rotas de IA (damage-vision, bulk, chat-support). */
describe('Gemini API rate budgets', () => {
  const TEN_MIN = 10 * 60 * 1000

  afterEach(() => {
    resetRateLimitMemoryForTests()
  })

  it('damage-vision: 25 req/10min por usuário', async () => {
    const key = `damage-vision:test-user-${Date.now()}`
    for (let i = 0; i < 25; i += 1) {
      expect((await checkRateLimit(key, 25, TEN_MIN)).allowed).toBe(true)
    }
    expect((await checkRateLimit(key, 25, TEN_MIN)).allowed).toBe(false)
  })

  it('damage-vision-bulk: 8 req/10min por usuário', async () => {
    const key = `damage-vision-bulk:test-user-${Date.now()}`
    for (let i = 0; i < 8; i += 1) {
      expect((await checkRateLimit(key, 8, TEN_MIN)).allowed).toBe(true)
    }
    expect((await checkRateLimit(key, 8, TEN_MIN)).allowed).toBe(false)
  })

  it('chat-support: 18 req/10min por IP', async () => {
    const key = `chat-support:203.0.113.${Date.now() % 255}`
    for (let i = 0; i < 18; i += 1) {
      expect((await checkRateLimit(key, 18, TEN_MIN)).allowed).toBe(true)
    }
    expect((await checkRateLimit(key, 18, TEN_MIN)).allowed).toBe(false)
  })

  it('view-side-classify: 15 req/10min por usuário', async () => {
    const key = `view-side-classify:test-user-${Date.now()}`
    for (let i = 0; i < 15; i += 1) {
      expect((await checkRateLimit(key, 15, TEN_MIN)).allowed).toBe(true)
    }
    expect((await checkRateLimit(key, 15, TEN_MIN)).allowed).toBe(false)
  })
})
