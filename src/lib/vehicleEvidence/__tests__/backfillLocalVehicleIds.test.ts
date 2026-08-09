import { describe, expect, it } from 'vitest'
import { backfillLocalVehicleIds } from '../backfillLocalVehicleIds'
import type { SavedReport } from '../../../types'

function report(id: string, plate: string, vehicleId?: string): SavedReport {
  return {
    id: id as SavedReport['id'],
    savedAt: 1,
    vehicleId,
    vehicleInfo: {
      owner: '',
      phone: '',
      brand: '',
      plate: plate as SavedReport['vehicleInfo']['plate'],
      generalNotes: '',
      interiorNotes: '',
      interiorPhotos: [],
      interiorPhotoNotes: [],
      profile: '',
      ref: '',
      color: '',
      vehicleTypeDesc: '',
      city: '',
      state: '',
    },
    damages: [],
  }
}

describe('backfillLocalVehicleIds (FASE 13)', () => {
  it('unifica laudos da mesma placa sob um vehicleId', () => {
    const { updated, changedCount } = backfillLocalVehicleIds([
      report('a', 'ABC1D23'),
      report('b', 'abc-1d23'),
      report('c', 'XYZ9K88'),
    ])
    expect(changedCount).toBeGreaterThanOrEqual(2)
    const idAb = updated.find((r) => r.id === 'a')?.vehicleId
    const idBb = updated.find((r) => r.id === 'b')?.vehicleId
    expect(idAb).toBeTruthy()
    expect(idAb).toBe(idBb)
    expect(updated.find((r) => r.id === 'c')?.vehicleId).not.toBe(idAb)
  })

  it('preserva vehicleId existente e propaga aos irmãos', () => {
    const { updated } = backfillLocalVehicleIds([
      report('a', 'ABC1D23', 'veh-keep'),
      report('b', 'ABC1D23'),
    ])
    expect(updated.every((r) => r.vehicleId === 'veh-keep')).toBe(true)
  })
})
