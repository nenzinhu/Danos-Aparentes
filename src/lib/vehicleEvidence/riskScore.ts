import type { SavedReport } from '../../types'
import { filterDamagesForPdf } from '../evidenceStatus'
import { compareInspections } from './compareInspections'
import { partLocationKey } from './damageIdentity'
import { savedReportToInspection } from './adapters'
import type { VehicleHistorySummary } from './groupReports'
import { countEvidencePhotos } from './groupReports'
import type { Severity } from './types'

export type RiskTier = 'green' | 'yellow' | 'red'
export type RiskConfidence = 'low' | 'high'

export interface RiskFactor {
  label: string
  points: number
}

export interface VehicleRiskScore {
  score: number
  tier: RiskTier
  confidence: RiskConfidence
  factors: RiskFactor[]
}

const SEVERITY_PENALTY: Record<Severity, number> = { low: -3, medium: -6, high: -12 }
const SEVERITY_LABEL: Record<Severity, string> = { low: 'leve', medium: 'moderada', high: 'grave' }

const SEVERITY_PENALTY_CAP = -50
const RECURRENCE_PENALTY = -10
const RECURRENCE_PENALTY_CAP = -30
const VELOCITY_PENALTY = -8
const VELOCITY_THRESHOLD_PER_DAY = 0.5
const MIN_REPORTS_FOR_HISTORY = 2
const LOW_EVIDENCE_COVERAGE_THRESHOLD = 0.5

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function tierFor(score: number): RiskTier {
  if (score >= 75) return 'green'
  if (score >= 40) return 'yellow'
  return 'red'
}

function severityFactors(lastReport: SavedReport): RiskFactor[] {
  const active = filterDamagesForPdf(lastReport.damages)
  let total = 0
  const factors: RiskFactor[] = []
  for (const d of active) {
    let points = SEVERITY_PENALTY[d.severity]
    if (total + points < SEVERITY_PENALTY_CAP) {
      points = SEVERITY_PENALTY_CAP - total
    }
    if (points >= 0) continue
    total += points
    factors.push({
      label: `Avaria ${SEVERITY_LABEL[d.severity]} — ${d.partName}`,
      points,
    })
  }
  return factors
}

function recurrenceFactors(
  reports: SavedReport[],
  vehicleId: string,
  tenantId: string | null,
  userId: string,
): RiskFactor[] {
  const seenLocations = new Set<string>()
  const factors: RiskFactor[] = []
  let total = 0

  for (let i = 1; i < reports.length; i++) {
    const prev = reports[i - 1]
    const curr = reports[i]
    let comparison
    try {
      comparison = compareInspections(
        savedReportToInspection(prev, { vehicleId, tenantId, userId }),
        savedReportToInspection(curr, { vehicleId, tenantId, userId }),
      )
    } catch {
      continue
    }

    for (const item of comparison.items) {
      if (item.category !== 'new' && item.category !== 'severityChanged') continue
      const damage = item.current ?? item.previous
      if (!damage) continue
      const loc = partLocationKey(damage)
      if (item.category === 'severityChanged' || seenLocations.has(loc)) {
        if (total <= RECURRENCE_PENALTY_CAP) continue
        let points = RECURRENCE_PENALTY
        if (total + points < RECURRENCE_PENALTY_CAP) {
          points = RECURRENCE_PENALTY_CAP - total
        }
        total += points
        factors.push({
          label: `Reincidência — ${damage.partName}`,
          points,
        })
      }
      seenLocations.add(loc)
    }
  }

  return factors
}

function velocityFactor(summary: VehicleHistorySummary): RiskFactor | null {
  if (summary.reports.length < MIN_REPORTS_FOR_HISTORY) return null
  if (summary.newDamagesOnLast <= 0) return null

  const sorted = summary.reports
  const prevSavedAt = sorted[sorted.length - 2].savedAt
  const lastSavedAt = sorted[sorted.length - 1].savedAt
  const days = Math.max(1, (lastSavedAt - prevSavedAt) / (1000 * 60 * 60 * 24))
  const rate = summary.newDamagesOnLast / days

  if (rate <= VELOCITY_THRESHOLD_PER_DAY) return null
  return { label: 'Acúmulo rápido de avarias novas', points: VELOCITY_PENALTY }
}

function evidenceCoverage(reports: SavedReport[]): number {
  if (reports.length === 0) return 0
  const withEvidence = reports.filter((r) => countEvidencePhotos(r) > 0).length
  return withEvidence / reports.length
}

function confidenceFor(summary: VehicleHistorySummary): RiskConfidence {
  if (summary.reports.length < MIN_REPORTS_FOR_HISTORY) return 'low'
  if (evidenceCoverage(summary.reports) < LOW_EVIDENCE_COVERAGE_THRESHOLD) return 'low'
  return 'high'
}

/**
 * Score de risco 0–100, determinístico, sem IA — deriva só de dados já
 * coletados (avarias ativas, reincidência por local, velocidade de
 * acúmulo). Com histórico insuficiente, confidence='low' e só o fator de
 * severidade atual conta (não penaliza por falta de dado).
 */
export function computeVehicleRiskScore(
  summary: VehicleHistorySummary,
  opts?: { tenantId?: string | null; userId?: string },
): VehicleRiskScore {
  const tenantId = opts?.tenantId ?? null
  const userId = opts?.userId ?? 'local'
  const lastReport = summary.reports[summary.reports.length - 1]
  const confidence = confidenceFor(summary)

  const factors: RiskFactor[] = lastReport ? severityFactors(lastReport) : []

  if (confidence === 'high') {
    factors.push(...recurrenceFactors(summary.reports, summary.id, tenantId, userId))
    const velocity = velocityFactor(summary)
    if (velocity) factors.push(velocity)
  }

  factors.sort((a, b) => a.points - b.points)

  const totalPenalty = factors.reduce((acc, f) => acc + f.points, 0)
  const score = clampScore(100 + totalPenalty)

  return { score, tier: tierFor(score), confidence, factors }
}
