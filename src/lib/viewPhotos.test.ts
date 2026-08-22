import { describe, expect, it } from 'vitest'
import type { VehicleInfo } from '@/src/types'
import { countFilledViewPhotos, hasAllViewPhotos, missingViewPhotos } from './viewPhotos'

const base = {
  owner: '',
  phone: '',
  brand: '',
  plate: '' as VehicleInfo['plate'],
  generalNotes: '',
  interiorNotes: '',
  interiorPhotos: [],
  interiorPhotoNotes: [],
  profile: '' as const,
  ref: '',
  color: '',
  vehicleTypeDesc: '',
  city: '',
  state: '',
} satisfies VehicleInfo

describe('viewPhotos helpers', () => {
  it('counts filled slots', () => {
    expect(countFilledViewPhotos(base)).toBe(0)
    expect(
      countFilledViewPhotos({
        ...base,
        viewPhotos: { frontal: 'blob:1', traseira: 'blob:2' },
      }),
    ).toBe(2)
  })

  it('requires all four sides', () => {
    expect(hasAllViewPhotos(base)).toBe(false)
    expect(
      hasAllViewPhotos({
        ...base,
        viewPhotos: {
          'lateral-left': 'a',
          frontal: 'b',
          'lateral-right': 'c',
          traseira: 'd',
        },
      }),
    ).toBe(true)
  })

  it('lists missing views', () => {
    expect(missingViewPhotos({ ...base, viewPhotos: { frontal: 'x' } })).toEqual([
      'lateral-left',
      'lateral-right',
      'traseira',
    ])
  })
})
