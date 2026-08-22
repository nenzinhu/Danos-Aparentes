'use client'

import { useState } from 'react'
import { Damage, DamageType, ViewType } from '../../types'
import { useTts } from '../../hooks/useTts'
import Image from 'next/image'
import { VehicleViewer } from '../VehicleViewer'
import Reveal from '../Reveal'

const VIEWS: { id: ViewType; label: string }[] = [
  { id: 'lateral-left', label: 'Lateral Esq.' },
  { id: 'frontal', label: 'Frontal' },
  { id: 'lateral-right', label: 'Lateral Dir.' },
  { id: 'traseira', label: 'Traseira' },
]

const VIEW_ORDER: ViewType[] = ['lateral-left', 'frontal', 'lateral-right', 'traseira']

/**
 * Demo ao vivo do mapeamento visual do veículo — carousel de 4 vistas
 * (lateral esq / frontal / lateral dir / traseira) + diagrama clicável.
 * Reutiliza o VehicleViewer do app. Sem libs externas.
 */
export default function LiveDemoCarousel() {
  const [viewType, setViewType] = useState<ViewType>('lateral-left')
  const [damages, setDamages] = useState<Damage[]>([])
  const { speak, speakHover } = useTts()

  function handleAddDamage(partId: string, partName: string, type: DamageType, typeName: string) {
    setDamages((prev) =>
      prev.some((d) => d.partId === partId)
        ? prev
        : [
            ...prev,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              vehicle: 'car',
              view: viewType,
              partId,
              partName,
              type,
              typeName,
              severity: 'low',
              notes: '',
              photos: [],
              photoNotes: [],
            },
          ],
    )
  }

  function handleRemoveDamageFromPart(partId: string) {
    setDamages((prev) => prev.filter((d) => d.partId !== partId))
  }

  const goView = (dir: 1 | -1) => {
    const idx = VIEW_ORDER.indexOf(viewType)
    const next = VIEW_ORDER[(idx + dir + VIEW_ORDER.length) % VIEW_ORDER.length]
    setViewType(next)
  }

  const current = VIEWS.find((v) => v.id === viewType) ?? VIEWS[0]

  return (
    <section
      id="demo-ao-vivo"
      className="w-full max-w-6xl mx-auto py-16 sm:py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center mb-10 sm:mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Demo ao vivo · Igual ao app
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          Mapeamento visual do veículo
        </h2>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Toque nas peças do diagrama para marcar a avaria. Arraste para girar entre as vistas — ou use as setas.
        </p>
      </Reveal>

      <Reveal>
        {/* Tabs de vistas (carousel) */}
        <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
          <button
            type="button"
            aria-label="Vista anterior"
            onClick={() => goView(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-main)] transition-colors hover:border-[var(--primary)]/40 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          <div className="flex items-center gap-1.5" role="tablist" aria-label="Vistas do veículo">
            {VIEWS.map((v) => {
              const selected = v.id === viewType
              return (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setViewType(v.id)}
                  className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold tracking-tight transition-all outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] ${
                    selected
                      ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--text-main)]'
                      : 'border-[var(--card-border)] bg-[var(--panel-bg)]/40 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--primary)]/35'
                  }`}
                >
                  {v.label}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            aria-label="Próxima vista"
            onClick={() => goView(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-main)] transition-colors hover:border-[var(--primary)]/40 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-stretch">
          {/* Diagrama clicável */}
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 p-4 sm:p-6">
            <VehicleViewer.Root
              vehicleType="car"
              viewType={viewType}
              damages={damages}
              onAddDamage={handleAddDamage}
              onRemoveDamageFromPart={handleRemoveDamageFromPart}
              speak={speak}
              speakHover={speakHover}
              onViewTypeChange={setViewType}
            >
              <VehicleViewer.Viewport />
              <VehicleViewer.FloatingDamage />
            </VehicleViewer.Root>
            {damages.length > 0 && (
              <p className="mt-3 text-center text-[11px] text-[var(--signal-bright)] font-semibold">
                {damages.length} avaria{damages.length > 1 ? 's' : ''} marcada{damages.length > 1 ? 's' : ''} · toque novamente para remover
              </p>
            )}
          </div>

          {/* Fotos reais da inspeção */}
          <aside className="flex flex-col gap-3 self-center">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-lg font-bold uppercase tracking-tight text-[var(--text-main)] leading-none">
                Toyota Corolla
              </p>
              <span className="font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)]">ABC-1234</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-[var(--card-border)]">
              <Image
                src="/samples/corolla-abc-1234-2.jpg"
                alt="Toyota Corolla ABC-1234 — vista traseira na inspeção"
                width={400}
                height={144}
                className="w-full h-36 object-cover"
                loading="lazy"
              />
            </div>
            <div className="rounded-xl overflow-hidden border border-[var(--card-border)]">
              <Image
                src="/samples/corolla-abc-1234-1.jpg"
                alt="Toyota Corolla ABC-1234 — detalhe da avaria no para-choque traseiro"
                width={400}
                height={144}
                className="w-full h-36 object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] leading-snug">
              Fotos anexadas à inspeção · Traseira · Evidência comprovatória
            </p>
          </aside>
        </div>
      </Reveal>
    </section>
  )
}
