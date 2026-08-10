import type { SavedReport } from '../../types'
import { groupReportsByVehicle, countEvidencePhotos } from './groupReports'

export type FleetKpiStatus = 'green' | 'yellow' | 'red'

export interface FleetKpis {
  totalVehicles: number
  completeHistory: number
  histCompletePct: number
  newDamages: number
  compared: number
  damageRate: number
  evidencePct: number
  issued: number
  integrityPct: number
}

function pct(n: number, d: number): number {
  return d > 0 ? Math.round((n / d) * 100) : 0
}

/**
 * Calcula os 5 KPIs North Star de gestão de históricos a partir dos laudos
 * locais (offline-first). Lógica pura e testável, separada do componente visual.
 *
 * - Hist. completo: % veículos com ≥2 inspeções (entrada+saída comparáveis)
 * - Danos novos: Σ newDamagesOnLast / veículos comparados (leading risk)
 * - Cobertura evidências: % inspeções com alguma foto (dano ou vista)
 * - Dossiês emitidos: count status='issued'
 * - Integridade: % inspeções com issued_hash (selo de integridade)
 */
export function computeFleetKpis(saved: SavedReport[]): FleetKpis {
  const groups = groupReportsByVehicle(saved)
  const totalVehicles = groups.length

  // Veículos com ≥2 inspeções (entrada+saída comparáveis).
  const compared = groups.filter((g) => g.reports.length >= 2)
  const completeHistory = compared.length
  const newDamages = compared.reduce((a, g) => a + g.newDamagesOnLast, 0)

  let withPhoto = 0
  let withHash = 0
  let issued = 0
  for (const r of saved) {
    if (countEvidencePhotos(r) > 0) withPhoto++
    if (r.issuedHash && r.issuedHash.length > 0) withHash++
    if (r.status === 'issued') issued++
  }

  const histCompletePct = pct(completeHistory, totalVehicles)
  const evidencePct = pct(withPhoto, saved.length)
  const integrityPct = pct(withHash, saved.length)
  const damageRate = compared.length > 0 ? newDamages / compared.length : 0

  return {
    totalVehicles,
    completeHistory,
    histCompletePct,
    newDamages,
    compared: compared.length,
    damageRate,
    evidencePct,
    issued,
    integrityPct,
  }
}
