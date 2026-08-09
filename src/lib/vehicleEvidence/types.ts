/**
 * Domínio puro — plataforma de evidência / histórico / comparação.
 * Sem efeitos colaterais, sem IA, sem I/O.
 */

export type DamageType = 'scratch' | 'dent' | 'broken'
export type Severity = 'low' | 'medium' | 'high'
export type ViewType = 'lateral-left' | 'lateral-right' | 'frontal' | 'traseira'

export type InspectionStatus = 'draft' | 'complete' | 'issued' | 'superseded' | 'cancelled'

/** Identidade estável do veículo (não depende só da placa). */
export interface Vehicle {
  id: string
  /** companies.id, ou chave lógica `user:{uuid}` para solo. */
  tenantId: string
  plate: string
  vin?: string | null
  vehicleType?: string
  brand?: string
  model?: string
  year?: number | null
  color?: string
  createdAt: string
  updatedAt: string
}

export interface DamageRecord {
  id: string
  view: ViewType
  partId: string
  partName: string
  type: DamageType
  typeName: string
  severity: Severity
  notes?: string
  /** Refs de evidência (não mutar bytes originais). */
  photoRefs?: string[]
  gps?: { lat: number; lng: number; capturedAt?: number } | null
}

export interface Inspection {
  id: string
  vehicleId: string
  tenantId: string
  status: InspectionStatus
  plateAtInspection: string
  inspectedAt: string
  damages: DamageRecord[]
  publicCode?: string
  geo?: { lat: number; lng: number; address?: string } | null
}

export type ComparisonCategory =
  | 'unchanged'
  | 'new'
  | 'removedOrRepaired'
  | 'severityChanged'
  | 'uncertain'

export interface ComparisonItem {
  category: ComparisonCategory
  identityKey: string
  previous?: DamageRecord
  current?: DamageRecord
  /** Linguagem de incerteza — nunca afirmar reparo sem evidência. */
  message: string
  previousSeverity?: Severity
  currentSeverity?: Severity
}

export interface ComparisonResult {
  previousInspectionId: string
  currentInspectionId: string
  vehicleId: string
  comparedAt: string
  items: ComparisonItem[]
  summary: {
    unchanged: number
    newDamages: number
    removedOrRepaired: number
    severityChanged: number
    uncertain: number
  }
}

export type ComparisonDecision = 'accept' | 'edit' | 'ignore'

export interface ComparisonReviewDecision {
  comparisonId: string
  itemIdentityKey: string
  decision: ComparisonDecision
  userId: string
  timestamp: string
  justification?: string
}

export type VehicleEventType =
  | 'INSPECTION'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'DELIVERY'
  | 'RETURN'
  | 'TRANSFER'
  | 'TRANSPORT'
  | 'REPAIR_START'
  | 'REPAIR_END'
  | 'SALE'
  | 'PURCHASE'
  | 'ACCIDENT'
  | 'OTHER'

export interface VehicleEvent {
  id: string
  vehicleId: string
  tenantId: string
  type: VehicleEventType
  title: string
  description?: string | null
  date: string
  createdAt: string
  createdBy?: string | null
  location?: string | null
  latitude?: number | null
  longitude?: number | null
  photos?: string[]
  documents?: Array<{ name: string; url: string }>
  inspectionId?: string | null
  status?: string | null
  hash?: string | null
  signature?: { signerName?: string; signedAt?: string } | null
}

export type VehicleEvidenceAuditEventType =
  | 'vehicle_created'
  | 'inspection_linked_to_vehicle'
  | 'comparison_created'
  | 'comparison_reviewed'
  | 'damage_marked_new'
  | 'damage_marked_existing'
  | 'damage_marked_changed'
  | 'damage_marked_uncertain'
  | 'comparison_exported'

export interface VehicleEvidenceAuditEvent {
  eventId: string
  eventType: VehicleEvidenceAuditEventType
  tenantId: string
  userId: string
  vehicleId?: string
  inspectionId?: string
  comparisonId?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

