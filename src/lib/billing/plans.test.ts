import { describe, expect, it } from 'vitest'
import { PLANS, parsePixPlan, parseSelfServePlan, planDisplayName } from '@/src/lib/billing/plans'
import { getStripePriceId, resolveCheckoutPlan } from '@/src/lib/server/stripePlans'

describe('billing plans catalog', () => {
  it('mantém os valores comerciais canônicos', () => {
    expect(PLANS.starter.amountBrlCents).toBe(2990)
    expect(PLANS.pro.amountBrlCents).toBe(7990)
    expect(PLANS.corporativo.amountBrlCents).toBe(29900)
    expect(PLANS.starter.laudosPerMonth).toBe(20)
    expect(PLANS.pro.laudosPerMonth).toBe(80)
    expect(PLANS.corporativo.laudosPerMonth).toBeNull()
  })

  it('parseSelfServePlan defaulta para pro', () => {
    expect(parseSelfServePlan('starter')).toBe('starter')
    expect(parseSelfServePlan('pro')).toBe('pro')
    expect(parseSelfServePlan(null)).toBe('pro')
  })

  it('parsePixPlan aceita corporativo', () => {
    expect(parsePixPlan('starter')).toBe('starter')
    expect(parsePixPlan('corporativo')).toBe('corporativo')
    expect(parsePixPlan('growth')).toBe('pro')
    expect(planDisplayName('corporativo')).toBe('Corporativo Start')
  })
})

describe('getStripePriceId', () => {
  it('usa STRIPE_PRICE_ID_PRO ou fallback STRIPE_PRICE_ID', () => {
    delete process.env.STRIPE_PRICE_ID_PRO
    process.env.STRIPE_PRICE_ID = 'price_legacy'
    expect(getStripePriceId('pro')).toBe('price_legacy')
    process.env.STRIPE_PRICE_ID_PRO = 'price_new'
    expect(getStripePriceId('pro')).toBe('price_new')
    delete process.env.STRIPE_PRICE_ID
    delete process.env.STRIPE_PRICE_ID_PRO
  })

  it('resolveCheckoutPlan aponta env correta', () => {
    process.env.STRIPE_PRICE_ID_STARTER = 'price_s'
    const r = resolveCheckoutPlan('starter')
    expect(r.plan).toBe('starter')
    expect(r.priceId).toBe('price_s')
    delete process.env.STRIPE_PRICE_ID_STARTER
  })
})
