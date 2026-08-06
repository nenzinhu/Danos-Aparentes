'use client'

import { useEffect, useState } from 'react'
import { listAuditEventsByVehicle, type AuditLogRow } from '@/src/lib/audit/auditLog'
import { presentAuditTimeline } from '@/src/lib/audit/timelinePresent'

export default function VehicleAuditTimeline({
  vehicleId,
  inspectionIds,
}: {
  vehicleId: string
  inspectionIds: string[]
}) {
  const [rows, setRows] = useState<AuditLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showIds, setShowIds] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const data = await listAuditEventsByVehicle({
        vehicleId,
        inspectionIds,
        limit: 60,
      })
      if (!cancelled) {
        setRows(data)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [vehicleId, inspectionIds.join('|')])

  const items = presentAuditTimeline(rows, { showIds })

  return (
    <section className="mt-2">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="font-display text-xl font-bold">Auditoria do veículo</h2>
        {!loading && items.length > 0 && (
          <label className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showIds}
              onChange={(e) => setShowIds(e.target.checked)}
              className="rounded border-[var(--card-border)]"
            />
            Mostrar IDs técnicos
          </label>
        )}
      </div>
      {loading ? (
        <p className="text-xs text-[var(--text-muted)]">Carregando eventos…</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">
          Nenhum evento de auditoria vinculado ainda (aparece após sync / comparação).
        </p>
      ) : (
        <div className="relative flex flex-col border-l border-[var(--card-border)] ml-2 pl-4">
          {items.slice().reverse().slice(0, 25).map((item) => (
            <div key={item.eventId} className="relative py-2.5">
              <span className="absolute -left-[1.35rem] top-3.5 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-[var(--bg-main)]" />
              <time className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                {item.when}
              </time>
              <p className="text-sm font-bold mt-0.5">{item.label}</p>
              {item.detail && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.detail}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
