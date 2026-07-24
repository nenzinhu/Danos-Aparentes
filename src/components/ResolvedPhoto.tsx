'use client';
import { useEffect, useState } from 'react'
import { resolvePhotoUrl } from '../lib/photoStore'

export function ResolvedPhoto({
  refOrDataUrl,
  alt = '',
  className,
  onClick,
}: {
  refOrDataUrl: string
  alt?: string
  className?: string
  onClick?: () => void
}) {
  const [src, setSrc] = useState(() => (refOrDataUrl.startsWith('data:') ? refOrDataUrl : ''))

  useEffect(() => {
    let cancelled = false
    resolvePhotoUrl(refOrDataUrl).then(url => {
      if (!cancelled) setSrc(url)
    })
    return () => { cancelled = true }
  }, [refOrDataUrl])

  if (!src) {
    return <div className={`bg-black/20 animate-pulse ${className ?? ''}`} aria-hidden="true" />
  }

  return <img src={src} alt={alt} className={className} onClick={onClick} />
}
