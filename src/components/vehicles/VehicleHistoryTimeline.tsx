'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { listAuditEventsByVehicle, type AuditLogRow } from '@/src/lib/audit/auditLog'
import {
  CATEGORY_STYLE,
  TIMELINE_FILTERS,
  presentAuditTimeline,
  type TimelineCategory,
  type TimelinePresentation,
  type TimelineStatusKind,
} from '@/src/lib/audit/timelinePresent'
import type { ProntuarioIntel } from '@/src/lib/vehicleEvidence/prontuarioIntel'
import type { VehicleHistorySummaryWithCloud } from '@/src/lib/vehicleEvidence'
import type { SavedReport } from '@/src/types'
import { resolvePhotoUrl } from '@/src/lib/photoStore'

type StoryItem = {
  id: string
  sortAt: number
  category: TimelineCategory
  title: string
  description: string
  bullets: string[]
  whenDate: string
  whenTime: string
  status: TimelineStatusKind
  statusLabel: string
  href?: string
  actionLabel?: string
  photoRefs?: string[]
  photoCount?: number
  damageCount?: number
  evidenceCount?: number
  responsible?: string
  aiResultLabel?: string
  aiConfidence?: number | null
  stageHint?: string
  aiBlock?: {
    confidence?: number | null
    severityLabel?: string | null
    partName?: string | null
  }
  source: 'inspection' | 'audit' | 'insight'
}

type RemoteInspection = {
  id: string
  plate?: string | null
  status?: string | null
  public_code?: string | null
  updated_at?: string | null
  issued_at?: string | null
}

function formatParts(ts: number | string): { whenDate: string; whenTime: string; sortAt: number } {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  const sortAt = d.getTime() || 0
  return {
    sortAt,
    whenDate: Number.isFinite(sortAt)
      ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—',
    whenTime: Number.isFinite(sortAt)
      ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '',
  }
}

function statusFromReport(r: SavedReport): { status: TimelineStatusKind; statusLabel: string } {
  if (r.status === 'issued') return { status: 'assinado', statusLabel: 'Assinado' }
  if (r.syncedAt == null || r.syncedAt < r.savedAt) {
    return { status: 'pendente', statusLabel: 'Pendente' }
  }
  if (r.status === 'complete') return { status: 'validado', statusLabel: 'Validado' }
  return { status: 'em_analise', statusLabel: 'Em análise' }
}

function statusIcon(kind: TimelineStatusKind): string {
  switch (kind) {
    case 'validado':
      return '✔'
    case 'pendente':
      return '⏳'
    case 'em_analise':
      return '🔄'
    case 'evidencias':
      return '📷'
    case 'assinado':
      return '✍'
    case 'sincronizado':
      return '☁'
    case 'alerta':
      return '⚠'
    default:
      return '•'
  }
}

function categoryGlyph(cat: TimelineCategory): string {
  switch (cat) {
    case 'inspecao':
      return '◎'
    case 'ia':
      return '✦'
    case 'comparacao':
      return '⇄'
    case 'reparo':
      return '⚒'
    case 'sincronizacao':
      return '☁'
    case 'venda':
      return '◆'
    case 'transferencia':
      return '⇢'
    case 'documento':
      return '▣'
    case 'alerta':
      return '!'
    default:
      return '•'
  }
}

function collectPhotoRefs(report: SavedReport, max = 4): string[] {
  const refs: string[] = []
  for (const d of report.damages) {
    for (const p of d.photos || []) {
      if (p && !refs.includes(p)) refs.push(p)
      if (refs.length >= max) return refs
    }
  }
  return refs
}

function countReportEvidence(report: SavedReport): number {
  let n = report.damages.reduce((acc, d) => acc + (d.photos?.length || 0), 0)
  n += report.vehicleInfo.interiorPhotos?.length || 0
  if (report.vehicleInfo.viewPhotos) {
    n += Object.values(report.vehicleInfo.viewPhotos).filter(Boolean).length
  }
  return n
}

function aiLabelFromReport(r: SavedReport): { label?: string; confidence?: number | null } {
  const statuses = r.damages.map((d) => d.evidenceStatus).filter(Boolean)
  if (statuses.some((s) => s === 'sugerido')) return { label: 'IA: em análise', confidence: 70 }
  if (statuses.some((s) => s === 'confirmado')) return { label: 'IA: 98%', confidence: 98 }
  if (statuses.length === 0) return {}
  return { label: 'IA: revisada', confidence: 85 }
}

