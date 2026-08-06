import type { FipePublicSummary, SavedReport } from '../../types'
import { normalizePlate } from '../reportComparison'
import { compareInspections } from './compareInspections'
import { savedReportToInspection } from './adapters'
import { tenantScopeKey } from './vehicleIdentity'

export type VehicleHistorySummary = {
  /** vehicles.id ou chave sintética `local:{plate}` até backfill. */
  id: string
  plate: string
  brand: string
  color: string
  vehicleType?: string
  reports: SavedReport[]
  lastLocation?: string
  activeDamageCount: number
  newDamagesOnLast: number
  firstInspectedAt: number | null
  lastInspectedAt: number | null
  /** Resumo FIPE do último laudo com consulta (só campos públicos). */
  fipe?: FipePublicSummary
}

function syntheticVehicleId(plate: string): string {
  const p = normalizePlate(plate)
  return p.length >= 6 ? `local:${p}` : `local:unknown`
}

/** Resolve id de veículo a partir do laudo (FK ou placa). */
export function resolveReportVehicleId(report: SavedReport): string | null {
  if (report.vehicleId) return report.vehicleId
  const plate = normalizePlate(String(report.vehicleInfo.plate || ''))
  if (plate.length < 6) return null
  return syntheticVehicleId(plate)
}

/**
 * Agrupa laudos salvos por veículo.
 * Preferência: vehicleId; fallback: placa normalizada.
 */
export function groupReportsByVehicle(
  reports: SavedReport[],
  opts?: { tenantId?: string | null; userId?: string },
): VehicleHistorySummary[] {
  const map = new Map<string, SavedReport[]>()

  for (const r of reports) {
    const id = resolveReportVehicleId(r)
    if (!id) continue
    const list = map.get(id) ?? []
    list.push(r)
    map.set(id, list)
  }

  const userId = opts?.userId ?? 'local'
  const tenantId = opts?.tenantId ?? null
  const scope = tenantScopeKey(tenantId, userId)

  const summaries: VehicleHistorySummary[] = []

  for (const [id, list] of map) {
    const sorted = [...list].sort((a, b) => a.savedAt - b.savedAt)
    const last = sorted[sorted.length - 1]
    const prev = sorted.length >= 2 ? sorted[sorted.length - 2] : null
    const plate = normalizePlate(String(last.vehicleInfo.plate || ''))

    let newDamagesOnLast = 0
    if (prev && last) {
      try {
        const prevInsp = savedReportToInspection(prev, {
          vehicleId: id,
          tenantId,
          userId,
        })
        const currInsp = savedReportToInspection(last, {
          vehicleId: id,
          tenantId,
          userId,
        })
        // force same tenant scope already via adapter
        void scope
        newDamagesOnLast = compareInspections(prevInsp, currInsp).summary.newDamages
      } catch {
        newDamagesOnLast = 0
      }
    }

    const fipe =
      [...sorted].reverse().find((r) => r.vehicleInfo.fipe)?.vehicleInfo.fipe

    summaries.push({
      id,
      plate,
      brand: last.vehicleInfo.brand || '',
      color: last.vehicleInfo.color || '',
      vehicleType: last.vehicleType,
      reports: sorted,
      lastLocation: last.vehicleInfo.geo?.address,
      activeDamageCount: last.damages.length,
      newDamagesOnLast,
      firstInspectedAt: sorted[0]?.savedAt ?? null,
      lastInspectedAt: last.savedAt,
      ...(fipe ? { fipe } : {}),
    })
  }

  return summaries.sort((a, b) => a.plate.localeCompare(b.plate))
}

export function findVehicleSummary(
  reports: SavedReport[],
  vehicleId: string,
  opts?: { tenantId?: string | null; userId?: string },
): VehicleHistorySummary | null {
  return groupReportsByVehicle(reports, opts).find((v) => v.id === vehicleId) ?? null
}
