import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  GROQ_RATE_LIMIT_USER_MESSAGE,
  isGroqRateLimit,
  parseGroqRetryAfterMs,
} from '../groqRetry'
import { callGroqChat } from '../groqClient'
import { callGroqVision } from '../groqVision'
import { classifyStripePriceError, stripePriceUserMessage } from '../stripePlans'

describe('groqRetry', () => {
  it('parseia "try again in Xs" do corpo Groq', () => {
    const body =
      'Rate limit reached... Please try again in 9.9975s. Need more tokens?'
    expect(parseGroqRetryAfterMs(body)).toBeGreaterThanOrEqual(500)
    expect(parseGroqRetryAfterMs(body)).toBeLessThanOrEqual(12_000)
  })

  it('usa Retry-After em segundos', () => {
    const headers = new Headers({ 'retry-after': '2' })
    expect(parseGroqRetryAfterMs('', headers)).toBe(2000)
  })

  it('detecta rate_limit_exceeded no corpo', () => {
    expect(isGroqRateLimit(200, 'rate_limit_exceeded')).toBe(true)
    expect(isGroqRateLimit(429, '')).toBe(true)
    expect(isGroqRateLimit(500, 'oops')).toBe(false)
  })
})

describe('callGroqChat retry', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.GROQ_API_KEY = 'gsk_test_key_12345'
  })

  it('retenta em 429 e depois sucede', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers(),
        text: async () =>
          JSON.stringify({
            error: { message: 'Please try again in 0.01s', code: 'rate_limit_exceeded' },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'ok após retry' } }] }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const res = await callGroqChat({ messages: [{ role: 'user', content: 'oi' }] })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.content).toBe('ok após retry')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('após esgotar retries devolve mensagem amigável', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers(),
        text: async () => 'Please try again in 0.01s. rate_limit_exceeded',
      }),
    )

    const res = await callGroqChat({ messages: [{ role: 'user', content: 'oi' }] })
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.status).toBe(429)
      expect(res.error).toBe(GROQ_RATE_LIMIT_USER_MESSAGE)
    }
  })
})

describe('callGroqVision retry', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.GROQ_API_KEY = 'gsk_test_key_12345'
  })

  it('retorna mensagem amigável após 429 esgotado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers(),
        text: async () => 'Please try again in 0.01s. rate_limit_exceeded',
      }),
    )

    const res = await callGroqVision('prompt', 'data:image/jpeg;base64,xx', 'test')
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.status).toBe(429)
      expect(res.error).toBe(GROQ_RATE_LIMIT_USER_MESSAGE)
    }
  })
})

describe('classifyStripePriceError', () => {
  it('detecta mismatch test/live', () => {
    expect(
      classifyStripePriceError(
        new Error(
          "No such price: 'price_x'; a similar object exists in test mode, but a live mode key was used",
        ),
      ),
    ).toBe('test_live_mismatch')
  })

  it('mensagem cita a env var', () => {
    const msg = stripePriceUserMessage('test_live_mismatch', 'STRIPE_PRICE_ID_STARTER')
    expect(msg).toContain('STRIPE_PRICE_ID_STARTER')
    expect(msg).toContain('live')
  })
})
