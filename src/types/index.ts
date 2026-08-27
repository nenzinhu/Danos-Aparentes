/**
 * Tipos “lite” para verificação/diff de evidência e componentes comuns.
 *
 * Fonte canônica do domínio da app (vistoria, laudo, SVG): `@/src/types` (`src/types.ts`).
 * Este módulo NÃO deve redefinir Damage / SavedReport / VehicleInfo.
 */

export type { Severity as DamageSeverity } from '../types'

export type DamageCategory =
  | 'arranhão'
  | 'amassado'
  | 'trinca'
  | 'quebra'
  | 'outro'

/** Coordenada mínima para payload de evidência (lite) — distinto de GeoLocation em types.ts. */
export interface GeoLocation {
  lat: number
  lng: number
}

export interface DamageRecord {
  id: string
  severity: import('../types').Severity
  category: DamageCategory
  description: string
  part_id?: string
  part_name?: string
  photo_url?: string
  confidence?: number
}

export interface EvidencePayload {
  photos: string[]
  location?: GeoLocation
  captured_at: string // ISO
  device_fingerprint?: string
}

/** Status do modelo lite de inspeção (API/verify) — distinto de InspectionStatus em types.ts. */
export type LiteInspectionStatus = 'draft' | 'completed' | 'superseded' | 'archived'

/** @deprecated Use LiteInspectionStatus — nome legado mantido para schemas Zod. */
export type InspectionStatus = LiteInspectionStatus

export interface InspectionBase {
  vehicle_id: string
  plate: string
  type: 'checkout' | 'checkin'
  status: LiteInspectionStatus
  damages: DamageRecord[]
  evidence: EvidencePayload
  notes?: string
  inspector_name?: string
  inspector_id?: string
}

export interface Inspection extends InspectionBase {
  id: string
  hash: string
  previous_hash?: string
  version: number
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  plate: string
  brand?: string
  model?: string
  year?: number
  color?: string
  first_inspection_at?: string
  last_inspection_at?: string
  inspection_count: number
}

export interface DiffResult {
  added_damages: DamageRecord[]
  removed_damages: DamageRecord[]
  modified_damages: DamageRecord[]
  unchanged_damages: DamageRecord[]
}

export type VerifyOutcome =
  | { ok: true; status: 'verified' }
  | { ok: true; status: 'superseded' }
  | { ok: false; reason: 'not_found' | 'hash_mismatch' | 'integrity_failure' }

export interface PdfVerifyRecord {
  hash: string
  final_hash: string | null
  integrity_manifest: { pdf_hash?: string } | null
  inspection_status: string | null
  is_superseded_version: boolean
}
