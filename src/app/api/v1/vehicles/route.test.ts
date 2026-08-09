/**
 * Contrato do /api/v1/vehicles (superfície pública versionada).
 *
 * POST — validação de borda:
 *  1. `plate` só era checado com `!plate`, então "   " (espaços) passava e
 *     gravava um veículo com plate="" após a normalização.
 *  2. `year` usava `Number(year)` sem checagem, então "abc" virava NaN e o
 *     Postgres/JSON serializava como null silenciosamente.
 *
 * GET — exposição e volume:
 *  3. `select('*')` devolvia toda coluna da tabela, incluindo `user_id`
 *     (UUID de auth.users) e `tenant_id` — detalhe interno que vazava para
 *     o integrador e viraria contrato de facto (Hyrum's Law).
 *  4. Sem paginação: retornava o tenant inteiro numa resposta só.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockFrom, state } = vi.hoisted(() => {
  const state = {
    upserted: null as null | Record<string, unknown>,
    selectedColumns: null as null | string,
    range: null as null | { from: number; to: number },
    rows: [] as Record<string, unknown>[],
    count: 0,
  }

  const mockFrom = vi.fn((table: string) => {
    if (table === 'vehicles') {
      // Projeta as colunas pedidas, como o Postgres faria — assim o teste
      // valida o SELECT do route, e não a complacência do mock.
      const project = (rows: Record<string, unknown>[]) => {
        const cols = (state.selectedColumns || '')
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
        if (cols.length === 0 || cols.includes('*')) return rows
        return rows.map((row) =>
          Object.fromEntries(
            Object.entries(row).filter(([k]) => cols.includes(k)),
          ),
        )
      }
      const result = () => ({
        data: project(state.rows),
        error: null,
        count: state.count,
      })
      const builder: Record<string, unknown> = {
        eq: () => builder,
        order: () => builder,
        range: (from: number, to: number) => {
          state.range = { from, to }
          return builder
        },
        then: (resolve: (v: unknown) => unknown) => resolve(result()),
      }
      return {
        select: (cols: string) => {
          state.selectedColumns = cols
          return builder
        },
        upsert: (row: Record<string, unknown>) => ({
          select: () => ({
            single: async () => {
              state.upserted = row
              return { data: { id: 'veh-1', ...row }, error: null }
            },
          }),
        }),
      }
    }
    return {
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
      }),
    }
  })

  return { mockFrom, state }
})

vi.mock('@/src/lib/server/supabaseAdmin', () => ({
  supabaseAdmin: { from: mockFrom },
}))

vi.mock('@/src/lib/server/apiKeyAuth', () => ({
  validateApiKeyHeader: vi.fn(),
}))

import { validateApiKeyHeader } from '@/src/lib/server/apiKeyAuth'
import { GET, POST } from './route'

const COMPANY = 'company-1'

function post(body: unknown) {
  return new Request('http://localhost/api/v1/vehicles', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer da_live_test',
    },
    body: JSON.stringify(body),
  })
}

function get(qs = '') {
  return new Request('http://localhost/api/v1/vehicles' + qs, {
    method: 'GET',
    headers: { Authorization: 'Bearer da_live_test' },
  })
}

describe('POST /api/v1/vehicles — validação de borda', () => {
  beforeEach(() => {
    state.upserted = null
    vi.mocked(validateApiKeyHeader).mockResolvedValue({
      companyId: COMPANY,
      scopes: ['read', 'write'],
    } as Awaited<ReturnType<typeof validateApiKeyHeader>>)
  })

  it('rejeita plate composta só de espaços em vez de gravar plate vazia', async () => {
    const res = await POST(post({ plate: '   ' }))

    expect(res.status).toBe(400)
    expect(state.upserted).toBeNull()
  })

  it('rejeita plate que normaliza para vazio (só símbolos)', async () => {
    const res = await POST(post({ plate: '---' }))

    expect(res.status).toBe(400)
    expect(state.upserted).toBeNull()
  })

  it('rejeita year não numérico em vez de gravar NaN', async () => {
    const res = await POST(post({ plate: 'ABC1D23', year: 'abc' }))

    expect(res.status).toBe(400)
    expect(state.upserted).toBeNull()
  })

  it('aceita payload válido e normaliza a placa', async () => {
    const res = await POST(post({ plate: 'abc-1d23', year: '2020' }))

    expect(res.status).toBe(201)
    expect(state.upserted).toMatchObject({
      plate: 'ABC1D23',
      year: 2020,
      tenant_id: COMPANY,
    })
  })

  it('aceita veículo sem year (campo opcional continua opcional)', async () => {
    const res = await POST(post({ plate: 'XYZ9K88' }))

    expect(res.status).toBe(201)
    expect(state.upserted).toMatchObject({ plate: 'XYZ9K88', year: null })
  })
})

describe('GET /api/v1/vehicles — exposição e paginação', () => {
  beforeEach(() => {
    state.selectedColumns = null
    state.range = null
    state.rows = []
    state.count = 0
    vi.mocked(validateApiKeyHeader).mockResolvedValue({
      companyId: COMPANY,
      scopes: ['read', 'write'],
    } as Awaited<ReturnType<typeof validateApiKeyHeader>>)
  })

  it('não usa select(*) — colunas internas não vazam', async () => {
    await GET(get())

    expect(state.selectedColumns).not.toBe('*')
    expect(state.selectedColumns).toBeTruthy()
    expect(state.selectedColumns).not.toContain('user_id')
    expect(state.selectedColumns).not.toContain('tenant_id')
  })

  it('não devolve user_id nem tenant_id no corpo da resposta', async () => {
    state.rows = [
      { id: 'veh-1', plate: 'ABC1D23', user_id: 'secret-user', tenant_id: COMPANY },
    ]
    state.count = 1

    const res = await GET(get())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(JSON.stringify(body)).not.toContain('secret-user')
    expect(body.vehicles[0]).not.toHaveProperty('user_id')
    expect(body.vehicles[0]).not.toHaveProperty('tenant_id')
  })

  it('aplica paginação com valores padrão', async () => {
    await GET(get())

    expect(state.range).toEqual({ from: 0, to: 49 })
  })

  it('respeita page e pageSize', async () => {
    await GET(get('?page=3&pageSize=10'))

    expect(state.range).toEqual({ from: 20, to: 29 })
  })

  it('limita pageSize ao teto para não permitir dump do tenant', async () => {
    await GET(get('?pageSize=100000'))

    expect(state.range).not.toBeNull()
    const size = state.range!.to - state.range!.from + 1
    expect(size).toBeLessThanOrEqual(200)
  })

  it('ignora page/pageSize inválidos em vez de quebrar', async () => {
    await GET(get('?page=abc&pageSize=-5'))

    expect(state.range).toEqual({ from: 0, to: 49 })
  })

  it('retorna metadados de paginação junto com os dados', async () => {
    state.rows = [{ id: 'veh-1', plate: 'ABC1D23' }]
    state.count = 142

    const res = await GET(get('?page=2&pageSize=20'))
    const body = await res.json()

    expect(body.pagination).toMatchObject({
      page: 2,
      pageSize: 20,
      totalItems: 142,
      totalPages: 8,
    })
  })

  it('mantém a chave vehicles (compatibilidade com consumidores atuais)', async () => {
    state.rows = [{ id: 'veh-1', plate: 'ABC1D23' }]
    state.count = 1

    const res = await GET(get())
    const body = await res.json()

    expect(Array.isArray(body.vehicles)).toBe(true)
    expect(body.vehicles[0].plate).toBe('ABC1D23')
  })
})
