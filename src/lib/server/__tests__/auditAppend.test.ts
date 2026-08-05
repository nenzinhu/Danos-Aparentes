import { beforeEach, describe, expect, it, vi } from 'vitest'

const insertMock = vi.fn(async () => ({ error: null }))
const maybeSingleMock = vi.fn(async () => ({ data: null }))

vi.mock('../supabaseAdmin', () => ({
  supabaseAdmin: {
    from: (table: string) => {
      if (table !== 'audit_log') throw new Error(`unexpected ${table}`)
      const terminal = {
        order: () => terminal,
        limit: () => terminal,
        maybeSingle: maybeSingleMock,
        contains: () => terminal,
        eq: () => terminal,
        is: () => terminal,
      }
      return {
        insert: insertMock,
        select: () => terminal,
      }
    },
  },
}))

describe('appendAuditEventAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    maybeSingleMock.mockResolvedValue({ data: null })
  })

  it('appends verification event with service actor', async () => {
    const { appendAuditEventAdmin } = await import('../auditAppend')
    const row = await appendAuditEventAdmin({
      user_id: 'owner-1',
      tenant_id: 'tenant-1',
      inspection_id: 'insp-9',
      event_type: 'verification',
      actor_type: 'service',
      metadata: { outcome: 'integrity_confirmed', hash: 'ABCD' },
      idempotency_key: 'verify:ABCD:integrity_confirmed:lookup',
    })
    expect(row).not.toBeNull()
    expect(row!.event_type).toBe('verification')
    expect(row!.actor_type).toBe('service')
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'owner-1',
        tenant_id: 'tenant-1',
        inspection_id: 'insp-9',
        event_type: 'verification',
      }),
    )
  })
})
