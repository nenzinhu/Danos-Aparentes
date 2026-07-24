'use client';
import { useCallback } from 'react'
import type { MouseEvent } from 'react'
import { animate } from 'framer-motion'
import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import type { Damage } from '../../types'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(DrawSVGPlugin)
}

type PartClickHandler = (id: string, name: string) => void

/**
 * Spring "pop" feedback on tap — a transient pulse, not a steady state,
 * so it's done imperatively here rather than through the CSS .selected
 * rules (which handle the persistent fill/outline once selected).
 */
function popPart(el: SVGElement) {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  el.style.transformBox = 'fill-box'
  el.style.transformOrigin = 'center'
  animate(el, { scale: [1, 1.08, 1] }, { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] })
}

/**
 * Traces the part's outline stroke on click via DrawSVGPlugin — a "highlighter"
 * sweep around the selected area rather than an instant stroke-width jump.
 * Groups (van/bus parts made of several child shapes) draw each child in a
 * light stagger so the trace reads as one continuous outline.
 */
function drawSelection(el: SVGElement) {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const targets = el.tagName.toLowerCase() === 'g'
    ? Array.from(el.querySelectorAll<SVGElement>('path, rect, circle, ellipse, polygon, line'))
    : [el]

  const strokable = targets.filter(t => t.getAttribute('pointer-events') !== 'none')
  if (!strokable.length) return

  gsap.fromTo(
    strokable,
    { drawSVG: '0%' },
    {
      drawSVG: '100%',
      duration: 1.4,
      ease: 'power2.out',
      stagger: 0.08,
      onComplete: () => gsap.set(strokable, { clearProps: 'strokeDasharray,strokeDashoffset' }),
    },
  )
}

export function usePartProps(
  damages: Damage[],
  selectedPartId: string | null,
  onPartClick: PartClickHandler,
  onPartHover: PartClickHandler,
) {
  return useCallback((id: string) => {
    const dmg = damages.find(d => d.partId === id)
    const isWheel = id.includes('wheel')
    const cls = [
      'part',
      isWheel ? 'wheel-part' : '',
      dmg ? `damage-${dmg.severity}` : '',
      selectedPartId === id ? 'selected' : '',
    ].filter(Boolean).join(' ')

    return {
      className: cls,
      onClick: (e: MouseEvent<SVGElement>) => {
        e.stopPropagation()
        const target = e.currentTarget as SVGElement
        const name = target.getAttribute('data-name') || id
        popPart(target)
        drawSelection(target)
        onPartClick(id, name)
      },
      onMouseEnter: (e: MouseEvent<SVGElement>) => {
        const name = (e.currentTarget as SVGElement).getAttribute('data-name') || id
        onPartHover(id, name)
      },
    }
  }, [damages, selectedPartId, onPartClick, onPartHover])
}
