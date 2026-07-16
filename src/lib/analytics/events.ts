import { hasMarketingConsent } from './consent'
import { initGoogleAds } from './pixels'
import { getStoredUtms } from './utm'

export type PixEventSource = 'planos' | 'paywall' | 'pagamento-pix' | 'trial_link'

export type PixEventParams = {
  source: PixEventSource
  duration_months?: number
  value?: number
  currency?: string
}

function gaEventsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (!hasMarketingConsent()) return false
  const force = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'
  const isProd = process.env.NODE_ENV === 'production'
  return force || isProd
}

function utmPayload(): Record<string, string | undefined> {
  const u = getStoredUtms()
  return {
    utm_source: u.source,
    utm_medium: u.medium,
    utm_campaign: u.campaign,
    utm_content: u.content,
  }
}

function cleanParams(params: Record<string, string | number | boolean | undefined>): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined),
  )
}

/** Safe GA4/gtag + dataLayer event — no-op when consent missing or adblock blocks scripts. */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (!gaEventsEnabled()) return

  const payload = cleanParams({ ...utmPayload(), ...params })

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, ...payload })

  initGoogleAds()
  window.gtag?.('event', eventName, payload)
}

export function trackPixCtaClick(params: PixEventParams): void {
  trackEvent('pix_cta_click', params)
}

export function trackPixQrGenerated(params: PixEventParams): void {
  trackEvent('pix_qr_generated', params)
}

export function trackPixPaymentConfirmed(params: Omit<PixEventParams, 'source'> & { source?: PixEventSource }): void {
  trackEvent('pix_payment_confirmed', { source: 'pagamento-pix', ...params })
}
