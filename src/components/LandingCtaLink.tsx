'use client'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trackLead } from '@/src/lib/analytics/pixels'
import { trackCtaClick, type FunnelCtaSource } from '@/src/lib/analytics/events'
import { appendUtmsToPath } from '@/src/lib/analytics/utm'

interface Props {
  id?: string
  className?: string
  style?: CSSProperties
  children: ReactNode
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

  useEffect(() => {
    setHref(appendUtmsToPath('/app?mode=signup'))
    // ponytail: warm /app RSC+JS while user reads landing — trades idle bandwidth for faster tap-to-login.
    router.prefetch('/app')
    router.prefetch('/app?mode=signup')
  }, [router])

  return (
    <Link
      id={id}
      href={href}
      prefetch
      transitionTypes={transitionTypes as never}
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
