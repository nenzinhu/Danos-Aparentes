'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  hydrateVehicleReportsLocally,
  type VehicleHistorySummaryWithCloud,
} from '@/src/lib/vehicleEvidence'
import { appendAuditEvent } from '@/src/lib/audit/auditLog'
import VehicleAuditTimeline from './VehicleAuditTimeline'

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR')
}

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
  const last = vehicle.reports[vehicle.reports.length - 1]
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

  async function handleHydrate() {
    setHydrateBusy(true)
    setHydrateMsg(null)
    try {
      const result = await hydrateVehicleReportsLocally(userId, vehicle.id, accessToken)
      setHydrateMsg(
        result.written > 0
          ? `${result.written} inspeção(ões) baixada(s) para este dispositivo.`
          : result.pulled === 0
            ? 'Nenhuma inspeção na nuvem para este veículo.'
            : 'Histórico local já está atualizado.',
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
      } catch { /* ignore */ }
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
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Veículo</p>
        <h1 className="font-display text-3xl font-bold tracking-wide mt-1">{vehicle.plate}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {[vehicle.brand, vehicle.color].filter(Boolean).join(' · ') || 'Sem descrição'}
          {vehicle.lastLocation ? ` · ${vehicle.lastLocation}` : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Inspeções" value={String(vehicle.reports.length)} />
        <Stat label="Danos ativos (última)" value={String(vehicle.activeDamageCount)} />
        <Stat label="Novos na última" value={String(vehicle.newDamagesOnLast)} />
        <Stat
          label="Primeira inspeção"
          value={
            vehicle.firstInspectedAt
              ? new Date(vehicle.firstInspectedAt).toLocaleDateString('pt-BR')
              : '—'
          }
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/app"
          className="px-4 py-2.5 rounded-lg text-xs font-bold bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 transition-colors"
        >
          Nova Inspeção
        </Link>
        <Link
          href={`/app/vehicles/${encodeURIComponent(vehicle.id)}/compare`}
          className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[var(--card-bg-solid)] border border-[var(--card-border)] text-[var(--text-main)] hover:border-sky-500/40 transition-colors"
        >
          Comparar inspeções
        </Link>
        <button
          type="button"
          disabled={hydrateBusy}
          onClick={() => { void handleHydrate() }}
          className="px-4 py-2.5 rounded-lg text-xs font-bold border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 disabled:opacity-50"
          title="Baixa dossiês completos da nuvem para este dispositivo"
        >
          {hydrateBusy ? 'Sincronizando…' : 'Sincronizar histórico'}
        </button>
        <button
          type="button"
          disabled={qrBusy}
          onClick={() => { void handleVehicleQr() }}
          className="px-4 py-2.5 rounded-lg text-xs font-bold border border-[var(--card-border)] hover:border-sky-500/40 disabled:opacity-50"
        >
          {qrBusy ? 'Gerando QR…' : 'QR do veículo'}
        </button>
        <Link
          href="/app/vehicles"
          className="px-4 py-2.5 rounded-lg text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        >
          ← Todos os veículos
        </Link>
      </div>

      {hydrateMsg && (
        <p className="text-xs text-sky-300 border border-sky-500/25 rounded-lg px-3 py-2 bg-sky-500/10">
          {hydrateMsg}
        </p>
      )}

      {qrError && (
        <p className="text-xs text-amber-300 border border-amber-500/30 rounded-lg px-3 py-2 bg-amber-500/10">
          {qrError}
        </p>
      )}
      {qrUrl && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-3 text-xs break-all">
          <p className="font-bold text-[var(--text-muted)] mb-1">Link público (copiado se permitido):</p>
          <a href={qrUrl} className="text-sky-400 hover:underline" target="_blank" rel="noreferrer">
            {qrUrl}
          </a>
          <p className="text-[var(--text-muted)] mt-2">
            Exibe só laudos emitidos do seu escopo — sem CPF nem dados pessoais.
          </p>
        </div>
      )}

      <section>
        <h2 className="font-display text-xl font-bold mb-3">Linha do Tempo</h2>
        {needsHydrate && (
          <p className="text-xs text-sky-300/90 mb-3 border border-sky-500/25 rounded-lg px-3 py-2 bg-sky-500/10">
            Há inspeções na nuvem incompletas neste dispositivo. Use{' '}
            <strong>Sincronizar histórico</strong> para baixar danos e evidências e poder comparar.
          </p>
        )}
        <div className="relative flex flex-col gap-0 border-l border-[var(--card-border)] ml-2 pl-4">
          {vehicle.reports.map((r) => (
            <div key={r.id} className="relative py-3">
              <span className="absolute -left-[1.35rem] top-4 w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-[var(--bg-main)]" />
              <time className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                {formatDateTime(r.savedAt)}
              </time>
              <p className="text-sm font-bold mt-0.5">
                Inspeção {r.publicCode || r.id.slice(0, 8)}
                {r.status ? (
                  <span className="ml-2 text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    {r.status}
                  </span>
                ) : null}
                {r.syncedAt == null || r.syncedAt < r.savedAt ? (
                  <span className="ml-2 text-[10px] font-bold uppercase text-amber-400">
                    pendente sync
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {r.damages.length === 0
                  ? 'Sem danos registrados'
                  : `${r.damages.length} dano(s) identificado(s)`}
                {r.vehicleInfo.geo?.address ? ` · ${r.vehicleInfo.geo.address}` : ''}
              </p>
            </div>
          ))}
          {cloudOnlyInspections.map((r) => (
            <div key={`cloud-${r.id}`} className="relative py-3">
              <span className="absolute -left-[1.35rem] top-4 w-2.5 h-2.5 rounded-full bg-violet-400 ring-4 ring-[var(--bg-main)]" />
              <time className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                {r.updated_at ? formatDateTime(Date.parse(r.updated_at)) : '—'}
              </time>
              <p className="text-sm font-bold mt-0.5">
                Inspeção {r.public_code || r.id.slice(0, 8)}
                <span className="ml-2 text-[10px] font-bold uppercase text-violet-300">nuvem</span>
                {r.status ? (
                  <span className="ml-2 text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    {r.status}
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Metadados remotos — danos completos após sync no dispositivo.
              </p>
            </div>
          ))}
          {vehicle.reports.length === 0 && cloudOnlyInspections.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] py-3">Nenhuma inspeção listada ainda.</p>
          )}
          {last && vehicle.newDamagesOnLast > 0 && (
            <div className="relative py-3">
              <span className="absolute -left-[1.35rem] top-4 w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-[var(--bg-main)]" />
              <p className="text-sm font-bold text-amber-300">
                {vehicle.newDamagesOnLast} novo(s) dano(s) na última inspeção
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Detectado por comparação estrutural — revisar na tela de comparação.
              </p>
            </div>
          )}
        </div>
      </section>

      <VehicleAuditTimeline
        vehicleId={vehicle.id}
        inspectionIds={vehicle.reports.map((r) => r.id)}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-3">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] mt-0.5">{label}</p>
    </div>
  )
}
