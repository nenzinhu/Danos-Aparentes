'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  hydrateVehicleReportsLocally,
  type VehicleHistorySummaryWithCloud,
} from '@/src/lib/vehicleEvidence'
import { appendAuditEvent } from '@/src/lib/audit/auditLog'
import VehicleHistoryTimeline from './VehicleHistoryTimeline'

type RemoteInspection = {
  id: string
  plate?: string | null
  status?: string | null
  public_code?: string | null
  updated_at?: string | null
  issued_at?: string | null
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

  const titleParts = [vehicle.brand, vehicle.color].filter(Boolean)
  const displayName = titleParts.length > 0 ? titleParts.join(' · ') : 'Veículo sem descrição'
  const fipe =
    vehicle.fipe ??
    [...vehicle.reports].reverse().find((r) => r.vehicleInfo.fipe)?.vehicleInfo.fipe

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
      {/* Hero — prontuário */}
      <header className="relative overflow-hidden rounded-2xl border border-[var(--card-border)]/70 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--signal)_10%,transparent)_0%,var(--card-bg-solid)_45%,transparent_100%)] px-5 py-6 sm:px-7 sm:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:28px_28px]"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Histórico Digital Ativo
            </span>
            {vehicle.lastLocation && (
              <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[16rem]">
                {vehicle.lastLocation}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)]">
            {displayName}
          </h1>
          <p className="mt-2 font-mono-data text-lg sm:text-xl tracking-[0.12em] text-[var(--signal-bright)]">
            {vehicle.plate || '—'}
          </p>
          {fipe && (
            <div className="mt-4 max-w-xl rounded-xl border border-[var(--card-border)]/80 bg-[var(--card-bg-solid)]/70 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] mb-2">
                Referência FIPE
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {(fipe.textoMarca || fipe.textoModelo) && (
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Marca / modelo</dt>
                    <dd className="text-[var(--text-main)] font-medium leading-snug">
                      {[fipe.textoMarca, fipe.textoModelo].filter(Boolean).join(' · ')}
                    </dd>
                  </div>
                )}
                {fipe.anoModelo && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Ano modelo</dt>
                    <dd className="text-[var(--text-main)] font-medium">{fipe.anoModelo}</dd>
                  </div>
                )}
                {fipe.valor && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Valor</dt>
                    <dd className="text-[var(--text-main)] font-medium">{fipe.valor}</dd>
                  </div>
                )}
                {fipe.mesReferencia && (
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Mês referência</dt>
                    <dd className="text-[var(--text-main)] font-medium">{fipe.mesReferencia}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
          <p className="mt-3 text-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
            Prontuário digital do veículo — inspeções, evidências, comparações e eventos em uma
            linha do tempo auditável.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/app"
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-sky-500/15"
          style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
        >
          Nova inspeção
        </Link>
        <Link
          href={`/app/vehicles/${encodeURIComponent(vehicle.id)}/compare`}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--card-bg-solid)] border border-[var(--card-border)] text-[var(--text-main)] hover:border-sky-500/40 transition-colors"
        >
          Comparar inspeções
        </Link>
        <button
          type="button"
          disabled={hydrateBusy}
          onClick={() => {
            void handleHydrate()
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 disabled:opacity-50"
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
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[var(--card-border)] hover:border-sky-500/40 disabled:opacity-50"
        >
          {qrBusy ? 'Gerando QR…' : 'QR do veículo'}
        </button>
        <Link
          href="/app/vehicles"
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
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

      <VehicleHistoryTimeline
        vehicle={vehicle}
        cloudOnlyInspections={cloudOnlyInspections}
        onSyncRequest={() => {
          void handleHydrate()
        }}
      />
    </div>
  )
}
