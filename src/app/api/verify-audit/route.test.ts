import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const appendAuditEventAdmin = vi.fn()

vi.mock('@/src/lib/server/auditAppend', () => ({
  appendAuditEventAdmin: (...args: unknown[]) => appendAuditEventAdmin(...args),
}))

import { POST } from './route'

function makeRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
  } as unknown as NextRequest
}

describe('POST /api/verify-audit', () => {
  beforeEach(() => {
    appendAuditEventAdmin.mockReset()
  })

  it('retorna 400 para corpo inválido (JSON quebrado)', async () => {
    const req = { json: async () => { throw new Error('bad json') } } as unknown as NextRequest
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Corpo inválido')
  })

  it('retorna 400 quando nem hash nem report_key são enviados', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain('obrigatórios')
  })

  it('registra evento de auditoria com os metadados do QR e responde ok', async () => {
    appendAuditEventAdmin.mockResolvedValue(undefined)
    const res = await POST(makeRequest({
      hash: 'abc123',
      inspection_id: 'insp-1',
      method: 'qr',
    }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })

    expect(appendAuditEventAdmin).toHaveBeenCalledTimes(1)
    const call = appendAuditEventAdmin.mock.calls[0][0] as Record<string, unknown>
    expect(call.event_type).toBe('verify_lookup')
    expect(call.inspection_id).toBe('insp-1')
    expect(call.metadata).toMatchObject({ hash: 'abc123', method: 'qr' })
  })

  it('usa report_key quando hash não é informado', async () => {
    appendAuditEventAdmin.mockResolvedValue(undefined)
    await POST(makeRequest({ report_key: 'rk-9' }))
    const call = appendAuditEventAdmin.mock.calls[0][0] as Record<string, unknown>
    expect(call.metadata).toMatchObject({ report_key: 'rk-9', method: 'qr' })
  })

  it('responde ok mesmo se a auditoria falhar (fail-open)', async () => {
    appendAuditEventAdmin.mockRejectedValue(new Error('db down'))
    const res = await POST(makeRequest({ hash: 'x' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })
})
