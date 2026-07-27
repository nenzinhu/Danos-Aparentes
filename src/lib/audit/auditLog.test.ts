import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  buildEventPayload,
  computeEventHash,
  verifyEventChain,
  type AuditLogRow,
} from './auditLog'

describe('buildEventPayload', () => {
  it('fills defaults and preserves previous_event_hash', () => {
    const p = buildEventPayload({
      event_id: 'evt-1',
      user_id: 'user-1',
      actor_id: 'user-1',
      event_type: 'issuance',
      previous_event_hash: '',
      timestamp: '2026-07-27T12:00:00.000Z',
    })
    expect(p.event_id).toBe('evt-1')
    expect(p.inspection_id).toBeNull()
    expect(p.tenant_id).toBeNull()
    expect(p.actor_type).toBe('user')
    expect(p.metadata).toEqual({})
    expect(p.previous_event_hash).toBe('')
    expect(p.ip).toBeNull()
  })
})

describe('computeEventHash + chain', () => {
  it('is deterministic for the same payload', async () => {
    const payload = buildEventPayload({
      event_id: 'evt-a',
      user_id: 'u1',
      actor_id: 'u1',
      event_type: 'hash_generation',
      previous_event_hash: '',
      timestamp: '2026-07-27T12:00:00.000Z',
      metadata: { hash: 'ABC' },
    })
    const h1 = await computeEventHash(payload)
    const h2 = await computeEventHash(payload)
    expect(h1).toBe(h2)
    expect(h1).toMatch(/^[0-9a-f]{64}$/)
  })

  it('links events: second previous_event_hash equals first event_hash', async () => {
    const firstPayload = buildEventPayload({
      event_id: 'evt-1',
      inspection_id: 'insp-1',
      user_id: 'u1',
      actor_id: 'u1',
      event_type: 'hash_generation',
      previous_event_hash: '',
      timestamp: '2026-07-27T12:00:00.000Z',
    })
    const firstHash = await computeEventHash(firstPayload)

    const secondPayload = buildEventPayload({
      event_id: 'evt-2',
      inspection_id: 'insp-1',
      user_id: 'u1',
      actor_id: 'u1',
      event_type: 'issuance',
      previous_event_hash: firstHash,
      timestamp: '2026-07-27T12:01:00.000Z',
    })
    const secondHash = await computeEventHash(secondPayload)

    const chain: AuditLogRow[] = [
      { ...firstPayload, event_hash: firstHash },
      { ...secondPayload, event_hash: secondHash },
    ]
    expect(chain[1].previous_event_hash).toBe(chain[0].event_hash)
    await expect(verifyEventChain(chain)).resolves.toEqual({ ok: true })
  })

  it('detects tampering of a previous event (broken verification)', async () => {
    const e1 = buildEventPayload({
      event_id: 'evt-1',
      inspection_id: 'insp-1',
      user_id: 'u1',
      actor_id: 'u1',
      event_type: 'correction',
      previous_event_hash: '',
      timestamp: '2026-07-27T12:00:00.000Z',
      metadata: { reason: 'typo' },
    })
    const h1 = await computeEventHash(e1)
    const e2 = buildEventPayload({
      event_id: 'evt-2',
      inspection_id: 'insp-1',
      user_id: 'u1',
      actor_id: 'u1',
      event_type: 'issuance',
      previous_event_hash: h1,
      timestamp: '2026-07-27T12:02:00.000Z',
    })
    const h2 = await computeEventHash(e2)

    const tampered: AuditLogRow[] = [
      { ...e1, metadata: { reason: 'TAMPERED' }, event_hash: h1 },
      { ...e2, event_hash: h2 },
    ]
    const result = await verifyEventChain(tampered)
    expect(result.ok).toBe(false)
    expect(result.brokenAt).toBe(0)
    expect(result.reason).toBe('event_hash mismatch')
  })

  it('detects broken previous_event_hash link', async () => {
    const e1 = buildEventPayload({
      event_id: 'evt-1',
      user_id: 'u1',
      actor_id: 'u1',
      event_type: 'change',
      previous_event_hash: '',
      timestamp: '2026-07-27T12:00:00.000Z',
    })
    const h1 = await computeEventHash(e1)
    const e2 = buildEventPayload({
      event_id: 'evt-2',
      user_id: 'u1',
      actor_id: 'u1',
      event_type: 'change',
      previous_event_hash: 'deadbeef',
      timestamp: '2026-07-27T12:01:00.000Z',
    })
    const h2 = await computeEventHash(e2)
    const result = await verifyEventChain([
      { ...e1, event_hash: h1 },
      { ...e2, event_hash: h2 },
    ])
    expect(result.ok).toBe(false)
    expect(result.brokenAt).toBe(1)
    expect(result.reason).toBe('previous_event_hash mismatch')
  })
})

describe('append-only semantics (helpers)', () => {
  it('does not expose an update helper — only append + verify + list', async () => {
    const mod = await import('./auditLog')
    expect(typeof mod.appendAuditEvent).toBe('function')
    expect(typeof mod.listAuditEventsByInspection).toBe('function')
    expect(typeof mod.verifyEventChain).toBe('function')
    expect('updateAuditEvent' in mod).toBe(false)
    expect('deleteAuditEvent' in mod).toBe(false)
  })
})

describe('appendAuditEvent (mocked supabase)', () => {
  const insertMock = vi.fn(async () => ({ error: null }))
  const maybeSingleMock = vi.fn(async () => ({ data: null }))

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.doMock('../supabase', () => ({
      supabaseEnabled: true,
      supabase: {
        auth: { getSession: async () => ({ data: { session: { user: { id: 'user-1' } } } }) },
        from: (table: string) => {
          if (table !== 'audit_log') throw new Error(`unexpected ${table}`)
          const terminal = {
            order: () => terminal,
            limit: () => terminal,
            maybeSingle: maybeSingleMock,
          }
          return {
            insert: insertMock,
            select: () => ({
              eq: () => terminal,
              is: () => terminal,
            }),
          }
        },
      },
    }))
  })

  it('inserts a chained row with empty previous when genesis', async () => {
    const { appendAuditEvent } = await import('./auditLog')
    const row = await appendAuditEvent({
      event_type: 'issuance',
      inspection_id: 'insp-1',
      metadata: { hash: 'ABC' },
    })
    expect(row).not.toBeNull()
    expect(row!.previous_event_hash).toBe('')
    expect(row!.event_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        actor_id: 'user-1',
        event_type: 'issuance',
        inspection_id: 'insp-1',
        previous_event_hash: '',
      }),
    )
  })
})
