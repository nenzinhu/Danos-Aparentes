import { hasMarketingConsent } from './consent'
import { getStoredUtms } from './utm'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
    ttq?: {
      load: (id: string) => void
      page: () => void
      track: (event: string, payload?: Record<string, unknown>) => void
    }
  }
}

const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const TIKTOK_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

export function analyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (!hasMarketingConsent()) return false
  const force = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'
  const isProd = process.env.NODE_ENV === 'production'
  if (!force && !isProd) return false
  return Boolean(META_ID || TIKTOK_ID)
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

export function initPixels(): void {
  if (!analyticsEnabled()) return

  if (META_ID && !window.fbq) {
    ;(function (f: Window, b: Document, e: string, v: string) {
      const n = (f.fbq = function (...args: unknown[]) {
        const fbqFn = n as typeof f.fbq & {
          callMethod?: (...a: unknown[]) => void
          queue: unknown[]
        }
        if (fbqFn.callMethod) {
          fbqFn.callMethod(...args)
        } else {
          fbqFn.queue.push(args)
        }
      }) as typeof f.fbq & { queue: unknown[]; loaded?: boolean; version?: string }
      if (!f._fbq) f._fbq = n
      n.queue = []
      n.loaded = true
      n.version = '2.0'
      const t = b.createElement(e) as HTMLScriptElement
      t.async = true
      t.src = v
      const s = b.getElementsByTagName(e)[0]
      s.parentNode!.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    window.fbq!('init', META_ID)
  }

  if (TIKTOK_ID && !window.ttq) {
    const script = document.createElement('script')
    script.text = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
        var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${TIKTOK_ID}');
      }(window, document, 'ttq');
    `
    document.head.appendChild(script)
  }
}

export function trackPageView(): void {
  if (!analyticsEnabled()) return
  initPixels()
  const payload = utmPayload()
  window.fbq?.('track', 'PageView', payload)
  window.ttq?.page?.()
}

export function trackLead(): void {
  if (!analyticsEnabled()) return
  initPixels()
  const payload = utmPayload()
  window.fbq?.('track', 'Lead', payload)
  window.ttq?.track?.('SubmitForm', payload)
}

export function trackCompleteRegistration(): void {
  if (!analyticsEnabled()) return
  initPixels()
  const payload = utmPayload()
  window.fbq?.('track', 'CompleteRegistration', payload)
  window.ttq?.track?.('CompleteRegistration', payload)
}
