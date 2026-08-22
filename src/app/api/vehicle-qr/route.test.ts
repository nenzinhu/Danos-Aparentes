import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const getUserFromRequest = vi.fn()

vi.mock('@/src/lib/server/auth', () => ({
  getUserFromRequest: (...args: unknown[]) => getUserFromRequest(...args),
}))

vi.mock('@/src/lib/server/vehicleQr', () => ({
  createVehicleQrToken: (plate: string) => `qr-${plate}`,
}))

import { POST } from './route'

function makeRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
  } as unknown as NextRequest
}

describe('POST /api/vehicle-qr', () => {
  beforeEach(() => {
    getUserFromRequest.mockReset()
  })

  it('retorna 401 quando não autenticado', async () => {
    getUserFromRequest.mockResolvedValue(null)
    const res = await POST(makeRequest({ plate: 'ABC1D23' }))
    expect(res.status).toBe(401)
  })

  it('retorna 400 para corpo inválido', async () => {
    getUserFromRequest.mockResolvedValue({ id: 'u1' })
    const req = { json: async () => { throw new Error('bad') } } as unknown as NextRequest
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando a placa está vazia', async () => {
    getUserFromRequest.mockResolvedValue({ id: 'u1' })
    const res = await POST(makeRequest({ plate: '   ' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Placa obrigatória')
  })

  it('gera token a partir da placa trimada', async () => {
    getUserFromRequest.mockResolvedValue({ id: 'u1' })
    const res = await POST(makeRequest({ plate: ' ABC1D23 ' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ token: 'qr-ABC1D23' })
  })
})
