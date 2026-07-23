'use client';
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { captureUtmParamsFromUrl } from '@/src/lib/analytics/utm'
import { analyticsEnabled, initGoogleAds, initPixels, trackPageView } from '@/src/lib/analytics/pixels'
import { hasMarketingConsent } from '@/src/lib/analytics/consent'

export default function AnalyticsScripts() {
  const pathname = usePathname()

  useEffect(() => {
    captureUtmParamsFromUrl()
  }, [])

  useEffect(() => {
    function sync() {
      if (!hasMarketingConsent()) return
      initPixels()
      trackPageView()
      initGoogleAds()
    }
    sync()
    window.addEventListener('marketing-consent-changed', sync)
    return () => window.removeEventListener('marketing-consent-changed', sync)
  }, [])

  useEffect(() => {
    if (analyticsEnabled()) trackPageView()
  }, [pathname])

  return null
}
