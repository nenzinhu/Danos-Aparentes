import { describe, expect, it } from 'vitest'
import {
  asDamageId,
  decideMergeWinner,
  mergeInspectionReports,
} from '../mergePolicy'
import type { Damage, SavedReport } from '../../../types'

describe('decideMergeWinner', () => {
  it('usa merge semântico entre drafts/completos (não LWW puro)', () => {
    expect(decideMergeWinner(
      { savedAt: 1000, status: 'complete' },
      { savedAt: 2000, status: 'complete' },
    )).toBe('merge-and-push')

    expect(decideMergeWinner(
      { savedAt: 3000, status: 'draft' },
      { savedAt: 1000, status: 'complete' },
    )).toBe('merge-and-push')
  })

  it('protege laudo local emitido contra remoto unlocked mais novo', () => {
    expect(decideMergeWinner(
      { savedAt: 1000, status: 'issued' },
      { savedAt: 9000, status: 'complete' },
    )).toBe('keep-local-and-push')
  })

  it('aceita remoto emitido quando o local ainda é draft', () => {
    expect(decideMergeWinner(
      { savedAt: 5000, status: 'draft' },
      { savedAt: 1000, status: 'issued' },
    )).toBe('take-remote')
  })

  it('entre dois locked usa last-write-wins (issued → superseded)', () => {
    expect(decideMergeWinner(
      { savedAt: 1000, status: 'issued' },
      { savedAt: 2000, status: 'superseded' },
    )).toBe('take-remote')

    expect(decideMergeWinner(
      { savedAt: 3000, status: 'issued' },
      { savedAt: 1000, status: 'cancelled' },
    )).toBe('keep-local-and-push')
  })
})

function makeDamage(partial: Partial<Damage> & { id: string }): Damage {
  return {
    vehicle: 'car',
    view: 'frontal',
    partId: partial.partId || 'hood',
    partName: partial.partName || 'Capô',
    type: partial.type || 'dent',
    typeName: partial.typeName || 'Amassado',
    severity: partial.severity || 'low',
    notes: partial.notes || '',
    photos: partial.photos || [],
    photoNotes: partial.photoNotes || [],
    ...partial,
    id: asDamageId(partial.id),
  }
}

function makeReport(overrides: Partial<SavedReport> = {}): SavedReport {
  return {
    id: 'r1',
    savedAt: 1000,
    damages: [],
    vehicleType: 'car',
    status: 'complete',
    vehicleInfo: {
      owner: 'A',
      phone: '',
      brand: 'Fiat',
      plate: 'ABC1D23' as SavedReport['vehicleInfo']['plate'],
      generalNotes: '',
      profile: 'oficina',
      ref: 'OS-1',
      color: '',
      interiorNotes: '',
      interiorPhotos: [],
      interiorPhotoNotes: [],
      vehicleTypeDesc: '',
      city: '',
      state: '',
    },
    ...overrides,
  }
}

describe('mergeInspectionReports', () => {
  it('une danos distintos de dois dispositivos', () => {
    const local = makeReport({
      savedAt: 1000,
      damages: [makeDamage({ id: 'd1', partId: 'hood' })],
    })
    const remote = makeReport({
      savedAt: 2000,
      damages: [makeDamage({ id: 'd2', partId: 'door-l', view: 'lateral-left' })],
    })
    const { report, stats } = mergeInspectionReports(local, remote)
    expect(report.damages).toHaveLength(2)
    expect(stats.damagesFromLocalOnly).toBe(1)
    expect(stats.damagesFromRemoteOnly).toBe(1)
    expect(stats.multiContributor).toBe(true)
    expect(stats.needsPush).toBe(true)
    expect(report.savedAt).toBe(2000)
  })

  it('deduplica pela mesma identity (view+part+type) com ids diferentes', () => {
    const local = makeReport({
      damages: [makeDamage({ id: 'd1', photos: ['blob:a'], notes: 'local' })],
    })
    const remote = makeReport({
      savedAt: 2000,
      damages: [makeDamage({ id: 'd2', photos: ['blob:b'], notes: 'remoto' })],
    })
    const { report, stats } = mergeInspectionReports(local, remote)
    expect(report.damages).toHaveLength(1)
    expect(report.damages[0].photos).toEqual(expect.arrayContaining(['blob:a', 'blob:b']))
    expect(report.damages[0].notes).toContain('local')
    expect(report.damages[0].notes).toContain('remoto')
    expect(stats.damagesMerged).toBe(1)
  })

  it('em divergência de placa usa o lado mais novo e registra', () => {
    const local = makeReport({
      savedAt: 3000,
      vehicleInfo: { ...makeReport().vehicleInfo, plate: 'NEW1234' as SavedReport['vehicleInfo']['plate'] },
    })
    const remote = makeReport({
      savedAt: 1000,
      vehicleInfo: { ...makeReport().vehicleInfo, plate: 'OLD1234' as SavedReport['vehicleInfo']['plate'] },
    })
    const { report, stats } = mergeInspectionReports(local, remote)
    expect(report.vehicleInfo.plate).toBe('NEW1234')
    expect(stats.fieldDivergences).toContain('plate')
  })
})
