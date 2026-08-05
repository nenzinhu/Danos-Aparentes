import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { capturePostHog, initPostHog, hasMarketingConsent } = vi.hoisted(() => ({
  capturePostHog: vi.fn(),
  initPostHog: vi.fn(),
  hasMarketingConsent: vi.fn(() => false),
}))

vi.mock('./posthog', () => ({
  capturePostHog,
  initPostHog,
}))

vi.mock('./consent', () => ({
  hasMarketingConsent,
}))

vi.mock('./pixels', () => ({
  initGoogleAds: vi.fn(),
}))

vi.mock('./utm', () => ({
  getStoredUtms: () => ({}),
}))

import {
  isProductFunnelEvent,
  trackCtaClick,
  trackEvent,
  trackFirstInspection,
  trackPixCtaClick,
} from './events'

describe('product funnel analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENABLED', '')
    Object.defineProperty(globalThis, 'window', {
      value: { dataLayer: [] as unknown[], localStorage: { getItem: () => null, setItem: vi.fn() } },
      configurable: true,
    })
    hasMarketingConsent.mockReturnValue(false)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('classifica eventos de funil como produto', () => {
    expect(isProductFunnelEvent('cta_click')).toBe(true)
    expect(isProductFunnelEvent('first_inspection')).toBe(true)
    expect(isProductFunnelEvent('pix_cta_click')).toBe(false)
  })

  it('envia cta_click sem consentimento de marketing (PostHog memory)', () => {
    trackCtaClick({ source: 'home', cta_id: 'hero' })
    expect(initPostHog).toHaveBeenCalledWith('memory')
    expect(capturePostHog).toHaveBeenCalledWith(
      'cta_click',
      expect.objectContaining({ source: 'home', funnel_step: 'cta' }),
    )
  })

  it('não envia pix_cta_click sem consentimento', () => {
    trackPixCtaClick({ source: 'planos' })
    expect(capturePostHog).not.toHaveBeenCalled()
  })

  it('first_inspection usa funnel_step activation', () => {
    trackFirstInspection({ status: 'draft' })
    expect(capturePostHog).toHaveBeenCalledWith(
      'first_inspection',
      expect.objectContaining({ funnel_step: 'activation', status: 'draft' }),
    )
  })

  it('com consentimento, funil usa PostHog full', () => {
    hasMarketingConsent.mockReturnValue(true)
    trackEvent('signup_start', { source: 'app_query' })
    expect(initPostHog).toHaveBeenCalledWith('full')
    expect(capturePostHog).toHaveBeenCalled()
  })
})
