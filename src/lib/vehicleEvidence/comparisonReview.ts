/**
 * Persistência local de revisões de comparação + emissão de audit events.
 * Não muta laudos issued.
 */

import { appendAuditEvent } from '../audit/auditLog'
import type { ComparisonDecision, ComparisonReviewDecision, ComparisonResult } from './types'
import { auditEventsForComparisonCreated, auditEventsForReview } from './auditEvents'

const STORAGE_KEY = 've-comparison-reviews-v1'

export type StoredComparisonReview = {
  comparisonId: string
  vehicleId: string
  previousInspectionId: string
  currentInspectionId: string
  tenantId: string
  createdAt: string
  summary: ComparisonResult['summary']
  decisions: ComparisonReviewDecision[]
}

function readAll(): Record<string, StoredComparisonReview> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, StoredComparisonReview>
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, StoredComparisonReview>): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function comparisonStorageId(previousId: string, currentId: string): string {
  return `cmp_${previousId}_${currentId}`
}

export function getStoredComparison(comparisonId: string): StoredComparisonReview | null {
  return readAll()[comparisonId] ?? null
}

/** Persiste revisão já montada (ex.: hidratação da nuvem — FASE 18). */
export function upsertStoredComparison(stored: StoredComparisonReview): void {
  const all = readAll()
  all[stored.comparisonId] = stored
  writeAll(all)
}

export function saveComparisonCreated(input: {
  vehicleId: string
  previousInspectionId: string
  currentInspectionId: string
  tenantId: string
  userId: string
  result: ComparisonResult
}): StoredComparisonReview {
  const comparisonId = comparisonStorageId(input.previousInspectionId, input.currentInspectionId)
  const existing = getStoredComparison(comparisonId)
  const stored: StoredComparisonReview = existing ?? {
    comparisonId,
    vehicleId: input.vehicleId,
    previousInspectionId: input.previousInspectionId,
    currentInspectionId: input.currentInspectionId,
    tenantId: input.tenantId,
    createdAt: new Date().toISOString(),
    summary: input.result.summary,
    decisions: [],
  }
  if (!existing) {
    stored.summary = input.result.summary
  }
  const all = readAll()
  all[comparisonId] = stored
  writeAll(all)

  // Domain audit helpers (local trail) + append to real audit_log (best-effort)
  void auditEventsForComparisonCreated({
    tenantId: input.tenantId,
    userId: input.userId,
    vehicleId: input.vehicleId,
    comparisonId,
    summary: input.result.summary,
  })

  void appendAuditEvent({
    event_type: 'comparison_created',
    inspection_id: input.currentInspectionId,
    tenant_id: input.tenantId.startsWith('user:') ? null : input.tenantId,
    actor_id: input.userId,
    metadata: {
      vehicle_id: input.vehicleId,
      comparison_id: comparisonId,
      previous_inspection_id: input.previousInspectionId,
      summary: input.result.summary,
    },
    idempotency_key: `comparison_created:${comparisonId}`,
  }).catch(() => {
    /* offline / sem supabase — ok */
  })

  void import('./syncComparison').then(({ syncComparisonToCloud }) =>
    syncComparisonToCloud({
      stored,
      result: input.result,
      userId: input.userId,
    }),
  ).catch(() => undefined)

  return stored
}

export async function recordComparisonDecision(input: {
  comparisonId: string
  itemIdentityKey: string
  decision: ComparisonDecision
  userId: string
  justification?: string
  category?: string
}): Promise<StoredComparisonReview> {
  const all = readAll()
  const stored = all[input.comparisonId]
  if (!stored) throw new Error('Comparação não encontrada')

  const decision: ComparisonReviewDecision = {
    comparisonId: input.comparisonId,
    itemIdentityKey: input.itemIdentityKey,
    decision: input.decision,
    userId: input.userId,
    timestamp: new Date().toISOString(),
    justification: input.justification,
  }

  stored.decisions = [
    ...stored.decisions.filter((d) => d.itemIdentityKey !== input.itemIdentityKey),
    decision,
  ]
  all[input.comparisonId] = stored
  writeAll(all)

  void auditEventsForReview(decision, stored.tenantId)

  const markType =
    input.decision === 'accept'
      ? input.category === 'new'
        ? 'damage_marked_new'
        : 'damage_marked_existing'
      : input.decision === 'ignore'
        ? 'damage_marked_uncertain'
        : 'damage_marked_changed'

  await appendAuditEvent({
    event_type: 'comparison_reviewed',
    inspection_id: stored.currentInspectionId,
    tenant_id: stored.tenantId.startsWith('user:') ? null : stored.tenantId,
    actor_id: input.userId,
    metadata: {
      vehicle_id: stored.vehicleId,
      comparison_id: input.comparisonId,
      identity_key: input.itemIdentityKey,
      decision: input.decision,
      justification: input.justification,
    },
  }).catch(() => undefined)

  await appendAuditEvent({
    event_type: markType,
    inspection_id: stored.currentInspectionId,
    tenant_id: stored.tenantId.startsWith('user:') ? null : stored.tenantId,
    actor_id: input.userId,
    metadata: {
      vehicle_id: stored.vehicleId,
      comparison_id: input.comparisonId,
      identity_key: input.itemIdentityKey,
      decision: input.decision,
    },
  }).catch(() => undefined)

  void import('./syncComparison').then(({ syncComparisonToCloud }) =>
    syncComparisonToCloud({ stored, userId: input.userId }),
  ).catch(() => undefined)

  return stored
}
