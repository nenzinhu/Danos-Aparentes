'use client'
import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'

interface Props {
  src: string
  alt: string
  className?: string
  /** Fator máximo de zoom (transform scale). */
  maxZoom?: number
}

/**
 * Imagem com zoom controlado por GSAP, restrito à própria área do card.
 * O zoom é feito via `transform: scale()` (GPU), SEM recompressão — a
 * imagem original em alta resolução é preservada. O pan segue o cursor
 * (desktop) ou o toque (mobile), com clamp para não sair do card.
 */
export default function GsapZoomImage({ src, alt, className, maxZoom = 2.6 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const [zoomed, setZoomed] = useState(false)

  const clamp = useCallback((v: number, min: number, max: number) => Math.max(min, Math.min(max, v)), [])

  const moveTo = useCallback(
    (clientX: number, clientY: number) => {
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const px = clamp((clientX - rect.left) / rect.width, 0, 1)
      const py = clamp((clientY - rect.top) / rect.height, 0, 1)
      // translate para centralizar o ponto sob o cursor (origem 50% 50%)
      const x = (0.5 - px) * (rect.width * (maxZoom - 1))
      const y = (0.5 - py) * (rect.height * (maxZoom - 1))
      gsap.to(imgRef.current, {
        x,
        y,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    },
    [clamp, maxZoom],
  )

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!zoomed) return
      moveTo(e.clientX, e.clientY)
    },
    [zoomed, moveTo],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!zoomed) return
      const t = e.touches[0]
      if (t) moveTo(t.clientX, t.clientY)
    },
    [zoomed, moveTo],
  )

  const setZoom = useCallback(
    (on: boolean) => {
      setZoomed(on)
      if (!imgRef.current) return
      if (on) {
        gsap.to(imgRef.current, { scale: maxZoom, duration: 0.4, ease: 'power3.out', overwrite: 'auto' })
      } else {
        gsap.to(imgRef.current, {
          scale: 1,
          x: 0,
          y: 0,
          duration: 0.4,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
    },
    [maxZoom],
  )

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden cursor-zoom-in ${className ?? ''}`}
      onMouseMove={onMove}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onTouchStart={() => setZoom(!zoomed)}
      onTouchMove={onTouchMove}
    >
      <div ref={imgRef} className="will-change-transform" style={{ transformOrigin: '50% 50%' }}>
        <div className="absolute inset-0">
          <Image
            src={src}
            alt={alt}
            fill
            quality={92}
            className="object-contain object-top"
            sizes="(max-width: 1024px) 100vw, 640px"
            priority={false}
          />
        </div>
      </div>
      <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-white/90 backdrop-blur">
        🔍 Passe o mouse / toque para ampliar
      </span>
    </div>
  )
}
