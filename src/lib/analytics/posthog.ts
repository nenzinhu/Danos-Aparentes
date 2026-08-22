'use client'

import posthog from 'posthog-js'
import { hasMarketingConsent } from './consent'

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

type PersistenceMode = 'full' | 'memory'

let booted = false
let bootMode: PersistenceMode | null = null

function analyticsRuntimeEnabled(): boolean {
  const force = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'
  const isProd = process.env.NODE_ENV === 'production'
  return force || isProd
}

/**
 * PostHog para funil de produto.
 * - Com consentimento de marketing: localStorage+cookie
 * - Sem consentimento: memory (sem cookie de ads) — só eventos de produto
 */
export function initPostHog(mode: PersistenceMode = 'full'): void {
  if (typeof window === 'undefined') return
  if (!KEY) return
  if (!analyticsRuntimeEnabled()) return

  if (mode === 'full' && !hasMarketingConsent()) return

  if (booted) {
    // Upgrade memory → full when user accepts cookies mid-session.
    if (bootMode === 'memory' && mode === 'full' && hasMarketingConsent()) {
      posthog.set_config({ persistence: 'localStorage+cookie' })
      bootMode = 'full'
    }
    return
  }

  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false,
    persistence: mode === 'full' ? 'localStorage+cookie' : 'memory',
    person_profiles: 'identified_only',
  })
  booted = true
  bootMode = mode
}

export function capturePostHog(
  event: string,
  props?: Record<string, string | number | boolean | undefined>,
): void {
  if (!KEY || !booted) return
  const clean = Object.fromEntries(
    Object.entries(props || {}).filter((e): e is [string, string | number | boolean] => e[1] !== undefined),
  )
  posthog.capture(event, clean)
}

/** @internal tests */
export function resetPostHogForTests(): void {
  booted = false
  bootMode = null
}
