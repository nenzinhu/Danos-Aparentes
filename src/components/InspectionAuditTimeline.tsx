'use client'
import { useEffect, useState } from 'react'
import { listAuditEventsByInspection, type AuditLogRow } from '../lib/audit/auditLog'
import {
  CATEGORY_STYLE,
  presentAuditTimeline,
  type TimelinePresentation,
} from '../lib/audit/timelinePresent'

interface InspectionAuditTimelineProps {
  inspectionId: string | null | undefined
  /** When true, timeline is read-only context (issued). Always read-only in practice. */
  issued?: boolean
}

export default function InspectionAuditTimeline({ inspectionId, issued }: InspectionAuditTimelineProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<TimelinePresentation[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !inspectionId) return
    let cancelled = false
    // Adia um tick para não chamar setState sincronamente dentro do effect.
    const t = setTimeout(() => {
      if (cancelled) return
      setLoading(true)
      setError('')
      void listAuditEventsByInspection(inspectionId)
        .then((rows: AuditLogRow[]) => {
          if (cancelled) return
          setItems(presentAuditTimeline(rows))
        })
        .catch(() => {
          if (!cancelled) setError('Não foi possível carregar o histórico desta inspeção.')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(t)
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
          <p className="text-sm font-bold text-[var(--text-main)]">Histórico desta inspeção</p>
          <p className="text-[0.72rem] text-[var(--text-muted)] mt-0.5">
            Eventos do prontuário digital{issued ? ' (somente leitura após emissão)' : ''}.
          </p>
        </div>
        <span className="text-xs font-bold text-[var(--text-muted)]">{open ? 'Recolher' : 'Ver'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-2.5" role="list" aria-label="Histórico da inspeção">
          {loading && (
            <p className="text-[0.75rem] text-[var(--text-muted)]">Carregando eventos…</p>
          )}
          {error && (
            <p className="text-[0.75rem] text-[var(--severity-high)]" role="alert">{error}</p>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="text-[0.75rem] text-[var(--text-muted)]">
              Nenhum evento encontrado. Assim que houver atividade, o histórico aparece aqui.
            </p>
          )}
          {items.map((ev) => {
            const style = CATEGORY_STYLE[ev.category]
            return (
              <div
                key={ev.eventId}
                role="listitem"
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] px-3.5 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}
                    >
                      {style.label}
                    </span>
                    <p className="text-[0.85rem] font-bold text-[var(--text-main)]">{ev.title}</p>
                  </div>
                  <p className="text-[0.68rem] text-[var(--text-muted)]">{ev.when}</p>
                </div>
                {ev.description && (
                  <p className="text-[0.72rem] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                    {ev.description}
                  </p>
                )}
                {ev.bullets.length > 0 && (
                  <ul className="mt-2 space-y-1 text-[0.7rem] text-[var(--text-main)]/85 list-none m-0 p-0">
                    {ev.bullets.map((b) => (
                      <li key={b} className="flex gap-1.5">
                        <span className="text-[var(--success)]">✔</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {ev.statusLabel}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
