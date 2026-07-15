import { describe, expect, it } from 'vitest'
import {
  filterByPlate,
  mapOutboundInspection,
  photoRefToPublicUrl,
  sortByUpdatedDesc,
} from './outboundInspections'

describe('outboundInspections', () => {
  const insp = {
    id: 'r1',
    updated_at: 1_700_000_000_000,
    vehicle_type: 'car',
    plate: 'ABC1D23',
    brand: 'Fiat',
    color: 'Prata',
    vehicle_type_desc: 'Automóvel',
    owner: 'Maria',
    phone: '11999999999',
    cpf: '123',
    city: 'SP',
    state: 'SP',
    ref: 'OS-1',
    profile: 'oficina',
    general_notes: 'ok',
    interior_notes: '',
    interior_photos: ['storage:u1/r1/int/1.jpg'],
    inspector_signature: 'data:image/png;base64,xxx',
    client_signature: '',
  }

  const damages = [
    {
      id: 'd1',
      inspection_id: 'r1',
      view: 'frontal',
      part_id: 'capo',
      part_name: 'Capô',
      type: 'dent',
      type_name: 'Amassado',
      severity: 'medium',
      notes: '',
      photos: ['storage:u1/r1/d1/p1.jpg'],
      photo_notes: ['frente'],
    },
  ]

  it('mapeia laudo sem expor assinaturas base64', () => {
    const out = mapOutboundInspection(insp, damages, { includeDamages: true })
    expect(out.id).toBe('r1')
    expect(out.signed_by_inspector).toBe(true)
    expect(out.signed_by_client).toBe(false)
    expect(out.damage_count).toBe(1)
    expect(out.damages?.[0].part_id).toBe('capo')
    expect(JSON.stringify(out)).not.toContain('data:image/png')
  })

  it('omite damages quando includeDamages=false', () => {
    const out = mapOutboundInspection(insp, damages, { includeDamages: false })
    expect(out.damages).toBeUndefined()
    expect(out.damage_count).toBe(1)
  })

  it('filtra e ordena por placa / updated_at', () => {
    const rows = [
      { id: 'a', plate: 'ABC1D23', updated_at: 100 },
      { id: 'b', plate: 'XYZ9A99', updated_at: 300 },
      { id: 'c', plate: 'abc1d23', updated_at: 200 },
    ]
    expect(filterByPlate(rows, 'ABC1D23').map(r => r.id)).toEqual(['a', 'c'])
    expect(sortByUpdatedDesc(rows).map(r => r.id)).toEqual(['b', 'c', 'a'])
  })

  it('converte storage: em URL pública quando Supabase URL existe', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    const url = photoRefToPublicUrl('storage:u1/r1/d1/p1.jpg')
    expect(url).toContain('/storage/v1/object/public/damage-photos/u1/r1/d1/p1.jpg')
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
  })
})
