/**
 * FASE 14 — deterministic keys for offline sync retries.
 * ponytail: dedupe is best-effort (metadata lookup / hash existence), not a DB unique constraint.
 */

export function syncUpsertIdempotencyKey(reportId: string, savedAt: number): string {
  return `sync_upsert:${reportId}:${savedAt}`
}

export function auditIdempotencyKey(eventType: string, inspectionId: string | null, suffix: string): string {
  return `audit:${eventType}:${inspectionId ?? 'global'}:${suffix}`
}

export function hashRegisterIdempotencyKey(hash: string, inspectionId?: string | null): string {
  return `hash_register:${inspectionId ?? 'none'}:${hash}`
}
