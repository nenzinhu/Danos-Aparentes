'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AuditLogRow } from '../lib/audit/auditLog'
import { presentAuditTimeline } from '../lib/audit/timelinePresent'

interface AuditDashboardProps {
  accessToken?: string
  enabled?: boolean
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    if (body && typeof body.error === 'string') return body.error
  } catch {
    // ignore
  }
  return fallback
}

export default function AuditDashboard({ accessToken, enabled = true }: AuditDashboardProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [events, setEvents] = useState<AuditLogRow[]>([])
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [inspectionFilter, setInspectionFilter] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('')

  const load = useCallback(async () => {
    if (!enabled || !accessToken) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: '50' })
      const insp = inspectionFilter.trim()
      if (insp) params.set('inspection_id', insp)
      if (eventTypeFilter) params.set('event_type', eventTypeFilter)
      const res = await fetch(`/api/audit-log?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error(await readErrorMessage(res, 'Não foi possível carregar auditoria'))
      const data = await res.json()
      setEvents((data.events as AuditLogRow[]) ?? [])
      setEventTypes((data.eventTypes as string[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar auditoria')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [accessToken, enabled, inspectionFilter, eventTypeFilter])

  useEffect(() => {
    if (!open) return
    // Adia um tick para não chamar setState sincronamente dentro do effect.
    setTimeout(() => { void load() }, 0)
  }, [open, load])

  if (!enabled || !accessToken) return null

  const items = presentAuditTimeline(events)

  return (
    <div className="glass-card p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)]">Auditoria da organização</h3>
          <p className="text-[0.72rem] text-[var(--text-muted)] mt-0.5">
            Trilha técnica de eventos do tenant (sem validade jurídica garantida).
          </p>
        </div>
        <span className="text-xs font-bold text-[var(--text-muted)]">{open ? 'Recolher' : 'Ver'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2 items-end">
            <label className="flex flex-col gap-1 text-[0.68rem] text-[var(--text-muted)]">
              Vistoria (ID)
              <input
                value={inspectionFilter}
                onChange={(e) => setInspectionFilter(e.target.value)}
                placeholder="opcional"
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-[var(--text-main)] min-w-[140px]"
              />
            </label>
            <label className="flex flex-col gap-1 text-[0.68rem] text-[var(--text-muted)]">
              Tipo de evento
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-[var(--text-main)] min-w-[160px]"
              >
                <option value="">Todos</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => { void load() }}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500/10 border border-sky-500/25 text-sky-400 disabled:opacity-50"
            >
              {loading ? 'Carregando…' : 'Filtrar'}
            </button>
          </div>

          {error && (
            <p className="text-[0.75rem] text-rose-400" role="alert">{error}</p>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="text-[0.75rem] text-[var(--text-muted)]">Nenhum evento encontrado.</p>
          )}
          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
            {items.map((ev) => (
              <div
                key={ev.eventId}
                className="rounded-lg border border-white/10 bg-black/10 px-3 py-2"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="text-[0.78rem] font-bold text-[var(--text-main)]">{ev.label}</p>
                  <p className="text-[0.65rem] text-[var(--text-muted)] font-mono">{ev.when}</p>
                </div>
                {ev.detail && (
                  <p className="text-[0.68rem] text-[var(--text-muted)] mt-1 break-all">{ev.detail}</p>
                )}
                {ev.eventHashShort && (
                  <p className="text-[0.62rem] text-[var(--text-muted)] font-mono mt-0.5 opacity-70">
                    {ev.eventHashShort}…
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
