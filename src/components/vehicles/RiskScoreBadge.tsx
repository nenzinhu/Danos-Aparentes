'use client'

import { useMemo } from 'react'
import { computeVehicleRiskScore, type RiskTier } from '@/src/lib/vehicleEvidence/riskScore'
import type { VehicleHistorySummary } from '@/src/lib/vehicleEvidence'

const TIER_COLOR: Record<RiskTier, string> = {
  green: 'text-[var(--severity-low)] bg-[color-mix(in_srgb,var(--severity-low)_14%,transparent)] border-[var(--severity-low)]/30',
  yellow: 'text-[var(--severity-medium)] bg-[color-mix(in_srgb,var(--severity-medium)_14%,transparent)] border-[var(--severity-medium)]/30',
  red: 'text-[var(--severity-high)] bg-[color-mix(in_srgb,var(--severity-high)_14%,transparent)] border-[var(--severity-high)]/30',
}

export function RiskScoreBadge({ vehicle }: { vehicle: VehicleHistorySummary }) {
  const risk = useMemo(() => computeVehicleRiskScore(vehicle), [vehicle])

  const title = risk.confidence === 'low'
    ? `Score de risco: ${risk.score} (nota preliminar — poucos dados)`
    : `Score de risco: ${risk.score}${risk.factors.length > 0 ? ' — ' + risk.factors.slice(0, 3).map((f) => f.label).join('; ') : ''}`

  return (
    <span
      title={title}
      className={
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold tabular-nums shrink-0 ' +
        (risk.confidence === 'low'
          ? 'text-[var(--text-muted)] bg-transparent border-[var(--card-border)] border-dashed'
          : TIER_COLOR[risk.tier])
      }
    >
      {risk.score}
    </span>
  )
}

const TIER_LABEL: Record<RiskTier, string> = {
  green: 'Risco baixo',
  yellow: 'Risco moderado',
  red: 'Risco alto',
}

export function RiskScoreCard({ vehicle }: { vehicle: VehicleHistorySummary }) {
  const risk = useMemo(() => computeVehicleRiskScore(vehicle), [vehicle])

  return (
    <div className="rounded-xl border border-[var(--card-border)]/70 bg-[var(--card-bg-solid)]/75 px-4 py-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] mb-2.5">
        Score de risco
      </p>
      <div className="flex items-center gap-3">
        <span className={'font-display text-3xl font-bold tabular-nums ' + (risk.confidence === 'low' ? 'text-[var(--text-muted)]' : TIER_COLOR[risk.tier].split(' ')[0])}>
          {risk.score}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-[var(--text-main)]">{TIER_LABEL[risk.tier]}</span>
          {risk.confidence === 'low' && (
            <span className="text-[10px] font-semibold text-[var(--text-muted)]">
              Nota preliminar — poucos dados de histórico
            </span>
          )}
        </div>
      </div>
      {risk.factors.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5 text-[11px]">
          {risk.factors.map((f, i) => (
            <li key={`${f.label}-${i}`} className="flex items-center justify-between gap-2 text-[var(--text-muted)]">
              <span className="truncate">{f.label}</span>
              <span className="font-bold tabular-nums text-[var(--text-main)] shrink-0">{f.points}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