function buildInspectionStories(
  vehicle: VehicleHistorySummaryWithCloud,
  cloudOnly: RemoteInspection[],
): StoryItem[] {
  const items: StoryItem[] = []

  for (const r of vehicle.reports) {
    const { whenDate, whenTime, sortAt } = formatParts(r.savedAt)
    const st = statusFromReport(r)
    const damageCount = r.damages.length
    const evidenceCount = countReportEvidence(r)
    const photoCount = r.damages.reduce((n, d) => n + (d.photos?.length || 0), 0)
    const ai = aiLabelFromReport(r)
    const responsible =
      r.vehicleInfo.owner?.trim() ||
      (r.vehicleInfo.inspectorSignature ? 'Responsável assinado' : 'Equipe de vistoria')
    items.push({
      id: `insp-${r.id}`,
      sortAt,
      category: 'inspecao',
      title: 'Nova inspeção',
      description:
        damageCount === 0
          ? 'O estado do veículo foi documentado sem avarias aparentes neste momento.'
          : `Registro com ${damageCount} dano${damageCount === 1 ? '' : 's'} mapeado${damageCount === 1 ? '' : 's'} no diagrama.`,
      bullets: [
        evidenceCount > 0
          ? `${evidenceCount} evidência${evidenceCount === 1 ? '' : 's'} fotográfica${evidenceCount === 1 ? '' : 's'}`
          : 'Diagrama atualizado',
        ...(r.vehicleInfo.geo?.address ? [`Local: ${r.vehicleInfo.geo.address}`] : []),
        ...(r.publicCode ? [`Dossiê ${r.publicCode}`] : []),
        photoCount > 0 ? `${photoCount} foto${photoCount === 1 ? '' : 's'} anexada${photoCount === 1 ? '' : 's'}` : '',
      ].filter(Boolean),
      whenDate,
      whenTime,
      status: st.status,
      statusLabel: st.statusLabel,
      href: `/app/vehicles/${encodeURIComponent(vehicle.id)}/compare`,
      actionLabel: 'Comparar inspeções',
      photoRefs: collectPhotoRefs(r),
      photoCount,
      damageCount,
      evidenceCount,
      responsible,
      aiResultLabel: ai.label,
      aiConfidence: ai.confidence,
      stageHint: 'Inspeção → evidências → validação',
      source: 'inspection',
    })
  }

  for (const r of cloudOnly) {
    const ts = r.updated_at || r.issued_at || Date.now()
    const { whenDate, whenTime, sortAt } = formatParts(ts)
    items.push({
      id: `cloud-${r.id}`,
      sortAt,
      category: 'sincronizacao',
      title: 'Sincronização pendente',
      description:
        'Há um registro remoto ainda incompleto neste dispositivo. Sincronize para ver danos e fotos.',
      bullets: [
        r.public_code ? `Dossiê ${r.public_code}` : 'Metadados remotos',
        'Aguardando sincronização',
      ],
      whenDate,
      whenTime,
      status: 'pendente',
      statusLabel: 'Pendente',
      responsible: 'Nuvem',
      stageHint: 'Sincronização',
      source: 'inspection',
    })
  }

  if (vehicle.newDamagesOnLast > 0) {
    const last = vehicle.reports[vehicle.reports.length - 1]
    const { whenDate, whenTime, sortAt } = formatParts(last?.savedAt ?? Date.now())
    items.push({
      id: `insight-new-${vehicle.id}`,
      sortAt: sortAt + 1,
      category: 'comparacao',
      title: 'Comparação com histórico',
      description: 'A inspeção foi comparada automaticamente com a anterior.',
      bullets: [
        `${vehicle.newDamagesOnLast} novo${vehicle.newDamagesOnLast === 1 ? '' : 's'} dano${vehicle.newDamagesOnLast === 1 ? '' : 's'} encontrado${vehicle.newDamagesOnLast === 1 ? '' : 's'}`,
        'Histórico atualizado',
      ],
      whenDate,
      whenTime,
      status: 'validado',
      statusLabel: 'Validado',
      href: `/app/vehicles/${encodeURIComponent(vehicle.id)}/compare`,
      actionLabel: 'Ver comparação',
      damageCount: vehicle.newDamagesOnLast,
      aiResultLabel: 'Sem divergências estruturais',
      stageHint: 'Comparação → resultado',
      source: 'insight',
    })
  }

  return items
}

