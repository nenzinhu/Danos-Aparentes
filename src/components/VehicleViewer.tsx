'use client';
import React, { createContext, useContext, useRef, useState, useEffect, useCallback, useMemo, memo, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { VehicleType, ViewType, Damage, DamageType, Severity } from '../types'
import { vehicleRegistry } from './vehicles/registry'
import { useZoomPan } from '../hooks/useZoomPan'
import DamageFloat from './DamageFloat'
import DamageCallouts, { DamageCalloutLegend } from './DamageCallouts'
import VehicleDefs from './vehicles/VehicleDefs'
import ErrorBoundary from './ErrorBoundary'
import { Flip, gsap, prefersReducedMotion } from '../lib/gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(DrawSVGPlugin)
}

// --- Types ---
interface VehicleViewerContextValue {
  vehicleType: VehicleType
  viewType: ViewType
  damages: Damage[]
  onAddDamage: (partId: string, partName: string, type: DamageType, typeName: string, photoFile?: File) => void
  onAddDamageDetailed?: (partId: string, partName: string, type: DamageType, typeName: string, severity: Severity, notes: string, photoFile?: File) => void
  onRemoveDamageFromPart: (partId: string) => void
  speak: (text: string) => void
  speakHover: (text: string) => void
  onViewTypeChange?: (v: ViewType) => void
  accessToken?: string

  // State
  fullscreen: boolean
  setFullscreen: (f: boolean) => void
  selectedPart: { id: string; name: string; pos: { x: number; y: number } } | null
  setSelectedPart: (p: { id: string; name: string; pos: { x: number; y: number } } | null) => void
  orbitDir: number

  // Zoom/Pan
  scale: number
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  containerRef: React.RefObject<HTMLDivElement | null>
  targetRef: React.RefObject<HTMLDivElement | null>
  flipStateRef: React.RefObject<ReturnType<typeof Flip.getState> | null>
}

const VehicleViewerContext = createContext<VehicleViewerContextValue | null>(null)

export function useVehicleViewer() {
  const context = useContext(VehicleViewerContext)
  if (!context) throw new Error('useVehicleViewer must be used within VehicleViewer.Root')
  return context
}

// --- Root Component ---
interface RootProps {
  children?: React.ReactNode
  vehicleType: VehicleType
  viewType: ViewType
  damages: Damage[]
  onAddDamage: (partId: string, partName: string, type: DamageType, typeName: string, photoFile?: File) => void
  onAddDamageDetailed?: (partId: string, partName: string, type: DamageType, typeName: string, severity: Severity, notes: string, photoFile?: File) => void
  onRemoveDamageFromPart: (partId: string) => void
  speak: (text: string) => void
  speakHover: (text: string) => void
  onViewTypeChange?: (v: ViewType) => void
  accessToken?: string
}

const VIEW_ORDER: ViewType[] = ['lateral-left', 'frontal', 'lateral-right', 'traseira']

