const STORAGE_KEY = 'utm_attribution'

export type UtmParams = {
  source?: string
  medium?: string
  campaign?: string
  content?: string
}

export function captureUtmParamsFromUrl(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const next: UtmParams = {}
  if (params.get('utm_source')) next.source = params.get('utm_source')!
  if (params.get('utm_medium')) next.medium = params.get('utm_medium')!
  if (params.get('utm_campaign')) next.campaign = params.get('utm_campaign')!
  if (params.get('utm_content')) next.content = params.get('utm_content')!
  if (Object.keys(next).length > 0) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
}

export function getStoredUtms(): UtmParams {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') as UtmParams
  } catch {
    return {}
  }
}

export function appendUtmsToPath(path: string): string {
  if (typeof window === 'undefined') return path
  const utms = getStoredUtms()
  const url = new URL(path, window.location.origin)
  if (utms.source) url.searchParams.set('utm_source', utms.source)
  if (utms.medium) url.searchParams.set('utm_medium', utms.medium)
  if (utms.campaign) url.searchParams.set('utm_campaign', utms.campaign)
  if (utms.content) url.searchParams.set('utm_content', utms.content)
  return url.pathname + url.search
}

export function hasPaidTrafficParams(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  if (params.has('utm_source') || params.has('utm_medium') || params.has('utm_campaign')) return true
  const stored = getStoredUtms()
  return Boolean(stored.source || stored.medium || stored.campaign)
}
