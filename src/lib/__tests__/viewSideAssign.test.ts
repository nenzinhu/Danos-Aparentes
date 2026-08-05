import { describe, expect, it } from 'vitest'
import {
  VIEW_FACE_PART_ID,
  buildViewPhotosFromAssignments,
  canConfirmSideAssignments,
  filterDamagesToInvalidateOnViewChange,
  hasDuplicateViews,
  reassignViewPhoto,
} from '../viewSideAssign'
import type { Damage } from '@/src/types'

describe('hasDuplicateViews', () => {
  it('detects duplicates in array form', () => {
    expect(hasDuplicateViews([{ view: 'frontal' }, { view: 'traseira' }])).toBe(false)
    expect(hasDuplicateViews([{ view: 'frontal' }, { view: 'frontal' }])).toBe(true)
  })

  it('detects duplicates in record form', () => {
    expect(hasDuplicateViews({ a: 'frontal', b: 'traseira' })).toBe(false)
    expect(hasDuplicateViews({ a: 'frontal', b: 'frontal' })).toBe(true)
  })
})

describe('buildViewPhotosFromAssignments', () => {
  it('maps photo refs by view', () => {
    expect(
      buildViewPhotosFromAssignments([
        { photoRef: 'blob:1', view: 'frontal' },
        { photoRef: 'blob:2', view: 'traseira' },
      ]),
    ).toEqual({ frontal: 'blob:1', traseira: 'blob:2' })
  })
})

describe('canConfirmSideAssignments', () => {
  it('fails on empty', () => {
    expect(canConfirmSideAssignments([])).toEqual({
      ok: false,
      reason: 'Adicione pelo menos uma foto.',
    })
  })

  it('fails on missing view', () => {
    const r = canConfirmSideAssignments([
      { photoRef: 'blob:1', view: undefined as unknown as 'frontal' },
    ])
    expect(r.ok).toBe(false)
  })

  it('fails on duplicates', () => {
    const r = canConfirmSideAssignments([
      { photoRef: 'blob:1', view: 'frontal' },
      { photoRef: 'blob:2', view: 'frontal' },
    ])
    expect(r).toEqual({ ok: false, reason: 'Cada lado só pode ser usado uma vez.' })
  })

  it('ok for four unique views', () => {
    expect(
      canConfirmSideAssignments([
        { photoRef: 'a', view: 'lateral-left' },
        { photoRef: 'b', view: 'frontal' },
        { photoRef: 'c', view: 'lateral-right' },
        { photoRef: 'd', view: 'traseira' },
      ]),
    ).toEqual({ ok: true })
  })
})

describe('filterDamagesToInvalidateOnViewChange', () => {
  const base = {
    id: '1' as Damage['id'],
    vehicle: 'car' as const,
    type: 'dent' as const,
    typeName: 'Amassado',
    severity: 'low' as const,
    notes: '',
    photos: ['blob:x'],
    photoNotes: [],
    partName: 'Frontal',
  }

  it('returns sugerido view-face damages for that view', () => {
    const damages: Damage[] = [
      {
        ...base,
        view: 'frontal',
        partId: VIEW_FACE_PART_ID,
        evidenceStatus: 'sugerido',
      },
      {
        ...base,
        id: '2' as Damage['id'],
        view: 'frontal',
        partId: 'door',
        evidenceStatus: 'sugerido',
      },
      {
        ...base,
        id: '3' as Damage['id'],
        view: 'frontal',
        partId: VIEW_FACE_PART_ID,
        evidenceStatus: 'confirmado',
      },
    ]
    expect(filterDamagesToInvalidateOnViewChange(damages, { view: 'frontal' }).map((d) => d.id)).toEqual([
      '1',
    ])
  })
})

describe('reassignViewPhoto', () => {
  it('moves photo and swaps when destination occupied', () => {
    expect(
      reassignViewPhoto({ frontal: 'a', traseira: 'b' }, 'frontal', 'lateral-left'),
    ).toEqual({ traseira: 'b', 'lateral-left': 'a' })

    expect(
      reassignViewPhoto({ frontal: 'a', 'lateral-left': 'b' }, 'frontal', 'lateral-left'),
    ).toEqual({ frontal: 'b', 'lateral-left': 'a' })
  })
})
