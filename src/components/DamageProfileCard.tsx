'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import type { DamageType, Severity } from '../types'

// Lazy-load ThreeDamageCanvas so three.js (~600 KB) is only bundled when
// the '3d' mode is actually rendered — keeps the main bundle lean.
const ThreeDamageCanvas = dynamic(() => import('./ThreeDamageCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg-solid)]" style={{ width: 244, height: 210 }}>
      <span className="text-xs text-slate-500">Carregando 3D…</span>
    </div>
  ),
})

interface Props {
  type: DamageType
  severity?: Severity
  partName?: string
  isSelected?: boolean
  onClick?: () => void
  mode?: 'image' | '3d'
  className?: string
}

/**
 * Componente visual de perfil de avaria exibindo as 3 imagens 3D originais intocadas
 * ou a renderização 3D Three.js WebGL interativa para a peça selecionada do diagrama.
 */
export default function DamageProfileCard({
  type,
  severity = 'high',
  partName,
  isSelected = false,
  onClick,
  mode = 'image',
  className = '',
}: Props) {
  if (mode === '3d') {
    return (
      <div
        onClick={onClick}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onClick) {
            e.preventDefault()
            onClick()
          }
        }}
      >
        <ThreeDamageCanvas
          type={type}
          severity={severity}
          partName={partName || 'Peça Selecionada'}
          width={220}
          height={180}
          className={`${isSelected ? 'ring-4 ring-[var(--primary)]/40 border-[var(--primary)] scale-105' : ''} ${className}`}
        />
      </div>
    )
  }

  const isScratch = type === 'scratch'
  const isDent = type === 'dent'

  // Ilustrações vetoriais de porta de veículo (SVG, fundo transparente)
  const imgSrc = isScratch
    ? '/damage/porta-riscada.svg'
    : isDent
    ? '/damage/porta-amassada.svg'
    : '/damage/porta-trincada.svg'

  const imgAlt = isScratch
    ? 'Risco / Arranhado — porta de veículo com riscos profundos na lataria'
    : isDent
    ? 'Amassado / Deformado — porta de veículo amassada'
    : 'Quebrado / Trincado — porta de veículo com painel estilhaçado'

  // Card highlight borders for selection
  const borderClass = isScratch
    ? isSelected
      ? 'border-[var(--success)] ring-4 ring-[var(--success)]/30 shadow-[0_0_30px_color-mix(in_srgb,var(--success)_40%,transparent)] scale-105'
      : 'border-[var(--card-border)] hover:border-[var(--success)]/50'
    : isDent
    ? isSelected
      ? 'border-amber-500 ring-4 ring-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.4)] scale-105'
      : 'border-[var(--card-border)] hover:border-amber-500/50'
    : isSelected
    ? 'border-rose-500 ring-4 ring-[var(--severity-high)]/30 shadow-[0_0_30px_color-mix(in_srgb,var(--severity-high)_40%,transparent)] scale-105'
    : 'border-[var(--card-border)] hover:border-[var(--severity-high)]/50'

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
      className={`
        relative flex flex-col items-center justify-center p-1.5 rounded-2xl border-2 overflow-hidden transition-all duration-300 cursor-pointer select-none bg-[var(--card-bg-solid)] shadow-2xl group
        ${borderClass}
        ${className}
      `}
    >
      <div className="relative w-full overflow-hidden rounded-2xl">
        {/* src é blob/data URL dinâmico — next/image não se aplica */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={imgAlt}
          loading="lazy"
          decoding="async"
          className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      {partName && (
        <div className="py-1 text-[0.62rem] font-bold text-[var(--primary)] uppercase tracking-widest text-center truncate w-full px-2">
          {partName}
        </div>
      )}
    </div>
  )
}
