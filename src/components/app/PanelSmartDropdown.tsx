'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface PanelSmartDropdownProps {
  onSelect: (view: 'vehicles' | 'dashboard') => void
}

const OPTIONS: { id: 'vehicles' | 'dashboard'; label: string; desc: string }[] = [
  { id: 'vehicles', label: 'Histórico', desc: 'Veículos e inspeções' },
  { id: 'dashboard', label: 'Gestão de Histórica', desc: 'KPIs e auditoria' },
]

/**
 * Ícone "Painel Inteligente" no topo. Hover/tap mostra tooltip; clique abre
 * dropdown com Histórico / Gestão de Histórica e troca a tela principal.
 */
export default function PanelSmartDropdown({ onSelect }: PanelSmartDropdownProps) {
  const [open, setOpen] = useState(false)
  const [tooltip, setTooltip] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!open || !menuRef.current) return
    const el = menuRef.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      el,
      { opacity: 0, y: -6 },
      { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' },
    )
  }, [open])

  return (
    <div
      ref={wrapRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => setTooltip(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Painel Inteligente"
        title="Painel Inteligente"
        className="px-3 sm:px-4 py-2 rounded-lg text-xs font-bold font-outfit transition-colors cursor-pointer border inline-flex items-center gap-1.5 theme-tab-idle text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent hover:bg-white/[0.03] focus-visible:ring-2 ring-[var(--primary)] outline-none"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={open ? 'text-[var(--primary)]' : 'text-slate-400'}
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        <span className="hidden sm:inline">Painel Inteligente</span>
      </button>

      {tooltip && !open && (
        <div
          role="tooltip"
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-md bg-black/85 px-2.5 py-1.5 text-[11px] font-semibold text-white pointer-events-none"
        >
          Painel Inteligente
        </div>
      )}

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Painel Inteligente"
          className="absolute top-full mt-2 right-0 z-50 w-56 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] shadow-xl p-1.5"
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onSelect(opt.id)
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/[0.05] focus-visible:ring-2 ring-[var(--primary)] outline-none flex flex-col"
            >
              <span className="text-sm font-bold text-[var(--text-main)]">{opt.label}</span>
              <span className="text-[11px] text-[var(--text-muted)]">{opt.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
