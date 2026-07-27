import { createId } from '../id'
import { sha256Hex } from '../pdf/integrityManifest'
import { supabase, supabaseEnabled } from '../supabase'
import { resolveTenantId } from '../tenant/resolveTenant'

/** Known / reserved event types. New types may be appended without migration. */
export const AUDIT_EVENT_TYPES = [
  'creation',
  'start',
  'change',
  'damage_create',
  'photo_capture',
  'ai_analysis',
  'human_decision',
  'review',
  'signature',
  'gps',
  'pdf_generation',
  'hash_generation',
  'issuance',
  'verification',
  'correction',
  'cancellation',
  'unauthorized_access_attempt',
  'issued_mutation_attempt',
  'review_completed',
  'issue_blocked_without_review',
] as const

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number] | (string & {})

export type AuditActorType = 'user' | 'system' | 'service'

export type AuditEventInput = {
  event_id?: string
  inspection_id?: string | null
  tenant_id?: string | null
  user_id: string
  actor_id: string
  actor_type?: AuditActorType
  event_type: AuditEventType
  timestamp?: string
  ip?: string | null
  user_agent?: string | null
  device_id?: string | null
  metadata?: Record<string, unknown>
  previous_event_hash: string
}

/** Canonical row fields used for hashing (excludes event_hash). */
export type AuditEventPayload = {
  event_id: string
  inspection_id: string | null
  tenant_id: string | null
  user_id: string
  actor_id: string
  actor_type: AuditActorType
  event_type: string
  timestamp: string
  ip: string | null
  user_agent: string | null
  device_id: string | null
  metadata: Record<string, unknown>
  previous_event_hash: string
}

export type AuditLogRow = AuditEventPayload & {
  event_hash: string
  created_at?: string
}

/** Stable JSON for hashing — sorted object keys at the top level only. */
export function canonicalAuditJson(value: unknown): string {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return JSON.stringify(value)
  }
  const obj = value as Record<string, unknown>
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key]
  }
  return JSON.stringify(sorted)
}

export function buildEventPayload(input: AuditEventInput): AuditEventPayload {
  return {
    event_id: input.event_id || createId(),
    inspection_id: input.inspection_id ?? null,
    tenant_id: input.tenant_id ?? null,
    user_id: input.user_id,
    actor_id: input.actor_id,
    actor_type: input.actor_type ?? 'user',
    event_type: input.event_type,
    timestamp: input.timestamp || new Date().toISOString(),
    ip: input.ip ?? null,
    user_agent: input.user_agent ?? null,
    device_id: input.device_id ?? null,
    metadata: input.metadata ?? {},
    previous_event_hash: input.previous_event_hash || '',
  }
}

export async function computeEventHash(payload: AuditEventPayload): Promise<string> {
  return sha256Hex(canonicalAuditJson(payload))
}

/**
 * Verify that each event's previous_event_hash matches the prior event_hash
 * and that recomputing event_hash matches the stored value.
 */
export async function verifyEventChain(
  events: AuditLogRow[],
): Promise<{ ok: boolean; brokenAt?: number; reason?: string }> {
  let expectedPrev = ''
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    if ((ev.previous_event_hash || '') !== expectedPrev) {
      return { ok: false, brokenAt: i, reason: 'previous_event_hash mismatch' }
    }
    const recomputed = await computeEventHash({
      event_id: ev.event_id,
      inspection_id: ev.inspection_id,
      tenant_id: ev.tenant_id,
      user_id: ev.user_id,
      actor_id: ev.actor_id,
      actor_type: ev.actor_type,
      event_type: ev.event_type,
      timestamp: ev.timestamp,
      ip: ev.ip,
      user_agent: ev.user_agent,
      device_id: ev.device_id,
      metadata: ev.metadata ?? {},
      previous_event_hash: ev.previous_event_hash || '',
    })
    if (recomputed !== ev.event_hash) {
      return { ok: false, brokenAt: i, reason: 'event_hash mismatch' }
    }
    expectedPrev = ev.event_hash
  }
  return { ok: true }
}

function clientUserAgent(): string | null {
  if (typeof navigator === 'undefined') return null
  return navigator.userAgent || null
}

async function auditIdempotencyKeyExists(
  inspectionId: string | null,
  idempotencyKey: string,
): Promise<boolean> {
  if (!supabase) return false
  let q = supabase
    .from('audit_log')
    .select('event_id')
    .contains('metadata', { idempotency_key: idempotencyKey })
    .limit(1)
  q = inspectionId ? q.eq('inspection_id', inspectionId) : q.is('inspection_id', null)
  const { data } = await q.maybeSingle()
  return Boolean(data?.event_id)
}

async function fetchPreviousEventHash(inspectionId: string | null): Promise<string> {
  if (!supabase) return ''
  let q = supabase.from('audit_log').select('event_hash')
  q = inspectionId
    ? q.eq('inspection_id', inspectionId)
    : q.is('inspection_id', null)
  const { data } = await q
    .order('timestamp', { ascending: false })
    .order('event_id', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.event_hash as string | undefined) || ''
}

export type AppendAuditEventArgs = {
  event_type: AuditEventType
  inspection_id?: string | null
  tenant_id?: string | null
  metadata?: Record<string, unknown>
  actor_type?: AuditActorType
  /** Override actor; defaults to session user. */
  actor_id?: string
  ip?: string | null
  user_agent?: string | null
  device_id?: string | null
  /** FASE 14: skip insert when the same key already exists for this inspection. */
  idempotency_key?: string
}

/**
 * Best-effort append. Never throws to callers — offline / no session = no-op.
 * Returns the inserted row or null.
 */
export async function appendAuditEvent(args: AppendAuditEventArgs): Promise<AuditLogRow | null> {
  if (!supabaseEnabled || !supabase) return null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const userId = session.user.id
    const inspectionId = args.inspection_id ?? null
    if (args.idempotency_key) {
      const dup = await auditIdempotencyKeyExists(inspectionId, args.idempotency_key)
      if (dup) return null
    }
    const tenantId = args.tenant_id !== undefined
      ? args.tenant_id
      : await resolveTenantId(userId)
    const previous = await fetchPreviousEventHash(inspectionId)
    const metadata = { ...(args.metadata ?? {}) }
    if (args.idempotency_key) metadata.idempotency_key = args.idempotency_key
    const payload = buildEventPayload({
      inspection_id: inspectionId,
      tenant_id: tenantId,
      user_id: userId,
      actor_id: args.actor_id || userId,
      actor_type: args.actor_type ?? 'user',
      event_type: args.event_type,
      ip: args.ip ?? null,
      user_agent: args.user_agent ?? clientUserAgent(),
      device_id: args.device_id ?? null,
      metadata,
      previous_event_hash: previous,
    })
    const event_hash = await computeEventHash(payload)
    const row: AuditLogRow = { ...payload, event_hash }

    const { error } = await supabase.from('audit_log').insert(row)
    if (error) return null
    return row
  } catch {
    return null
  }
}

/** List events for an inspection, oldest first (Timeline / FASE 10). */
export async function listAuditEventsByInspection(
  inspectionId: string,
): Promise<AuditLogRow[]> {
  if (!supabaseEnabled || !supabase || !inspectionId) return []
  try {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('inspection_id', inspectionId)
      .order('timestamp', { ascending: true })
      .order('event_id', { ascending: true })
    if (error || !data) return []
    return data as AuditLogRow[]
  } catch {
    return []
  }
}
