import { describe, expect, it } from 'vitest'
import {
  extendSubscriptionExpiry,
  hasActiveSubscriptionAccess,
  isPixActive,
  isTrialActive,
} from './subscriptionAccess'

const NOW = Date.parse('2026-07-15T12:00:00.000Z')

describe('hasActiveSubscriptionAccess', () => {
  it('libera Stripe active sem checar datas', () => {
    expect(hasActiveSubscriptionAccess({ status: 'active', now: NOW })).toBe(true)
  })

  it('libera trial válido e bloqueia trial expirado', () => {
    expect(
      hasActiveSubscriptionAccess({
        status: 'trialing',
        trialEndsAt: '2026-07-20T00:00:00.000Z',
        now: NOW,
      }),
    ).toBe(true)
    expect(
      hasActiveSubscriptionAccess({
        status: 'trialing',
        trialEndsAt: '2026-07-01T00:00:00.000Z',
        now: NOW,
      }),
    ).toBe(false)
  })

  it('libera active_pix só com expires_at no futuro', () => {
    expect(
      hasActiveSubscriptionAccess({
        status: 'active_pix',
        expiresAt: '2026-08-15T00:00:00.000Z',
        now: NOW,
      }),
    ).toBe(true)
    expect(
      hasActiveSubscriptionAccess({
        status: 'active_pix',
        expiresAt: '2026-07-01T00:00:00.000Z',
        now: NOW,
      }),
    ).toBe(false)
    expect(hasActiveSubscriptionAccess({ status: 'active_pix', now: NOW })).toBe(false)
  })

  it('bloqueia pending_pix, past_due e canceled', () => {
    for (const status of ['pending_pix', 'past_due', 'canceled', null, undefined]) {
      expect(hasActiveSubscriptionAccess({ status, now: NOW })).toBe(false)
    }
  })
})

describe('isPixActive / isTrialActive', () => {
  it('exige status e data válidos', () => {
    expect(isPixActive('active_pix', '2026-08-01T00:00:00.000Z', NOW)).toBe(true)
    expect(isPixActive('active', '2026-08-01T00:00:00.000Z', NOW)).toBe(false)
    expect(isTrialActive('trialing', 'not-a-date', NOW)).toBe(false)
  })
})

describe('extendSubscriptionExpiry', () => {
  it('usa now quando não há expires_at', () => {
    const next = extendSubscriptionExpiry(null, 1, new Date(NOW))
    expect(next.toISOString()).toBe('2026-08-15T12:00:00.000Z')
  })

  it('estende a partir de expires_at futuro', () => {
    const next = extendSubscriptionExpiry('2026-09-01T00:00:00.000Z', 1, new Date(NOW))
    expect(next.toISOString()).toBe('2026-10-01T00:00:00.000Z')
  })

  it('não estende a partir de expires_at já vencido', () => {
    const next = extendSubscriptionExpiry('2026-06-01T00:00:00.000Z', 1, new Date(NOW))
    expect(next.toISOString()).toBe('2026-08-15T12:00:00.000Z')
  })

  it('trata months inválido como 1', () => {
    const next = extendSubscriptionExpiry(null, 0, new Date(NOW))
    expect(next.toISOString()).toBe('2026-08-15T12:00:00.000Z')
  })
})
