import { describe, expect, it } from 'vitest'
import { shouldWriteRemoteOverLocal } from '../hydrateVehicleReports'
import type { SavedReport } from '../../../types'

function report(id: string, savedAt: number): SavedReport {
  return {
    id: id as SavedReport['id'],
    savedAt,
    vehicleType: 'car',
    status: 'issued',
    vehicleInfo: {
      owner: '',
      phone: '',
      brand: '',
      plate: 'ABC1D23' as SavedReport['vehicleInfo']['plate'],
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

describe('hydrateVehicleReports (FASE 22)', () => {
  it('escreve remoto quando não há local', () => {
    expect(shouldWriteRemoteOverLocal(undefined, report('a', 10))).toBe(true)
  })

  it('escreve remoto quando savedAt remoto é maior (LWW)', () => {
    expect(shouldWriteRemoteOverLocal(report('a', 10), report('a', 20))).toBe(true)
  })

  it('preserva local mais recente — não sobrescreve', () => {
    expect(shouldWriteRemoteOverLocal(report('a', 30), report('a', 20))).toBe(false)
  })

  it('empate de savedAt — mantém local (sem push)', () => {
    expect(shouldWriteRemoteOverLocal(report('a', 10), report('a', 10))).toBe(false)
  })
})
