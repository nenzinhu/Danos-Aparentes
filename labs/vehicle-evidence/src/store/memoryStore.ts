import {
  assertSameTenant,
  auditEventsForComparisonCreated,
  auditEventsForReview,
  compareInspections,
  createAuditEvent,
  normalizePlate,
  withUpdatedPlate,
  type ComparisonResult,
  type ComparisonReviewDecision,
  type Inspection,
  type LabAuditEvent,
  type Vehicle,
} from '../domain'

export type StoredComparison = ComparisonResult & {
  id: string
  tenantId: string
  decisions: ComparisonReviewDecision[]
}

/**
 * Store em memória (+ localStorage opcional) — simula offline-first.
 * Não toca Supabase / app de produção.
 */
export class VehicleEvidenceStore {
  vehicles = new Map<string, Vehicle>()
  inspections = new Map<string, Inspection>()
  comparisons = new Map<string, StoredComparison>()
  audit: LabAuditEvent[] = []
  /** Inspections only available locally (not yet "synced"). */
  pendingSync = new Set<string>()

  constructor(private readonly storageKey?: string) {
    if (storageKey && typeof localStorage !== 'undefined') {
      this.hydrate()
    }
  }

  private persist(): void {
    if (!this.storageKey || typeof localStorage === 'undefined') return
    localStorage.setItem(
      this.storageKey,
      JSON.stringify({
        vehicles: [...this.vehicles.values()],
        inspections: [...this.inspections.values()],
        comparisons: [...this.comparisons.values()],
        audit: this.audit,
        pendingSync: [...this.pendingSync],
      }),
    )
  }

  private hydrate(): void {
    if (!this.storageKey || typeof localStorage === 'undefined') return
    const raw = localStorage.getItem(this.storageKey)
    if (!raw) return
    try {
      const data = JSON.parse(raw) as {
        vehicles: Vehicle[]
        inspections: Inspection[]
        comparisons: StoredComparison[]
        audit: LabAuditEvent[]
        pendingSync: string[]
      }
      data.vehicles?.forEach((v) => this.vehicles.set(v.id, v))
      data.inspections?.forEach((i) => this.inspections.set(i.id, i))
      data.comparisons?.forEach((c) => this.comparisons.set(c.id, c))
      this.audit = data.audit ?? []
      this.pendingSync = new Set(data.pendingSync ?? [])
    } catch {
      /* ignore corrupt */
    }
  }

  createVehicle(input: Omit<Vehicle, 'createdAt' | 'updatedAt'> & { createdAt?: string }): Vehicle {
    const now = input.createdAt ?? new Date().toISOString()
    const vehicle: Vehicle = {
      ...input,
      plate: normalizePlate(input.plate),
      createdAt: now,
      updatedAt: now,
    }
    this.vehicles.set(vehicle.id, vehicle)
    this.audit.push(
      createAuditEvent({
        eventType: 'vehicle_created',
        tenantId: vehicle.tenantId,
        userId: 'system',
        vehicleId: vehicle.id,
        metadata: { plate: vehicle.plate },
      }),
    )
    this.persist()
    return vehicle
  }

  updatePlate(vehicleId: string, newPlate: string): Vehicle {
    const v = this.vehicles.get(vehicleId)
    if (!v) throw new Error('Vehicle not found')
    const updated = withUpdatedPlate(v, newPlate)
    this.vehicles.set(vehicleId, updated)
    this.persist()
    return updated
  }

  linkInspection(inspection: Inspection, opts?: { offline?: boolean }): Inspection {
    const vehicle = this.vehicles.get(inspection.vehicleId)
    if (!vehicle) throw new Error('Vehicle not found')
    assertSameTenant(vehicle, inspection, 'inspection')
    this.inspections.set(inspection.id, inspection)
    if (opts?.offline) this.pendingSync.add(inspection.id)
    this.audit.push(
      createAuditEvent({
        eventType: 'inspection_linked_to_vehicle',
        tenantId: inspection.tenantId,
        userId: 'system',
        vehicleId: inspection.vehicleId,
        inspectionId: inspection.id,
        metadata: { offline: Boolean(opts?.offline), status: inspection.status },
      }),
    )
    this.persist()
    return inspection
  }

  markSynced(inspectionId: string): void {
    this.pendingSync.delete(inspectionId)
    this.persist()
  }

  listInspectionsForVehicle(vehicleId: string, tenantId: string): Inspection[] {
    return [...this.inspections.values()]
      .filter((i) => i.vehicleId === vehicleId && i.tenantId === tenantId)
      .sort((a, b) => a.inspectedAt.localeCompare(b.inspectedAt))
  }

  listVehicles(tenantId: string): Vehicle[] {
    return [...this.vehicles.values()]
      .filter((v) => v.tenantId === tenantId)
      .sort((a, b) => a.plate.localeCompare(b.plate))
  }

  /**
   * Compara duas vistorias. Se alguma ainda não sincronizou e o caller
   * pedir requireSynced, devolve mensagem em vez de resultado.
   */
  compare(
    previousId: string,
    currentId: string,
    userId: string,
    opts?: { requireSynced?: boolean },
  ): { ok: true; comparison: StoredComparison } | { ok: false; reason: string } {
    const previous = this.inspections.get(previousId)
    const current = this.inspections.get(currentId)
    if (!previous || !current) {
      return { ok: false, reason: 'Inspeção não encontrada localmente.' }
    }
    if (opts?.requireSynced && (this.pendingSync.has(previousId) || this.pendingSync.has(currentId))) {
      return {
        ok: false,
        reason: 'Comparação será disponibilizada quando os dados estiverem sincronizados.',
      }
    }

    const result = compareInspections(previous, current)
    const id = `cmp_${previousId}_${currentId}`
    const stored: StoredComparison = {
      ...result,
      id,
      tenantId: previous.tenantId,
      decisions: [],
    }
    this.comparisons.set(id, stored)
    this.audit.push(
      ...auditEventsForComparisonCreated({
        tenantId: previous.tenantId,
        userId,
        vehicleId: previous.vehicleId,
        comparisonId: id,
        summary: result.summary,
      }),
    )
    this.persist()
    return { ok: true, comparison: stored }
  }

  review(
    comparisonId: string,
    decision: Omit<ComparisonReviewDecision, 'comparisonId' | 'timestamp'> & { timestamp?: string },
  ): StoredComparison {
    const cmp = this.comparisons.get(comparisonId)
    if (!cmp) throw new Error('Comparison not found')
    const full: ComparisonReviewDecision = {
      comparisonId,
      itemIdentityKey: decision.itemIdentityKey,
      decision: decision.decision,
      userId: decision.userId,
      timestamp: decision.timestamp ?? new Date().toISOString(),
      justification: decision.justification,
    }
    cmp.decisions.push(full)
    this.audit.push(...auditEventsForReview(full, cmp.tenantId))
    this.persist()
    return cmp
  }
}
