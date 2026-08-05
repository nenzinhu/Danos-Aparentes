import { describe, expect, it } from 'vitest'
import { comparePdfUpload, hashPdfBytes } from '../pdfUploadVerify'

describe('hashPdfBytes', () => {
  it('is stable and changes when a byte changes', async () => {
    const a = await hashPdfBytes(new Uint8Array([37, 80, 68, 70])) // %PDF
    const b = await hashPdfBytes(new Uint8Array([37, 80, 68, 70]))
    const c = await hashPdfBytes(new Uint8Array([37, 80, 68, 71]))
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f]{64}$/)
    expect(c).not.toBe(a)
  })
})

describe('comparePdfUpload', () => {
  const record = {
    hash: 'AAAABBBBCCCCDDDDEEEEFFFF00001111',
    integrity_manifest: { pdf_hash: 'aabb'.padEnd(64, '0') },
  }

  it('confirms when matched by stored pdf_hash', () => {
    expect(
      comparePdfUpload({
        uploadedPdfHash: 'aabb'.padEnd(64, '0'),
        record,
        matchedBy: 'pdf_hash',
      }),
    ).toBe('integrity_confirmed')
  })

  it('returns not_found when no record', () => {
    expect(
      comparePdfUpload({
        uploadedPdfHash: 'aabb'.padEnd(64, '0'),
        record: null,
        matchedBy: 'none',
      }),
    ).toBe('not_found')
  })

  it('flags mismatch when typed hash row has different pdf_hash', () => {
    expect(
      comparePdfUpload({
        uploadedPdfHash: 'ffff'.padEnd(64, 'f'),
        record,
        matchedBy: 'typed_hash',
      }),
    ).toBe('integrity_not_confirmed')
  })

  it('flags mismatch for legacy rows without pdf_hash', () => {
    expect(
      comparePdfUpload({
        uploadedPdfHash: 'aabb'.padEnd(64, '0'),
        record: { hash: 'AAAABBBBCCCCDDDDEEEEFFFF00001111', integrity_manifest: null },
        matchedBy: 'typed_hash',
      }),
    ).toBe('integrity_not_confirmed')
  })
})
