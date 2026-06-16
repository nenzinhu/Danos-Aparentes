import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { VehicleType, ViewType, Damage, DamageType } from '../types'
import { vehicleRegistry } from './vehicles/registry'
import { useZoomPan } from '../hooks/useZoomPan'
import DamageFloat from './DamageFloat'
import VehicleDefs from './vehicles/VehicleDefs'

interface Props {
  vehicleType: VehicleType
  viewType: ViewType
  damages: Damage[]
  onAddDamage: (partId: string, partName: string, type: DamageType, typeName: string) => void
  onRemoveDamageFromPart: (partId: string) => void
  speak: (text: string) => void
  speakHover: (text: string) => void
}

// Ordem orbital das vistas (sentido horário ao redor do veículo)
const VIEW_ORDER: ViewType[] = ['lateral-left', 'frontal', 'lateral-right', 'traseira']

export default function VehicleViewer({
  vehicleType, viewType, damages, onAddDamage, onRemoveDamageFromPart, speak, speakHover
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scale, offset, reset, zoomIn, zoomOut } = useZoomPan(containerRef)
  const [selectedPart, setSelectedPart] = useState<{ id: string; name: string; pos: { x: number; y: number } } | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  // Rastreia direção da órbita 3D
  const prevViewRef = useRef<ViewType>(viewType)
  const prevVehicleRef = useRef<VehicleType>(vehicleType)
  const [orbitDir, setOrbitDir] = useState(1)

  useEffect(() => {
    if (vehicleType !== prevVehicleRef.current) {
      // Troca de veículo: sempre entra pela direita
      setOrbitDir(1)
      prevVehicleRef.current = vehicleType
      prevViewRef.current = viewType
      return
    }
    const prev = VIEW_ORDER.indexOf(prevViewRef.current)
    const next = VIEW_ORDER.indexOf(viewType)
    if (prev === next) return
    // Detecta sentido mais curto no ciclo de 4 vistas
    let diff = next - prev
    if (diff > 2) diff -= 4
    if (diff < -2) diff += 4
    setOrbitDir(diff >= 0 ? 1 : -1)
    prevViewRef.current = viewType
  }, [viewType, vehicleType])

  useEffect(() => {
    if (!fullscreen) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setFullscreen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen])

  useEffect(() => {
    document.body.style.overflow = fullscreen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [fullscreen])

  const VehicleComp = vehicleRegistry[vehicleType][viewType]

  function handlePartClick(id: string, name: string) {
    speak(name)
    const el = document.getElementById(id)
    const rect = el?.getBoundingClientRect()
    const pos = rect ? { x: Math.min(rect.right + 8, window.innerWidth - 240), y: rect.top } : { x: 200, y: 200 }
    setSelectedPart({ id, name, pos })
  }

  function handleChoose(type: DamageType, typeName: string) {
    if (!selectedPart) return
    onAddDamage(selectedPart.id, selectedPart.name, type, typeName)
    setSelectedPart(null)
  }

  function handleClear() {
    if (!selectedPart) return
    onRemoveDamageFromPart(selectedPart.id)
    setSelectedPart(null)
  }

  const btnBase: React.CSSProperties = {
    background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#e8f4ff', cursor: 'pointer',
    fontFamily: 'Outfit,sans-serif', fontWeight: 700,
  }

  // Variantes da animação orbital 3D — recebem `custom` (direção)
  const orbitVariants = {
    initial: (dir: number) => ({
      rotateY: dir * 90,
      opacity: 0,
      scale: 0.92,
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      },
    },
    exit: (dir: number) => ({
      rotateY: dir * -90,
      opacity: 0,
      scale: 0.92,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      },
    }),
  }

  function makeSvgArea(isFullscreen: boolean) {
    return (
      // Perspective no container pai para o efeito 3D
      <div ref={containerRef} style={{
        overflow: 'hidden', borderRadius: isFullscreen ? 0 : 16,
        cursor: 'grab', flex: 1, minHeight: isFullscreen ? 0 : 220,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: '1100px',
        perspectiveOrigin: 'center center',
      }}>
        <AnimatePresence mode="wait" custom={orbitDir}>
          <motion.div
            key={`${vehicleType}-${viewType}`}
            custom={orbitDir}
            variants={orbitVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              width: '100%',
              transformStyle: 'preserve-3d',
              // Zoom/pan aplicado aqui, separado da rotação orbital
              x: offset.x,
              y: offset.y,
              scale,
            }}
          >
            <VehicleComp
              damages={damages}
              selectedPartId={selectedPart?.id ?? null}
              onPartClick={(id, name) => handlePartClick(id, name)}
              onPartHover={(_, name) => speakHover(name)}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ── Fullscreen overlay ─────────────────────────────────────────────
  const fullscreenOverlay = fullscreen ? createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 8000,
      background: 'rgba(6,13,26,0.99)',
      display: 'flex', flexDirection: 'column', padding: 16, userSelect: 'none'
    }}>
      <VehicleDefs />
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#e8f4ff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00aaff" strokeWidth="2.5"><path d="M8 3H5a2 2 0 00-2 2v3"/><path d="M21 8V5a2 2 0 00-2-2h-3"/><path d="M3 16v3a2 2 0 002 2h3"/><path d="M16 21h3a2 2 0 002-2v-3"/></svg>
          Inspeção Visual — Tela Cheia
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={zoomOut} style={{ ...btnBase, padding: '6px 12px', fontSize: '0.85rem' }}>−</button>
          <span onClick={reset} style={{ ...btnBase, padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer' }}>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} style={{ ...btnBase, padding: '6px 12px', fontSize: '0.85rem' }}>+</button>
          <button onClick={reset} style={{ ...btnBase, padding: '6px 10px' }}>↺</button>
          <button onClick={() => setFullscreen(false)} style={{
            ...btnBase, padding: '6px 14px', fontSize: '0.85rem',
            background: 'rgba(239,68,68,0.18)', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3v3a2 2 0 01-2 2H3"/><path d="M21 8h-3a2 2 0 01-2-2V3"/><path d="M3 16h3a2 2 0 012 2v3"/><path d="M16 21v-3a2 2 0 012-2h3"/></svg>
            Sair (ESC)
          </button>
        </div>
      </div>

      {/* Avarias selecionadas — topo direito */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, flexShrink: 0 }}>
        {damages.length === 0 ? (
          <div style={{
            fontSize: '0.72rem', color: 'rgba(180,210,240,0.35)',
            fontFamily: 'Outfit,sans-serif', fontStyle: 'italic',
          }}>
            Nenhuma avaria registrada nesta vista
          </div>
        ) : (
          <div style={{
            display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end',
            maxHeight: 72, overflowY: 'auto',
          }}>
            {damages.map((d, i) => (
              <div key={d.id ?? i} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(239,68,68,0.13)',
                border: '1px solid rgba(239,68,68,0.38)',
                borderRadius: 6, padding: '3px 9px',
                fontSize: '0.72rem', fontWeight: 700,
                color: '#f87171', fontFamily: 'Outfit,sans-serif',
                whiteSpace: 'nowrap',
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                {d.partName} · {d.typeName}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* SVG area */}
      {makeSvgArea(true)}
      {/* Hint */}
      <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'rgba(200,220,255,0.5)', textAlign: 'center', flexShrink: 0 }}>
        Clique em uma peça para registrar avaria • ESC para sair • Scroll para zoom
      </div>
    </div>,
    document.body
  ) : null

  // DamageFloat always rendered via its own portal at body level so z-index is always correct
  const damageFloatPortal = selectedPart ? createPortal(
    <DamageFloat
      partName={selectedPart.name}
      position={selectedPart.pos}
      onChoose={handleChoose}
      onClear={handleClear}
      onClose={() => setSelectedPart(null)}
    />,
    document.body
  ) : null

  // ── Normal view ────────────────────────────────────────────────────
  return (
    <>
      {fullscreenOverlay}
      {damageFloatPortal}
      <div style={{ position: 'relative', userSelect: 'none', display: 'flex', flexDirection: 'column' }}>
        <VehicleDefs />
        {/* Controls */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={zoomOut} style={{ ...btnBase, padding: '4px 10px', fontSize: '0.85rem' }}>−</button>
          <span onClick={reset} style={{ ...btnBase, padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} style={{ ...btnBase, padding: '4px 10px', fontSize: '0.85rem' }}>+</button>
          <button onClick={reset} style={{ ...btnBase, padding: '4px 8px', fontSize: '0.75rem' }}>↺</button>
          <button
            onClick={() => setFullscreen(true)}
            title="Tela cheia"
            style={{ ...btnBase, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,170,255,0.12)', borderColor: 'rgba(0,170,255,0.3)', color: '#00aaff', fontSize: '0.72rem', fontWeight: 700 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 00-2 2v3"/><path d="M21 8V5a2 2 0 00-2-2h-3"/><path d="M3 16v3a2 2 0 002 2h3"/><path d="M16 21h3a2 2 0 002-2v-3"/></svg>
            Tela cheia
          </button>
        </div>
        {!fullscreen && makeSvgArea(false)}
        <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Clique em uma peça para registrar avaria • Scroll ou pinch para zoom
        </div>
      </div>
    </>
  )
}
