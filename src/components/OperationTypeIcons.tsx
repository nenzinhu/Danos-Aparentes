'use client'
import type { InspectionPurpose } from '../types'

interface IconProps {
  size?: number
  className?: string
}

/**
 * Ícone "Entrada / Recebimento": seta descendo para dentro de uma bandeja —
 * indica o veículo chegando/being received.
 */
export function EntradaIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3 V14" />
      <path d="M8 10 L12 14 L16 10" />
      <path d="M4 18 H20" />
      <path d="M4 20.5 H20" strokeWidth={3} strokeLinecap="butt" />
    </svg>
  )
}

/**
 * Ícone "Saída / Entrega": seta subindo saindo de uma bandeja —
 * indica o veículo sendo entregue/handed over.
 */
export function SaidaIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21 V10" />
      <path d="M8 14 L12 10 L16 14" />
      <path d="M4 6 H20" />
      <path d="M4 3.5 H20" strokeWidth={3} strokeLinecap="butt" />
    </svg>
  )
}

/** Seletor de tipo de operação com ícones SVG (Entrada × Saída). */
export function OperationTypeToggle({
  value,
  onChange,
  className,
}: {
  value: InspectionPurpose
  onChange: (v: InspectionPurpose) => void
  className?: string
}) {
  const base =
    'flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[0.8rem] font-bold transition-all'
  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => onChange('entrada')}
        aria-pressed={value === 'entrada'}
        className={`${base} ${
          value === 'entrada'
            ? 'border-[var(--success)]/60 bg-[var(--success)]/15 text-[var(--success)]'
            : 'border-white/10 bg-[var(--card-bg)]/60 text-[var(--text-muted)] hover:bg-slate-800'
        }`}
      >
        <EntradaIcon size={18} />
        Entrada / Recebimento
      </button>
      <button
        type="button"
        onClick={() => onChange('retorno')}
        aria-pressed={value === 'retorno'}
        className={`${base} ${
          value === 'retorno'
            ? 'border-[var(--primary)]/60 bg-[var(--primary)]/15 text-[var(--primary)]'
            : 'border-white/10 bg-[var(--card-bg)]/60 text-[var(--text-muted)] hover:bg-slate-800'
        }`}
      >
        <SaidaIcon size={18} />
        Saída / Entrega
      </button>
    </div>
  )
}
