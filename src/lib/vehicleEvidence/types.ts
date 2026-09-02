// Primitivos do domínio canônico da app (vistoria, laudo, SVG) — `src/types.ts`.
import type {
  DamageType,
  Severity,
  ViewType,
  InspectionStatus,
} from '../../types'

// Re-exportar para manter compatibilidade com imports existentes neste módulo
export type {
  DamageType,
  Severity,
  ViewType,
  InspectionStatus,
}

/**
 * `Vehicle`, `DamageRecord` e `Inspection` abaixo são o modelo de domínio
 * usado por comparação/histórico/auditoria (camelCase, multi-tenant).
 * São DISTINTOS dos tipos "lite" de mesmo nome em `src/types/index.ts`
 * (usados pela API de verificação/diff) — não devem ser confundidos nem
 * unificados; cada um serve a um contrato diferente.
 */

/** Localização GPS mínima associada a um dano. */
export interface DamageGeoLocation {
  lat: number
  lng: number
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
  photoRefs?: string[]
  gps?: DamageGeoLocation
}

export interface Vehicle {
  id: string
  tenantId: string
  plate: string
  vin?: string | null
  vehicleType?: string
  brand?: string
  color?: string
  createdAt: string
  updatedAt: string
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

/* -------------------------------------------------------------------------- */
/* Comparação de vistorias (FASE 9+) — fonte canônica deste módulo            */
/* src/types/index.ts re-exporta daqui via `export type { … } from '…/types'` */
/* -------------------------------------------------------------------------- */

export type ComparisonCategory =
  | 'unchanged'
  | 'new'
  | 'removedOrRepaired'
  | 'severityChanged'
  | 'uncertain'

export interface ComparisonItem {
  category: ComparisonCategory
  identityKey: string
  /** Dano no modelo de domínio (camelCase) — usar DamageRecord deste módulo. */
  previous?: DamageRecord
  current?: DamageRecord
  message: string
  previousSeverity?: Severity
  currentSeverity?: Severity
}

export interface ComparisonSummary {
  unchanged: number
  newDamages: number
  removedOrRepaired: number
  severityChanged: number
  uncertain: number
  [key: string]: number
}

export interface ComparisonResult {
  previousInspectionId: string
  currentInspectionId: string
  vehicleId: string
  comparedAt: string // ISO
  items: ComparisonItem[]
  summary: ComparisonSummary
}

/** Decisão humana sobre um item de comparação. */
export type ComparisonDecision = 'accept' | 'edit' | 'ignore'

export interface ComparisonReviewDecision {
  comparisonId: string
  itemIdentityKey: string
  decision: ComparisonDecision
  userId: string
  timestamp: string // ISO
  justification?: string
}

/* -------------------------------------------------------------------------- */
/* Histórico Veicular Digital — vehicleEvents.ts                              */
/* -------------------------------------------------------------------------- */

/** Tipo de evento do histórico veicular (aberto — validado/normalizado na camada de API/DB). */
export type VehicleEventType = string

export interface VehicleEvent {
  id: string
  vehicleId: string
  tenantId: string
  type: VehicleEventType
  title: string
  description?: string
  date: string // ISO
  createdAt: string // ISO
  createdBy?: string
  location?: string
  latitude?: number
  longitude?: number
  photos?: string[]
  documents?: Array<{ name: string; url: string }>
  inspectionId?: string
  status?: string
  hash?: string
  signature?: { signerName?: string; signedAt?: string }
}

/* -------------------------------------------------------------------------- */
/* Trilha de auditoria do domínio vehicleEvidence — auditEvents.ts            */
/* -------------------------------------------------------------------------- */

export type VehicleEvidenceAuditEventType =
  | 'vehicle_created'
  | 'inspection_linked_to_vehicle'
  | 'comparison_created'
  | 'comparison_reviewed'
  | 'damage_marked_new'
  | 'damage_marked_existing'
  | 'damage_marked_changed'
  | 'damage_marked_uncertain'

export interface VehicleEvidenceAuditEvent {
  eventId: string
  timestamp: string // ISO
  eventType: VehicleEvidenceAuditEventType
  tenantId: string
  userId: string
  vehicleId?: string
  inspectionId?: string
  comparisonId?: string
  metadata?: Record<string, unknown>
}
