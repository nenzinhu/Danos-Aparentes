// Importar tipos do domínio da fonte canônica (app de produção)
import type {
  DamageType,
  Severity,
  ViewType,
  InspectionStatus,
  Vehicle,
  DamageRecord,
  Inspection,
  ComparisonCategory,
  ComparisonItem,
  ComparisonResult,
  ComparisonDecision,
  ComparisonReviewDecision,
  VehicleEventType,
  VehicleEvent,
  VehicleEvidenceAuditEventType,
  VehicleEvidenceAuditEvent
} from '@/src/types';

// Tipos de auditoria específicos do labs (mantidos isolados)
export type LabAuditEventType =
  | 'vehicle_created'
  | 'inspection_linked_to_vehicle'
  | 'comparison_created'
  | 'comparison_reviewed'
  | 'damage_marked_new'
  | 'damage_marked_existing'
  | 'damage_marked_changed'
  | 'damage_marked_uncertain'
  | 'comparison_exported'

export interface LabAuditEvent {
  eventId: string
  eventType: LabAuditEventType
  tenantId: string
  userId: string
  vehicleId?: string
  inspectionId?: string
  comparisonId?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// Re-exportar tipos do domínio se necessário neste módulo (opcional, mas recomendado)
export {
  DamageType,
  Severity,
  ViewType,
  InspectionStatus,
  Vehicle,
  DamageRecord,
  Inspection,
  ComparisonCategory,
  ComparisonItem,
  ComparisonResult,
  ComparisonDecision,
  ComparisonReviewDecision,
  VehicleEventType,
  VehicleEvent,
  VehicleEvidenceAuditEventType,
  VehicleEvidenceAuditEvent
};
