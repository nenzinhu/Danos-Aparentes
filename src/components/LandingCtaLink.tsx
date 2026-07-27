'use client';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trackLead } from '@/src/lib/analytics/pixels'
import { appendUtmsToPath } from '@/src/lib/analytics/utm'

interface Props {
  id?: string
  className?: string
  style?: CSSProperties
  children: ReactNode
  transitionTypes?: string[]
}

export default function LandingCtaLink({ id, className, style, children, transitionTypes }: Props) {
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
      onClick={() => trackLead()}
      className={className}
      style={style}
    >
      {children}
    </Link>
  )
}
