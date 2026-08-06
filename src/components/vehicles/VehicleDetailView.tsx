'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  computeProntuarioIntel,
  hydrateVehicleReportsLocally,
  type VehicleHistorySummaryWithCloud,
} from '@/src/lib/vehicleEvidence'
import { appendAuditEvent } from '@/src/lib/audit/auditLog'
import { VehicleIconSvg } from '@/src/components/VehicleSelector'
import VehicleHistoryTimeline from './VehicleHistoryTimeline'

type RemoteInspection = {
  id: string
  plate?: string | null
  status?: string | null
  public_code?: string | null
  updated_at?: string | null
  issued_at?: string | null
}

const metricToneClass: Record<string, string> = {
  default: 'text-[var(--text-main)]',
  signal: 'text-[var(--signal-bright)]',
  warn: 'text-amber-300',
  ok: 'text-emerald-300',
}

const statusDot: Record<string, string> = {
  ok: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]',
  warn: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.45)]',
  info: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.45)]',
}

export default function VehicleDetailView({
  vehicle,
  accessToken,
  userId,
  onHydrated,
}: {
  vehicle: VehicleHistorySummaryWithCloud
  accessToken?: string
  userId: string
  onHydrated?: () => void | Promise<void>
}) {
  const [qrBusy, setQrBusy] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const [remoteInspections, setRemoteInspections] = useState<RemoteInspection[]>([])
  const [hydrateBusy, setHydrateBusy] = useState(false)
  const [hydrateMsg, setHydrateMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || vehicle.id.startsWith('local:')) {
      setRemoteInspections([])
      return
    }
    let cancelled = false
    void fetch(`/api/vehicles/${encodeURIComponent(vehicle.id)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { inspections?: RemoteInspection[] } | null) => {
        if (!cancelled && data?.inspections) setRemoteInspections(data.inspections)
      })
      .catch(() => {
        if (!cancelled) setRemoteInspections([])
      })
    return () => {
      cancelled = true
    }
  }, [accessToken, vehicle.id])

  const localIds = new Set(vehicle.reports.map((r) => r.id))
  const cloudOnlyInspections = remoteInspections.filter((i) => !localIds.has(i.id))
  const needsHydrate =
    vehicle.cloudOnly || cloudOnlyInspections.length > 0 || vehicle.reports.length === 0

  const fipe =
    vehicle.fipe ??
    [...vehicle.reports].reverse().find((r) => r.vehicleInfo.fipe)?.vehicleInfo.fipe

  const intel = useMemo(
    () =>
      computeProntuarioIntel(vehicle, {
        cloudPendingCount: cloudOnlyInspections.length,
      }),
    [vehicle, cloudOnlyInspections.length],
  )

  const displayName = intel.modelLabel || 'Veículo sem descrição'

  async function handleHydrate() {
    setHydrateBusy(true)
    setHydrateMsg(null)
    try {
      const result = await hydrateVehicleReportsLocally(userId, vehicle.id, accessToken)
      setHydrateMsg(
        result.written > 0
          ? `Histórico atualizado: ${result.written} inspeção(ões) baixada(s) neste dispositivo.`
          : result.pulled === 0
            ? 'Nenhuma inspeção na nuvem para este veículo.'
            : 'Memória digital já estava preservada neste dispositivo.',
      )
      void appendAuditEvent({
        event_type: 'inspection_linked_to_vehicle',
        metadata: {
          kind: 'hydrate_vehicle_reports',
          vehicle_id: vehicle.id,
          pulled: result.pulled,
          written: result.written,
        },
      })
      await onHydrated?.()
    } catch (e) {
      setHydrateMsg(e instanceof Error ? e.message : 'Falha ao sincronizar o histórico')
    } finally {
      setHydrateBusy(false)
    }
  }

  async function handleVehicleQr() {
    if (!accessToken) {
      setQrError('Faça login para gerar o QR do veículo.')
      return
    }
    setQrBusy(true)
    setQrError(null)
    try {
      const res = await fetch('/api/vehicle-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          plate: vehicle.plate,
          vehicleId: vehicle.id.startsWith('local:') ? undefined : vehicle.id,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Falha ao gerar QR')
      }
      const url = `${window.location.origin}/historico/${data.token}`
      setQrUrl(url)
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        /* ignore */
      }
      void appendAuditEvent({
        event_type: 'comparison_exported',
        metadata: {
          kind: 'vehicle_qr',
          vehicle_id: vehicle.id,
          plate: vehicle.plate,
        },
      })
    } catch (e) {
      setQrError(e instanceof Error ? e.message : 'Erro ao gerar QR')
    } finally {
      setQrBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Cabeçalho + 2. Painel executivo */}
      <header className="relative overflow-hidden rounded-2xl border border-[var(--card-border)]/70 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--signal)_10%,transparent)_0%,var(--card-bg-solid)_45%,transparent_100%)] px-5 py-6 sm:px-7 sm:py-8 transition-[box-shadow] duration-200 hover:shadow-[0_0_40px_-12px_rgba(56,189,248,0.18)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:28px_28px]"
        />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-5 lg:items-start">
            {/* Identidade visual do veículo */}
            <div className="flex gap-4 min-w-0 flex-1">
              <div className="relative shrink-0 flex h-[4.5rem] w-[4.5rem] sm:h-24 sm:w-24 items-center justify-center rounded-2xl border border-[var(--card-border)]/80 bg-[var(--card-bg-solid)]/80 shadow-inner shadow-black/20 ring-1 ring-sky-500/15">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-sky-400/10 blur-md opacity-70"
                />
                <VehicleIconSvg type={intel.vehicleType} size={52} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Histórico Digital Ativo
                  </span>
                  <span className="inline-flex rounded-full border border-[var(--card-border)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {intel.historyStatusLabel}
                  </span>
                  {vehicle.lastLocation && (
                    <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[14rem]">
                      {vehicle.lastLocation}
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)] [text-wrap:balance]">
                  {displayName}
                </h1>
                <p className="mt-1.5 font-mono-data text-lg sm:text-xl tracking-[0.12em] text-[var(--signal-bright)]">
                  {intel.plate || '—'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  {intel.color && (
                    <span className="rounded-lg border border-[var(--card-border)]/70 bg-[var(--panel-bg)]/60 px-2.5 py-1 text-[var(--text-muted)]">
                      Cor <strong className="text-[var(--text-main)] ml-1">{intel.color}</strong>
                    </span>
                  )}
                  {intel.year && (
                    <span className="rounded-lg border border-[var(--card-border)]/70 bg-[var(--panel-bg)]/60 px-2.5 py-1 text-[var(--text-muted)]">
                      Ano <strong className="text-[var(--text-main)] ml-1">{intel.year}</strong>
                    </span>
                  )}
                  <span className="rounded-lg border border-[var(--card-border)]/70 bg-[var(--panel-bg)]/60 px-2.5 py-1 text-[var(--text-muted)]">
                    Danos ativos{' '}
                    <strong className="text-[var(--text-main)] ml-1">{intel.activeDamages}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Estado atual */}
            <div className="w-full lg:max-w-sm rounded-xl border border-[var(--card-border)]/70 bg-[var(--card-bg-solid)]/75 px-4 py-3.5 transition-colors duration-200 hover:border-sky-500/25">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] mb-2.5">
                Estado atual do veículo
              </p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {intel.statusLines.map((line) => (
                  <li key={line.text} className="flex items-start gap-2.5 text-sm text-[var(--text-main)]/90">
                    <span
                      aria-hidden
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${statusDot[line.tone]}`}
                    />
                    <span className="leading-snug">{line.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Métricas executivas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
            {intel.executiveMetrics.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-[var(--card-border)]/60 bg-[var(--card-bg-solid)]/70 px-2.5 py-2.5 transition-[transform,border-color,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5 hover:border-sky-500/30 hover:shadow-[0_0_20px_-8px_rgba(56,189,248,0.25)]"
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] leading-tight mb-1">
                  {m.label}
                </p>
                <p
                  className={`text-sm sm:text-base font-bold tabular-nums tracking-tight leading-tight ${metricToneClass[m.tone || 'default']}`}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* FIPE painel informativo */}
          {fipe && (
            <div className="rounded-xl border border-[var(--card-border)]/70 bg-[linear-gradient(120deg,color-mix(in_srgb,var(--signal)_8%,transparent),transparent_55%)] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--signal-bright)]">
                  Referência FIPE
                </p>
                {fipe.valor && (
                  <p className="font-display text-xl font-bold tracking-tight text-[var(--text-main)]">
                    {fipe.valor}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Marca', value: fipe.textoMarca },
                  { label: 'Modelo', value: fipe.textoModelo },
                  { label: 'Ano', value: fipe.anoModelo },
                  { label: 'Combustível', value: fipe.combustivel || '—' },
                  { label: 'FIPE', value: fipe.valor },
                  { label: 'Mês referência', value: fipe.mesReferencia },
                ]
                  .filter((c) => c.value)
                  .map((cell) => (
                    <div key={cell.label} className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                        {cell.label}
                      </p>
                      <p className="text-sm font-semibold text-[var(--text-main)] leading-snug truncate" title={cell.value}>
                        {cell.value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Prontuário digital inteligente — inspeções, evidências, comparações e eventos em uma
            linha do tempo auditável.
          </p>
        </div>
      </header>

      {/* 3. Ações */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/app"
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-sky-500/15 transition-[transform,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5"
          style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
        >
          Nova inspeção
        </Link>
        <Link
          href={`/app/vehicles/${encodeURIComponent(vehicle.id)}/compare`}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--card-bg-solid)] border border-[var(--card-border)] text-[var(--text-main)] hover:border-sky-500/40 transition-colors duration-200"
        >
          Comparar inspeções
        </Link>
        <button
          type="button"
          disabled={hydrateBusy}
          onClick={() => {
            void handleHydrate()
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 disabled:opacity-50 transition-colors duration-200"
          title="Baixa dossiês completos da nuvem para este dispositivo"
        >
          {hydrateBusy ? 'Sincronizando…' : 'Sincronizar histórico'}
        </button>
        <button
          type="button"
          disabled={qrBusy}
          onClick={() => {
            void handleVehicleQr()
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[var(--card-border)] hover:border-sky-500/40 disabled:opacity-50 transition-colors duration-200"
        >
          {qrBusy ? 'Gerando QR…' : 'QR do veículo'}
        </button>
        <Link
          href="/app/vehicles"
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors duration-200"
        >
          ← Todos os veículos
        </Link>
      </div>

      {needsHydrate && (
        <p className="text-xs text-sky-300/90 border border-sky-500/25 rounded-xl px-3 py-2.5 bg-sky-500/10">
          Há registros na nuvem incompletos neste dispositivo. Use{' '}
          <strong>Sincronizar histórico</strong> para carregar evidências e comparar.
        </p>
      )}

      {hydrateMsg && (
        <p className="text-xs text-sky-300 border border-sky-500/25 rounded-xl px-3 py-2 bg-sky-500/10">
          {hydrateMsg}
        </p>
      )}

      {qrError && (
        <p className="text-xs text-amber-300 border border-amber-500/30 rounded-xl px-3 py-2 bg-amber-500/10">
          {qrError}
        </p>
      )}
      {qrUrl && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-3 text-xs break-all">
          <p className="font-bold text-[var(--text-muted)] mb-1">Link público do prontuário:</p>
          <a href={qrUrl} className="text-sky-400 hover:underline" target="_blank" rel="noreferrer">
            {qrUrl}
          </a>
          <p className="text-[var(--text-muted)] mt-2">
            Exibe laudos emitidos do seu escopo — sem dados pessoais sensíveis.
          </p>
        </div>
      )}

      {/* 4–7. Indicadores, resumo e linha do tempo */}
      <VehicleHistoryTimeline
        vehicle={vehicle}
        cloudOnlyInspections={cloudOnlyInspections}
        intel={intel}
        onSyncRequest={() => {
          void handleHydrate()
        }}
      />
    </div>
  )
}
