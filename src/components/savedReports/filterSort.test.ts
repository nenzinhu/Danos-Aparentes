import { describe, expect, it } from 'vitest'
import type { SavedReport } from '../../types'
import {
  cloudStateOf,
  dateBucket,
  filterReports,
  groupReportsByDate,
  sortReports,
} from './filterSort'

function makeReport(overrides: Partial<SavedReport> & { id: string }): SavedReport {
  return {
    savedAt: 1_700_000_000_000,
    damages: [],
    vehicleType: 'car',
    vehicleInfo: {
      owner: 'Ana', phone: '', brand: 'VW', plate: 'ABC1D23', generalNotes: '',
      profile: '', ref: 'OS-1', color: '', interiorNotes: '', interiorPhotos: [],
      interiorPhotoNotes: [], vehicleTypeDesc: '', city: '', state: '',
    },
    ...overrides,
  } as SavedReport
}

describe('savedReports/filterSort', () => {
  it('cloudStateOf distingue pending/cloud/local', () => {
    expect(cloudStateOf('r1', new Set(['r1']), true)).toBe('pending')
    expect(cloudStateOf('r1', new Set(), true)).toBe('cloud')
    expect(cloudStateOf('r1', new Set(), false)).toBe('local')
  })

  it('filterReports busca por placa/dono e filtro draft', () => {
    const saved = [
      makeReport({ id: '1', status: 'draft', vehicleInfo: { ...makeReport({ id: 'x' }).vehicleInfo, owner: 'Bruno', plate: 'XYZ9A87' } }),
      makeReport({ id: '2', status: 'issued' }),
    ]
    const byPlate = filterReports(saved, {
      workflowFilter: 'all',
      searchQuery: 'xyz',
      cloudStateOf: () => 'cloud',
    })
    expect(byPlate).toHaveLength(1)
    expect(byPlate[0].id).toBe('1')

    const drafts = filterReports(saved, {
      workflowFilter: 'draft',
      searchQuery: '',
      cloudStateOf: () => 'cloud',
    })
    expect(drafts.map(r => r.id)).toEqual(['1'])
  })

  it('sortReports e groupReportsByDate', () => {
    const a = makeReport({ id: 'a', savedAt: 100, vehicleInfo: { ...makeReport({ id: 'x' }).vehicleInfo, owner: 'Zoe' } })
    const b = makeReport({ id: 'b', savedAt: 200, vehicleInfo: { ...makeReport({ id: 'y' }).vehicleInfo, owner: 'Ana' } })
    expect(sortReports([a, b], 'recent').map(r => r.id)).toEqual(['b', 'a'])
    expect(sortReports([a, b], 'owner').map(r => r.id)).toEqual(['b', 'a'])
    expect(groupReportsByDate([a, b], 'owner')).toEqual([{ label: null, items: [a, b] }])
    expect(dateBucket(Date.now())).toBe('Hoje')
  })
})
