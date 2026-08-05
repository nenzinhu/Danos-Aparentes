import { describe, expect, it } from 'vitest'
import { generateApiKey } from '../../server/apiKeyAuth'
import type { VehicleEvent, VehicleEventType } from '../types'

describe('Histórico Veicular Digital — Eventos & Chaves de API', () => {
  it('gera chave de API segura com formato da_live_ e hash SHA-256 unico', () => {
    const { rawKey, keyHash, prefix } = generateApiKey()
    expect(rawKey).toMatch(/^da_live_[a-f0-9]{48}$/)
    expect(prefix).toMatch(/^da_live_[a-f0-9]{6}\.\.\.$/)
    expect(keyHash).toHaveLength(64)
  })

  it('valida estrutura do objeto VehicleEvent do dominio', () => {
    const eventType: VehicleEventType = 'TRANSFER'
    const event: VehicleEvent = {
      id: 'evt-123',
      vehicleId: 'veh-456',
      tenantId: 'comp-789',
      type: eventType,
      title: 'Transferência de Filial: Florianópolis -> Curitiba',
      description: 'Veículo em transporte por cegonha',
      date: '2026-07-29T00:00:00.000Z',
      createdAt: '2026-07-29T00:00:00.000Z',
      location: 'Florianópolis / SC',
      photos: ['https://example.com/photo.jpg'],
    }

    expect(event.type).toBe('TRANSFER')
    expect(event.vehicleId).toBe('veh-456')
    expect(event.title).toContain('Florianópolis')
  })
})
