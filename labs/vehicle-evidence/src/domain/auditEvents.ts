import type { ComparisonDecision, ComparisonReviewDecision, LabAuditEvent, LabAuditEventType } from './types'

let seq = 0
function nextId(prefix: string): string {
  seq += 1
  return `${prefix}_${seq}_${Date.now().toString(36)}`
}

export function resetAuditIdSeqForTests(): void {
  seq = 0
}

export function createAuditEvent(input: Omit<LabAuditEvent, 'eventId' | 'timestamp'> & { timestamp?: string }): LabAuditEvent {
  return {
    eventId: nextId('evt'),
    timestamp: input.timestamp ?? new Date().toISOString(),
    ...input,
  }
}

export function auditEventsForComparisonCreated(args: {
  tenantId: string
  userId: string
  vehicleId: string
  comparisonId: string
  summary: Record<string, number>
}): LabAuditEvent[] {
  return [
    createAuditEvent({
      eventType: 'comparison_created',
      tenantId: args.tenantId,
      userId: args.userId,
      vehicleId: args.vehicleId,
      comparisonId: args.comparisonId,
      metadata: { summary: args.summary },
    }),
  ]
}

export function auditEventsForReview(decision: ComparisonReviewDecision, tenantId: string): LabAuditEvent[] {
  const markType: LabAuditEventType =
    decision.decision === 'accept'
      ? 'damage_marked_existing'
      : decision.decision === 'ignore'
        ? 'damage_marked_uncertain'
        : 'damage_marked_changed'

  return [
    createAuditEvent({
      eventType: 'comparison_reviewed',
      tenantId,
      userId: decision.userId,
      comparisonId: decision.comparisonId,
      timestamp: decision.timestamp,
      metadata: {
        identityKey: decision.itemIdentityKey,
        decision: decision.decision,
        justification: decision.justification,
      },
    }),
    createAuditEvent({
      eventType: markType,
      tenantId,
      userId: decision.userId,
      comparisonId: decision.comparisonId,
      timestamp: decision.timestamp,
      metadata: {
        identityKey: decision.itemIdentityKey,
        decision: decision.decision as ComparisonDecision,
      },
    }),
  ]
}
