import { describe, expect, it } from 'vitest'
import type { Damage, DamageId, Plate, ReportId, SavedReport, VehicleInfo } from '../../../types'
import {
  IssueBlockedWithoutReviewError,
  ReviewContentStaleError,
  assertCanIssue,
  assertCanMutateInspectionFields,
  buildReviewContentPayload,
  canIssue,
  canMutateInspectionFields,
  clearReview,
  computeReviewContentHash,
  isReviewed,
  markAsReviewed,
} from '../reviewGate'
import { markAsIssued } from '../reportIssuance'

function makeInfo(overrides: Partial<VehicleInfo> = {}): VehicleInfo {
  return {
    owner: 'Maria',
    phone: '',
    brand: 'Fiat',
    plate: 'ABC1D23' as Plate,
    generalNotes: '',
    interiorNotes: '',
    interiorPhotos: [],
    interiorPhotoNotes: [],
    profile: 'oficina',
    ref: 'OS-000123',
    color: '',
    vehicleTypeDesc: '',
    city: '',
    state: '',
    ...overrides,
  }
}

function makeComplete(overrides: Partial<SavedReport> = {}): SavedReport {
  return {
    id: 'insp-1' as ReportId,
    savedAt: 1,
    vehicleInfo: makeInfo(),
    damages: [
      {
        id: 'dmg-1' as DamageId,
        vehicle: 'car',
        view: 'frente',
        partId: 'hood',
        partName: 'Capô',
        type: 'scratch',
        typeName: 'Risco',
        severity: 'low',
        notes: 'leve',
        photos: ['ref:1'],
        photoNotes: [''],
      },
    ] as Damage[],
    vehicleType: 'car',
    status: 'complete',
    laudoVersion: 1,
    ...overrides,
  }
}

describe('isReviewed / mutate freeze', () => {
  it('is not reviewed until reviewedAt is set', () => {
    expect(isReviewed(makeComplete())).toBe(false)
    expect(canMutateInspectionFields(makeComplete())).toBe(true)
  })

  it('freezes vehicle/damage fields after review', () => {
    const reviewed = markAsReviewed(makeComplete(), {
      reviewerId: 'user-1',
      contentHash: 'abc',
      reviewedAt: 100,
    })
    expect(isReviewed(reviewed)).toBe(true)
    expect(canMutateInspectionFields(reviewed)).toBe(false)
    expect(() => assertCanMutateInspectionFields(reviewed)).toThrow(/reabra a revisão/)
  })

  it('clearReview unfreezes fields', () => {
    const reviewed = markAsReviewed(makeComplete(), {
      reviewerId: 'user-1',
      contentHash: 'abc',
      reviewedAt: 100,
    })
    const cleared = clearReview(reviewed)
    expect(isReviewed(cleared)).toBe(false)
    expect(canMutateInspectionFields(cleared)).toBe(true)
    expect(cleared.reviewerId).toBeUndefined()
    expect(cleared.reviewContentHash).toBeUndefined()
  })
})

describe('assertCanIssue gate', () => {
  it('blocks issue without review', () => {
    const report = makeComplete()
    expect(canIssue(report)).toBe(false)
    expect(() => assertCanIssue(report)).toThrow(IssueBlockedWithoutReviewError)
    expect(() => assertCanIssue(report)).toThrow(/revisão humana/)
  })

  it('allows issue after review', async () => {
    const report = makeComplete()
    const hash = await computeReviewContentHash(
      report.vehicleInfo,
      report.damages,
      report.laudoVersion,
    )
    const reviewed = markAsReviewed(report, {
      reviewerId: 'user-1',
      contentHash: hash,
      reviewedAt: 200,
      notes: 'ok',
    })
    expect(reviewed.reviewNotes).toBe('ok')
    expect(canIssue(reviewed, hash)).toBe(true)
    expect(() => assertCanIssue(reviewed, hash)).not.toThrow()
  })

  it('blocks issue when content hash diverges after review', async () => {
    const report = makeComplete()
    const hash = await computeReviewContentHash(
      report.vehicleInfo,
      report.damages,
      report.laudoVersion,
    )
    const reviewed = markAsReviewed(report, {
      reviewerId: 'user-1',
      contentHash: hash,
      reviewedAt: 200,
    })
    const tampered = {
      ...reviewed,
      damages: [
        {
          ...reviewed.damages[0],
          severity: 'high' as const,
        },
      ],
    }
    const newHash = await computeReviewContentHash(
      tampered.vehicleInfo,
      tampered.damages,
      tampered.laudoVersion,
    )
    expect(newHash).not.toBe(hash)
    expect(() => assertCanIssue(tampered, newHash)).toThrow(ReviewContentStaleError)
  })

  it('markAsIssued requires review (cannot complete → issued without gate)', async () => {
    const report = makeComplete()
    expect(() =>
      markAsIssued(report, { hash: 'HASHHASHHASHHASHHASHHASHHASHHASH' }),
    ).toThrow(IssueBlockedWithoutReviewError)

    const contentHash = await computeReviewContentHash(
      report.vehicleInfo,
      report.damages,
      report.laudoVersion,
    )
    const reviewed = markAsReviewed(report, {
      reviewerId: 'user-1',
      contentHash,
      reviewedAt: 300,
    })
    const issued = markAsIssued(reviewed, {
      hash: 'HASHHASHHASHHASHHASHHASHHASHHASH',
      issuedAt: 400,
    })
    expect(issued.status).toBe('issued')
    expect(issued.reviewedAt).toBe(300)
    expect(issued.reviewerId).toBe('user-1')
  })
})

describe('buildReviewContentPayload', () => {
  it('is stable for the same snapshot', () => {
    const a = makeComplete()
    const b = makeComplete()
    expect(buildReviewContentPayload(a.vehicleInfo, a.damages, 1)).toBe(
      buildReviewContentPayload(b.vehicleInfo, b.damages, 1),
    )
  })

  it('changes when severity changes', () => {
    const a = makeComplete()
    const b = makeComplete({
      damages: [{ ...a.damages[0], severity: 'high' }],
    })
    expect(buildReviewContentPayload(a.vehicleInfo, a.damages, 1)).not.toBe(
      buildReviewContentPayload(b.vehicleInfo, b.damages, 1),
    )
  })
})
