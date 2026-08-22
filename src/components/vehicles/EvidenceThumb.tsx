'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { resolvePhotoUrl } from '@/src/lib/photoStore'

/** Miniatura de evidência — resolve blob:/storage: sem alterar bytes. */
export default function EvidenceThumb({
  photoRef,
  label,
}: {
  photoRef?: string | null
  label: string
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!photoRef) {
        if (!cancelled) setUrl(null)
        return
      }
      try {
        const resolved = await resolvePhotoUrl(photoRef)
        if (cancelled) return
        setUrl(resolved || null)
      } catch {
        if (!cancelled) setUrl(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [photoRef])

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg-solid)] overflow-hidden min-h-[120px] flex flex-col">
      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] border-b border-[var(--card-border)]">
        {label}
      </div>
      {url ? (
        <Image src={url} alt={label} className="w-full h-28 object-cover" width={320} height={112} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)] p-3">
          {photoRef ? 'Carregando…' : 'Sem foto'}
        </div>
      )}
    </div>
  )
}
