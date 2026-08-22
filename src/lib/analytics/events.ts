import { hasMarketingConsent } from './consent'
import { initGoogleAds } from './pixels'
import { capturePostHog, initPostHog } from './posthog'
import { getStoredUtms } from './utm'

export type PixEventSource = 'planos' | 'paywall' | 'pagamento-pix' | 'trial_link'

export type PixEventParams = {
  source: PixEventSource
  duration_months?: number
  value?: number
  currency?: string
}

/** Eventos do funil de ativação — medidos mesmo sem consentimento de marketing (PostHog memory). */
const PRODUCT_FUNNEL_EVENTS = new Set([
  'cta_click',
  'signup_start',
  'onboarding_start',
  'onboarding_step_click',
  'onboarding_dismiss',
  'onboarding_complete',
  'first_inspection',
])

function runtimeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const force = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'
  const isProd = process.env.NODE_ENV === 'production'
  return force || isProd
}

function marketingEventsEnabled(): boolean {
  return runtimeEnabled() && hasMarketingConsent()
}

function utmPayload(): Record<string, string | undefined> {
  const u = getStoredUtms()
  return {
    utm_source: u.source,
    utm_medium: u.medium,
    utm_campaign: u.campaign,
    utm_content: u.content,
    utm_term: u.term,
  }
}

function cleanParams(
  params: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined),
  )
}

function pushDataLayer(
  eventName: string,
  payload: Record<string, string | number | boolean>,
): void {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, ...payload })
}

/**
 * Safe analytics.
 * - Funil de produto → PostHog (memory sem consent; full com consent) + dataLayer
 * - Demais eventos (ads/PIX marketing) → só com consentimento de marketing
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (!runtimeEnabled()) return

  const isProduct = PRODUCT_FUNNEL_EVENTS.has(eventName)
  if (!isProduct && !marketingEventsEnabled()) return

  const payload = cleanParams({ ...utmPayload(), ...params })

  pushDataLayer(eventName, payload)

  if (isProduct) {
    initPostHog(hasMarketingConsent() ? 'full' : 'memory')
    capturePostHog(eventName, payload)
    if (hasMarketingConsent()) {
      initGoogleAds()
      window.gtag?.('event', eventName, payload)
    }
    return
  }

  initGoogleAds()
  window.gtag?.('event', eventName, payload)
  initPostHog('full')
  capturePostHog(eventName, payload)
}

export function trackPixCtaClick(params: PixEventParams): void {
  trackEvent('pix_cta_click', params)
}

export function trackPixQrGenerated(params: PixEventParams): void {
  trackEvent('pix_qr_generated', params)
}

export function trackPixPaymentConfirmed(
  params: Omit<PixEventParams, 'source'> & { source?: PixEventSource },
): void {
  trackEvent('pix_payment_confirmed', { source: 'pagamento-pix', ...params })
}

/** Funil conversão: clique CTA landing → signup → 1ª vistoria */
export type FunnelCtaSource =
  | 'home'
  | 'locadoras'
  | 'oficinas'
  | 'frotas'
  | 'seguradoras'
  | 'historico'
  | 'planos'
  | 'sticky'
  | 'blog'
  | 'other'

export function trackCtaClick(params: {
  source: FunnelCtaSource | string
  cta_id?: string
  destination?: string
}): void {
  trackEvent('cta_click', { funnel_step: 'cta', ...params })
}

export function trackSignupStart(params?: { source?: string }): void {
  trackEvent('signup_start', { funnel_step: 'signup', ...params })
}

const FIRST_INSPECTION_KEY = 'da_first_inspection_tracked'

/** Dispara uma vez por navegador quando a primeira vistoria é salva. */
export function trackFirstInspection(params?: { status?: string }): void {
  if (typeof window === 'undefined') return
  try {
    if (window.localStorage.getItem(FIRST_INSPECTION_KEY) === '1') return
    window.localStorage.setItem(FIRST_INSPECTION_KEY, '1')
  } catch {
    // private mode / blocked storage — still emit once per session best-effort
  }
  trackEvent('first_inspection', { funnel_step: 'activation', ...params })
}

export function trackOnboardingStart(params?: { source?: string }): void {
  trackEvent('onboarding_start', { funnel_step: 'onboarding', ...params })
}

/** @internal tests */
export function isProductFunnelEvent(eventName: string): boolean {
  return PRODUCT_FUNNEL_EVENTS.has(eventName)
}
