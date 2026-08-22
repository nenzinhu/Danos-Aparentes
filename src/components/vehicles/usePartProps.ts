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

export type PartMotion = 'default' | 'pro'

interface UsePartPropsOptions {
  /** `pro` = GSAP timeline + DrawSVG. Default is pro for all vehicles. */
  motion?: PartMotion
}

const PRO_TL_KEY = '__daProTl' as const
const PRO_HOVER_KEY = '__daProHover' as const

type ProEl = SVGElement & {
  [PRO_TL_KEY]?: gsap.core.Timeline
  [PRO_HOVER_KEY]?: gsap.core.Tween
}

function reducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function strokableTargets(el: SVGElement): SVGElement[] {
  const targets = el.tagName.toLowerCase() === 'g'
    ? Array.from(el.querySelectorAll<SVGElement>('path, rect, circle, ellipse, polygon, line'))
    : [el]
  return targets.filter(t => t.getAttribute('pointer-events') !== 'none')
}

function prepareSvgMotion(el: SVGElement) {
  el.style.transformBox = 'fill-box'
  el.style.transformOrigin = 'center'
  // Avoid CSS transform transitions fighting GSAP.
  el.style.transitionProperty = 'fill, stroke, stroke-width, filter'
}

/** Legacy Framer pop — kept for motion: 'default'. */
function popPart(el: SVGElement) {
  if (typeof window === 'undefined' || reducedMotion()) return

  prepareSvgMotion(el)
  animate(el, { scale: [1, 1.08, 1] }, { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] })
}

/** Legacy DrawSVG-only path. */
function drawSelection(el: SVGElement) {
  if (typeof window === 'undefined' || reducedMotion()) return

  const strokable = strokableTargets(el)
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

/** Pro selection: one timeline for pop + outline draw + settle. */
function playProSelection(el: ProEl) {
  if (reducedMotion()) return

  prepareSvgMotion(el)
  el[PRO_TL_KEY]?.kill()
  el[PRO_HOVER_KEY]?.kill()

  const strokable = strokableTargets(el)
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      if (strokable.length) {
        gsap.set(strokable, { clearProps: 'strokeDasharray,strokeDashoffset' })
      }
    },
  })

  el[PRO_TL_KEY] = tl

  tl.fromTo(el, { scale: 1 }, { scale: 1.07, duration: 0.18 })

  if (strokable.length) {
    tl.fromTo(
      strokable,
      { drawSVG: '0%' },
      {
        drawSVG: '100%',
        duration: 0.75,
        stagger: 0.05,
        ease: 'power2.inOut',
      },
      '<0.04',
    )
  }

  tl.to(el, { scale: 1, duration: 0.32, ease: 'back.out(1.8)' }, '-=0.35')
}

function playProHoverIn(el: ProEl) {
  if (reducedMotion()) return
  if (el.classList.contains('selected')) return

  prepareSvgMotion(el)
  el[PRO_HOVER_KEY]?.kill()
  el[PRO_HOVER_KEY] = gsap.to(el, {
    scale: 1.035,
    duration: 0.22,
    ease: 'power2.out',
    overwrite: 'auto',
  })
}

function playProHoverOut(el: ProEl) {
  if (reducedMotion()) return
  if (el.classList.contains('selected')) return

  prepareSvgMotion(el)
  el[PRO_HOVER_KEY]?.kill()
  el[PRO_HOVER_KEY] = gsap.to(el, {
    scale: 1,
    duration: 0.22,
    ease: 'power2.out',
    overwrite: 'auto',
  })
}

export function usePartProps(
  damages: Damage[],
  selectedPartId: string | null,
  onPartClick: PartClickHandler,
  onPartHover: PartClickHandler,
  options: UsePartPropsOptions = {},
) {
  const motion: PartMotion = options.motion ?? 'pro'

  return useCallback((id: string) => {
    const dmg = damages.find(d => d.partId === id)
    const isWheel = id.includes('wheel')
    const cls = [
      'part',
      motion === 'pro' ? 'part-pro-motion' : '',
      isWheel ? 'wheel-part' : '',
      dmg ? `damage-${dmg.severity}` : '',
      selectedPartId === id ? 'selected' : '',
    ].filter(Boolean).join(' ')

    return {
      'data-part-id': id,
      className: cls,
      onClick: (e: MouseEvent<SVGElement>) => {
        e.stopPropagation()
        const target = e.currentTarget as ProEl
        const name = target.getAttribute('data-name') || id
        if (motion === 'pro') {
          playProSelection(target)
        } else {
          popPart(target)
          drawSelection(target)
        }
        onPartClick(id, name)
      },
      onMouseEnter: (e: MouseEvent<SVGElement>) => {
        const target = e.currentTarget as ProEl
        const name = target.getAttribute('data-name') || id
        if (motion === 'pro') playProHoverIn(target)
        onPartHover(id, name)
      },
      onMouseLeave: (e: MouseEvent<SVGElement>) => {
        if (motion === 'pro') playProHoverOut(e.currentTarget as ProEl)
      },
    }
  }, [damages, selectedPartId, onPartClick, onPartHover, motion])
}
