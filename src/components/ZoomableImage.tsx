'use client'
import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt: string
  className?: string
  /** Lupa: raio em px. */
  lensSize?: number
  /** Fator de zoom da lupa. */
  zoom?: number
}

/**
 * Imagem com lupa (magnifier) que segue o cursor no desktop e abre
 * em lightbox no toque/mobile. O alvo é a mesma imagem em alta resolução.
 */
export default function ZoomableImage({ src, alt, className, lensSize = 160, zoom = 2.4 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [open, setOpen] = useState(false)

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setPos(null)
      return
    }
    setPos({ x, y, w: rect.width, h: rect.height })
  }, [])

  const lens = pos ? (
    <div
      className="pointer-events-none absolute rounded-full border border-white/40 shadow-2xl"
      style={{
        width: lensSize,
        height: lensSize,
        left: pos.x - lensSize / 2,
        top: pos.y - lensSize / 2,
        backgroundImage: `url("${src}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${(pos.w * zoom)}px ${(pos.h * zoom)}px`,
        backgroundPosition: `${-(pos.x * zoom - lensSize / 2)}px ${-(pos.y * zoom - lensSize / 2)}px`,
        boxShadow: '0 0 0 9999px rgba(2,6,23,0.35)',
      }}
    />
  ) : null

  return (
    <>
      <div
        ref={wrapRef}
        className={`relative ${className ?? ''}`}
        onMouseMove={onMove}
        onMouseLeave={() => setPos(null)}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`Ampliar imagem: ${alt}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(true) }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          quality={92}
          className="object-contain object-top"
          sizes="(max-width: 1024px) 100vw, 640px"
        />
        {lens}
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-white/90 backdrop-blur">
          🔍 Passe o mouse / toque para ampliar
        </span>
      </div>

      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/20"
            aria-label="Fechar"
          >
            ✕ Fechar
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[92vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  )
}
