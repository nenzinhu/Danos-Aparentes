'use client';
import React, { createContext, useContext, useRef, useState, useEffect, useCallback, useMemo, memo } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { VehicleType, ViewType, Damage, DamageType, Severity } from '../types'
import { vehicleRegistry } from './vehicles/registry'
import { useZoomPan } from '../hooks/useZoomPan'
import DamageFloat from './DamageFloat'
import VehicleDefs from './vehicles/VehicleDefs'
import DamageSuggestionsReview, { type DamageSuggestion } from './DamageSuggestionsReview'
import { compressImage, LOCAL_PHOTO_MAX_WIDTH, LOCAL_PHOTO_QUALITY } from '../lib/imageUtils'

// --- Types ---
interface VehicleViewerContextValue {
  vehicleType: VehicleType
  viewType: ViewType
  damages: Damage[]
  onAddDamage: (partId: string, partName: string, type: DamageType, typeName: string, photoFile?: File) => void
  onAddDamageDetailed?: (partId: string, partName: string, type: DamageType, typeName: string, severity: Severity, notes: string) => void
  onRemoveDamageFromPart: (partId: string) => void
  speak: (text: string) => void
  speakHover: (text: string) => void

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
  onAddDamageDetailed?: (partId: string, partName: string, type: DamageType, typeName: string, severity: Severity, notes: string) => void
  onRemoveDamageFromPart: (partId: string) => void
  speak: (text: string) => void
  speakHover: (text: string) => void
}

const VIEW_ORDER: ViewType[] = ['lateral-left', 'frontal', 'lateral-right', 'traseira']

