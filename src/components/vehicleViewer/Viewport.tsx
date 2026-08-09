'use client'
import React, { useState, useEffect, useCallback, useMemo, memo, Suspense, useRef } from 'react'
import type { ViewType } from '../../types'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { vehicleRegistry } from '../vehicles/registry'
import DamageCallouts, { DamageCalloutLegend } from '../DamageCallouts'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useVehicleViewer } from './context'
import { VIEW_ORDER } from './context'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(DrawSVGPlugin)
}

const orbitVariants: Variants = {
  initial: (dir: number) => ({ rotateY: dir * 50, opacity: 0, scale: 0.97 }),
  animate: {
    rotateY: 0, opacity: 1, scale: 1,
    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  },
  exit: (dir: number) => ({
    rotateY: dir * -50, opacity: 0, scale: 0.97,
    transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
  }),
}

export const Viewport = memo(function Viewport({ isFullscreen = false }: { isFullscreen?: boolean }) {
  const { vehicleType, viewType, damages, speak, speakHover,
    selectedPart, setSelectedPart, orbitDir, containerRef, targetRef,
    baseContainerRef, baseTargetRef, scale, outlineMode, previousReport, compareMode,
    onViewTypeChange, onGoToDossier,
  } = useVehicleViewer()
  const scannerRef = useRef<HTMLDivElement>(null)

  const VehicleComp = vehicleRegistry[vehicleType]?.[viewType] || vehicleRegistry['car']?.[viewType] || vehicleRegistry['car']['lateral-left']
  const layoutKey = `${vehicleType}-${viewType}`
  const [compact, setCompact] = useState(false)

  // Rastreia quais vistas já foram vistas nesta sessão do diagrama.
  const seenViewsRef = useRef<Set<ViewType>>(new Set())
  seenViewsRef.current.add(viewType)
  const allViewsSeen = seenViewsRef.current.size >= VIEW_ORDER.length

  const goToView = useCallback((dir: 1 | -1) => {
    if (!onViewTypeChange) return
    const idx = VIEW_ORDER.indexOf(viewType)
    const next = VIEW_ORDER[(idx + dir + VIEW_ORDER.length) % VIEW_ORDER.length]
    onViewTypeChange(next)
  }, [viewType, onViewTypeChange])

  // Warm-up: pré-carrega os 4 SVGs do tipo atual para o cache do client,
  // eliminando o "Carregando diagrama…" na primeira troca de vista.
  useEffect(() => {
    const entry = vehicleRegistry[vehicleType] || vehicleRegistry['car']
    if (!entry) return
    Object.values(entry).forEach((comp) => {
      try {
        // next/dynamic expõe o loader em _payload (interno); ignorar se indisponível.
        const loader = (comp as { _payload?: () => Promise<unknown> })?._payload
        if (typeof loader === 'function') void loader()
      } catch { /* no-op */ }
    })
  }, [vehicleType])

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

  // Professional entrance for every vehicle/view swap. Robust: never leaves the
  // diagram invisible if the effect is interrupted (fast view switches, slow lazy
  // chunk, or a missing GSAP plugin). Parts are always visible at rest.
  useEffect(() => {
    const root = targetRef.current
    if (!root) return

    // Garante visibilidade base antes de qualquer animação.
    const ensureVisible = () => {
      gsap.set(root.querySelectorAll<SVGElement>('.part'), { clearProps: 'all', autoAlpha: 1 })
      const sc = scannerRef.current
      if (sc) gsap.set(sc, { autoAlpha: 0 })
    }

    if (prefersReducedMotion()) {
      ensureVisible()
      return
    }

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
        // Estado final garantido: visível. O 'from' apenas desloca/escala; nunca
        // esconde (sem autoAlpha:0), então uma interrupção não deixa invisível.
        gsap.set(parts, { transformOrigin: '50% 50%', transformBox: 'fill-box' })
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
        tl.from(parts, {
          y: 8,
          scale: 0.98,
          duration: 0.22,
          stagger: 0.02,
          onInterrupt: () => gsap.set(parts, { clearProps: 'all', autoAlpha: 1 }),
        })
        if (strokable.length) {
          tl.fromTo(
            strokable,
            { drawSVG: '0%' },
            {
              drawSVG: '100%',
              duration: 0.4,
              stagger: 0.015,
              ease: 'power2.inOut',
              onComplete: () => gsap.set(strokable, { clearProps: 'strokeDasharray,strokeDashoffset' }),
              onInterrupt: () => gsap.set(strokable, { clearProps: 'strokeDasharray,strokeDashoffset' }),
            },
            '-=0.14',
          )
        }
        const scanner = scannerRef.current
        if (scanner) {
          tl.fromTo(
            scanner,
            { clipPath: 'inset(0 0 100% 0)' },
            { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power1.inOut' },
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

    if (play()) return () => {
      ctx?.revert()
      ensureVisible()
    }

    const mo = new MutationObserver(() => {
      if (play()) mo.disconnect()
    })
    mo.observe(root, { childList: true, subtree: true })
    // Segurança: se o SVG demora (chunk lazy) ou o plugin falha, força visível.
    const safety = window.setTimeout(() => {
      mo.disconnect()
      ensureVisible()
    }, 500)
    return () => {
      mo.disconnect()
      window.clearTimeout(safety)
      ctx?.revert()
      ensureVisible()
    }
  }, [layoutKey, targetRef])

  return (
    <div className={`flex flex-col ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>
      <div
        ref={setContainerNode}
        className={`relative overflow-hidden cursor-grab touch-none flex items-center justify-center [perspective:1100px] [perspective-origin:center_center] vehicle-stage ${isFullscreen ? 'rounded-0 flex-1 min-h-0' : 'rounded-2xl flex-1 min-h-[220px]'} ${outlineMode ? `va-outline${isFullscreen ? ' va-outline--fs' : ''}` : ''}`}
      >
        <AnimatePresence mode='popLayout' custom={orbitDir}>
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
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[0.75rem]">
                    <span className="animate-pulse">Carregando diagrama…</span>
                  </div>
                }
              >
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

        {/* Setas de navegação entre as 4 vistas.
            Desktop (>=640px): nas laterais, fora da área do SVG.
            Mobile (<640px): barra abaixo do diagrama, sem sobrepor o veículo. */}
        {onViewTypeChange && (
          <>
            {/* Desktop: setas laterais flutuantes nas bordas do container */}
            <button
              type="button"
              aria-label="Vista anterior"
              onClick={() => goToView(-1)}
              className="hidden sm:flex absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-black/45 text-white text-xl font-bold hover:bg-black/70 active:scale-95 transition-all"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Próxima vista"
              onClick={() => goToView(1)}
              className="hidden sm:flex absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-black/45 text-white text-xl font-bold hover:bg-black/70 active:scale-95 transition-all"
            >
              ›
            </button>
          </>
        )}

        {/* Após ver as 4 vistas, pergunta se deseja ir para o dossiê */}
        {allViewsSeen && onGoToDossier && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[var(--card-bg)]/95 border border-[var(--card-border)] rounded-full px-3 py-1.5 shadow-lg">
            <span className="text-[0.7rem] text-[var(--text-main)] font-semibold">Ver as 4 vistas? Ir para o dossiê?</span>
            <button
              type="button"
              onClick={() => onGoToDossier()}
              className="text-[0.7rem] font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-full px-2.5 py-1 transition-colors"
            >
              Ir para dossiê →
            </button>
          </div>
        )}
      </div>

      {/* Mobile: barra de navegação entre as 4 vistas, abaixo do diagrama
          (não sobrepõe o SVG do veículo). Aparece só em telas estreitas. */}
      {onViewTypeChange && (
        <div className="sm:hidden mt-3 flex items-center justify-between gap-2 px-1">
          <button
            type="button"
            onClick={() => goToView(-1)}
            className="flex-1 min-h-11 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--btn-secondary-bg)] text-[var(--text-main)] text-sm font-bold hover:bg-white/5 active:scale-95 transition-all"
          >
            <span aria-hidden="true" className="text-lg leading-none">‹</span>
            Anterior
          </button>
          <span className="text-[0.7rem] font-mono-data uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">
            {VIEW_ORDER.indexOf(viewType) + 1}/{VIEW_ORDER.length}
          </span>
          <button
            type="button"
            onClick={() => goToView(1)}
            className="flex-1 min-h-11 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--btn-secondary-bg)] text-[var(--text-main)] text-sm font-bold hover:bg-white/5 active:scale-95 transition-all"
          >
            Próxima
            <span aria-hidden="true" className="text-lg leading-none">›</span>
          </button>
        </div>
      )}

      {compact ? (
        <DamageCalloutLegend
          damages={viewDamages}
          selectedPart={selectedForCallouts}
        />
      ) : null}
    </div>
  )
})
