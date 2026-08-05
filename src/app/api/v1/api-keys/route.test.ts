import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { mockFrom, state } = vi.hoisted(() => {
  const state = {
    sub: null as null | {
      status: string
      plan_tier: string
      trial_ends_at: string | null
      expires_at: string | null
    },
    company: null as null | { id: string; owner_id: string },
    inserted: null as null | Record<string, unknown>,
    keys: [] as Record<string, unknown>[],
  }

  const mockFrom = vi.fn((table: string) => {
    if (table === 'subscriptions') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: state.sub, error: null }),
          }),
        }),
      }
    }
    if (table === 'companies') {
      return {
        select: () => ({
          eq: (_c: string, _v: string) => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: state.company,
                error: null,
              }),
            }),
            maybeSingle: async () => ({
              data: state.company,
              error: null,
            }),
          }),
        }),
      }
    }
    if (table === 'api_keys') {
      return {
        select: () => ({
          eq: () => ({
            order: async () => ({ data: state.keys, error: null }),
          }),
        }),
        insert: (row: Record<string, unknown>) => ({
          select: () => ({
            single: async () => {
              state.inserted = row
              const data = {
                id: 'key-1',
                name: row.name,
                prefix: row.prefix,
                scopes: row.scopes,
                created_at: '2026-08-02T00:00:00.000Z',
              }
              return { data, error: null }
            },
          }),
        }),
      }
    }
    return {
      select: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }
  })

  return { mockFrom, state }
})

vi.mock('@/src/lib/server/supabaseAdmin', () => ({
  supabaseAdmin: { from: mockFrom },
}))

vi.mock('@/src/lib/server/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/lib/server/auth')>()
  return { ...actual, getUserFromRequest: vi.fn() }
})

vi.mock('@/src/lib/server/tenantScope', () => ({
  resolveTenantContextForUser: vi.fn(),
}))

import { getUserFromRequest } from '@/src/lib/server/auth'
import { resolveTenantContextForUser } from '@/src/lib/server/tenantScope'
import { GET, POST } from './route'

const USER = 'owner-1'
const COMPANY = 'company-1'

function req(method: string, url: string, body?: unknown) {
  return new NextRequest(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('GET/POST /api/v1/api-keys', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.sub = null
    state.company = null
    state.inserted = null
    state.keys = []
  })

  it('GET retorna 401 sem autenticação', async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue(null)
    const res = await GET(req('GET', 'http://localhost/api/v1/api-keys'))
    expect(res.status).toBe(401)
  })

  it('POST retorna 401 sem autenticação', async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue(null)
    const res = await POST(
      req('POST', 'http://localhost/api/v1/api-keys', { name: 'Integração' }),
    )
    expect(res.status).toBe(401)
  })

  it('POST retorna 403 se não for corporativo', async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue({ id: USER, email: 'a@b.com' } as never)
    state.sub = {
      status: 'active',
      plan_tier: 'pro',
      trial_ends_at: null,
      expires_at: null,
    }
    const res = await POST(
      req('POST', 'http://localhost/api/v1/api-keys', { name: 'Integração' }),
    )
    expect(res.status).toBe(403)
  })

  it('POST retorna 403 se for inspector (não owner)', async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue({ id: USER, email: 'a@b.com' } as never)
    state.sub = {
      status: 'active',
      plan_tier: 'corporativo',
      trial_ends_at: null,
      expires_at: null,
    }
    vi.mocked(resolveTenantContextForUser).mockResolvedValue({
      role: 'inspector',
      tenantId: COMPANY,
    })
    const res = await POST(
      req('POST', 'http://localhost/api/v1/api-keys', { name: 'Integração' }),
    )
    expect(res.status).toBe(403)
  })

  it('POST cria chave com company/user do servidor (ignora body spoof)', async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue({ id: USER, email: 'a@b.com' } as never)
    state.sub = {
      status: 'active',
      plan_tier: 'corporativo',
      trial_ends_at: null,
      expires_at: null,
    }
    vi.mocked(resolveTenantContextForUser).mockResolvedValue({
      role: 'owner',
      tenantId: COMPANY,
    })
    state.company = { id: COMPANY, owner_id: USER }

    const res = await POST(
      req('POST', 'http://localhost/api/v1/api-keys', {
        name: 'ERP',
        companyId: 'evil-company',
        userId: 'evil-user',
        scopes: ['read', 'admin', 'write'],
      }),
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.secretKey).toMatch(/^da_live_/)
    expect(state.inserted?.company_id).toBe(COMPANY)
    expect(state.inserted?.user_id).toBe(USER)
    expect(state.inserted?.scopes).toEqual(['read', 'write'])
  })

  it('GET lista chaves da empresa do owner autenticado', async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue({ id: USER, email: 'a@b.com' } as never)
    state.sub = {
      status: 'active',
      plan_tier: 'corporativo',
      trial_ends_at: null,
      expires_at: null,
    }
    vi.mocked(resolveTenantContextForUser).mockResolvedValue({
      role: 'owner',
      tenantId: COMPANY,
    })
    state.company = { id: COMPANY, owner_id: USER }
    state.keys = [{ id: 'k1', name: 'ERP', prefix: 'da_live_abc...' }]

    const res = await GET(
      req('GET', 'http://localhost/api/v1/api-keys?companyId=evil-company'),
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.apiKeys).toHaveLength(1)
  })
})
