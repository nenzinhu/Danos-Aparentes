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

  it('fail-open quando não há usuário (PDF offline sem token)', async () => {
    getUserFromRequest.mockResolvedValue(null)
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ allowed: true })
  })
})
