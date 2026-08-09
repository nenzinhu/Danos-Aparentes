import { describe, expect, it } from 'vitest'
import {
  averageHashFromGray8x8,
  bitsToHex64,
  checkGpsConsistency,
  checkTimeConsistency,
  downsampleToGray8x8,
  evaluatePhotoAntifraud,
  findReuseMatches,
  hammingDistanceHex,
  hasAntifraudAlerts,
  haversineKm,
  isPerceptualMatch,
  TIME_MAX_SKEW_MS,
} from '../photoAntifraud'

describe('averageHashFromGray8x8', () => {
  it('is deterministic and 16 hex chars', () => {
    const gray = Array.from({ length: 64 }, (_, i) => (i % 2 === 0 ? 255 : 0))
    const a = averageHashFromGray8x8(gray)
    const b = averageHashFromGray8x8(gray)
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f]{16}$/)
  })

  it('differs for inverted patterns', () => {
    const light = Array(64).fill(200)
    const dark = Array(64).fill(10)
    // Both uniform → all bits same relative to avg → same hash (all 1s or all equal)
    expect(averageHashFromGray8x8(light)).toBe(averageHashFromGray8x8(dark))
    const half = [...Array(32).fill(0), ...Array(32).fill(255)]
    const inv = [...Array(32).fill(255), ...Array(32).fill(0)]
    expect(averageHashFromGray8x8(half)).not.toBe(averageHashFromGray8x8(inv))
  })
})

describe('downsample + hamming', () => {
  it('downsamples a 16×16 checkerboard to 8×8', () => {
    const pixels: number[] = []
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        pixels.push((x + y) % 2 === 0 ? 255 : 0)
      }
    }
    const small = downsampleToGray8x8(pixels, 16, 16)
    expect(small).toHaveLength(64)
    const hash = averageHashFromGray8x8(small)
    expect(hash).toMatch(/^[0-9a-f]{16}$/)
  })

  it('hammingDistanceHex counts differing bits', () => {
    expect(hammingDistanceHex('0000000000000000', '0000000000000000')).toBe(0)
    expect(hammingDistanceHex('ffffffffffffffff', '0000000000000000')).toBe(64)
    expect(hammingDistanceHex('8000000000000000', '0000000000000000')).toBe(1)
  })

  it('isPerceptualMatch respects threshold', () => {
    const a = bitsToHex64(Array.from({ length: 64 }, (_, i) => i < 3))
    const b = bitsToHex64(Array(64).fill(false))
    expect(isPerceptualMatch(a, b, 5)).toBe(true)
    expect(isPerceptualMatch(a, b, 2)).toBe(false)
  })
})

describe('findReuseMatches', () => {
  it('detects exact SHA-256 reuse across inspections', () => {
    const matches = findReuseMatches(
      { id: 'p1', sha256: 'aaa', inspectionId: 'insp-a' },
      [
        { id: 'p1', sha256: 'aaa', inspectionId: 'insp-a' },
        { id: 'p2', sha256: 'aaa', inspectionId: 'insp-b' },
        { id: 'p3', sha256: 'bbb', inspectionId: 'insp-c' },
      ],
    )
    expect(matches).toEqual([
      { kind: 'exact', candidateId: 'p2', candidateInspectionId: 'insp-b' },
    ])
  })

  it('detects perceptual near-duplicates', () => {
    const base = bitsToHex64(Array(64).fill(false))
    const near = bitsToHex64(Array.from({ length: 64 }, (_, i) => i < 2))
    const matches = findReuseMatches(
      { id: 'p1', sha256: 'a', perceptualHash: base, inspectionId: 'a' },
      [
        { id: 'p2', sha256: 'b', perceptualHash: near, inspectionId: 'b' },
      ],
    )
    expect(matches).toHaveLength(1)
    expect(matches[0].kind).toBe('perceptual')
    expect(matches[0].distance).toBe(2)
  })

  it('ignores reuse inside the same inspection', () => {
    const matches = findReuseMatches(
      { id: 'p1', sha256: 'aaa', inspectionId: 'insp-a' },
      [{ id: 'p2', sha256: 'aaa', inspectionId: 'insp-a' }],
    )
    expect(matches).toEqual([])
  })
})

describe('context checks', () => {
  it('haversineKm is ~0 for same point and large for distant cities', () => {
    expect(haversineKm({ lat: -23.55, lng: -46.63 }, { lat: -23.55, lng: -46.63 })).toBeLessThan(0.01)
    const spRj = haversineKm({ lat: -23.55, lng: -46.63 }, { lat: -22.9, lng: -43.2 })
    expect(spRj).toBeGreaterThan(300)
  })

  it('flags GPS mismatch beyond 5 km', () => {
    const alert = checkGpsConsistency(
      { lat: -23.55, lng: -46.63 },
      { lat: -22.9, lng: -43.2 },
    )
    expect(alert?.kind).toBe('gps_mismatch')
    expect(checkGpsConsistency({ lat: -23.55, lng: -46.63 }, { lat: -23.551, lng: -46.631 })).toBeNull()
  })

  it('flags time skew beyond 7 days', () => {
    const now = Date.UTC(2026, 7, 5)
    expect(checkTimeConsistency(now, now + 1000)).toBeNull()
    const alert = checkTimeConsistency(now, now + TIME_MAX_SKEW_MS + 1)
    expect(alert?.kind).toBe('time_mismatch')
  })
})

describe('evaluatePhotoAntifraud', () => {
  it('aggregates reuse + context and hasAntifraudAlerts', () => {
    const finding = evaluatePhotoAntifraud({
      photo: {
        id: 'p1',
        sha256: 'dup',
        inspectionId: 'a',
        capturedAt: Date.UTC(2026, 0, 1),
        gps: { lat: -23.55, lng: -46.63 },
      },
      candidates: [{ id: 'p2', sha256: 'dup', inspectionId: 'b' }],
      inspectionGps: { lat: -22.9, lng: -43.2 },
      inspectionAnchorAt: Date.UTC(2026, 7, 1),
    })
    expect(finding.reuses).toHaveLength(1)
    expect(finding.context.some((c) => c.kind === 'gps_mismatch')).toBe(true)
    expect(finding.context.some((c) => c.kind === 'time_mismatch')).toBe(true)
    expect(hasAntifraudAlerts([finding])).toBe(true)
  })
})
