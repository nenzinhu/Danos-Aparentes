import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const appendAuditEventAdmin = vi.fn()
const maybeSingle = vi.fn()

vi.mock('@/src/lib/server/auditAppend', () => ({
  appendAuditEventAdmin: (...args: unknown[]) => appendAuditEventAdmin(...args),
}))

vi.mock('@/src/lib/server/rateLimit', () => ({
  checkRateLimit: async () => ({ allowed: true, retryAfterSec: 0 }),
}))

vi.mock('@/src/lib/server/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => maybeSingle(),
        }),
      }),
    }),
  },
}))

import { POST } from './route'

function makeRequest(body: unknown): NextRequest {
  return {
    headers: { get: () => null },
    json: async () => body,
  } as unknown as NextRequest
}

describe('POST /api/verify-audit', () => {
  beforeEach(() => {
    appendAuditEventAdmin.mockReset()
    maybeSingle.mockReset()
  })

  it('retorna 400 para corpo inválido (JSON quebrado)', async () => {
    const req = { headers: { get: () => null }, json: async () => { throw new Error('bad json') } } as unknown as NextRequest
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('JSON inválido')
  })

  it('retorna 400 para hash ausente/curto', async () => {
    const res = await POST(makeRequest({ hash: 'abc', outcome: 'integrity_confirmed' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Hash inválido')
  })

  it('retorna 400 para outcome fora da lista permitida', async () => {
    const res = await POST(makeRequest({ hash: 'A'.repeat(64), outcome: 'qualquer' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Outcome inválido')
  })

  it('fail-open (skipped) quando não há dono para o hash', async () => {
    maybeSingle.mockResolvedValue({ data: null })
    const res = await POST(makeRequest({ hash: 'A'.repeat(64), outcome: 'not_found' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, skipped: 'no_owner' })
    expect(appendAuditEventAdmin).not.toHaveBeenCalled()
  })

  it('registra evento de verificação com idempotência por hash+outcome+method', async () => {
    maybeSingle.mockResolvedValue({ data: { user_id: 'u1', tenant_id: 't1', inspection_id: 'insp-9' } })
    appendAuditEventAdmin.mockResolvedValue({ id: 'evt-1' })
    const res = await POST(makeRequest({
      hash: 'a'.repeat(64),
      outcome: 'integrity_confirmed',
      method: 'qr',
    }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, logged: true })

    const call = appendAuditEventAdmin.mock.calls[0][0] as Record<string, unknown>
    expect(call.user_id).toBe('u1')
    expect(call.event_type).toBe('verification')
    expect(call.idempotency_key).toBe(`verify:${'A'.repeat(64)}:integrity_confirmed:qr`)
    expect(call.metadata).toMatchObject({ outcome: 'integrity_confirmed', method: 'qr' })
  })
})
