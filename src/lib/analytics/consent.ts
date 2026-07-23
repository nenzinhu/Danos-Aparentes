const KEY = 'cookie_consent_marketing'

export type MarketingConsent = 'accepted' | 'rejected' | 'unknown'

export function getMarketingConsent(): MarketingConsent {
  if (typeof window === 'undefined') return 'unknown'
  const v = localStorage.getItem(KEY)
  if (v === 'accepted' || v === 'rejected') return v
  return 'unknown'
}

export function setMarketingConsent(value: 'accepted' | 'rejected'): void {
  localStorage.setItem(KEY, value)
  window.dispatchEvent(new CustomEvent('marketing-consent-changed', { detail: value }))
}

export function hasMarketingConsent(): boolean {
  return getMarketingConsent() === 'accepted'
}
