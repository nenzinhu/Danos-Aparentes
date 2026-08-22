'use client'
import React, { createContext, useContext } from 'react'
import { VehicleType, ViewType, Damage, DamageType, Severity } from '../../types'
import type { PreviousReportSummary } from '../../lib/reportComparison'
import { Flip } from '../../lib/gsap'

export interface VehicleViewerContextValue {
  vehicleType: VehicleType
  viewType: ViewType
  damages: Damage[]
  onAddDamage: (partId: string, partName: string, type: DamageType, typeName: string, photoFile?: File) => void
  onAddDamageDetailed?: (partId: string, partName: string, type: DamageType, typeName: string, severity: Severity, notes: string, photoFile?: File) => void
  onRemoveDamageFromPart: (partId: string) => void
  speak: (text: string) => void
  speakHover: (text: string) => void
  onViewTypeChange?: (v: ViewType) => void
  onGoToDossier?: () => void
  accessToken?: string
  /** Baseline da vistoria anterior — marca avarias novas no float. */
  previousReport?: PreviousReportSummary | null
  onToast?: (msg: string) => void

  // State
  fullscreen: boolean
  setFullscreen: (f: boolean) => void
  selectedPart: { id: string; name: string; pos: { x: number; y: number } } | null
  setSelectedPart: (p: { id: string; name: string; pos: { x: number; y: number } } | null) => void
  orbitDir: number
  outlineMode: boolean
  setOutlineMode: (f: boolean) => void
  panLocked: boolean
  setPanLocked: (f: boolean) => void
  compareMode: boolean
  setCompareMode: (f: boolean) => void

  // Zoom/Pan
  scale: number
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  containerRef: React.RefObject<HTMLDivElement | null>
  targetRef: React.RefObject<HTMLDivElement | null>
  /** Always the small (non-fullscreen) viewport's nodes — a fallback so
   * `containerRef`/`targetRef` can be restored to it once the fullscreen
   * Viewport instance unmounts and nulls out the ref it was sharing. */
  baseContainerRef: React.RefObject<HTMLDivElement | null>
  baseTargetRef: React.RefObject<HTMLDivElement | null>
  flipStateRef: React.RefObject<ReturnType<typeof Flip.getState> | null>
}

export const VehicleViewerContext = createContext<VehicleViewerContextValue | null>(null)

export function useVehicleViewer() {
  const context = useContext(VehicleViewerContext)
  if (!context) throw new Error('useVehicleViewer must be used within VehicleViewer.Root')
  return context
}

export const VIEW_ORDER: ViewType[] = ['lateral-left', 'frontal', 'lateral-right', 'traseira']