function RootComponent({
  children, vehicleType, viewType, damages, onAddDamage, onAddDamageDetailed, onRemoveDamageFromPart, speak, speakHover, onViewTypeChange, accessToken
}: RootProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const flipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null)

  // Drag-to-rotate: swipe on the vehicle at 100% zoom advances/retreats through
  // VIEW_ORDER (see docs/superpowers/specs/2026-07-26-drag-to-rotate-vehicle-viewer-design.md).
  const handleHorizontalSwipe = useCallback((direction: 1 | -1) => {
    if (!onViewTypeChange) return
    const idx = VIEW_ORDER.indexOf(viewType)
    const next = VIEW_ORDER[(idx + direction + VIEW_ORDER.length) % VIEW_ORDER.length]
    onViewTypeChange(next)
  }, [viewType, onViewTypeChange])

  const { scale, reset, zoomIn, zoomOut } = useZoomPan(containerRef, targetRef, handleHorizontalSwipe)
  const [selectedPart, setSelectedPart] = useState<{ id: string; name: string; pos: { x: number; y: number } } | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  const prevViewRef = useRef<ViewType>(viewType)
  const prevVehicleRef = useRef<VehicleType>(vehicleType)
  const orbitDirRef = useRef(1)

  // Computed synchronously during render (not in a useEffect) so it's never
  // stale when AnimatePresence reads `custom` for the exit animation on this
  // same render. A useEffect here would run one render behind: the exit
  // variant would compute against the PREVIOUS transition's orbitDir, which
  // for some VIEW_ORDER pairs happens to numerically equal the entrance
  // pose (opacity:0, rotateY:90deg) — a degenerate animation that
  // Framer Motion never signals as complete, permanently stalling
  // AnimatePresence mode="wait".
  if (vehicleType !== prevVehicleRef.current) {
    orbitDirRef.current = 1
    prevVehicleRef.current = vehicleType
    prevViewRef.current = viewType
  } else if (viewType !== prevViewRef.current) {
    const prev = VIEW_ORDER.indexOf(prevViewRef.current)
    const next = VIEW_ORDER.indexOf(viewType)
    let diff = next - prev
    if (diff > 2) diff -= 4
    if (diff < -2) diff += 4
    orbitDirRef.current = diff >= 0 ? 1 : -1
    prevViewRef.current = viewType
  }
  const orbitDir = orbitDirRef.current

  const contextValue = useMemo(() => ({
    vehicleType, viewType, damages, onAddDamage, onAddDamageDetailed, onRemoveDamageFromPart, speak, speakHover,
    accessToken,
    fullscreen, setFullscreen, selectedPart, setSelectedPart, orbitDir,
    scale, zoomIn, zoomOut, reset, containerRef, targetRef, flipStateRef
  }), [
    vehicleType, viewType, damages, onAddDamage, onAddDamageDetailed, onRemoveDamageFromPart, speak, speakHover,
    accessToken, fullscreen, selectedPart, orbitDir, scale, zoomIn, zoomOut, reset
  ])

  return (
    <VehicleViewerContext.Provider value={contextValue}>
      <div className='relative select-none flex flex-col'>
        <VehicleDefs />
        {children}
      </div>
    </VehicleViewerContext.Provider>
  )
}

const Root = memo(RootComponent)

// --- Subcomponents ---

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

