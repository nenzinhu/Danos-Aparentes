/**
 * Pure helpers for FASE 4 photo evidence (ORIGINAL + OPTIMIZED).
 * No IndexedDB / canvas — unit-testable in Node.
 */
import { describe, expect, it } from 'vitest'
import {
  buildPhotoEvidenceMeta,
  hashBlobSha256,
  originalDiffersFromOptimized,
} from '../photoEvidence'
import { hashDataUrlOrRef, sha256Hex } from '../pdf/integrityManifest'

describe('hashBlobSha256', () => {
  it('hashes original bytes stably', async () => {
    const a = new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/jpeg' })
    const b = new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/jpeg' })
    const ha = await hashBlobSha256(a)
    const hb = await hashBlobSha256(b)
    expect(ha).toMatch(/^[0-9a-f]{64}$/)
    expect(ha).toBe(hb)
  })

  it('differs when bytes differ', async () => {
    const original = new Blob([new Uint8Array([10, 20, 30])], { type: 'image/jpeg' })
    const optimized = new Blob([new Uint8Array([10, 20, 30, 40])], { type: 'image/jpeg' })
    const o = await hashBlobSha256(original)
    const z = await hashBlobSha256(optimized)
    expect(originalDiffersFromOptimized(o, z)).toBe(true)
  })
})

describe('buildPhotoEvidenceMeta', () => {
  it('builds dual-record metadata without dropping original fields', () => {
    const meta = buildPhotoEvidenceMeta({
      id: 'ev-1',
      optimizedPhotoId: 'opt-1',
      mimeType: 'image/jpeg',
      byteSize: 1_024_000,
      sha256: 'a'.repeat(64),
      optimizedSha256: 'b'.repeat(64),
      width: 4032,
      height: 3024,
      capturedAt: 1_700_000_000_000,
      inspectionId: 'insp-1',
      damageId: 'dmg-1',
      userId: 'user-1',
      device: 'iPhone',
      gps: { lat: -23.5, lng: -46.6, accuracy: 8 },
    })
    expect(meta.id).toBe('ev-1')
    expect(meta.optimizedPhotoId).toBe('opt-1')
    expect(meta.byteSize).toBe(1_024_000)
    expect(meta.sha256).toBe('a'.repeat(64))
    expect(meta.optimizedSha256).toBe('b'.repeat(64))
    expect(meta.width).toBe(4032)
    expect(meta.gps?.lat).toBe(-23.5)
    expect(meta.userId).toBe('user-1')
    // Original identity is independent of optimized id
    expect(meta.id).not.toBe(meta.optimizedPhotoId)
  })

  it('keeps original sha256 even if optimized sha changes', () => {
    const originalSha = 'c'.repeat(64)
    const meta1 = buildPhotoEvidenceMeta({
      id: 'ev-2',
      optimizedPhotoId: 'opt-2',
      mimeType: 'image/jpeg',
      byteSize: 100,
      sha256: originalSha,
      optimizedSha256: 'd'.repeat(64),
      createdAt: 1,
    })
    const meta2 = buildPhotoEvidenceMeta({
      ...meta1,
      optimizedSha256: 'e'.repeat(64),
    })
    expect(meta2.sha256).toBe(originalSha)
    expect(meta2.optimizedSha256).not.toBe(meta1.optimizedSha256)
    expect(originalDiffersFromOptimized(meta2.sha256, meta2.optimizedSha256!)).toBe(true)
  })

  it('includes vehicleId when provided', () => {
    const meta = buildPhotoEvidenceMeta({
      id: 'ev-2',
      optimizedPhotoId: 'opt-2',
      mimeType: 'image/jpeg',
      byteSize: 100,
      sha256: 'c'.repeat(64),
      inspectionId: 'insp-1',
      damageId: 'dmg-1',
      vehicleId: 'veh-1',
    })
    expect(meta.vehicleId).toBe('veh-1')
    expect(meta.inspectionId).toBe('insp-1')
    expect(meta.damageId).toBe('dmg-1')
  })
})

describe('hashDataUrlOrRef prefers original sha (FASE 4)', () => {
  it('uses preferredOriginalSha256 when provided', async () => {
    const originalSha = await sha256Hex(new Uint8Array([9, 8, 7]))
    const ref = 'blob:opt-display-id'
    const withPreferred = await hashDataUrlOrRef(ref, originalSha)
    const without = await hashDataUrlOrRef(ref)
    expect(withPreferred).toBe(originalSha)
    expect(without).toBe(await sha256Hex(ref))
    expect(withPreferred).not.toBe(without)
  })
})
