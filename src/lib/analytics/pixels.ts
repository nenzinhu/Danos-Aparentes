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
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const TIKTOK_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
const GOOGLE_ADS_ID = 'AW-18259031185'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Antes esse gtag.js era injetado incondicionalmente em layout.tsx (afterInteractive
// em toda página, antes mesmo do usuário decidir sobre cookies). Centralizamos aqui
// para respeitar o mesmo consentimento de marketing que já vale para Meta/TikTok,
// e para não custar ~150KB + ~360ms de script logo no carregamento inicial.

/**
 * Adia execução para quando o browser estiver ocioso (requestIdleCallback),
 * com fallback de 3s para browsers que não suportam (Safari < 17).
 * Reduz TBT ao não disputar a main thread durante o LCP.
 */
function whenIdle(fn: () => void): void {
  if (typeof window === 'undefined') return
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fn, { timeout: 3000 })
  } else {
    setTimeout(fn, 3000)
  }
}

export function initGoogleAds(): void {
  if (typeof window === 'undefined') return
  if (!hasMarketingConsent()) return
  if ((window as unknown as { __daGtagBooted?: boolean }).__daGtagBooted) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GOOGLE_ADS_ID)
  if (GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
  }
  ;(window as unknown as { __daGtagBooted?: boolean }).__daGtagBooted = true

  whenIdle(() => {
    const script = document.createElement('script')
    script.async = true
    const loaderId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID
    script.src = `https://www.googletagmanager.com/gtag/js?id=${loaderId}`
    document.head.appendChild(script)
  })
}

export function analyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (!hasMarketingConsent()) return false
  const force = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'
  const isProd = process.env.NODE_ENV === 'production'
  if (!force && !isProd) return false
  return Boolean(META_ID || TIKTOK_ID || GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_POSTHOG_KEY)
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

export function initPixels(): void {
  if (!analyticsEnabled()) return

  if (META_ID && !window.fbq) {
    whenIdle(() => {
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
      window.fbq!('init', META_ID!)
    })
  }

  if (TIKTOK_ID && !window.ttq) {
    whenIdle(() => {
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
    })
  }
}

export function trackPageView(): void {
  if (!analyticsEnabled()) return
  initPixels()
  initGoogleAds()
  const payload = utmPayload()
  window.fbq?.('track', 'PageView', payload)
  window.ttq?.page?.()
  if (GA_MEASUREMENT_ID) {
    window.gtag?.('event', 'page_view', { ...payload, send_to: GA_MEASUREMENT_ID })
  }
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
