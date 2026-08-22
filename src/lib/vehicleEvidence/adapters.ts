import type { Damage, SavedReport, VehicleType } from '../../types'
import { normalizePlate } from '../reportComparison'
import type { DamageRecord, Inspection, InspectionStatus, Vehicle } from './types'
import { tenantScopeKey } from './vehicleIdentity'

function mapDamage(d: Damage): DamageRecord {
  return {
    id: d.id,
    view: d.view,
    partId: d.partId,
    partName: d.partName,
    type: d.type,
    typeName: d.typeName,
    severity: d.severity,
    notes: d.notes || undefined,
    photoRefs: d.photos?.length ? [...d.photos] : undefined,
  }
}

/**
 * Adapta SavedReport → Inspection do domínio.
 * `vehicleId` vem do laudo (FASE 3) ou de um placeholder explícito.
 */
export function savedReportToInspection(
  report: SavedReport,
  opts: {
    vehicleId: string
    tenantId: string | null
    userId: string
  },
): Inspection {
  const geo = report.vehicleInfo.geo
  return {
    id: report.id,
    vehicleId: opts.vehicleId,
    tenantId: tenantScopeKey(opts.tenantId, opts.userId),
    status: (report.status ?? 'complete') as InspectionStatus,
    plateAtInspection: normalizePlate(String(report.vehicleInfo.plate || '')),
    inspectedAt: new Date(report.savedAt).toISOString(),
    damages: report.damages.map(mapDamage),
    publicCode: report.publicCode,
    geo: geo
      ? { lat: geo.lat, lng: geo.lng, address: geo.address }
      : null,
  }
}

/** Cria Vehicle de domínio a partir de campos de um laudo (sem I/O). */
export function vehicleFromReportFields(input: {
  id: string
  tenantId: string | null
  userId: string
  plate: string
  vin?: string | null
  vehicleType?: VehicleType | string
  brand?: string
  color?: string
  createdAt?: string
}): Vehicle {
  const now = input.createdAt ?? new Date().toISOString()
  return {
    id: input.id,
    tenantId: tenantScopeKey(input.tenantId, input.userId),
    plate: normalizePlate(input.plate),
    vin: input.vin ?? null,
    vehicleType: input.vehicleType,
    brand: input.brand,
    color: input.color,
    createdAt: now,
    updatedAt: now,
  }
}
