import { describe, expect, it } from 'vitest'
import { presentAuditEvent, presentAuditTimeline, summarizeMetadata } from '../timelinePresent'
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

  it('describes vehicle QR without dumping JSON or vehicle_id', () => {
    const p = presentAuditEvent(
      row({
        event_type: 'comparison_exported',
        metadata: {
          kind: 'vehicle_qr',
          plate: 'GOL0000',
          vehicle_id: 'f33f60ab-dd31-4407-8cd5-b26343b3fbe2',
        },
      }),
    )
    expect(p.label).toBe('QR do veículo gerado')
    expect(p.detail).toContain('GOL0000')
    expect(p.detail).not.toContain('vehicle_id')
    expect(p.detail).not.toContain('f33f60ab')
    expect(p.detail).not.toMatch(/^\s*\{/)
  })

  it('shows vehicle_id only when showIds is true', () => {
    const meta = {
      kind: 'vehicle_qr',
      plate: 'GOL0000',
      vehicle_id: 'f33f60ab-dd31-4407-8cd5-b26343b3fbe2',
    }
    expect(summarizeMetadata(meta, 'comparison_exported')).not.toContain('f33f60ab')
    expect(summarizeMetadata(meta, 'comparison_exported', { showIds: true })).toContain(
      'vehicle_id: f33f60ab-dd31-4407-8cd5-b26343b3fbe2',
    )
  })

  it('describes hydrate sync in plain language', () => {
    const p = presentAuditEvent(
      row({
        event_type: 'inspection_linked_to_vehicle',
        metadata: {
          kind: 'hydrate_vehicle_reports',
          pulled: 1,
          written: 0,
          vehicle_id: 'f33f60ab-dd31-4407-8cd5-b26343b3fbe2',
        },
      }),
    )
    expect(p.label).toBe('Histórico sincronizado')
    expect(p.detail).toContain('atualizado')
    expect(p.detail).not.toContain('vehicle_id')
  })

  it('describes review_completed without raw JSON', () => {
    const p = presentAuditEvent(
      row({
        event_type: 'review_completed',
        metadata: {
          review_notes: '',
          review_content_hash: 'AB62899E69D32880C7E8DD63A5110B7D',
        },
      }),
    )
    expect(p.label).toBe('Revisão humana concluída')
    expect(p.detail).toBe('Sem observações registradas')
    expect(p.detail).not.toMatch(/\{/)
  })

  it('describes photo_reuse_alert in plain language', () => {
    const p = presentAuditEvent(
      row({
        event_type: 'photo_reuse_alert',
        metadata: {
          kind: 'exact',
          photo_id: 'p1',
          match_photo_id: 'p2',
          match_inspection_id: 'insp-other',
        },
      }),
    )
    expect(p.label).toBe('Alerta: foto reutilizada')
    expect(p.tone).toBe('warn')
    expect(p.detail).toContain('SHA-256')
    expect(p.detail).not.toContain('insp-other')
  })
})
