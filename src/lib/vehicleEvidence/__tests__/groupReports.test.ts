import { describe, expect, it } from 'vitest'
import { groupReportsByVehicle, resolveReportVehicleId } from '../groupReports'
import type { Damage, SavedReport } from '../../../types'

function report(
  id: string,
  plate: string,
  savedAt: number,
  damages: Damage[] = [],
  vehicleId?: string,
): SavedReport {
  return {
    id: id as SavedReport['id'],
    savedAt,
    vehicleId,
    vehicleType: 'car',
    status: 'issued',
    vehicleInfo: {
      owner: '',
      phone: '',
      brand: 'Fiat',
      plate: plate as SavedReport['vehicleInfo']['plate'],
      generalNotes: '',
      interiorNotes: '',
      interiorPhotos: [],
      interiorPhotoNotes: [],
      profile: '',
      ref: '',
      color: 'branco',
      vehicleTypeDesc: '',
      city: '',
      state: '',
    },
    damages,
  }
}

describe('groupReportsByVehicle', () => {
  it('agrupa por placa normalizada quando sem vehicleId', () => {
    const reports = [
      report('a', 'abc-1d23', 100),
      report('b', 'ABC1D23', 200, [
        {
          id: 'd1' as Damage['id'],
          vehicle: 'car',
          view: 'frontal',
          partId: 'bumper-front',
          partName: 'Para-choque',
          type: 'dent',
          typeName: 'Amassado',
          severity: 'low',
          notes: '',
          photos: [],
          photoNotes: [],
        },
      ]),
    ]
    const groups = groupReportsByVehicle(reports, { userId: 'u1' })
    expect(groups).toHaveLength(1)
    expect(groups[0].id).toBe('local:ABC1D23')
    expect(groups[0].reports).toHaveLength(2)
    expect(groups[0].activeDamageCount).toBe(1)
    expect(groups[0].newDamagesOnLast).toBe(1)
  })

  it('respeita vehicleId explícito (mesmo com placas diferentes)', () => {
    const reports = [
      report('a', 'AAA1A11', 100, [], 'veh-1'),
      report('b', 'BBB2B22', 200, [], 'veh-1'),
    ]
    const groups = groupReportsByVehicle(reports)
    expect(groups).toHaveLength(1)
    expect(groups[0].id).toBe('veh-1')
    expect(groups[0].reports).toHaveLength(2)
  })

  it('ignora laudos sem placa válida e sem vehicleId', () => {
    expect(resolveReportVehicleId(report('x', 'AB', 1))).toBeNull()
    expect(groupReportsByVehicle([report('x', 'AB', 1)])).toHaveLength(0)
  })
})