function RootComponent({
  children, vehicleType, viewType, damages, onAddDamage, onAddDamageDetailed, onRemoveDamageFromPart, speak, speakHover
}: RootProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const { scale, reset, zoomIn, zoomOut } = useZoomPan(containerRef, targetRef)
  const [selectedPart, setSelectedPart] = useState<{ id: string; name: string; pos: { x: number; y: number } } | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  const prevViewRef = useRef<ViewType>(viewType)
  const prevVehicleRef = useRef<VehicleType>(vehicleType)
  const [orbitDir, setOrbitDir] = useState(1)

  useEffect(() => {
    if (vehicleType !== prevVehicleRef.current) {
      setOrbitDir(1)
      prevVehicleRef.current = vehicleType
      prevViewRef.current = viewType
      return
    }
    const prev = VIEW_ORDER.indexOf(prevViewRef.current)
    const next = VIEW_ORDER.indexOf(viewType)
    if (prev === next) return
    let diff = next - prev
    if (diff > 2) diff -= 4
    if (diff < -2) diff += 4
    setOrbitDir(diff >= 0 ? 1 : -1)
    prevViewRef.current = viewType
  }, [viewType, vehicleType])

  const contextValue = useMemo(() => ({
    vehicleType, viewType, damages, onAddDamage, onAddDamageDetailed, onRemoveDamageFromPart, speak, speakHover,
    fullscreen, setFullscreen, selectedPart, setSelectedPart, orbitDir,
    scale, zoomIn, zoomOut, reset, containerRef, targetRef
  }), [
    vehicleType, viewType, damages, onAddDamage, onAddDamageDetailed, onRemoveDamageFromPart, speak, speakHover,
    fullscreen, selectedPart, orbitDir, scale, zoomIn, zoomOut, reset
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
    selectedPart, setSelectedPart, orbitDir, containerRef, targetRef
  } = useVehicleViewer()

  const VehicleComp = vehicleRegistry[vehicleType][viewType]

  const handlePartClick = useCallback((id: string, name: string) => {
    speak(name)
    const el = document.getElementById(id)
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

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden cursor-grab flex items-center justify-center [perspective:1100px] [perspective-origin:center_center] ${isFullscreen ? 'rounded-0 flex-1 min-h-0' : 'rounded-2xl flex-1 min-h-[220px]'}`}
    >
      <AnimatePresence mode='wait' custom={orbitDir}>
        <motion.div
          key={`${vehicleType}-${viewType}`}
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
            <VehicleComp
              damages={damages}
              selectedPartId={selectedPart?.id ?? null}
              onPartClick={handlePartClick}
              onPartHover={(_, name) => speakHover(name)}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
})

const btnBase = 'bg-slate-900/85 border border-white/10 rounded-lg text-[#e8f4ff] font-outfit font-bold cursor-pointer transition-all hover:bg-slate-800'

const Controls = memo(function Controls({ variant = 'floating' }: { variant?: 'floating' | 'header' }) {
  const { zoomIn, zoomOut, reset, scale, setFullscreen } = useVehicleViewer()

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
        onClick={() => setFullscreen(true)}
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
  const { fullscreen, setFullscreen, damages } = useVehicleViewer()

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

      <Viewport isFullscreen />

      <div className='mt-1.5 text-[0.72rem] text-sky-200/50 text-center shrink-0'>
        Clique em uma peça para registrar avaria • ESC para sair • Scroll para zoom
      </div>
    </div>,
    document.body
  )
})

const FloatingDamage = memo(function FloatingDamage() {
  const { selectedPart, setSelectedPart, onAddDamage, onRemoveDamageFromPart, damages, vehicleType } = useVehicleViewer()

  if (!selectedPart) return null

  const existingDmg = damages.find(d => d.partId === selectedPart.id && d.vehicle === vehicleType)

  return createPortal(
    <DamageFloat
      partName={selectedPart.name}
      position={selectedPart.pos}
      currentType={existingDmg?.type}
      onChoose={(type, typeName, photoFile) => {
        onAddDamage(selectedPart.id, selectedPart.name, type, typeName, photoFile)
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

const TYPE_NAME: Record<DamageType, string> = {
  scratch: 'Riscos / Abrasão',
  dent: 'Deformação',
  broken: 'Dano / Fratura',
}

const AutoDetect = memo(function AutoDetect({
  accessToken,
  onToast,
}: {
  accessToken?: string
  onToast?: (msg: string) => void
}) {
  const { vehicleType, viewType, containerRef, onAddDamageDetailed } = useVehicleViewer()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<DamageSuggestion[] | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!accessToken) {
      onToast?.('❌ Entre na sua conta para usar a detecção automática')
      return
    }
    setAnalyzing(true)
    try {
      const parts = Array.from(containerRef.current?.querySelectorAll('.part') ?? [])
        .map(el => ({ id: el.getAttribute('id') || '', name: el.getAttribute('data-name') || '' }))
        .filter(p => p.id && p.name)

      if (parts.length === 0) {
        onToast?.('❌ Não foi possível ler as peças desta vista')
        return
      }

      const compressedBlob = await compressImage(file, LOCAL_PHOTO_MAX_WIDTH, LOCAL_PHOTO_QUALITY)
      const photoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(compressedBlob)
      })

      const res = await fetch('/api/damage-vision-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ photo: photoDataUrl, vehicle: vehicleType, view: viewType, availableParts: parts }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        onToast?.(`❌ ${err.error || 'Não foi possível analisar a foto'}`)
        return
      }

      const { detections } = await res.json()
      const nameById = new Map(parts.map(p => [p.id, p.name]))
      const built: DamageSuggestion[] = (detections || []).map((d: { partId: string; type: DamageType; severity: Severity; description: string }) => ({
        partId: d.partId,
        partName: nameById.get(d.partId) || d.partId,
        type: d.type,
        typeName: TYPE_NAME[d.type] || d.type,
        severity: d.severity,
        description: d.description,
        accepted: true,
      }))

      if (built.length === 0) {
        onToast?.('✅ Nenhuma avaria identificada nesta foto')
      } else {
        setSuggestions(built)
      }
    } catch (err) {
      console.error('Erro na detecção automática de avarias:', err)
      onToast?.('❌ Falha ao analisar a foto')
    } finally {
      setAnalyzing(false)
    }
  }, [accessToken, containerRef, vehicleType, viewType, onToast])

  const toggleSuggestion = useCallback((partId: string) => {
    setSuggestions(prev => prev?.map(s => s.partId === partId ? { ...s, accepted: !s.accepted } : s) ?? null)
  }, [])

  const confirmSuggestions = useCallback(() => {
    if (!suggestions) return
    const accepted = suggestions.filter(s => s.accepted)
    accepted.forEach(s => {
      onAddDamageDetailed?.(s.partId, s.partName, s.type, s.typeName, s.severity, s.description)
    })
    onToast?.(`✅ ${accepted.length} avaria${accepted.length === 1 ? '' : 's'} adicionada${accepted.length === 1 ? '' : 's'}`)
    setSuggestions(null)
  }, [suggestions, onAddDamageDetailed, onToast])

  return (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />
      {analyzing ? (
        <button
          type="button"
          disabled
          className="w-full mt-2 py-2.5 rounded-lg font-bold text-xs border border-sky-500/30 bg-sky-500/10 text-sky-400 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
        >
          ⏳ Analisando foto…
        </button>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="py-2.5 rounded-lg font-bold text-[0.7rem] sm:text-xs border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors flex items-center justify-center gap-1.5 px-2"
          >
            📷 Detectar (câmera)
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="py-2.5 rounded-lg font-bold text-[0.7rem] sm:text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1.5 px-2"
          >
            🖼️ Detectar (galeria)
          </button>
        </div>
      )}

      {suggestions && (
        <DamageSuggestionsReview
          suggestions={suggestions}
          onToggle={toggleSuggestion}
          onConfirm={confirmSuggestions}
          onDiscard={() => setSuggestions(null)}
        />
      )}
    </>
  )
})

// --- Namespace ---

export const VehicleViewer = Object.assign(Root, {
  Root,
  Viewport,
  Controls,
  FullscreenOverlay,
  FloatingDamage,
  AutoDetect,
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
        Clique em uma peça para registrar avaria • Scroll ou pinch para zoom
      </div>
    </Root>
  )
}

