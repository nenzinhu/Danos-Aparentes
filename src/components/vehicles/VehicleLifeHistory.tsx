'use client'

import { useMemo } from 'react'
import type { VehicleHistorySummaryWithCloud } from '@/src/lib/vehicleEvidence'
import type { ProntuarioIntel } from '@/src/lib/vehicleEvidence/prontuarioIntel'
import { buildLifeHistory, type LifeHistory } from '@/src/lib/vehicleEvidence/lifeHistory'

/* ---------- primitivas de gráfico (SVG puro, acessível) ---------- */

function IntegrityRing({ pct }: { pct: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  const dash = (clamped / 100) * c
  const color =
    clamped >= 85 ? 'var(--success)' : clamped >= 60 ? 'var(--signal)' : 'var(--warn)'
  const label =
    clamped >= 85 ? 'Íntegro' : clamped >= 60 ? 'Monitorar' : 'Incompleto'
  return (
    <div className="relative flex h-24 w-24 items-center justify-center" role="img" aria-label={`Integridade do histórico ${clamped}% — ${label}`}>
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--card-border)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold tabular-nums text-[var(--text-main)]">{clamped}%</span>
        <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      </div>
    </div>
  )
}

function DonutMix({
  segments,
}: {
  segments: { label: string; pct: number; color: string }[]
}) {
  const size = 96
  const r = 30
  const c = 2 * Math.PI * r
  let offset = 0
  const arcs = segments.map((s) => {
    const len = (s.pct / 100) * c
    const arc = {
      ...s,
      dash: `${len} ${c - len}`,
      off: -offset,
    }
    offset += len
    return arc
  })
  const desc = segments.map((s) => `${s.label} ${s.pct}%`).join(', ')
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-24 w-24 items-center justify-center" role="img" aria-label={`Composição por status: ${desc}`}>
        <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--card-border)" strokeWidth="10" />
          {arcs.map((a) => (
            <circle
              key={a.label}
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth="10"
              strokeDasharray={a.dash}
              strokeDashoffset={a.off}
            />
          ))}
        </svg>
      </div>
      <ul className="flex flex-col gap-1 text-xs">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-[var(--text-muted)]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
            <span className="font-semibold text-[var(--text-main)] tabular-nums">{s.pct}%</span>
            <span>{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BarCompare({
  newDamages,
  repairs,
}: {
  newDamages: number
  repairs: number
}) {
  const total = newDamages + repairs
  const newPct = total ? Math.round((newDamages / total) * 100) : 0
  const repPct = total ? 100 - newPct : 0
  const desc =
    total === 0
      ? 'Sem alteração de danos entre inspeções'
      : `${newPct}% danos novos, ${repPct}% reparados`
  return (
    <div
      className="rounded-xl border border-[var(--card-border)]/60 bg-[var(--card-bg-solid)]/70 px-3 py-3"
      role="img"
      aria-label={`Danos: ${desc}`}
    >
      <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        <span>Novos</span>
        <span>Reparados</span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-[var(--card-border)]">
        <div
          className="bg-[var(--warn)] transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${newPct}%` }}
        />
        <div
          className="bg-[var(--success)] transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${repPct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold tabular-nums">
        <span className="text-[var(--warn)]">{newDamages} novo{newDamages === 1 ? '' : 's'}</span>
        <span className="text-[var(--success)]">{repairs} reparado{repairs === 1 ? '' : 's'}</span>
      </div>
    </div>
  )
}

/* ---------- seção principal ---------- */

export default function VehicleLifeHistory({
  vehicle,
  intel,
}: {
  vehicle: VehicleHistorySummaryWithCloud
  intel: ProntuarioIntel
}) {
  const life = useMemo(() => buildLifeHistory(vehicle, intel), [vehicle, intel])

  const statusColors: Record<string, string> = {
    Emitido: 'var(--success)',
    Concluído: 'var(--signal)',
    Rascunho: 'var(--warn)',
  }

  const hasData = life.totalInspections > 0

  return (
    <section
      className="rounded-2xl border border-[var(--card-border)]/70 bg-[var(--card-bg-solid)]/85 p-4 sm:p-5"
      aria-labelledby="life-history-heading"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono-data text-[11px] tracking-[0.2em] uppercase text-[var(--signal-bright)] mb-1">
            Linha do tempo da vida do veículo
          </p>
          <h2 id="life-history-heading" className="font-display text-xl sm:text-2xl font-bold tracking-tight">
            Histórico de Vida
          </h2>
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">{life.periodLabel}</p>
      </div>

      {!hasData ? (
        <p className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--panel-bg)]/40 px-4 py-6 text-center text-sm text-[var(--text-muted)]">
          Ainda não há inspeções para este veículo. A primeira vistoria aparece aqui como o
          início da linha do tempo.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Faixa 1: gráficos de gestão (anéis + barras) */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[var(--card-border)]/60 bg-[var(--card-bg-solid)]/70 px-3 py-3 flex items-center gap-3">
              <IntegrityRing pct={life.integrityPct} />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Confiança do prontuário
                </p>
                <p className="text-sm text-[var(--text-main)]/90 leading-snug">
                  Quanto maior, mais completa e à prova a documentação deste veículo.
                </p>
              </div>
            </div>

            {life.statusMix.length > 0 && (
              <div className="rounded-xl border border-[var(--card-border)]/60 bg-[var(--card-bg-solid)]/70 px-3 py-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Status das inspeções
                </p>
                <DonutMix
                  segments={life.statusMix.map((s) => ({
                    label: s.label,
                    pct: s.pct,
                    color: statusColors[s.label] ?? 'var(--signal)',
                  }))}
                />
              </div>
            )}

            <div className="rounded-xl border border-[var(--card-border)]/60 bg-[var(--card-bg-solid)]/70 px-3 py-3 flex flex-col justify-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Danos novos vs reparados
              </p>
              <BarCompare newDamages={life.newDamages} repairs={life.removedOrRepaired} />
            </div>
          </div>

          {/* Faixa 2: eixo mensal (timeline horizontal) + FIPE mês referência */}
          <div className="rounded-xl border border-[var(--card-border)]/60 bg-[var(--card-bg-solid)]/70 px-3 py-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Por mês — o que aconteceu com o veículo
              </p>
              {life.fipe?.mesReferencia ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--success-border)] bg-[var(--success-bg)] px-2 py-1 text-[11px] font-semibold text-[var(--success)]">
                  <span aria-hidden>FIPE</span>
                  {life.fipe.valor ? <strong>{life.fipe.valor}</strong> : null}
                  <span className="opacity-80">· ref. {life.fipe.mesReferencia}</span>
                </span>
              ) : null}
            </div>

            {life.months.length === 1 ? (
              <SingleMonthSummary life={life} />
            ) : (
              <MonthAxis life={life} />
            )}
          </div>

          {/* Faixa 3: resumo em linguagem de leigo */}
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            <strong className="text-[var(--text-main)]">Em linguagem simples:</strong>{' '}
            {life.totalInspections} inspeção{life.totalInspections === 1 ? '' : 'ões'} registrada
            {life.totalInspections === 1 ? '' : 's'}, com {life.totalEvidence} foto
            {life.totalEvidence === 1 ? '' : 's'} de evidência.{' '}
            {life.newDamages > 0
              ? `Apareceu${life.newDamages === 1 ? '' : 'm'} ${life.newDamages} dano${life.newDamages === 1 ? '' : 's'} novo${life.newDamages === 1 ? '' : 's'} desde a inspeção anterior. `
              : 'Nenhum dano novo desde a inspeção anterior. '}
            {life.removedOrRepaired > 0
              ? `${life.removedOrRepaired} dano${life.removedOrRepaired === 1 ? '' : 's'} foi${life.removedOrRepaired === 1 ? '' : 'ram'} reparado${life.removedOrRepaired === 1 ? '' : 's'}. `
              : ''}
            O histórico está {life.integrityPct >= 85 ? 'completo' : life.integrityPct >= 60 ? 'razoável, mas atenção' : 'incompleto'} ({life.integrityPct}% de confiança).
          </p>
        </div>
      )}
    </section>
  )
}

