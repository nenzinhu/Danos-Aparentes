import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const getUserFromRequest = vi.fn()

vi.mock('@/src/lib/server/auth', () => ({
  getUserFromRequest: (...args: unknown[]) => getUserFromRequest(...args),
}))

// supabaseAdmin mockado como null: os caminhos com backend exigiriam
// mockar o client encadeado; aqui cobrimos o fail-open crítico.
vi.mock('@/src/lib/server/supabaseAdmin', () => ({
  supabaseAdmin: null,
}))

import { POST } from './route'

function makeRequest(): NextRequest {
  return {} as unknown as NextRequest
}

describe('POST /api/report-quota', () => {
  beforeEach(() => {
    getUserFromRequest.mockReset()
  })

  it('retorna 401 quando não há usuário', async () => {
    getUserFromRequest.mockResolvedValue(null)
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('Não autenticado')
  })

  it('retorna 500 quando o Supabase não está configurado', async () => {
    getUserFromRequest.mockResolvedValue({ id: 'u1' })
    const res = await POST(makeRequest())
    expect(res.status).toBe(500)
  })
})
