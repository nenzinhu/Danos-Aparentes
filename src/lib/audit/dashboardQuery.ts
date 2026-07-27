/**
 * FASE 16 — pure helpers for org-wide audit dashboard filters.
 */

import type { AuditLogRow } from './auditLog'

export type AuditDashboardFilters = {
  inspectionId?: string
  eventType?: string
  limit?: number
  offset?: number
}

export const AUDIT_DASHBOARD_DEFAULT_LIMIT = 50
export const AUDIT_DASHBOARD_MAX_LIMIT = 100

export function clampAuditDashboardLimit(raw?: number): number {
  if (!raw || !Number.isFinite(raw)) return AUDIT_DASHBOARD_DEFAULT_LIMIT
  return Math.min(AUDIT_DASHBOARD_MAX_LIMIT, Math.max(1, Math.floor(raw)))
}

export function clampAuditDashboardOffset(raw?: number): number {
  if (!raw || !Number.isFinite(raw)) return 0
  return Math.max(0, Math.floor(raw))
}

/** Client-side filter when rows are already tenant/user scoped. */
export function filterAuditRows(
  rows: AuditLogRow[],
  filters: AuditDashboardFilters,
): AuditLogRow[] {
  let out = rows
  const inspectionId = filters.inspectionId?.trim()
  const eventType = filters.eventType?.trim()
  if (inspectionId) {
    out = out.filter((r) => r.inspection_id === inspectionId)
  }
  if (eventType) {
    out = out.filter((r) => r.event_type === eventType)
  }
  const offset = clampAuditDashboardOffset(filters.offset)
  const limit = clampAuditDashboardLimit(filters.limit)
  return out.slice(offset, offset + limit)
}
