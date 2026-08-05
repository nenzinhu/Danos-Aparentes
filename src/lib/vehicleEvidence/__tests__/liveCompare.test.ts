import { describe, expect, it } from 'vitest'
import {
  buildLiveComparePreview,
  draftReportFromState,
  findPreviousReportForPlate,
} from '../liveCompare'
import type { Damage, SavedReport } from '../../../types'

function report(id: string, plate: string, savedAt: number, damages: Damage[] = []): SavedReport {
  return {
    id: id as SavedReport['id'],
    savedAt,
    vehicleType: 'car',
    status: 'complete',
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
    damages,
  }
}

const dent: Damage = {
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
}

describe('liveCompare (FASE 10)', () => {
  it('findPreviousReportForPlate pega o mais recente excluindo o ativo', () => {
    const list = [
      report('a', 'ABC1D23', 100),
      report('b', 'ABC1D23', 300),
      report('c', 'ABC1D23', 200),
    ]
    expect(findPreviousReportForPlate(list, 'abc-1d23', 'b')?.id).toBe('c')
    expect(findPreviousReportForPlate(list, 'ABC1D23')?.id).toBe('b')
  })

  it('buildLiveComparePreview detecta novo dano no rascunho', () => {
    const previous = report('prev', 'ABC1D23', 1000, [])
    const current = draftReportFromState({
      vehicleInfo: previous.vehicleInfo,
      damages: [dent],
      vehicleType: 'car',
      activeReportId: 'curr',
    })
    const preview = buildLiveComparePreview({
      previous,
      current,
      userId: 'u1',
    })
    expect(preview).not.toBeNull()
    expect(preview!.result.summary.newDamages).toBe(1)
  })
})
