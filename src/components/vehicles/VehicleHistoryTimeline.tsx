'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { listAuditEventsByVehicle, type AuditLogRow } from '@/src/lib/audit/auditLog'
import { TIMELINE_FILTERS, type TimelineCategory } from '@/src/lib/audit/timelinePresent'
import type { ProntuarioIntel } from '@/src/lib/vehicleEvidence/prontuarioIntel'
import type { VehicleHistorySummaryWithCloud } from '@/src/lib/vehicleEvidence'
import { buildStories, type RemoteInspection } from './vehicleHistoryStories'
import TimelineCard, { SkeletonCards } from './TimelineCard'

const summaryTone: Record<string, string> = {
  default: 'text-[var(--text-main)]',
  ok: 'text-emerald-300',
  warn: 'text-amber-300',
}

export default function VehicleHistoryTimeline({
  vehicle,
  cloudOnlyInspections = [],
  intel,
  onSyncRequest,
}: {
  vehicle: VehicleHistorySummaryWithCloud
  cloudOnlyInspections?: RemoteInspection[]
  intel?: ProntuarioIntel
  onSyncRequest?: () => void
}) {
  const [rows, setRows] = useState<AuditLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TimelineCategory | 'todos'>('todos')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const inspectionIds = useMemo(() => vehicle.reports.map((r) => r.id), [vehicle.reports])

  // Loading sobe durante o render quando a chave de busca muda (ajuste de
  // estado por mudança de prop), sem setState síncrono dentro do effect.
  const [lastFetch, setLastFetch] = useState({ id: vehicle.id, ids: inspectionIds })
  if (lastFetch.id !== vehicle.id || lastFetch.ids !== inspectionIds) {
    setLastFetch({ id: vehicle.id, ids: inspectionIds })
    setLoading(true)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const data = await listAuditEventsByVehicle({
        vehicleId: vehicle.id,
        inspectionIds,
        limit: 80,
      })
      if (!cancelled) {
        setRows(data)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [vehicle.id, inspectionIds])

  const stories = useMemo(
    () => buildStories(vehicle, cloudOnlyInspections, rows),
    [vehicle, cloudOnlyInspections, rows],
  )

  const filtered = useMemo(() => {
    if (filter === 'todos') return stories
    return stories.filter((s) => s.category === filter)
  }, [stories, filter])

  const kpis = intel?.contextualKpis ?? []

  return (
    <section className="flex flex-col gap-6" aria-labelledby="vehicle-history-heading">
      {/* 4. Indicadores contextuais */}
      {kpis.length > 0 && (
        <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(9.5rem, 1fr))' }}>
          {kpis.map((kpi) => {
            const hint = kpi.hint?.trim()
            const inner = (
              <>
                <p className="text-2xl font-bold tabular-nums tracking-tight text-[var(--text-main)]">
                  {kpi.value}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                  {kpi.label}
                </p>
                {hint ? (
                  <p className="text-[11px] text-[var(--text-muted)]/90 mt-1.5 leading-snug break-words">{hint}</p>
                ) : null}
              </>
            )
            const className =
              'block rounded-xl border border-[var(--card-border)]/70 bg-[var(--card-bg-solid)]/80 px-3 py-3 shadow-sm shadow-black/5 transition-[transform,border-color,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5 hover:border-sky-500/30 hover:shadow-[0_0_24px_-10px_rgba(56,189,248,0.3)]'
            if (kpi.href) {
              return (
                <Link key={kpi.id} href={kpi.href} className={className}>
                  {inner}
                </Link>
              )
            }
            return (
              <div key={kpi.id} className={className}>
                {inner}
              </div>
            )
          })}
        </div>
      )}

      {/* 5. Resumo do Histórico */}
      {intel && (
        <div className="rounded-2xl border border-[var(--card-border)]/70 bg-[var(--card-bg-solid)]/85 p-4 sm:p-5 transition-[box-shadow,border-color] duration-200 hover:border-sky-500/25 hover:shadow-[0_0_32px_-14px_rgba(56,189,248,0.22)]">
          <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
            <div>
              <p className="font-mono-data text-[11px] tracking-[0.2em] uppercase text-[var(--signal-bright)] mb-1">
                Inteligência do prontuário
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                Resumo do Histórico
              </h2>
            </div>
            {intel.avgDaysBetween != null && (
              <p className="text-[11px] text-[var(--text-muted)]">
                Média {intel.avgDaysBetween}d entre inspeções · {intel.totalChanges} alteração
                {intel.totalChanges === 1 ? '' : 'ões'} recente{intel.totalChanges === 1 ? '' : 's'}
              </p>
            )}
          </div>
          <dl
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))' }}
          >
            {intel.summaryRows
              .filter((row) => Boolean(row.value?.trim()) && row.value.trim() !== '—')
              .map((row) => (
                <div
                  key={row.label}
                  className="rounded-xl border border-[var(--card-border)]/50 bg-[var(--panel-bg)]/40 px-3 py-2.5"
                >
                  <dt className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {row.label}
                  </dt>
                  <dd className={`mt-1 text-sm font-semibold break-words ${summaryTone[row.tone || 'default']}`}>
                    {row.value}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      {/* 6–7. Linha do Tempo + eventos */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono-data text-[11px] tracking-[0.2em] uppercase text-[var(--signal-bright)] mb-1">
            Prontuário digital
          </p>
          <h2 id="vehicle-history-heading" className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Linha do Tempo
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {filtered.length} evento{filtered.length === 1 ? '' : 's'}
            {filter !== 'todos' ? ' · filtro ativo' : ''} — evolução auditável do veículo
          </p>
        </div>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin"
        role="tablist"
        aria-label="Filtrar eventos do histórico"
      >
        {TIMELINE_FILTERS.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border transition-colors duration-200 ${
                active
                  ? 'bg-[var(--text-main)] text-[var(--bg-main)] border-transparent'
                  : 'bg-transparent text-[var(--text-muted)] border-[var(--card-border)] hover:text-[var(--text-main)] hover:border-[var(--text-muted)]'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <SkeletonCards />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--panel-bg)]/50 px-6 py-12 text-center">
          <p className="font-display text-xl font-bold tracking-tight">Nenhum evento encontrado</p>
          <p className="text-sm text-[var(--text-muted)] mt-2 max-w-md mx-auto leading-relaxed">
            Assim que uma inspeção for realizada, todo o histórico do veículo será registrado aqui.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/app"
              className="inline-flex px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-sky-500/20"
              style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
            >
              Realizar primeira inspeção
            </Link>
            {onSyncRequest && (
              <button
                type="button"
                onClick={onSyncRequest}
                className="inline-flex px-5 py-2.5 rounded-xl text-sm font-bold border border-[var(--card-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)]"
              >
                Sincronizar histórico
              </button>
            )}
          </div>
        </div>
      ) : (
        <ol className="relative m-0 list-none p-0 pl-0 sm:pl-2">
          <div
            aria-hidden
            className="absolute left-[1.35rem] sm:left-[1.55rem] top-4 bottom-4 w-px bg-gradient-to-b from-sky-400/50 via-[var(--card-border)]/70 to-transparent"
          />
          {filtered.map((item, index) => (
            <TimelineCard
              key={item.id}
              item={item}
              isOpen={expanded[item.id] ?? index < 4}
              isLatest={index === 0}
              onToggle={() =>
                setExpanded((prev) => ({ ...prev, [item.id]: !(prev[item.id] ?? index < 4) }))
              }
            />
          ))}
        </ol>
      )}
    </section>
  )
}
