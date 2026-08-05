import { describe, expect, it } from 'vitest'
import type Stripe from 'stripe'
import { getCurrentPeriodEnd, mapStripeStatus, resolvePlanTier } from './route.js'

function makeSubscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: 'sub_123',
    status: 'active',
    items: { data: [{ price: { id: 'price_pro' } }] },
    ...overrides,
  } as unknown as Stripe.Subscription
}

describe('mapStripeStatus', () => {
  it('trata active e trialing como active', () => {
    expect(mapStripeStatus('active')).toBe('active')
    expect(mapStripeStatus('trialing')).toBe('active')
  })

  it('trata past_due, unpaid e incomplete como past_due', () => {
    expect(mapStripeStatus('past_due')).toBe('past_due')
    expect(mapStripeStatus('unpaid')).toBe('past_due')
    expect(mapStripeStatus('incomplete')).toBe('past_due')
  })

  it('trata qualquer outro status como canceled', () => {
    expect(mapStripeStatus('canceled')).toBe('canceled')
    expect(mapStripeStatus('incomplete_expired')).toBe('canceled')
  })
})

describe('getCurrentPeriodEnd', () => {
  it('lê o campo do item da subscription (API nova)', () => {
    const sub = makeSubscription({
      items: { data: [{ price: { id: 'price_pro' }, current_period_end: 1700000000 }] },
    } as never)
    expect(getCurrentPeriodEnd(sub)).toBe(1700000000)
  })

  it('cai para o campo legado no objeto subscription quando o item não tem', () => {
    const sub = makeSubscription({ current_period_end: 1600000000 } as never)
    expect(getCurrentPeriodEnd(sub)).toBe(1600000000)
  })

  it('retorna null quando nenhuma fonte tem o campo', () => {
    const sub = makeSubscription()
    expect(getCurrentPeriodEnd(sub)).toBeNull()
  })
})

describe('resolvePlanTier', () => {
  it('retorna pro quando STRIPE_PRICE_ID_CORPORATE não está configurado', () => {
    delete process.env.STRIPE_PRICE_ID_CORPORATE
    delete process.env.STRIPE_PRICE_ID_STARTER
    delete process.env.STRIPE_PRICE_ID_PRO
    delete process.env.STRIPE_PRICE_ID
    const sub = makeSubscription()
    expect(resolvePlanTier(sub)).toBe('pro')
  })

  it('retorna corporativo quando algum item bate com o price base corporativo', () => {
    process.env.STRIPE_PRICE_ID_CORPORATE = 'price_corp_base'
    const sub = makeSubscription({
      items: {
        data: [
          { price: { id: 'price_corp_inspector_extra' } },
          { price: { id: 'price_corp_base' } },
        ],
      } as never,
    })
    expect(resolvePlanTier(sub)).toBe('corporativo')
    delete process.env.STRIPE_PRICE_ID_CORPORATE
  })

  it('retorna starter quando o price starter está na assinatura', () => {
    process.env.STRIPE_PRICE_ID_STARTER = 'price_starter'
    process.env.STRIPE_PRICE_ID_PRO = 'price_pro'
    const sub = makeSubscription({ items: { data: [{ price: { id: 'price_starter' } }] } as never })
    expect(resolvePlanTier(sub)).toBe('starter')
    delete process.env.STRIPE_PRICE_ID_STARTER
    delete process.env.STRIPE_PRICE_ID_PRO
  })

  it('retorna pro quando o price Pro (legado STRIPE_PRICE_ID) bate', () => {
    delete process.env.STRIPE_PRICE_ID_PRO
    process.env.STRIPE_PRICE_ID = 'price_pro_legacy'
    const sub = makeSubscription({ items: { data: [{ price: { id: 'price_pro_legacy' } }] } as never })
    expect(resolvePlanTier(sub)).toBe('pro')
    delete process.env.STRIPE_PRICE_ID
  })

  it('retorna pro quando nenhum item bate com o price base corporativo', () => {
    process.env.STRIPE_PRICE_ID_CORPORATE = 'price_corp_base'
    const sub = makeSubscription({ items: { data: [{ price: { id: 'price_pro' } }] } as never })
    expect(resolvePlanTier(sub)).toBe('pro')
    delete process.env.STRIPE_PRICE_ID_CORPORATE
  })
})
