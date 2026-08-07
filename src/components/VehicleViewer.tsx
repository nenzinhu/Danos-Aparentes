'use client'
import React, { useRef, useState, useLayoutEffect, useCallback, useMemo, memo, useEffect } from 'react'
import { VehicleType, ViewType, Damage, DamageType, Severity } from '../types'
import type { PreviousReportSummary } from '../lib/reportComparison'
import { useZoomPan } from '../hooks/useZoomPan'
import VehicleDefs from './vehicles/VehicleDefs'
import { Flip } from '../lib/gsap'
import { VehicleViewerContext, VIEW_ORDER } from './vehicleViewer/context'
import { Viewport } from './vehicleViewer/Viewport'
import { Controls } from './vehicleViewer/Controls'
import { FullscreenOverlay } from './vehicleViewer/FullscreenOverlay'
import { FloatingDamage } from './vehicleViewer/FloatingDamage'

export { useVehicleViewer } from './vehicleViewer/context'

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
  previousReport?: PreviousReportSummary | null
  onToast?: (msg: string) => void
}

function RootComponent({
  children, vehicleType, viewType, damages, onAddDamage, onAddDamageDetailed, onRemoveDamageFromPart, speak, speakHover, onViewTypeChange, accessToken, previousReport = null, onToast
}: RootProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const baseContainerRef = useRef<HTMLDivElement>(null)
  const baseTargetRef = useRef<HTMLDivElement>(null)
  const flipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null)

  // Drag-to-rotate: swipe on the vehicle at 100% zoom advances/retreats through
  // VIEW_ORDER (see docs/superpowers/specs/2026-07-26-drag-to-rotate-vehicle-viewer-design.md).
  const handleHorizontalSwipe = useCallback((direction: 1 | -1) => {
    if (!onViewTypeChange) return
    const idx = VIEW_ORDER.indexOf(viewType)
    const next = VIEW_ORDER[(idx + direction + VIEW_ORDER.length) % VIEW_ORDER.length]
    onViewTypeChange(next)
  }, [viewType, onViewTypeChange])

  const [selectedPart, setSelectedPart] = useState<{ id: string; name: string; pos: { x: number; y: number } } | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  // The fullscreen Viewport mounts and unmounts on top of the small one,
  // both sharing containerRef/targetRef. When it unmounts, React nulls out
  // whatever it last set those to — even though the small viewport is still
  // mounted and its node is still perfectly valid, just parked in
  // baseContainerRef/baseTargetRef. Restore the shared refs to it here.
  // useLayoutEffect (not useEffect) so this runs before useZoomPan's own
  // rebind effect below sees the ref, regardless of hook declaration order —
  // React flushes all layout effects before any passive effect.
  useLayoutEffect(() => {
    if (!fullscreen) {
      containerRef.current = baseContainerRef.current
      targetRef.current = baseTargetRef.current
    }
  }, [fullscreen])

  // `fullscreen` forces the pan/zoom/drag listeners to rebind to whichever
  // DOM node containerRef.current points to right now. The small viewport
  // and the fullscreen overlay both mount a Viewport sharing this same ref,
  // so without this the listeners stay stuck on whichever one existed when
  // the effect first ran and dragging silently does nothing in fullscreen.
  const [panLocked, setPanLocked] = useState(true)
  const { scale, reset, zoomIn, zoomOut } = useZoomPan(containerRef, targetRef, handleHorizontalSwipe, fullscreen, panLocked)
  const [outlineMode, setOutlineMode] = useState(false)
  const [compareMode, setCompareMode] = useState(false)

  // Trocar vista → sempre 100% e cadeado travado até o usuário destrancar.
  useEffect(() => {
    reset()
    setPanLocked(true)
  }, [viewType, vehicleType]) // eslint-disable-line react-hooks/exhaustive-deps -- reset is stable enough per render; lock on view/vehicle change

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
    accessToken, previousReport, onToast,
    fullscreen, setFullscreen, selectedPart, setSelectedPart, orbitDir, outlineMode, setOutlineMode, panLocked, setPanLocked, compareMode, setCompareMode,
    scale, zoomIn, zoomOut, reset, containerRef, targetRef, baseContainerRef, baseTargetRef, flipStateRef
  }), [
    vehicleType, viewType, damages, onAddDamage, onAddDamageDetailed, onRemoveDamageFromPart, speak, speakHover,
    accessToken, previousReport, onToast, fullscreen, selectedPart, orbitDir, outlineMode, panLocked, scale, zoomIn, zoomOut, reset
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
