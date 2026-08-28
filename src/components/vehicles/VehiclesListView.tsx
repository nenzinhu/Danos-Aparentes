'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { IconCar } from '@/src/components/ui/AnimatedIcons'
import TabEmptyState from '@/src/components/app/TabEmptyState'
import { PaginatedList } from './PaginatedList'
import type { VehicleHistorySummaryWithCloud } from '@/src/lib/vehicleEvidence'
import { normalizePlate } from '@/src/lib/reportComparison'

function formatDate(ts: number | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('pt-BR')
}

function plural(n: number, singular: string, pluralStr: string): string {
  return n === 1 ? singular : pluralStr
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
      <TabEmptyState
        icon={<IconCar size={30} />}
        title="Seu histórico começa na primeira vistoria"
        description="Cada veículo vistoriado ganha uma linha do tempo própria: avarias, fotos, GPS e dossiês — tudo por placa, pronto para comparar na próxima inspeção."
      >
        <Link
          href="/app"
          className="inline-block px-6 py-3 min-h-12 rounded-xl bg-primary text-[var(--bg-main)] font-bold text-sm hover:opacity-95 transition-opacity"
        >
          Criar primeira inspeção
        </Link>
      </TabEmptyState>
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

      <PaginatedList
        items={filtered}
        pageSize={10}
        ariaLabel="veículos"
        emptyText={`Nenhum veículo corresponde a “${query}”.`}
        getItemKey={(v) => v.id}
        renderItem={(v) => (
          <Link
            href={`/app/vehicles/${encodeURIComponent(v.id)}`}
            className="group rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-4 flex items-center justify-between gap-4 hover:border-[var(--primary)]/40 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-bold tracking-wide text-[var(--text-main)]">{v.plate || '—'}</p>
              <p
                className="text-xs text-[var(--text-muted)] mt-0.5 truncate"
                title={
                  [v.brand, v.color].filter(Boolean).join(' ') +
                  (v.lastLocation ? ` · ${v.lastLocation}` : '')
                }
              >
                {[v.brand, v.color].filter(Boolean).join(' · ') || 'Veículo'}
                {v.lastLocation ? ` · ${v.lastLocation}` : ''}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-right text-xs leading-snug">
              {v.cloudOnly ? (
                <span className="font-bold text-[var(--primary)]">Só na nuvem</span>
              ) : (
                <span className="font-bold tabular-nums text-[var(--text-main)]">
                  {v.reports.length} {plural(v.reports.length, 'inspeção', 'inspeções')}
                </span>
              )}
              <span className="tabular-nums text-[var(--text-muted)]">
                {v.activeDamageCount} {plural(v.activeDamageCount, 'dano', 'danos')} na última
              </span>
              {v.newDamagesOnLast > 0 && (
                <span className="inline-flex items-center gap-1 font-bold text-[var(--signal-bright)] tabular-nums">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-bright)]" />
                  +{v.newDamagesOnLast} {plural(v.newDamagesOnLast, 'novo', 'novos')}
                </span>
              )}
              <span className="text-[var(--text-muted)]/70">Última: {formatDate(v.lastInspectedAt)}</span>
            </div>
            <svg aria-hidden className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </Link>
        )}
      />
    </div>
  )
}
