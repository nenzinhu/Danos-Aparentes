'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { EntradaIcon, SaidaIcon } from '@/src/components/OperationTypeIcons'
import type { InspectionPurpose } from '@/src/types'
import { MenuPortal, useAnchoredMenu } from './useAnchoredMenu'

interface NewInspectionDropdownProps {
  onSelect: (purpose: InspectionPurpose) => void
  active?: boolean
}

const OPTIONS: { id: InspectionPurpose; label: string; desc: string; Icon: typeof EntradaIcon }[] = [
  { id: 'entrada', label: 'Entrada / Recebimento', desc: 'Veículo entra na guarda', Icon: EntradaIcon },
  { id: 'retorno', label: 'Saída / Entrega', desc: 'Veículo deixa a guarda', Icon: SaidaIcon },
]

const MENU_WIDTH = 240

/**
 * Aba "Iniciar Vistoria" vira dropdown com os tipos de vistoria.
 *
 * O menu flutua em portal no body (ver useAnchoredMenu) para não ficar
 * esmagado pelo `overflow-x-auto` da tab bar.
 */
export default function NewInspectionDropdown({ onSelect, active }: NewInspectionDropdownProps) {
  const [open, setOpen] = useState(false)
  const [tooltip, setTooltip] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const pos = useAnchoredMenu(open, btnRef, MENU_WIDTH, 'left')

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      // O menu é renderizado em portal no body (fora do wrapRef). Sem este
      // check, clicar num item fechava o menu no mousedown e o onClick nunca
      // disparava (o nó sumia antes do click subir).
      if (wrapRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(menuRef.current, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' })
  }, [open])

  return (
    <div
      ref={wrapRef}
      role="presentation"
      className="relative inline-flex items-center"
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => setTooltip(false)}
      onFocus={() => setTooltip(true)}
      onBlur={() => setTooltip(false)}
    >
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Iniciar Vistoria"
        title="Iniciar Vistoria"
        className={
          'px-3 sm:px-4 py-2 rounded-lg text-xs font-bold font-outfit transition-colors cursor-pointer border inline-flex items-center gap-1.5 ' +
          (active
            ? 'theme-tab-active bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--primary)]'
            : 'theme-tab-idle text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent hover:bg-white/[0.03]')
        }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={active ? 'text-white' : 'text-slate-400'}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
        <span className="hidden sm:inline">Iniciar Vistoria</span><span className="sm:hidden">Vistoria</span>
      </button>

      {tooltip && !open && (
        <div role="tooltip" className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-md bg-black/85 px-2.5 py-1.5 text-[11px] font-semibold text-white pointer-events-none">
          Iniciar Vistoria
        </div>
      )}

      <MenuPortal>
        {open && pos && (
          <div
            ref={menuRef}
            role="menu"
            aria-label="Tipo de inspeção"
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] shadow-xl p-1.5"
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
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/[0.05] focus-visible:ring-2 ring-[var(--primary)] outline-none flex items-center gap-2.5"
              >
                <opt.Icon size={18} className="text-[var(--primary)] shrink-0" />
                <span className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--text-main)]">{opt.label}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{opt.desc}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </MenuPortal>
    </div>
  )
}
