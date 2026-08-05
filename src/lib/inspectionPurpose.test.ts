import { describe, expect, it } from 'vitest'
import type { SavedReport } from '@/src/types'
import {
  findReportForReturn,
  findReportForReturnByCpf,
  findReportForReturnByPlate,
  findReportForReturnByPublicCode,
  normalizeCpfDigits,
} from './inspectionPurpose'

function report(partial: Partial<SavedReport> & { id: string; savedAt: number }): SavedReport {
  return {
    vehicleInfo: {
      owner: '',
      phone: '',
      brand: '',
      plate: '' as SavedReport['vehicleInfo']['plate'],
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
      cpf: '',
      cnh: '',
      cnhCategory: '',
      customFields: [],
      ...partial.vehicleInfo,
    },
    damages: [],
    ...partial,
  } as SavedReport
}

describe('inspectionPurpose lookup', () => {
  const list = [
    report({
      id: 'a',
      savedAt: 1,
      publicCode: 'DA-2026-AAAAAA',
      vehicleInfo: { plate: 'ABC1D23' as SavedReport['vehicleInfo']['plate'], cpf: '123.456.789-09' },
    }),
    report({
      id: 'b',
      savedAt: 3,
      publicCode: 'DA-2026-BBBBBB-R1',
      vehicleInfo: { plate: 'ABC1D23' as SavedReport['vehicleInfo']['plate'], cpf: '12345678909' },
    }),
    report({
      id: 'c',
      savedAt: 2,
      publicCode: 'DA-2026-CCCCCC',
      vehicleInfo: { plate: 'XYZ9A87' as SavedReport['vehicleInfo']['plate'], cpf: '98765432100' },
    }),
  ]

  it('normaliza CPF', () => {
    expect(normalizeCpfDigits('123.456.789-09')).toBe('12345678909')
  })

  it('busca por placa o mais recente', () => {
    expect(findReportForReturnByPlate(list, 'abc-1d23')?.id).toBe('b')
  })

  it('busca por CPF o mais recente', () => {
    expect(findReportForReturnByCpf(list, '123.456.789-09')?.id).toBe('b')
  })

  it('busca por código do PDF (exato e base)', () => {
    expect(findReportForReturnByPublicCode(list, 'DA-2026-CCCCCC')?.id).toBe('c')
    expect(findReportForReturnByPublicCode(list, 'da-2026-bbbbbb')?.id).toBe('b')
  })

  it('findReportForReturn despacha por kind', () => {
    expect(findReportForReturn(list, 'plate', 'XYZ9A87')?.id).toBe('c')
    expect(findReportForReturn(list, 'cpf', '987.654.321-00')?.id).toBe('c')
    expect(findReportForReturn(list, 'publicCode', 'DA-2026-AAAAAA')?.id).toBe('a')
  })
})
