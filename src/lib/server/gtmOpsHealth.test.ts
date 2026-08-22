import { describe, expect, it } from 'vitest'
import { evaluateGtmOps } from './gtmOpsHealth'

const fullProd = {
  NEXT_PUBLIC_BASE_URL: 'https://danosaparentes.com.br',
  NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'service',
  STRIPE_SECRET_KEY: 'sk_live_abc',
  STRIPE_WEBHOOK_SECRET: 'whsec_x',
  STRIPE_PRICE_ID: 'price_pro',
  STRIPE_PRICE_ID_STARTER: 'price_starter',
  PIX_PROVIDER: 'mercadopago',
  PIX_MERCADO_PAGO_ACCESS_TOKEN: 'mp_token',
  PIX_WEBHOOK_SECRET: 'pix_secret',
  CRON_SECRET: 'cron',
  SIGNATURE_LINK_SECRET: 'sig',
}

describe('evaluateGtmOps', () => {
  it('passa com env de produção completa', () => {
    const r = evaluateGtmOps(fullProd)
    expect(r.criticalOk).toBe(true)
    expect(r.ok).toBe(true)
    expect(r.summary.criticalFail).toBe(0)
  })

  it('exige token MP quando PIX_PROVIDER=mercadopago', () => {
    const { PIX_MERCADO_PAGO_ACCESS_TOKEN: _, ...rest } = fullProd
    const r = evaluateGtmOps(rest)
    expect(r.criticalOk).toBe(false)
    expect(r.checks.some((c) => c.id === 'pix_mp_token' && !c.ok)).toBe(true)
  })

  it('usa mercadopago como provider default', () => {
    const { PIX_PROVIDER: _, ...rest } = fullProd
    const r = evaluateGtmOps(rest)
    expect(r.checks.some((c) => c.id === 'pix_mp_token')).toBe(true)
  })

  it('falha se produção + Stripe test', () => {
    const r = evaluateGtmOps({ ...fullProd, STRIPE_SECRET_KEY: 'sk_test_abc' })
    expect(r.criticalOk).toBe(false)
    expect(r.checks.some((c) => c.id === 'stripe_mode_vs_base' && !c.ok)).toBe(true)
  })
})
