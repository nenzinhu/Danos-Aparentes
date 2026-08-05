import { describe, expect, it } from 'vitest'
import type { AuditLogRow } from '../auditLog'
import {
  clampAuditDashboardLimit,
  clampAuditDashboardOffset,
  filterAuditRows,
} from '../dashboardQuery'

function row(partial: Partial<AuditLogRow> & { event_id: string }): AuditLogRow {
  return {
    event_id: partial.event_id,
    inspection_id: partial.inspection_id ?? null,
    tenant_id: partial.tenant_id ?? null,
    user_id: partial.user_id ?? 'u1',
    actor_id: partial.actor_id ?? 'u1',
    actor_type: partial.actor_type ?? 'user',
    event_type: partial.event_type ?? 'change',
    timestamp: partial.timestamp ?? '2026-07-27T12:00:00.000Z',
    ip: null,
    user_agent: null,
    device_id: null,
    metadata: partial.metadata ?? {},
    previous_event_hash: partial.previous_event_hash ?? '',
    event_hash: partial.event_hash ?? 'abc',
  }
}

describe('audit dashboard query helpers', () => {
  it('clamps limit and offset', () => {
    expect(clampAuditDashboardLimit(999)).toBe(100)
    expect(clampAuditDashboardLimit(0)).toBe(50)
    expect(clampAuditDashboardOffset(-3)).toBe(0)
  })

  it('filters by inspection and event type with pagination', () => {
    const rows = [
      row({ event_id: '1', inspection_id: 'insp-a', event_type: 'issuance' }),
      row({ event_id: '2', inspection_id: 'insp-a', event_type: 'verification' }),
      row({ event_id: '3', inspection_id: 'insp-b', event_type: 'issuance' }),
    ]
    const filtered = filterAuditRows(rows, {
      inspectionId: 'insp-a',
      eventType: 'verification',
      limit: 10,
    })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].event_id).toBe('2')
  })
})
