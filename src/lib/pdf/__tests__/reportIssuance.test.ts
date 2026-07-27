import { describe, expect, it } from 'vitest'
import type { Damage, DamageId, Plate, ReportId, SavedReport, VehicleInfo } from '../../../types'
import { buildReportKey } from '../hash'
import {
  assertCanSaveInspection,
  canMutateInspectionContent,
  createCorrectionDraft,
  deriveBasePublicCode,
  formatPublicCode,
  isIssuedLocked,
  markAsIssued,
  markAsSuperseded,
  nextLaudoVersion,
  stripRevisionSuffix,
} from '../reportIssuance'

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

function makeIssued(overrides: Partial<SavedReport> = {}): SavedReport {
  return {
    id: 'insp-original' as ReportId,
    savedAt: Date.UTC(2026, 0, 15),
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
        photos: ['data:image/png;base64,AAA'],
        photoNotes: [''],
      },
    ],
    vehicleType: 'car',
    status: 'issued',
    publicCode: 'DA-2026-ABCDEF',
    laudoVersion: 1,
    issuedHash: 'ABCDEF1234567890ABCDEF1234567890',
    ...overrides,
  }
}

describe('isIssuedLocked / canMutateInspectionContent', () => {
  it('locks issued, superseded and cancelled', () => {
    expect(isIssuedLocked('issued')).toBe(true)
    expect(isIssuedLocked('superseded')).toBe(true)
    expect(isIssuedLocked('cancelled')).toBe(true)
    expect(canMutateInspectionContent('issued')).toBe(false)
  })

  it('allows draft and complete', () => {
    expect(isIssuedLocked('draft')).toBe(false)
    expect(isIssuedLocked('complete')).toBe(false)
    expect(isIssuedLocked(undefined)).toBe(false)
    expect(canMutateInspectionContent('complete')).toBe(true)
  })
})

describe('formatPublicCode', () => {
  it('keeps base for version 1', () => {
    expect(formatPublicCode('DA-2026-ABCDEF', 1)).toBe('DA-2026-ABCDEF')
  })

  it('appends -R{n} for revisions (version 2 → R1)', () => {
    expect(formatPublicCode('DA-2026-ABCDEF', 2)).toBe('DA-2026-ABCDEF-R1')
    expect(formatPublicCode('DA-2026-ABCDEF', 3)).toBe('DA-2026-ABCDEF-R2')
  })

  it('strips existing revision before appending', () => {
    expect(formatPublicCode('DA-2026-ABCDEF-R1', 3)).toBe('DA-2026-ABCDEF-R2')
  })
})

describe('deriveBasePublicCode', () => {
  it('is stable for the same plate+ref (same report_key grouping)', () => {
    const a = deriveBasePublicCode({ plate: 'abc-1d23' as Plate, ref: ' os-000123 ' }, 2026)
    const b = deriveBasePublicCode({ plate: 'ABC1D23' as Plate, ref: 'OS-000123' }, 2026)
    expect(a).toBe(b)
    expect(a).toMatch(/^DA-2026-[0-9A-F]{6}$/)
    expect(buildReportKey({ plate: 'ABC1D23' as Plate, ref: 'OS-000123' })).toBe('ABC1D23::OS-000123')
  })

  it('differs when plate differs', () => {
    const a = deriveBasePublicCode({ plate: 'AAA1111' as Plate, ref: 'OS-1' }, 2026)
    const b = deriveBasePublicCode({ plate: 'BBB2222' as Plate, ref: 'OS-1' }, 2026)
    expect(a).not.toBe(b)
  })
})

describe('createCorrectionDraft', () => {
  it('requires a non-empty correction reason', () => {
    expect(() => createCorrectionDraft({ original: makeIssued(), reason: '  ' })).toThrow(
      /Motivo da correção/,
    )
  })

  it('rejects non-issued originals', () => {
    expect(() =>
      createCorrectionDraft({
        original: makeIssued({ status: 'complete' }),
        reason: 'erro de placa',
      }),
    ).toThrow(/laudo emitido/)
  })

  it('clones into a new complete version linked to the parent without mutating original', () => {
    const original = makeIssued()
    const originalDamagesSnapshot = structuredClone(original.damages)

    const draft = createCorrectionDraft({
      original,
      reason: 'Correção de gravidade',
      correctedBy: 'user-1',
      correctedAt: 1_700_000_000_000,
      newId: 'insp-correction' as ReportId,
    })

    expect(draft.id).toBe('insp-correction')
    expect(draft.status).toBe('complete')
    expect(draft.parentInspectionId).toBe(original.id)
    expect(draft.correctionReason).toBe('Correção de gravidade')
    expect(draft.correctedBy).toBe('user-1')
    expect(draft.laudoVersion).toBe(2)
    expect(draft.publicCode).toBe('DA-2026-ABCDEF-R1')
    expect(draft.damages[0].id).not.toBe(original.damages[0].id)
    expect(draft.damages[0].photos).toEqual(original.damages[0].photos)

    // previous not deleted / not mutated
    expect(original.status).toBe('issued')
    expect(original.damages).toEqual(originalDamagesSnapshot)
  })
})

describe('markAsIssued / markAsSuperseded', () => {
  it('marks complete as issued with hash and public code', () => {
    const report: SavedReport = {
      id: 'insp-1' as ReportId,
      savedAt: 1,
      vehicleInfo: makeInfo(),
      damages: [] as Damage[],
      status: 'complete',
      reviewerId: 'user-1',
      reviewedAt: Date.UTC(2026, 6, 26),
      reviewContentHash: 'reviewhash',
    }
    const issued = markAsIssued(report, {
      hash: 'HASHHASHHASHHASHHASHHASHHASHHASH',
      issuedAt: Date.UTC(2026, 6, 27),
    })
    expect(issued.status).toBe('issued')
    expect(issued.issuedHash).toBe('HASHHASHHASHHASHHASHHASHHASHHASH')
    expect(issued.laudoVersion).toBe(1)
    expect(issued.publicCode).toMatch(/^DA-2026-[0-9A-F]{6}$/)
  })

  it('marks issued as superseded without deleting', () => {
    const original = makeIssued()
    const superseded = markAsSuperseded(original, 99)
    expect(superseded.status).toBe('superseded')
    expect(superseded.id).toBe(original.id)
    expect(superseded.issuedHash).toBe(original.issuedHash)
    expect(original.status).toBe('issued')
  })
})

describe('assertCanSaveInspection', () => {
  it('blocks updates to issued snapshots', () => {
    expect(() => assertCanSaveInspection('issued', 'complete')).toThrow(/imutável/)
    expect(() => assertCanSaveInspection('issued')).toThrow(/imutável/)
  })

  it('allows issued → superseded transition', () => {
    expect(() => assertCanSaveInspection('issued', 'superseded')).not.toThrow()
  })

  it('allows draft/complete saves', () => {
    expect(() => assertCanSaveInspection('draft', 'complete')).not.toThrow()
    expect(() => assertCanSaveInspection(undefined, 'complete')).not.toThrow()
  })
})

describe('nextLaudoVersion / stripRevisionSuffix', () => {
  it('bumps version', () => {
    expect(nextLaudoVersion(undefined)).toBe(2)
    expect(nextLaudoVersion(1)).toBe(2)
    expect(nextLaudoVersion(3)).toBe(4)
  })

  it('strips -Rn suffix', () => {
    expect(stripRevisionSuffix('DA-2026-ABC-R2')).toBe('DA-2026-ABC')
  })
})
