/**
 * Histórico de Vida do Veículo — agregações puras (sem I/O, testável).
 * Recebe os relatos (SavedReport) e produz: eixo mensal, fatos FIPE com mês
 * de referência, e KPIs de porcentagem para gráficos (gestão histórica).
 */

import type { SavedReport, InspectionStatus } from '../../types'
import type { VehicleHistorySummaryWithCloud } from './mergeRemoteVehicles'
import type { ProntuarioIntel } from './prontuarioIntel'

export type MonthPoint = {
  /** chave YYYY-MM */
  key: string
  /** rótulo curto pt-BR: "mai/25" */
  label: string
  inspections: number
  newDamages: number
  repairs: number
  evidence: number
  issued: number
  pending: number
  /** mês de referência FIPE mais recente visto neste mês (texto bruto), se houver */
  fipeRef?: string
}

export type LifeHistory = {
  months: MonthPoint[]
  /** totais para os gráficos de porcentagem */
  totalInspections: number
  totalEvidence: number
  totalIssued: number
  totalPending: number
  /** composição de status das inspeções (% dos relatos) */
  statusMix: { status: InspectionStatus; label: string; count: number; pct: number }[]
  /** danos novos vs reparados (do intel) */
  newDamages: number
  removedOrRepaired: number
  /** integridade 0-100 */
  integrityPct: number
  /** FIPE: valor + mês referência + marca/modelo, se houver */
  fipe: {
    valor?: string
    mesReferencia?: string
    textoMarca?: string
    textoModelo?: string
    anoModelo?: string
  } | null
  /** faixa de tempo legível para leigo */
  periodLabel: string
}

function monthKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const yy = String(y).slice(-2)
  return `${MONTHS_PT[m - 1]}/${yy}`
}

function statusLabel(s: InspectionStatus): string {
  switch (s) {
    case 'issued':
      return 'Emitido'
    case 'complete':
      return 'Concluído'
    case 'draft':
      return 'Rascunho'
    default:
      return 'Em andamento'
  }
}

/** Conta evidências (fotos) de um relato — mesmo critério do resto do app. */
function countEvidence(r: SavedReport): number {
  let n = 0
  for (const d of r.damages) n += d.photos?.length || 0
  n += r.vehicleInfo.interiorPhotos?.length || 0
  if (r.vehicleInfo.viewPhotos) {
    n += Object.values(r.vehicleInfo.viewPhotos).filter(Boolean).length
  }
  return n
}

export function buildLifeHistory(
  vehicle: VehicleHistorySummaryWithCloud,
  intel: ProntuarioIntel,
): LifeHistory {
  const reports = [...vehicle.reports].sort((a, b) => a.savedAt - b.savedAt)
  const map = new Map<string, MonthPoint>()

  const ensure = (key: string): MonthPoint => {
    let p = map.get(key)
    if (!p) {
      p = {
        key,
        label: monthLabel(key),
        inspections: 0,
        newDamages: 0,
        repairs: 0,
        evidence: 0,
        issued: 0,
        pending: 0,
      }
      map.set(key, p)
    }
    return p
  }

  for (const r of reports) {
    const p = ensure(monthKey(r.savedAt))
    p.inspections += 1
    p.evidence += countEvidence(r)
    if (r.status === 'issued') p.issued += 1
    if (r.syncedAt == null || r.syncedAt < r.savedAt) p.pending += 1
    const fipe = r.vehicleInfo.fipe?.mesReferencia?.trim()
    if (fipe) p.fipeRef = fipe
  }

  // Danos novos vs reparados atribuídos ao mês da última inspeção.
  if (reports.length >= 2) {
    const last = reports[reports.length - 1]
    const p = ensure(monthKey(last.savedAt))
    p.newDamages += intel.newDamages
    p.repairs += intel.removedOrRepaired
  }

  const months = [...map.values()].sort((a, b) => a.key.localeCompare(b.key))

  const totalInspections = reports.length
  const totalEvidence = months.reduce((s, m) => s + m.evidence, 0)
  const totalIssued = months.reduce((s, m) => s + m.issued, 0)
  const totalPending = months.reduce((s, m) => s + m.pending, 0)

  // Composição de status (sobre relatos locais).
  const statusOrder: InspectionStatus[] = ['issued', 'complete', 'draft']
  const statusCounts = new Map<InspectionStatus, number>()
  for (const r of reports) {
    const st: InspectionStatus = r.status ?? 'draft'
    statusCounts.set(st, (statusCounts.get(st) ?? 0) + 1)
  }
  const statusMix = statusOrder
    .map((status) => {
      const count = statusCounts.get(status) ?? 0
      return {
        status,
        label: statusLabel(status),
        count,
        pct: totalInspections ? Math.round((count / totalInspections) * 100) : 0,
      }
    })
    .filter((s) => s.count > 0)

  const fipeRaw = vehicle.fipe ?? reports[reports.length - 1]?.vehicleInfo.fipe
  const fipe = fipeRaw
    ? {
        valor: fipeRaw.valor?.trim() || undefined,
        mesReferencia: fipeRaw.mesReferencia?.trim() || undefined,
        textoMarca: fipeRaw.textoMarca?.trim() || undefined,
        textoModelo: fipeRaw.textoModelo?.trim() || undefined,
        anoModelo: fipeRaw.anoModelo?.trim() || undefined,
      }
    : null

  let periodLabel = 'Sem inspeções ainda'
  if (months.length === 1) {
    periodLabel = `Histórico de ${months[0].label}`
  } else if (months.length > 1) {
    periodLabel = `De ${months[0].label} a ${months[months.length - 1].label}`
  }

  return {
    months,
    totalInspections,
    totalEvidence,
    totalIssued,
    totalPending,
    statusMix,
    newDamages: intel.newDamages,
    removedOrRepaired: intel.removedOrRepaired,
    integrityPct: intel.integrityPct,
    fipe,
    periodLabel,
  }
}
