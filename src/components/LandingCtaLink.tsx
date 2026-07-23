'use client';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
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
  const [href, setHref] = useState('/app?mode=signup')

  useEffect(() => {
    setHref(appendUtmsToPath('/app?mode=signup'))
  }, [])

  return (
    <Link
      id={id}
      href={href}
      transitionTypes={transitionTypes as never}
      onClick={() => trackLead()}
      className={className}
      style={style}
    >
      {children}
    </Link>
  )
}
