'use client'
import { useEffect, useState } from 'react'
import { listAuditEventsByInspection, type AuditLogRow } from '../lib/audit/auditLog'
import { presentAuditTimeline, type TimelinePresentation, type TimelineTone } from '../lib/audit/timelinePresent'

interface InspectionAuditTimelineProps {
  inspectionId: string | null | undefined
  /** When true, timeline is read-only context (issued). Always read-only in practice. */
  issued?: boolean
}

const TONE_CLASS: Record<TimelineTone, string> = {
  neutral: 'border-[var(--panel-border)] bg-[var(--card-bg-solid)]',
  ok: 'border-emerald-500/25 bg-emerald-500/5',
  warn: 'border-amber-500/25 bg-amber-500/5',
  ai: 'border-sky-500/25 bg-sky-500/5',
  block: 'border-rose-500/25 bg-rose-500/5',
}

export default function InspectionAuditTimeline({ inspectionId, issued }: InspectionAuditTimelineProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<TimelinePresentation[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !inspectionId) return
    let cancelled = false
    setLoading(true)
    setError('')
    void listAuditEventsByInspection(inspectionId)
      .then((rows: AuditLogRow[]) => {
        if (cancelled) return
        setItems(presentAuditTimeline(rows))
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar a trilha de auditoria.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, inspectionId])

  if (!inspectionId) return null

  return (
    <div className="mt-6 pt-6 border-t border-[var(--panel-border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="text-sm font-bold text-[var(--text-main)]">Trilha de auditoria</p>
          <p className="text-[0.72rem] text-[var(--text-muted)] mt-0.5">
            Eventos técnicos desta vistoria{issued ? ' (somente leitura após emissão)' : ''}.
          </p>
        </div>
        <span className="text-xs font-bold text-[var(--text-muted)]">{open ? 'Recolher' : 'Ver'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-2" role="list" aria-label="Timeline de auditoria">
          {loading && (
            <p className="text-[0.75rem] text-[var(--text-muted)]">Carregando eventos…</p>
          )}
          {error && (
            <p className="text-[0.75rem] text-rose-400" role="alert">{error}</p>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="text-[0.75rem] text-[var(--text-muted)]">
              Nenhum evento registrado ainda para esta vistoria.
            </p>
          )}
          {items.map((ev) => (
            <div
              key={ev.eventId}
              role="listitem"
              className={`rounded-lg border px-3 py-2 ${TONE_CLASS[ev.tone]}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[0.8rem] font-bold text-[var(--text-main)]">{ev.label}</p>
                <p className="text-[0.68rem] text-[var(--text-muted)] font-mono">{ev.when}</p>
              </div>
              {ev.detail && (
                <p className="text-[0.7rem] text-[var(--text-muted)] mt-1 leading-relaxed break-all">
                  {ev.detail}
                </p>
              )}
              {ev.eventHashShort && (
                <p className="text-[0.65rem] text-[var(--text-muted)] mt-1 font-mono opacity-70">
                  chain {ev.eventHashShort}…
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
