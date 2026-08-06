'use client'

/**
 * Mantido para imports legados — a experiência premium vive em VehicleHistoryTimeline.
 * Não exibe IDs técnicos.
 */
import VehicleHistoryTimeline from './VehicleHistoryTimeline'
import type { VehicleHistorySummaryWithCloud } from '@/src/lib/vehicleEvidence'

export default function VehicleAuditTimeline({
  vehicleId: _vehicleId,
  inspectionIds: _inspectionIds,
}: {
  vehicleId: string
  inspectionIds: string[]
}) {
  // Compat shim: DetailView agora embute VehicleHistoryTimeline diretamente.
  // Este export evita quebrar imports externos com um placeholder mínimo.
  void _vehicleId
  void _inspectionIds
  return null
}

/** Preferir VehicleHistoryTimeline na UI do produto. */
export { VehicleHistoryTimeline }
export type { VehicleHistorySummaryWithCloud }