const Viewport = memo(function Viewport({ isFullscreen = false }: { isFullscreen?: boolean }) {
  const {
    vehicleType, viewType, damages, speak, speakHover,
    selectedPart, setSelectedPart, orbitDir, containerRef, targetRef, scale,
  } = useVehicleViewer()

  const VehicleComp = vehicleRegistry[vehicleType]?.[viewType] || vehicleRegistry['car']?.[viewType] || vehicleRegistry['car']['lateral-left']
  const layoutKey = `${vehicleType}-${viewType}`
  const [compact, setCompact] = useState(false)

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
    // Posiciona o popup FORA dos limites do veículo (à direita do visualizador,
    // ou à esquerda se não houver espaço), nunca em cima da peça clicada.
    const POPUP_W = 200
    const GAP = 12
    const cont = containerRef.current?.getBoundingClientRect()
    let x: number
    if (cont) {
      if (cont.right + GAP + POPUP_W <= window.innerWidth) x = cont.right + GAP
      else if (cont.left - GAP - POPUP_W >= 0) x = cont.left - GAP - POPUP_W
      else x = window.innerWidth - POPUP_W - GAP
    } else {
      x = rect ? rect.right + GAP : 200
    }
    const y = rect ? rect.top : (cont ? cont.top : 200)
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
        ref={containerRef}
        className={`relative overflow-hidden cursor-grab flex items-center justify-center [perspective:1100px] [perspective-origin:center_center] ${isFullscreen ? 'rounded-0 flex-1 min-h-0' : 'rounded-2xl flex-1 min-h-[220px]'}`}
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
              ref={targetRef}
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

        <DamageCallouts
          containerRef={containerRef}
          damages={viewDamages}
          selectedPart={selectedForCallouts}
          scale={scale}
          layoutKey={layoutKey}
          compact={compact}
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

const btnBase = 'bg-slate-900/85 border border-white/10 rounded-lg text-[#e8f4ff] font-outfit font-bold cursor-pointer transition-all hover:bg-slate-800'

const Controls = memo(function Controls({ variant = 'floating' }: { variant?: 'floating' | 'header' }) {
  const { zoomIn, zoomOut, reset, scale, setFullscreen, containerRef, flipStateRef } = useVehicleViewer()

  const openFullscreen = useCallback(() => {
    // Snapshot the small viewport's bounds/position now, while it's still the
    // only mounted instance — FullscreenOverlay replays the expand from here.
    if (!prefersReducedMotion() && containerRef.current) {
      flipStateRef.current = Flip.getState(containerRef.current)
    }
    setFullscreen(true)
  }, [containerRef, flipStateRef, setFullscreen])

  if (variant === 'header') {
    return (
      <div className='flex gap-1.5 items-center'>
        <button onClick={zoomOut} className={`${btnBase} px-3 py-1.5 text-[0.85rem]`}>−</button>
        <span onClick={reset} className={`${btnBase} px-3 py-1.5 text-[0.75rem] cursor-pointer`}>{Math.round(scale * 100)}%</span>
        <button onClick={zoomIn} className={`${btnBase} px-3 py-1.5 text-[0.85rem]`}>+</button>
        <button onClick={reset} className={`${btnBase} px-2.5 py-1.5`}>↺</button>
        <button
          onClick={() => setFullscreen(false)}
          className={`${btnBase} px-3.5 py-1.5 text-[0.85rem] bg-red-500/20 border-red-500/40 text-red-500 flex items-center gap-1.5 hover:bg-red-500/30`}
        >
          <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M8 3v3a2 2 0 01-2 2H3'/><path d='M21 8h-3a2 2 0 01-2-2V3'/><path d='M3 16h3a2 2 0 012 2v3'/><path d='M16 21v-3a2 2 0 012-2h3'/></svg>
          Sair (ESC)
        </button>
      </div>
    )
  }

  return (
    <div className='absolute top-2.5 right-2.5 z-10 flex gap-1 items-center'>
      <button onClick={zoomOut} className={`${btnBase} px-2.5 py-1 text-[0.85rem]`}>−</button>
      <span onClick={reset} className={`${btnBase} px-2.5 py-1 text-[0.75rem] cursor-pointer`}>{Math.round(scale * 100)}%</span>
      <button onClick={zoomIn} className={`${btnBase} px-2.5 py-1 text-[0.85rem]`}>+</button>
      <button onClick={reset} className={`${btnBase} px-2 py-1 text-[0.75rem]`}>↺</button>
      <button
        onClick={openFullscreen}
        title='Tela cheia'
        className={`${btnBase} px-2 py-1 flex items-center gap-1 bg-sky-500/10 border-sky-500/30 text-sky-500 text-[0.72rem] hover:bg-sky-500/20`}  
      >
        <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M8 3H5a2 2 0 00-2 2v3'/><path d='M21 8V5a2 2 0 00-2-2h-3'/><path d='M3 16v3a2 2 0 002 2h3'/><path d='M16 21h3a2 2 0 002-2v-3'/></svg>
        Tela cheia
      </button>
    </div>
  )
})

const FullscreenOverlay = memo(function FullscreenOverlay() {
  const { fullscreen, setFullscreen, damages, containerRef, flipStateRef } = useVehicleViewer()

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [fullscreen, setFullscreen])

  // Replays the small viewport's snapshot into the freshly mounted fullscreen
  // one, so the vehicle visually "grows" into place instead of just fading in.
  useEffect(() => {
    if (!fullscreen || !flipStateRef.current || !containerRef.current) return
    const state = flipStateRef.current
    flipStateRef.current = null
    Flip.from(state, {
      targets: containerRef.current,
      duration: 0.55,
      ease: 'power2.inOut',
      scale: true,
    })
  }, [fullscreen, containerRef, flipStateRef])

  if (!fullscreen) return null

  return createPortal(
    <div className='fixed inset-0 z-[9999] bg-[#020617] flex flex-col p-4 select-none animate-in fade-in duration-300'>
      <VehicleDefs />
      <div className='flex items-center justify-between mb-2 shrink-0'>
        <div className='font-extrabold text-base text-[#e8f4ff] flex items-center gap-2'>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00aaff' strokeWidth='2.5'><path d='M8 3H5a2 2 0 00-2 2v3'/><path d='M21 8V5a2 2 0 00-2-2h-3'/><path d='M3 16v3a2 2 0 002 2h3'/><path d='M16 21h3a2 2 0 002-2v-3'/></svg>
          Inspeção Visual — Tela Cheia
        </div>
        <Controls variant='header' />
      </div>

      <div className='flex justify-end mb-2 shrink-0'>
        {damages.length === 0 ? (
          <div className='text-[0.72rem] text-sky-400/35 font-outfit italic'>
            Nenhuma avaria registrada nesta vista
          </div>
        ) : (
          <div className='flex gap-1.5 flex-wrap justify-end max-h-[72px] overflow-y-auto'>
            {damages.map((d, i) => (
              <div key={d.id ?? i} className='flex items-center gap-1.5 bg-red-500/15 border border-red-500/40 rounded-lg px-2.5 py-1 text-[0.72rem] font-bold text-red-400 font-outfit whitespace-nowrap'>
                <svg width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                  <path d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'/>
                </svg>
                {d.partName} · {d.typeName}
              </div>
            ))}
          </div>
        )}
      </div>

      <ErrorBoundary>
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-sky-500/50 italic text-xs animate-pulse min-h-[220px]">Carregando visualizador…</div>}>
          <Viewport isFullscreen />
        </Suspense>
      </ErrorBoundary>

      <div className='mt-1.5 text-[0.72rem] text-sky-200/50 text-center shrink-0'>
        Clique em uma peça para registrar avaria • Arraste para girar • ESC para sair • Scroll para zoom
      </div>
    </div>,
    document.body
  )
})

const FloatingDamage = memo(function FloatingDamage() {
  const { selectedPart, setSelectedPart, onAddDamage, onAddDamageDetailed, onRemoveDamageFromPart, damages, vehicleType, accessToken } = useVehicleViewer()

  if (!selectedPart) return null

  const existingDmg = damages.find(d => d.partId === selectedPart.id && d.vehicle === vehicleType)

  return createPortal(
    <DamageFloat
      partName={selectedPart.name}
      position={selectedPart.pos}
      currentType={existingDmg?.type}
      accessToken={accessToken}
      onChoose={(type, typeName, severity, notes, photoFile) => {
        if (onAddDamageDetailed) {
          onAddDamageDetailed(selectedPart.id, selectedPart.name, type, typeName, severity, notes, photoFile)
        } else {
          onAddDamage(selectedPart.id, selectedPart.name, type, typeName, photoFile)
        }
        setSelectedPart(null)
      }}
      onClear={() => {
        onRemoveDamageFromPart(selectedPart.id)
        setSelectedPart(null)
      }}
      onClose={() => setSelectedPart(null)}
    />,
    document.body
  )
})

// --- Namespace ---

export const VehicleViewer = Object.assign(Root, {
  Root,
  Viewport,
  Controls,
  FullscreenOverlay,
  FloatingDamage,
})

// Default export for backward compatibility or simple use cases
export default function LegacyVehicleViewer(props: RootProps) {
  return (
    <Root {...props}>
      <Controls />
      <Viewport />
      <FloatingDamage />
      <FullscreenOverlay />
      <div className='mt-1.5 text-[0.72rem] text-[var(--text-muted)] text-center'>
        Clique em uma peça para registrar avaria • Arraste para girar • Scroll ou pinch para zoom
      </div>
    </Root>
  )
}

