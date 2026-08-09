/**
 * FASE 9 — Verify by PDF upload: hash file bytes and compare to stored pdf_hash.
 */

import { sha256Hex } from '../pdf/integrityManifest'
import { resolveVerifyOutcome, type PublicVerifyOutcome } from './publicVerify'

export type PdfVerifyRecord = {
  hash: string
  final_hash?: string | null
  integrity_manifest?: {
    pdf_hash?: string | null
  } | null
  inspection_status?: string | null
  is_superseded_version?: boolean
}

/** Full SHA-256 hex of PDF bytes (lowercase, 64 chars) — matches integrity-v2 pdf_hash. */
export async function hashPdfBytes(bytes: ArrayBuffer | Uint8Array): Promise<string> {
  return sha256Hex(bytes)
}

export type ComparePdfUploadArgs = {
  uploadedPdfHash: string
  /** Row found by pdf_hash lookup, or by typed public hash. */
  record: PdfVerifyRecord | null
  /** How the record was located. */
  matchedBy: 'pdf_hash' | 'typed_hash' | 'none'
}

/**
 * Pure comparison for PDF upload verification.
 * Altering any byte of the PDF changes uploadedPdfHash → mismatch when a stored pdf_hash exists.
 */
export function comparePdfUpload(args: ComparePdfUploadArgs): PublicVerifyOutcome {
  const { uploadedPdfHash, record, matchedBy } = args
  const storedPdf = record?.integrity_manifest?.pdf_hash || null

  if (!record || matchedBy === 'none') {
    return resolveVerifyOutcome({ found: false })
  }

  if (matchedBy === 'pdf_hash') {
    // Located by exact pdf_hash → bytes match the registered PDF.
    return resolveVerifyOutcome({
      found: true,
      inspectionStatus: record.inspection_status,
      isSupersededVersion: record.is_superseded_version,
      integrityMismatch: false,
    })
  }

  // Found via typed hash / public code — compare PDF bytes when available.
  if (!storedPdf) {
    // Legacy row without pdf_hash: cannot confirm file integrity.
    return resolveVerifyOutcome({
      found: true,
      integrityMismatch: true,
    })
  }

  const mismatch = storedPdf.toLowerCase() !== uploadedPdfHash.toLowerCase()
  return resolveVerifyOutcome({
    found: true,
    inspectionStatus: record.inspection_status,
    isSupersededVersion: record.is_superseded_version,
    integrityMismatch: mismatch,
  })
}
