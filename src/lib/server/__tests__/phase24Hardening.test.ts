import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkLaudoQuota, quotaBlockedMessage } from '@/src/components/reportActions/pdfExport'
import { tenantMatchesRow } from '@/src/lib/server/tenantScope'
import { classifyStripePriceError } from '@/src/lib/server/stripePlans'
import { assertAsaasSafeForProduction, isAsaasSandboxUrl } from '@/src/lib/server/asaasClient'
import { toDbTenantId, toEventsTenantId } from '@/src/lib/vehicleEvidence/vehicleIdentity'
import { asReceiptShape } from './phase24Helpers'

describe('checkLaudoQuota fail-closed', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('bloqueia quando API retorna 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ code: 'quota_rpc_missing' }),
      }),
    )
    const r = await checkLaudoQuota('tok')
    expect(r.allowed).toBe(false)
    expect(r.reason).toBe('quota_rpc_missing')
    expect(quotaBlockedMessage(r)).toMatch(/limite de laudos/i)
  })

  it('permite com 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ allowed: true, limit: 20 }),
      }),
    )
    const r = await checkLaudoQuota('tok')
    expect(r.allowed).toBe(true)
  })
})

describe('tenantMatchesRow', () => {
  it('corp exige tenant_id igual', () => {
    expect(
      tenantMatchesRow({ tenantId: 't1', role: 'owner' }, { tenant_id: 't1', user_id: 'u' }, 'u'),
    ).toBe(true)
    expect(
      tenantMatchesRow({ tenantId: 't1', role: 'owner' }, { tenant_id: 't2', user_id: 'u' }, 'u'),
    ).toBe(false)
  })

  it('solo exige user_id e tenant null', () => {
    expect(
      tenantMatchesRow({ tenantId: null, role: 'solo' }, { tenant_id: null, user_id: 'u1' }, 'u1'),
    ).toBe(true)
    expect(
      tenantMatchesRow({ tenantId: null, role: 'solo' }, { tenant_id: null, user_id: 'u2' }, 'u1'),
    ).toBe(false)
    expect(
      tenantMatchesRow({ tenantId: null, role: 'solo' }, { tenant_id: 't1', user_id: 'u1' }, 'u1'),
    ).toBe(false)
  })
})

describe('tenant id helpers', () => {
  it('toDbTenantId mapeia user: para null', () => {
    expect(toDbTenantId('user:abc')).toBeNull()
    expect(toDbTenantId('uuid-1')).toBe('uuid-1')
  })

  it('toEventsTenantId usa user: para solo', () => {
    expect(toEventsTenantId(null, 'uid')).toBe('user:uid')
    expect(toEventsTenantId('co-1', 'uid')).toBe('co-1')
  })
})

describe('asaas production guard', () => {
  const prev = { ...process.env }
  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = prev.NEXT_PUBLIC_BASE_URL
    process.env.ASAAS_API_URL = prev.ASAAS_API_URL
  })

  it('detecta sandbox', () => {
    expect(isAsaasSandboxUrl('https://api-sandbox.asaas.com')).toBe(true)
    expect(isAsaasSandboxUrl('https://api.asaas.com')).toBe(false)
  })

  it('bloqueia sandbox com BASE_URL prod', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://danosaparentes.com.br'
    process.env.ASAAS_API_URL = 'https://api-sandbox.asaas.com'
    expect(assertAsaasSafeForProduction()).toMatch(/sandbox/i)
  })
})

describe('classifyStripePriceError', () => {
  it('classifica mismatch', () => {
    expect(
      classifyStripePriceError(
        new Error('exists in test mode, but a live mode key was used'),
      ),
    ).toBe('test_live_mismatch')
  })
})

describe('public receipt shape', () => {
  it('exige hash', () => {
    expect(asReceiptShape({ hash: 'ABC' })).toBe(true)
    expect(asReceiptShape({})).toBe(false)
  })
})
