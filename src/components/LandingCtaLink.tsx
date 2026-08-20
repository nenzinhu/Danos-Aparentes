'use client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { trackLead } from '@/src/lib/analytics/pixels'
import { trackCtaClick, type FunnelCtaSource } from '@/src/lib/analytics/events'
import { appendUtmsToPath } from '@/src/lib/analytics/utm'

interface Props {
  id?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  transitionTypes?: string[]
  /** Origem do funil (landing / sticky / etc.) */
  eventSource?: FunnelCtaSource | string
}

export default function LandingCtaLink({
  id,
  className,
  style,
  children,
  transitionTypes,
  eventSource = 'other',
}: Props) {
  const router = useRouter()
  const [href, setHref] = useState('/app?mode=signup')
  const prefetched = useRef(false)

  useEffect(() => {
    setHref(appendUtmsToPath('/app?mode=signup'))
  }, [])

  const prefetchApp = useCallback(() => {
    if (prefetched.current) return
    prefetched.current = true
    try {
      router.prefetch('/app')
      router.prefetch('/app?mode=signup')
    } catch {
      // prefetch is opportunistic
    }
  }, [router])

  return (
    <Link
      id={id}
      href={href}
      prefetch
      transitionTypes={transitionTypes as never}
      onPointerEnter={prefetchApp}
      onTouchStart={prefetchApp}
      onClick={() => {
        trackLead()
        trackCtaClick({
          source: eventSource,
          cta_id: id,
          destination: '/app?mode=signup',
        })
      }}
      className={className}
      style={style}
    >
      {children}
    </Link>
  )
}
