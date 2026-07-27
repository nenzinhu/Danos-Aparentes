import { describe, expect, it } from 'vitest'
import { presentAuditEvent, presentAuditTimeline } from '../timelinePresent'
import type { AuditLogRow } from '../auditLog'

function row(partial: Partial<AuditLogRow> & Pick<AuditLogRow, 'event_type'>): AuditLogRow {
  return {
    event_id: partial.event_id || 'e1',
    inspection_id: 'insp-1',
    tenant_id: null,
    user_id: 'u1',
    actor_id: 'u1',
    actor_type: 'user',
    event_type: partial.event_type,
    timestamp: partial.timestamp || '2026-07-27T12:00:00.000Z',
    ip: null,
    user_agent: null,
    device_id: null,
    metadata: partial.metadata || {},
    previous_event_hash: '',
    event_hash: partial.event_hash || 'abcdef0123456789',
  }
}

describe('presentAuditEvent', () => {
  it('maps known types to Portuguese labels', () => {
    const p = presentAuditEvent(row({ event_type: 'issuance' }))
    expect(p.label).toBe('Laudo emitido')
    expect(p.tone).toBe('ok')
    expect(p.eventHashShort).toBe('ABCDEF012345')
  })

  it('masks CPF-like values in metadata detail', () => {
    const p = presentAuditEvent(
      row({
        event_type: 'change',
        metadata: { notes: 'CPF 123.456.789-00' },
      }),
    )
    expect(p.detail).toContain('***.***.***-00')
    expect(p.detail).not.toContain('123.456.789-00')
  })

  it('preserves order in timeline helper', () => {
    const list = presentAuditTimeline([
      row({ event_id: 'a', event_type: 'creation' }),
      row({ event_id: 'b', event_type: 'issuance' }),
    ])
    expect(list.map((x) => x.eventId)).toEqual(['a', 'b'])
  })
})
