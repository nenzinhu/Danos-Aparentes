'use client'

import { useId } from 'react'

type Props = {
  size?: number
  className?: string
  /** Mantido por compat; mark fica estático (sem inércia/hover GSAP). */
  throwRadius?: number
}

/**
 * Mark da marca DQA (lupa com "D · lupa · A").
 *
 * Duas variantes vetoriais, trocadas por CSS (`html.light`) e não por estado
 * React — assim não há flash de logo errado na hidratação nem mismatch de SSR:
 *  - tema escuro: squircle azul-escuro, lupa ciano, letras azul-médio;
 *  - tema claro: lupa em argila/terracota sobre fundo creme, letras bege.
 */
export default function FaviconInertiaMark({ size = 44, className }: Props) {
  const uid = useId().replace(/:/g, '')
  const dLens = `dqa-lens-dark-${uid}`
  const dRim = `dqa-rim-dark-${uid}`
  const lLens = `dqa-lens-light-${uid}`
  const lRim = `dqa-rim-light-${uid}`

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className ?? ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="DQA — Danos Aparentes"
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="overflow-visible"
        aria-hidden
      >
        <defs>
          {/* ---- tema escuro ---- */}
          <linearGradient id={dRim} x1="12" y1="10" x2="48" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7FD4F5" />
            <stop offset="1" stopColor="#4FA8DC" />
          </linearGradient>
          <radialGradient id={dLens} cx="0.38" cy="0.32" r="0.78">
            <stop offset="0" stopColor="#BFE6F8" />
            <stop offset="1" stopColor="#8CC6E6" />
          </radialGradient>

          {/* ---- tema claro (argila / terracota) ---- */}
          <linearGradient id={lRim} x1="12" y1="10" x2="48" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8A5A3B" />
            <stop offset="1" stopColor="#6B4327" />
          </linearGradient>
          <radialGradient id={lLens} cx="0.38" cy="0.32" r="0.78">
            <stop offset="0" stopColor="#7A4D30" />
            <stop offset="1" stopColor="#5C3720" />
          </radialGradient>
        </defs>

        {/* ================= TEMA ESCURO ================= */}
        <g className="dqa-dark">
          <rect width="64" height="64" rx="14" fill="#1E293B" />
          {/* cabo (base escura + traço claro por cima) */}
          <line
            x1="38.5" y1="38.5" x2="52" y2="52"
            stroke="#1E293B" strokeWidth="11" strokeLinecap="round"
          />
          <line
            x1="38.5" y1="38.5" x2="52" y2="52"
            stroke={`url(#${dRim})`} strokeWidth="7" strokeLinecap="round"
          />
          <circle cx="27" cy="27" r="17" fill={`url(#${dLens})`} />
          <circle
            cx="27" cy="27" r="17"
            fill="none" stroke={`url(#${dRim})`} strokeWidth="4.5"
          />
          {/* letras D Q A dentro da lente */}
          <text
            x="27" y="29.6"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
            fontSize="12.5" fontWeight="700" letterSpacing="0.4"
            fill="#2C6FA8"
          >
            DQA
          </text>
          {/* brilho */}
          <ellipse cx="20.5" cy="19.5" rx="4.6" ry="3.4" fill="#FFFFFF" opacity="0.62" transform="rotate(-32 20.5 19.5)" />
          <text x="55.5" y="59" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="7" fill="#FFFFFF" opacity="0.9">®</text>
        </g>

        {/* ================= TEMA CLARO ================= */}
        <g className="dqa-light">
          <rect width="64" height="64" rx="14" fill="#F3EFE6" />
          <line
            x1="38.5" y1="38.5" x2="52" y2="52"
            stroke="#F3EFE6" strokeWidth="11" strokeLinecap="round"
          />
          <line
            x1="38.5" y1="38.5" x2="52" y2="52"
            stroke={`url(#${lRim})`} strokeWidth="7" strokeLinecap="round"
          />
          <circle cx="27" cy="27" r="17" fill={`url(#${lLens})`} />
          <circle
            cx="27" cy="27" r="17"
            fill="none" stroke={`url(#${lRim})`} strokeWidth="4.5"
          />
          <text
            x="27" y="29.6"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
            fontSize="12.5" fontWeight="700" letterSpacing="0.4"
            fill="#E8DCC8"
          >
            DQA
          </text>
          <ellipse cx="20.5" cy="19.5" rx="4.6" ry="3.4" fill="#FFFFFF" opacity="0.42" transform="rotate(-32 20.5 19.5)" />
          <text x="55.5" y="59" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="7" fill="#6B4327" opacity="0.9">®</text>
        </g>
      </svg>
    </div>
  )
}
