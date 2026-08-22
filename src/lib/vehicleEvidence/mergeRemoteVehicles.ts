/**
 * FASE 17 — mescla veículos remotos (API) com o histórico local.
 * Offline-first: laudos locais sempre ganham; remoto só preenche buracos.
 */

import { normalizePlate } from '../reportComparison'
import type { VehicleHistorySummary } from './groupReports'

export type RemoteVehicleRow = {
  id: string
  plate: string
  brand?: string | null
  model?: string | null
  color?: string | null
  vehicle_type?: string | null
  updated_at?: string | null
  created_at?: string | null
}

export type VehicleHistorySummaryWithCloud = VehicleHistorySummary & {
  /** Presente só na nuvem (ainda sem laudos no IndexedDB). */
  cloudOnly?: boolean
}

function ts(iso?: string | null): number | null {
  if (!iso) return null
  const n = Date.parse(iso)
  return Number.isFinite(n) ? n : null
}

/**
 * Une listas: local por vehicleId/placa; adiciona stubs cloud-only.
 * Não troca o id de um grupo local sintético (`local:PLATE`) pelo UUID remoto —
 * o backfill/sync já unifica laudos quando possível.
 */
export function mergeRemoteVehiclesIntoSummaries(
  local: VehicleHistorySummary[],
  remote: RemoteVehicleRow[],
): VehicleHistorySummaryWithCloud[] {
  const byId = new Map<string, VehicleHistorySummaryWithCloud>()
  const platesCovered = new Set<string>()

  for (const v of local) {
    byId.set(v.id, { ...v, cloudOnly: false })
    const p = normalizePlate(v.plate)
    if (p) platesCovered.add(p)
  }

  for (const r of remote) {
    if (!r?.id) continue
    const plate = normalizePlate(String(r.plate || ''))
    if (byId.has(r.id)) {
      const existing = byId.get(r.id)!
      byId.set(r.id, {
        ...existing,
        brand: existing.brand || String(r.brand || ''),
        color: existing.color || String(r.color || ''),
        vehicleType: existing.vehicleType || r.vehicle_type || undefined,
        cloudOnly: existing.reports.length === 0,
      })
      if (plate) platesCovered.add(plate)
      continue
    }
    if (plate && platesCovered.has(plate)) {
      // Já há grupo local (ex.: local:ABC1D23) — não duplicar na lista.
      continue
    }
    byId.set(r.id, {
      id: r.id,
      plate,
      brand: String(r.brand || ''),
      color: String(r.color || ''),
      vehicleType: r.vehicle_type || undefined,
      reports: [],
      activeDamageCount: 0,
      newDamagesOnLast: 0,
      firstInspectedAt: ts(r.created_at),
      lastInspectedAt: ts(r.updated_at),
      cloudOnly: true,
    })
    if (plate) platesCovered.add(plate)
  }

  return [...byId.values()].sort((a, b) => a.plate.localeCompare(b.plate))
}
