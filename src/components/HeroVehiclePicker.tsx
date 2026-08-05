'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { vehicleRegistry } from './vehicles/registry'
import { vehicleOptions } from './VehicleShowcaseSection'
import { VehicleIconSvg } from './VehicleSelector'
import VehicleDefs from './vehicles/VehicleDefs'
import GsapLineCascade from './GsapLineCascade'
import Reveal from './Reveal'
import DamageFloat from './DamageFloat'
import { IconDamageScratch, IconDamageDent, IconDamageBroken } from './ui/AnimatedIcons'
import { createId } from '../lib/id'
import type { Damage, DamageId, DamageType, Severity, VehicleType } from '../types'

type SelectedPart = { id: string; name: string; pos: { x: number; y: number } }

const VIEW = 'lateral-left' as const

/**
 * Demo interativa na home: mesmo diagrama do app, uma vista (lateral esq.),
 * clique na peça → Tipo de Avaria (DamageFloat) + toggle Contorno.
 */
export default function HeroVehiclePicker() {
  const [activeVehicle, setActiveVehicle] = useState<VehicleType>('car')
  const [damagesByVehicle, setDamagesByVehicle] = useState<Partial<Record<VehicleType, Damage[]>>>({})
  const [selectedPart, setSelectedPart] = useState<SelectedPart | null>(null)
  const [outlineMode, setOutlineMode] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const diagramWrapRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  const damages = damagesByVehicle[activeVehicle] ?? []

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const el = stageRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.96, y: 6 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' },
    )
  }, [activeVehicle])

  const selected = vehicleOptions.find(o => o.type === activeVehicle) || vehicleOptions[0]
  const DiagramComp = vehicleRegistry[activeVehicle]?.[VIEW]

  const handlePartClick = useCallback((id: string, name: string) => {
    const wrap = diagramWrapRef.current?.getBoundingClientRect()
    const POPUP_W = 280
    const POPUP_H = 350
    let x: number
    let y: number
    if (wrap) {
      x = Math.max(16, Math.min(wrap.left + (wrap.width - POPUP_W) / 2, window.innerWidth - POPUP_W - 16))
      y = Math.max(16, Math.min(wrap.top + 8, window.innerHeight - POPUP_H - 16))
    } else {
      x = Math.max(16, (window.innerWidth - POPUP_W) / 2)
      y = 80
    }
    setSelectedPart({ id, name, pos: { x, y } })
  }, [])

  const upsertDamage = useCallback(
    (
      partId: string,
      partName: string,
      type: DamageType,
      typeName: string,
      severity: Severity,
      notes: string,
    ) => {
      setDamagesByVehicle(prev => {
        const current = prev[activeVehicle] ?? []
        const without = current.filter(d => d.partId !== partId)
        const next: Damage = {
          id: createId() as DamageId,
          vehicle: activeVehicle,
          view: VIEW,
          partId,
          partName,
          type,
          typeName,
          severity,
          notes,
          photos: [],
          photoNotes: [],
        }
        return { ...prev, [activeVehicle]: [...without, next] }
      })
      setSelectedPart(null)
    },
    [activeVehicle],
  )

  const clearPart = useCallback(
    (partId: string) => {
      setDamagesByVehicle(prev => ({
        ...prev,
        [activeVehicle]: (prev[activeVehicle] ?? []).filter(d => d.partId !== partId),
      }))
      setSelectedPart(null)
    },
    [activeVehicle],
  )

  const existingOnSelected = selectedPart
    ? damages.find(d => d.partId === selectedPart.id)
    : undefined

  const lastDamage = damages[damages.length - 1]

  return (
    <>
      <VehicleDefs />

      <Reveal className="space-y-2 mb-5">
        <GsapLineCascade
          as="p"
          delay={0}
          stagger={0.1}
          className="font-mono-data text-[11px] tracking-[0.18em] uppercase text-[var(--signal-bright)]"
        >
          Demo ao vivo
        </GsapLineCascade>
        <GsapLineCascade
          as="p"
          delay={180}
          stagger={0.08}
          className="font-display text-xl lg:text-2xl font-bold uppercase tracking-tight leading-[1.1] text-[var(--text-main)]"
        >
          Toque no veículo e marque o dano
        </GsapLineCascade>
      </Reveal>

      <div className="flex items-center justify-between gap-2 font-mono-data text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-4">
        <span>Vista · Lateral Esq.</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOutlineMode(o => !o)}
            aria-pressed={outlineMode}
            title="Ver só o contorno, sem cores"
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              outlineMode
                ? 'bg-sky-500/25 border-sky-400/50 text-sky-300'
                : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            ◇ Contorno
          </button>
          <span>
            {damages.length} avaria{damages.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div role="radiogroup" aria-label="Tipo de veículo" className="flex flex-wrap gap-1.5 mb-4">
        {vehicleOptions.map(opt => {
          const isActive = opt.type === activeVehicle
          return (
            <button
              key={opt.type}
              type="button"
              role="radio"
              aria-checked={isActive}
              title={opt.name}
              onClick={() => {
                setSelectedPart(null)
                setActiveVehicle(opt.type)
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono-data text-[10px] uppercase tracking-wider transition-colors duration-150 outline-none cursor-pointer ${
                isActive
                  ? 'bg-[var(--signal)]/15 border-[var(--signal-bright)]/70 text-[var(--signal-bright)]'
                  : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--sheet-line)]'
              }`}
            >
              <VehicleIconSvg type={opt.type} size={22} />
              {opt.name}
            </button>
          )
        })}
      </div>

      <div className="relative flex-1 grid place-items-center min-h-[260px]">
        <div aria-hidden="true" className="absolute inset-x-6 bottom-8 h-px bg-[var(--sheet-line)] opacity-60" />
        <div
          aria-hidden="true"
          className="absolute left-1/2 bottom-6 -translate-x-1/2 font-mono-data text-[9px] text-[var(--text-muted)] tracking-[0.3em] uppercase"
        >
          eixo de referência
        </div>

        <div
          ref={diagramWrapRef}
          id="container-hero-demo"
          className={`relative w-full max-w-md drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${
            outlineMode ? 'va-outline' : ''
          }`}
        >
          <div ref={stageRef}>
            {DiagramComp && (
              <DiagramComp
                damages={damages}
                selectedPartId={selectedPart?.id ?? null}
                onPartClick={handlePartClick}
                onPartHover={() => {}}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap pt-4 mt-2 border-t border-[var(--card-border)]">
        {lastDamage ? (
          <>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_#ef4444]" />
              <span className="text-xs font-bold text-[var(--text-main)]">
                Registrado: {lastDamage.partName}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {lastDamage.type === 'broken' ? (
                  <IconDamageBroken size={13} className="text-red-400" />
                ) : lastDamage.type === 'dent' ? (
                  <IconDamageDent size={13} className="text-orange-400" />
                ) : (
                  <IconDamageScratch size={13} className="text-amber-400" />
                )}
                Tipo: {lastDamage.typeName}
              </span>
              <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                {lastDamage.severity === 'high'
                  ? 'Grave'
                  : lastDamage.severity === 'medium'
                    ? 'Médio'
                    : 'Leve'}
              </span>
            </div>
          </>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">
            Nenhuma avaria ainda — toque em uma peça do {selected.name.toLowerCase()} para marcar.
          </p>
        )}
      </div>

      {selectedPart &&
        typeof document !== 'undefined' &&
        createPortal(
          <DamageFloat
            partName={selectedPart.name}
            position={selectedPart.pos}
            currentType={existingOnSelected?.type}
            onChoose={(type, typeName, severity, notes) => {
              upsertDamage(selectedPart.id, selectedPart.name, type, typeName, severity, notes)
            }}
            onClear={() => clearPart(selectedPart.id)}
            onClose={() => setSelectedPart(null)}
          />,
          document.body,
        )}
    </>
  )
}
