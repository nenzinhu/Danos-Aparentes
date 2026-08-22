'use client'

import { useCallback, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * Animações GSAP + handlers de touch drag-and-drop compartilhados pelas listas
 * de campos do gerenciador (padrão e personalizados).
 */
export function useFieldDrag() {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [activeTouchDragKey, setActiveTouchDragKey] = useState<string | null>(null)

  const animateDragStart = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    gsap.to(el, {
      scale: 1.04,
      rotationZ: 1.5,
      boxShadow: '0 12px 30px rgba(14,165,233,0.4)',
      borderColor: 'rgba(56,189,248,0.8)',
      backgroundColor: 'rgba(14,165,233,0.18)',
      duration: 0.2,
      ease: 'power2.out',
    })
  }, [])

  const animateDragEnd = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    gsap.to(el, {
      scale: 1,
      rotationZ: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      borderColor: '',
      backgroundColor: '',
      duration: 0.35,
      ease: 'elastic.out(1, 0.6)',
    })
  }, [])

  /** Touch drag-and-drop reordering para mobile. */
  const handleTouchMove = useCallback(
    (
      e: React.TouchEvent,
      currentKey: string,
      onDragOver: (key: string) => void,
      onDrop: (key: string) => void,
    ) => {
      const touch = e.touches[0]
      if (!touch) return

      const targetEl = document.elementFromPoint(touch.clientX, touch.clientY)
      if (!targetEl) return

      const card = targetEl.closest('[data-field-key]')
      if (card) {
        const targetKey = card.getAttribute('data-field-key')
        if (targetKey && targetKey !== currentKey) {
          onDragOver(targetKey)
          onDrop(targetKey)
        }
      }
    },
    [],
  )

  return {
    itemRefs,
    activeTouchDragKey,
    setActiveTouchDragKey,
    animateDragStart,
    animateDragEnd,
    handleTouchMove,
  }
}
