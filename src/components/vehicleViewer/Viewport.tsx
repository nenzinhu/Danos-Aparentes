'use client'
import React, { useState, useEffect, useCallback, useMemo, memo, Suspense, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { vehicleRegistry } from '../vehicles/registry'
import DamageCallouts, { DamageCalloutLegend } from '../DamageCallouts'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useVehicleViewer } from './context'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(DrawSVGPlugin)
}

const orbitVariants = {
  initial: (dir: number) => ({ rotateY: dir * 90, opacity: 0, scale: 0.92 }),
  animate: {
    rotateY: 0, opacity: 1, scale: 1,
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
  },
  exit: (dir: number) => ({
    rotateY: dir * -90, opacity: 0, scale: 0.92,
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
  }),
}

export const Viewport = memo(function Viewport({ isFullscreen = false }: { isFullscreen?: boolean }) {
  const { vehicleType, viewType, damages, speak, speakHover,
    selectedPart, setSelectedPart, orbitDir, containerRef, targetRef,
    baseContainerRef, baseTargetRef, scale, outlineMode, previousReport, compareMode,
  } = useVehicleViewer()
  const scannerRef = useRef<HTMLDivElement>(null)

  const VehicleComp = vehicleRegistry[vehicleType]?.[viewType] || vehicleRegistry['car']?.[viewType] || vehicleRegistry['car']['lateral-left']
  const layoutKey = `${vehicleType}-${viewType}`
  const [compact, setCompact] = useState(false)

  // The shared containerRef/targetRef always track whichever Viewport
  // instance (small or fullscreen) is currently interactive. Only the small
  // instance also records into base*Ref, so it can be restored once the
  // fullscreen instance unmounts and nulls the shared refs out (see the
  // useLayoutEffect in RootComponent).
  const setContainerNode = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
    if (!isFullscreen) baseContainerRef.current = node
  }, [containerRef, baseContainerRef, isFullscreen])

  const setTargetNode = useCallback((node: HTMLDivElement | null) => {
    targetRef.current = node
    if (!isFullscreen) baseTargetRef.current = node
  }, [targetRef, baseTargetRef, isFullscreen])

  // Mobile / narrow SVG: pins on diagram + legend list (avoids jumbled labels).
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const update = () => {
      const narrowMq = mq.matches
      const narrowBox = (containerRef.current?.clientWidth ?? 0) > 0
        && (containerRef.current?.clientWidth ?? 999) < 440
      setCompact(narrowMq || narrowBox)
    }
    update()
    mq.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      mq.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [containerRef, layoutKey, isFullscreen])

  const viewDamages = useMemo(
    () => damages.filter(d => d.vehicle === vehicleType && d.view === viewType),
    [damages, vehicleType, viewType],
  )

  const selectedForCallouts = selectedPart
    ? { id: selectedPart.id, name: selectedPart.name }
    : null

  const handlePartClick = useCallback((id: string, name: string) => {
    speak(name)
    const root = containerRef.current
    const el = root?.querySelector(`[data-part-id="${CSS.escape(id)}"]`)
      ?? document.querySelector(`[data-part-id="${CSS.escape(id)}"]`)
    const rect = el?.getBoundingClientRect()
    // Posiciona o popup Tipo de Avaria na PARTE SUPERIOR (alinhado com o teto do veículo),
    // flutuante e 100% visível na página sem precisar deslizar ou diminuir o zoom.
    const POPUP_W = 280
    const POPUP_H = 350
    const cont = containerRef.current?.getBoundingClientRect()
    let x: number
    let y: number
    if (cont) {
      // Centraliza horizontalmente em relação ao contêiner do veículo
      const centerX = cont.left + (cont.width - POPUP_W) / 2
      x = Math.max(16, Math.min(centerX, window.innerWidth - POPUP_W - 16))
      // Alinha com a linha do teto / parte superior do visualizador
      y = Math.max(16, Math.min(cont.top + 8, window.innerHeight - POPUP_H - 16))
    } else {
      x = Math.max(16, Math.min(rect ? rect.left : 200, window.innerWidth - POPUP_W - 16))
      y = Math.max(16, Math.min(rect ? rect.top - 50 : 80, window.innerHeight - POPUP_H - 16))
    }
    setSelectedPart({ id, name, pos: { x, y } })
  }, [speak, setSelectedPart, containerRef])

  // Professional entrance for every vehicle/view swap (waits for dynamic SVG).
  useEffect(() => {
    const root = targetRef.current
    if (!root || prefersReducedMotion()) return

    let ctx: gsap.Context | null = null
    let done = false

    const play = () => {
      if (done) return true
      const parts = root.querySelectorAll<SVGElement>('.part')
      if (!parts.length) return false
      done = true

      const strokable = Array.from(parts).flatMap(part => {
        if (part.tagName.toLowerCase() === 'g') {
          return Array.from(part.querySelectorAll<SVGElement>('path, rect, circle, ellipse, polygon'))
            .filter(t => t.getAttribute('pointer-events') !== 'none')
        }
        return [part]
      })

      ctx = gsap.context(() => {
        gsap.set(parts, { transformOrigin: '50% 50%', transformBox: 'fill-box' })
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
        tl.from(parts, {
          autoAlpha: 0,
          y: 10,
          scale: 0.97,
          duration: 0.4,
          stagger: 0.035,
        })
        if (strokable.length) {
          tl.fromTo(
            strokable,
            { drawSVG: '0%' },
            {
              drawSVG: '100%',
              duration: 0.65,
              stagger: 0.025,
              ease: 'power2.inOut',
              onComplete: () => gsap.set(strokable, { clearProps: 'strokeDasharray,strokeDashoffset' }),
            },
            '-=0.22',
          )
        }
        // Scanner pericial: feixe desce revelando o diagrama (clip-path).
        const scanner = scannerRef.current
        if (scanner) {
          tl.fromTo(
            scanner,
            { clipPath: 'inset(0 0 100% 0)' },
            {
              clipPath: 'inset(0 0 0% 0)',
              duration: 0.9,
              ease: 'power1.inOut',
            },
            '-=0.3',
          )
          tl.fromTo(
            scanner.querySelector('.va-scanner-beam'),
            { yPercent: -120 },
            { yPercent: 560, duration: 0.9, ease: 'power1.inOut' },
            '<',
          )
          tl.to(scanner, { autoAlpha: 0, duration: 0.3 }, '+=0.05')
        }
      }, root)
      return true
    }

    if (play()) return () => { ctx?.revert() }

    const mo = new MutationObserver(() => {
      if (play()) mo.disconnect()
    })
    mo.observe(root, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      ctx?.revert()
    }
  }, [layoutKey, targetRef])

  return (
    <div className={`flex flex-col ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>
      <div
        ref={setContainerNode}
        className={`relative overflow-hidden cursor-grab touch-none flex items-center justify-center [perspective:1100px] [perspective-origin:center_center] ${isFullscreen ? 'rounded-0 flex-1 min-h-0' : 'rounded-2xl flex-1 min-h-[220px]'} ${outlineMode ? `va-outline${isFullscreen ? ' va-outline--fs' : ''}` : ''}`}
      >
        <AnimatePresence mode='wait' custom={orbitDir}>
          <motion.div
            key={layoutKey}
            custom={orbitDir}
            variants={orbitVariants}
            initial='initial'
            animate='animate'
            exit='exit'
            className={`[transform-style:preserve-3d] ${isFullscreen ? 'w-full h-full flex items-center justify-center' : 'w-full'}`}
          >
            <div
              ref={setTargetNode}
              id={`container-${vehicleType}-${viewType}`}
              style={{ width: '100%', transformOrigin: 'center center' }}
              className={isFullscreen ? 'h-full flex items-center justify-center [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full' : ''}
            >
              {/* Suspense must live below AnimatePresence, not above it: if a lazy
                  VehicleComp suspends while the previous view is still exiting,
                  a Suspense boundary that wraps AnimatePresence unmounts the
                  exiting element mid-animation, so onExitComplete never fires
                  and mode="wait" hangs forever. */}
              <Suspense fallback={null}>
                <VehicleComp
                  damages={viewDamages}
                  selectedPartId={selectedPart?.id ?? null}
                  onPartClick={handlePartClick}
                  onPartHover={(_, name) => speakHover(name)}
                />
              </Suspense>
            </div>
          </motion.div>
        </AnimatePresence>

        <div
          ref={scannerRef}
          aria-hidden="true"
          className="va-scanner pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl"
          style={{ clipPath: 'inset(0 0 100% 0)' }}
        >
          <div
            className="va-scanner-beam absolute inset-x-0 top-0 h-16"
            style={{
              background:
                'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--signal) 35%, transparent) 70%, color-mix(in srgb, var(--signal-bright) 70%, transparent))',
              filter: 'blur(1px)',
            }}
          />
        </div>

        <DamageCallouts
          containerRef={containerRef}
          damages={viewDamages}
          selectedPart={selectedForCallouts}
          scale={scale}
          layoutKey={layoutKey}
          compact={compact}
          compareMode={compareMode}
          baselineKeys={previousReport?.damageKeys}
        />
      </div>

      {compact ? (
        <DamageCalloutLegend
          damages={viewDamages}
          selectedPart={selectedForCallouts}
        />
      ) : null}
    </div>
  )
})