function SingleMonthSummary({ life }: { life: LifeHistory }) {
  const m = life.months[0]
  return (
    <p className="text-sm text-[var(--text-main)]/90">
      Em <strong>{m.label}</strong>: {m.inspections} inspeção{m.inspections === 1 ? '' : 'ões'},{' '}
      {m.evidence} evidência{m.evidence === 1 ? '' : 's'}
      {m.issued > 0 ? `, ${m.issued} emitida${m.issued === 1 ? '' : 's'}` : ''}
      {m.newDamages > 0 ? `, ${m.newDamages} dano${m.newDamages === 1 ? '' : 's'} novo${m.newDamages === 1 ? '' : 's'}` : ''}
      {m.repairs > 0 ? `, ${m.repairs} reparado${m.repairs === 1 ? '' : 's'}` : ''}.
    </p>
  )
}

function MonthAxis({ life }: { life: LifeHistory }) {
  const maxEvidence = Math.max(1, ...life.months.map((m) => m.evidence))
  return (
    <ol className="flex flex-col gap-2.5" role="list">
      {life.months.map((m) => {
        const evPct = Math.round((m.evidence / maxEvidence) * 100)
        return (
          <li key={m.key} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-[11px] font-bold uppercase tracking-wide text-[var(--signal-bright)]">
              {m.label}
            </span>
            <div className="flex-1">
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--card-border)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--signal)] to-[var(--signal-bright)] transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${evPct}%` }}
                />
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-2 text-[11px] tabular-nums text-[var(--text-muted)]">
              <span title="Inspeções">{m.inspections} insp.</span>
              <span title="Evidências">{m.evidence} ev.</span>
              {m.newDamages > 0 ? (
                <span className="text-[var(--warn)]" title="Danos novos">
                  +{m.newDamages}
                </span>
              ) : null}
              {m.repairs > 0 ? (
                <span className="text-[var(--success)]" title="Reparados">
                  -{m.repairs}
                </span>
              ) : null}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
