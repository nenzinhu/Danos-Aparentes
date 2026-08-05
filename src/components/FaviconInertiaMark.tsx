'use client'

import { useId } from 'react'

type Props = {
  size?: number
  className?: string
  /** Mantido por compat; mark fica estático (sem inércia/hover GSAP). */
  throwRadius?: number
}

/** Mark da marca (lupa = favicon) — estático na landing. */
export default function FaviconInertiaMark({ size = 44, className }: Props) {
  const uid = useId().replace(/:/g, '')
  const gId = `fav-mark-${uid}`

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className ?? ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Danos Aparentes"
    >
      <svg viewBox="0 0 32 32" width={size} height={size} className="overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={gId} x1="4" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2FBCEE" offset="0" />
            <stop stopColor="#4D8AFE" offset="1" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="7" fill="#020617" />
        <circle cx="13.5" cy="13.5" r="8.2" fill="#0B1B30" stroke={`url(#${gId})`} strokeWidth="2.6" />
        <circle cx="13.5" cy="13.5" r="5.2" fill="#DBF1FF" />
        <circle cx="11.4" cy="11.2" r="1.6" fill="#FFFFFF" opacity="0.55" />
        <line
          x1="19.2"
          y1="19.2"
          x2="26.4"
          y2="26.4"
          stroke="#0B1B30"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <line
          x1="19.2"
          y1="19.2"
          x2="26.4"
          y2="26.4"
          stroke={`url(#${gId})`}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
