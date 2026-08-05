/**
 * FASE 18 — server-side audit append (public verify, webhooks).
 * Uses service role; never throws to callers.
 */

import {
  buildEventPayload,
  computeEventHash,
  type AuditLogRow,
} from '../audit/auditLog'
import { supabaseAdmin } from './supabaseAdmin'

export type AppendAuditEventAdminArgs = {
  user_id: string
  event_type: string
  inspection_id?: string | null
  tenant_id?: string | null
  metadata?: Record<string, unknown>
  actor_type?: 'user' | 'system' | 'service'
  actor_id?: string
  idempotency_key?: string
}

async function fetchPreviousEventHashAdmin(inspectionId: string | null): Promise<string> {
  if (!supabaseAdmin) return ''
  let q = supabaseAdmin.from('audit_log').select('event_hash')
  q = inspectionId ? q.eq('inspection_id', inspectionId) : q.is('inspection_id', null)
  const { data } = await q
    .order('timestamp', { ascending: false })
    .order('event_id', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.event_hash as string | undefined) || ''
}

async function auditIdempotencyKeyExistsAdmin(
  inspectionId: string | null,
  idempotencyKey: string,
): Promise<boolean> {
  if (!supabaseAdmin) return false
  let q = supabaseAdmin
    .from('audit_log')
    .select('event_id')
    .contains('metadata', { idempotency_key: idempotencyKey })
    .limit(1)
  q = inspectionId ? q.eq('inspection_id', inspectionId) : q.is('inspection_id', null)
  const { data } = await q.maybeSingle()
  return Boolean(data?.event_id)
}

export async function appendAuditEventAdmin(
  args: AppendAuditEventAdminArgs,
): Promise<AuditLogRow | null> {
  if (!supabaseAdmin || !args.user_id) return null
  try {
    const inspectionId = args.inspection_id ?? null
    if (args.idempotency_key) {
      const dup = await auditIdempotencyKeyExistsAdmin(inspectionId, args.idempotency_key)
      if (dup) return null
    }
    const metadata = { ...(args.metadata ?? {}) }
    if (args.idempotency_key) metadata.idempotency_key = args.idempotency_key
    const previous = await fetchPreviousEventHashAdmin(inspectionId)
    const payload = buildEventPayload({
      inspection_id: inspectionId,
      tenant_id: args.tenant_id ?? null,
      user_id: args.user_id,
      actor_id: args.actor_id || 'public-verify',
      actor_type: args.actor_type ?? 'service',
      event_type: args.event_type,
      metadata,
      previous_event_hash: previous,
    })
    const event_hash = await computeEventHash(payload)
    const row: AuditLogRow = { ...payload, event_hash }
    const { error } = await supabaseAdmin.from('audit_log').insert(row)
    if (error) return null
    return row
  } catch {
    return null
  }
}
