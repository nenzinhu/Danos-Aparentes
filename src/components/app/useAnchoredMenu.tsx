'use client'

import { useLayoutEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

type Anchor = { top: number; left: number; width: number }

const emptySubscribe = () => () => {}

/** Só renderiza o portal depois de montar no cliente (evita mismatch de SSR). */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

/**
 * Posiciona um menu flutuante ancorado num gatilho, para ser renderizado em
 * portal no `document.body`.
 *
 * Motivo: dropdowns `absolute` dentro da tab bar do app ficam presos ao
 * container com `overflow-x-auto` (a barra rolável) — o menu é CORTADO na
 * borda em vez de flutuar sobre o conteúdo. Trocar para `position: fixed`
 * também não basta quando algum ancestral tem `transform`, porque esse
 * ancestral vira o containing block. O portal escapa das duas armadilhas.
 *
 * `align`: 'left' alinha a borda esquerda do menu ao gatilho; 'right' alinha a
 * borda direita. O menu é sempre mantido dentro da viewport (margem de 8px).
 */
export function useAnchoredMenu(
  open: boolean,
  triggerRef: React.RefObject<HTMLElement | null>,
  menuWidth: number,
  align: 'left' | 'right' = 'left',
): Anchor | null {
  const [pos, setPos] = useState<Anchor | null>(null)

  useLayoutEffect(() => {
    if (!open) return
    const measure = () => {
      const el = triggerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const margin = 8
      const w = Math.min(menuWidth, window.innerWidth - margin * 2)
      let left = align === 'right' ? r.right - w : r.left
      left = Math.max(margin, Math.min(left, window.innerWidth - w - margin))
      setPos({ top: r.bottom + 8, left, width: w })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open, triggerRef, menuWidth, align])

  return open ? pos : null
}

export function MenuPortal({ children }: { children: React.ReactNode }) {
  const mounted = useMounted()
  if (!mounted) return null
  return createPortal(children, document.body)
}

export type { Anchor }