function auditToStory(p: TimelinePresentation, sortAt: number): StoryItem {
  return {
    id: `audit-${p.eventId}`,
    sortAt,
    category: p.category,
    title: p.title,
    description: p.description || p.detail,
    bullets: p.bullets,
    whenDate: p.whenDate,
    whenTime: p.whenTime,
    status: p.status,
    statusLabel: p.statusLabel,
    responsible: 'Sistema de auditoria',
    aiResultLabel:
      p.category === 'ia' && p.meta.confidence != null
        ? `IA: ${p.meta.confidence}%`
        : p.category === 'ia'
          ? 'IA processou imagens'
          : undefined,
    aiConfidence: p.meta.confidence,
    stageHint:
      p.category === 'ia'
        ? 'IA processou imagens'
        : p.category === 'sincronizacao'
          ? 'Sincronização'
          : p.category === 'comparacao'
            ? 'Comparação com histórico'
            : undefined,
    aiBlock:
      p.category === 'ia'
        ? {
            confidence: p.meta.confidence,
            severityLabel: p.meta.severityLabel,
            partName: p.meta.partName,
          }
        : undefined,
    source: 'audit',
  }
}

function TimelineThumb({ photoRef }: { photoRef: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (photoRef.startsWith('data:') || /^https?:/i.test(photoRef)) {
          if (!cancelled) setUrl(photoRef)
          return
        }
        const resolved = await resolvePhotoUrl(photoRef)
        if (!cancelled && resolved) setUrl(resolved)
      } catch {
        if (!cancelled) setUrl(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [photoRef])

  if (!url) {
    return (
      <div
        className="h-14 w-14 rounded-lg border border-[var(--card-border)] bg-[var(--panel-bg)] animate-pulse"
        aria-hidden
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className="h-14 w-14 rounded-lg object-cover border border-[var(--card-border)]/80 shadow-sm transition-transform duration-200 motion-safe:group-hover:scale-[1.02]"
    />
  )
}

function SkeletonCards() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando histórico">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--card-border)]/60 bg-[var(--card-bg-solid)]/40 p-5 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="h-3 w-24 rounded bg-[var(--card-border)]/50 mb-3" />
          <div className="h-5 w-2/3 rounded bg-[var(--card-border)]/40 mb-2" />
          <div className="h-3 w-full rounded bg-[var(--card-border)]/30" />
        </div>
      ))}
    </div>
  )
}

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

  useEffect(() => {
    let cancelled = false
    setLoading(true)
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
  }, [vehicle.id, inspectionIds.join('|')])

  const stories = useMemo(() => {
    const fromInsp = buildInspectionStories(vehicle, cloudOnlyInspections)
    const presented = presentAuditTimeline(rows)
    const fromAudit = presented.map((p) => {
      const sortAt = Date.parse(rows.find((r) => r.event_id === p.eventId)?.timestamp || '') || 0
      return auditToStory(p, sortAt)
    })
    return [...fromInsp, ...fromAudit].sort((a, b) => b.sortAt - a.sortAt)
  }, [vehicle, cloudOnlyInspections, rows])

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
          {filtered.map((item, index) => {
            const style = CATEGORY_STYLE[item.category]
            const isOpen = expanded[item.id] ?? index < 4
            const isLatest = index === 0
            return (
              <li key={item.id} className="relative pl-14 sm:pl-16 pb-6 last:pb-0">
                {/* Marcador premium */}
                <span className="absolute left-2 sm:left-2.5 top-5 flex h-9 w-9 items-center justify-center">
                  <span
                    aria-hidden
                    className={`absolute inset-0 rounded-full bg-sky-400/25 blur-[6px] ${
                      isLatest ? 'motion-safe:animate-pulse' : ''
                    }`}
                  />
                  <span
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/40 ${style.iconBg} text-[12px] font-black shadow-[0_0_14px_rgba(56,189,248,0.35)] ring-[5px] ring-[var(--bg-main)] transition-transform duration-200 motion-safe:group-hover:scale-105`}
                    title={style.label}
                  >
                    {categoryGlyph(item.category)}
                  </span>
                </span>

                <article
                  className={`group rounded-2xl border border-[var(--card-border)]/80 bg-[var(--card-bg-solid)]/90 p-4 sm:p-5 shadow-sm shadow-black/10 transition-[transform,box-shadow,border-color] duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/10 hover:border-sky-500/30 ${style.ring} ring-1`}
                >
                  <header className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}
                        >
                          {style.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--success)]">
                          <span aria-hidden>{statusIcon(item.status)}</span>
                          {item.statusLabel}
                        </span>
                        {item.aiResultLabel && (
                          <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                            {item.aiResultLabel}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)] [text-wrap:balance]">
                        {item.title}
                      </h3>
                      <time className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        {item.whenDate}
                        {item.whenTime ? ` · ${item.whenTime}` : ''}
                        {item.responsible ? ` · ${item.responsible}` : ''}
                      </time>
                    </div>
                    <button
                      type="button"
                      className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors duration-200"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [item.id]: !isOpen }))
                      }
                    >
                      {isOpen ? 'Recolher' : 'Expandir'}
                    </button>
                  </header>

                  {/* Badges de métricas do evento */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.photoCount != null && item.photoCount > 0 && (
                      <span className="rounded-md border border-[var(--card-border)]/70 px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                        {item.photoCount} foto{item.photoCount === 1 ? '' : 's'}
                      </span>
                    )}
                    {item.damageCount != null && item.damageCount > 0 && (
                      <span className="rounded-md border border-[var(--card-border)]/70 px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                        {item.damageCount} dano{item.damageCount === 1 ? '' : 's'}
                      </span>
                    )}
                    {item.evidenceCount != null && item.evidenceCount > 0 && (
                      <span className="rounded-md border border-[var(--card-border)]/70 px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                        {item.evidenceCount} evidência{item.evidenceCount === 1 ? '' : 's'}
                      </span>
                    )}
                    {item.stageHint?.trim() ? (
                      <span className="rounded-md border border-sky-500/25 bg-sky-500/5 px-2 py-0.5 text-[10px] font-bold text-sky-300/90">
                        {item.stageHint.trim()}
                      </span>
                    ) : null}
                  </div>

                  {isOpen && (
                    <div className="mt-3 space-y-3">
                      {item.description && (
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {item.bullets.length > 0 && (
                        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                          {item.bullets.map((b) => (
                            <li
                              key={b}
                              className="flex items-start gap-2 text-sm text-[var(--text-main)]/90"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--success)]/80" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {item.aiBlock &&
                        (item.aiBlock.partName ||
                          item.aiBlock.confidence ||
                          item.aiBlock.severityLabel) && (
                          <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300 mb-2">
                              ✦ Análise de IA
                            </p>
                            <p className="text-sm font-semibold text-[var(--text-main)]">
                              {item.aiBlock.partName
                                ? `Novo dano identificado · ${item.aiBlock.partName}`
                                : 'Novo dano identificado'}
                            </p>
                            <dl className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              {item.aiBlock.confidence != null && (
                                <div>
                                  <dt className="text-[var(--text-muted)]">Confiança</dt>
                                  <dd className="font-bold text-violet-200">
                                    {item.aiBlock.confidence}%
                                  </dd>
                                </div>
                              )}
                              {item.aiBlock.severityLabel && (
                                <div>
                                  <dt className="text-[var(--text-muted)]">Severidade</dt>
                                  <dd className="font-bold">{item.aiBlock.severityLabel}</dd>
                                </div>
                              )}
                              {item.aiBlock.partName && (
                                <div className="col-span-2 sm:col-span-1">
                                  <dt className="text-[var(--text-muted)]">Componente</dt>
                                  <dd className="font-bold">{item.aiBlock.partName}</dd>
                                </div>
                              )}
                            </dl>
                            <p className="mt-2 text-[11px] text-violet-200/80">
                              Comparado automaticamente.
                            </p>
                          </div>
                        )}

                      {item.photoRefs && item.photoRefs.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                            Evidências
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.photoRefs.map((ref) => (
                              <TimelineThumb key={ref} photoRef={ref} />
                            ))}
                          </div>
                        </div>
                      )}

                      {item.href && item.actionLabel && (
                        <div className="pt-1">
                          <Link
                            href={item.href}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-colors duration-200"
                          >
                            {item.actionLabel}
                            <span aria-hidden>→</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
