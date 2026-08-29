import type { FipePublicSummary, SavedReport } from '../../types'
import { normalizePlate } from '../reportComparison'
import { compareInspections } from './compareInspections'
import { savedReportToInspection } from './adapters'
import { tenantScopeKey } from './vehicleIdentity'
import { filterDamagesForPdf } from '../evidenceStatus'

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
  const userId = opts?.userId ?? 'local'
  const tenantId = opts?.tenantId ?? null
  const scope = tenantScopeKey(tenantId, userId)

  // Isolamento de posse (defesa em profundidade): quando um SavedReport carrega
  // userId/tenantId, descarta os que não pertencem ao escopo atual. Hoje os
  // reportes locais não carregam esses campos (bucket por dispositivo), então o
  // filtro é no-op — o isolamento entre contas no mesmo navegador é feito no
  // logout (useAuth.signOut → db.clearAllLocalData). Se o modelo ganhar
  // userId/tenantId no futuro, este filtro passa a proteger automaticamente.
  const scopeOwns = (r: SavedReport): boolean => {
    const rUser = (r as SavedReport & { userId?: string | null }).userId
    const rTenant = (r as SavedReport & { tenantId?: string | null }).tenantId
    if (rUser === undefined && rTenant === undefined) return true
    if (rTenant) return rTenant === tenantId
    if (rUser) return `user:${rUser}` === scope
    return true
  }

  const map = new Map<string, SavedReport[]>()

  for (const r of reports) {
    if (!scopeOwns(r)) continue
    const id = resolveReportVehicleId(r)
    if (!id) continue
    const list = map.get(id) ?? []
    list.push(r)
    map.set(id, list)
  }

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
      activeDamageCount: filterDamagesForPdf(last.damages).length,
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

/**
 * Conta quantas evidências fotográficas um laudo tem:
 * fotos de avarias + vistas com foto (viewPhotos é Record<ViewType, string> — cada
 * valor é a URL da foto daquela vista, não um array).
 * Usado por DashboardView e FleetHistoryDashboard para manter o cálculo consistente.
 */
export function countEvidencePhotos(report: SavedReport): number {
  const damagePhotos = report.damages.reduce(
    (acc, d) => acc + (d.photos?.length ?? 0),
    0,
  )
  const viewPhotos = report.vehicleInfo?.viewPhotos
  const viewCount = viewPhotos
    ? Object.values(viewPhotos).filter((v) => typeof v === 'string' && v.length > 0).length
    : 0
  return damagePhotos + viewCount
}
