'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { VehicleHistorySummaryWithCloud } from '@/src/lib/vehicleEvidence'
import { normalizePlate } from '@/src/lib/reportComparison'

function formatDate(ts: number | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('pt-BR')
}

export default function VehiclesListView({
  vehicles,
}: {
  vehicles: VehicleHistorySummaryWithCloud[]
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return vehicles
    const nq = normalizePlate(q)
    const lower = q.toLowerCase()
    return vehicles.filter((v) => {
      const plate = normalizePlate(v.plate)
      return (
        plate.includes(nq) ||
        v.brand.toLowerCase().includes(lower) ||
        v.color.toLowerCase().includes(lower)
      )
    })
  }, [vehicles, query])

  if (vehicles.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Nenhum veículo com placa válida no histórico local ainda.
        </p>
        <Link
          href="/app"
          className="inline-block mt-4 text-sm font-bold text-sky-400 hover:underline"
        >
          Ir para nova vistoria →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-muted)]">
        Buscar placa, marca ou cor
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: ABC1D23"
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg-solid)] text-[var(--text-main)] text-sm font-normal px-3 py-2"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-6">
          Nenhum veículo corresponde a “{query}”.
        </p>
      ) : (
        filtered.map((v) => (
          <Link
            key={v.id}
            href={`/app/vehicles/${encodeURIComponent(v.id)}`}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-4 flex items-center justify-between gap-4 hover:border-sky-500/40 transition-colors"
          >
            <div>
              <p className="font-display text-xl font-bold tracking-wide">{v.plate || '—'}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {[v.brand, v.color].filter(Boolean).join(' · ') || 'Veículo'}
                {v.lastLocation ? ` · ${v.lastLocation}` : ''}
              </p>
            </div>
            <div className="text-right text-xs text-[var(--text-muted)] shrink-0">
              {v.cloudOnly ? (
                <p className="font-bold text-sky-300">Só na nuvem</p>
              ) : (
                <p className="font-bold text-[var(--text-main)]">{v.reports.length} vistoria(s)</p>
              )}
              <p>{v.activeDamageCount} dano(s) na última</p>
              {v.newDamagesOnLast > 0 && (
                <p className="text-amber-400 font-bold mt-0.5">{v.newDamagesOnLast} novo(s)</p>
              )}
              <p className="mt-1">Última: {formatDate(v.lastInspectedAt)}</p>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
