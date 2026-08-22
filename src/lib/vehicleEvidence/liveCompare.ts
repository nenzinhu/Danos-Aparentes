/**
 * Prévia de comparação ao vivo (FASE 10) — determinística, sem IA.
 * Compara o rascunho atual com a última vistoria do mesmo veículo/placa.
 */

import type { Damage, SavedReport, VehicleInfo, VehicleType } from '../../types'
import { createId } from '../id'
import { normalizePlate } from '../reportComparison'
import { compareInspections } from './compareInspections'
import { savedReportToInspection } from './adapters'
import { resolveReportVehicleId } from './groupReports'
import { resolveVehicleIdForSave } from './resolveVehicle'
import type { ComparisonResult } from './types'

export type LiveComparePreview = {
  vehicleId: string
  previousReportId: string
  previousUpdatedAt: string
  result: ComparisonResult
}

/** Última vistoria salva da mesma placa (exceto `excludeId`). */
export function findPreviousReportForPlate(
  reports: SavedReport[],
  plate: string,
  excludeId?: string | null,
): SavedReport | null {
  const norm = normalizePlate(plate)
  if (norm.length < 6) return null
  const matches = reports
    .filter((r) => {
      if (excludeId && r.id === excludeId) return false
      return normalizePlate(String(r.vehicleInfo.plate || '')) === norm
    })
    .sort((a, b) => b.savedAt - a.savedAt)
  return matches[0] ?? null
}

/** Monta SavedReport temporário do rascunho atual para o motor de comparação. */
export function draftReportFromState(input: {
  vehicleInfo: VehicleInfo
  damages: Damage[]
  vehicleType: VehicleType
  activeReportId?: string | null
  vehicleId?: string
  savedAt?: number
}): SavedReport {
  return {
    id: (input.activeReportId || `draft-${createId()}`) as SavedReport['id'],
    savedAt: input.savedAt ?? Date.now(),
    vehicleInfo: input.vehicleInfo,
    damages: input.damages,
    vehicleType: input.vehicleType,
    status: 'draft',
    vehicleId: input.vehicleId,
  }
}

export function buildLiveComparePreview(input: {
  previous: SavedReport
  current: SavedReport
  tenantId?: string | null
  userId: string
}): LiveComparePreview | null {
  const vehicleId =
    resolveReportVehicleId(input.current) ||
    resolveReportVehicleId(input.previous) ||
    resolveVehicleIdForSave(
      String(input.current.vehicleInfo.plate || input.previous.vehicleInfo.plate || ''),
      [input.previous, input.current],
      input.current.vehicleId || input.previous.vehicleId,
    )
  if (!vehicleId) return null

  try {
    const previous = savedReportToInspection(input.previous, {
      vehicleId,
      tenantId: input.tenantId ?? null,
      userId: input.userId,
    })
    const current = savedReportToInspection(input.current, {
      vehicleId,
      tenantId: input.tenantId ?? null,
      userId: input.userId,
    })
    // IDs devem ser distintos para o motor
    if (previous.id === current.id) {
      current.id = `${current.id}-live`
    }
    const result = compareInspections(previous, current)
    return {
      vehicleId,
      previousReportId: input.previous.id,
      previousUpdatedAt: new Date(input.previous.savedAt).toISOString(),
      result,
    }
  } catch {
    return null
  }
}
