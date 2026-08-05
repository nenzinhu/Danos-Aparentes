/**
 * FASE 4 — Photo evidence: ORIGINAL bytes preserved + OPTIMIZED for display/PDF.
 * Never silently replace the original.
 */

import { compressImage, LOCAL_PHOTO_MAX_WIDTH, LOCAL_PHOTO_QUALITY } from './imageUtils'
import { createId } from './id'
import { db, type PhotoEvidenceRecord, type PhotoGps } from './db'
import { sha256Hex } from './pdf/integrityManifest'
import { appendAuditEvent } from './audit/auditLog'
import { PHOTO_REF_PREFIX, isPhotoRef, storePhoto } from './photoStore'

export type { PhotoEvidenceRecord, PhotoGps }

/** Metadata without the blob — used in tests and cloud sync payloads. */
export type PhotoEvidenceMeta = Omit<PhotoEvidenceRecord, 'blob'>

export type StorePhotoEvidenceOpts = {
  inspectionId?: string | null
  damageId?: string | null
  vehicleId?: string | null
  userId?: string | null
  device?: string | null
  gps?: PhotoGps | null
  /** Skip compress (tests / already-small files). Still dual-stores. */
  skipCompress?: boolean
  /** Emit audit_log photo_capture (default true). */
  audit?: boolean
}

export type StorePhotoEvidenceResult = {
  /** Ref stored on damages.photos / interiorPhotos (optimized for display). */
  optimizedRef: string
  evidenceId: string
  originalSha256: string
  optimizedSha256: string
}

/** SHA-256 of raw blob bytes (pure; no IndexedDB). */
export async function hashBlobSha256(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer()
  return sha256Hex(new Uint8Array(buf))
}

/** Dual-record model check: original hash must differ when optimized bytes differ. */
export function originalDiffersFromOptimized(
  originalSha256: string,
  optimizedSha256: string,
): boolean {
  return originalSha256 !== optimizedSha256
}

/** Build metadata record (no blob) — pure helper for tests / cloud insert. */
export function buildPhotoEvidenceMeta(args: {
  id: string
  optimizedPhotoId: string
  mimeType: string
  byteSize: number
  sha256: string
  optimizedSha256?: string
  width?: number | null
  height?: number | null
  capturedAt?: number
  createdAt?: number
  inspectionId?: string | null
  damageId?: string | null
  vehicleId?: string | null
  userId?: string | null
  device?: string | null
  gps?: PhotoGps | null
}): PhotoEvidenceMeta {
  const now = args.createdAt ?? args.capturedAt ?? 0
  return {
    id: args.id,
    optimizedPhotoId: args.optimizedPhotoId,
    mimeType: args.mimeType || 'application/octet-stream',
    byteSize: args.byteSize,
    sha256: args.sha256,
    optimizedSha256: args.optimizedSha256,
    width: args.width ?? null,
    height: args.height ?? null,
    capturedAt: args.capturedAt ?? now,
    createdAt: args.createdAt ?? now,
    inspectionId: args.inspectionId ?? null,
    damageId: args.damageId ?? null,
    vehicleId: args.vehicleId ?? null,
    userId: args.userId ?? null,
    device: args.device ?? null,
    gps: args.gps ?? null,
  }
}

async function probeImageSize(blob: Blob): Promise<{ width: number; height: number } | null> {
  if (typeof Image === 'undefined' || typeof URL === 'undefined') return null
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

/**
 * Capture path: keep ORIGINAL bytes, compress for display, link both.
 * `damages.photos` / UI / PDF use the optimized `blob:` ref.
 */
export async function storePhotoEvidence(
  file: File | Blob,
  opts: StorePhotoEvidenceOpts = {},
): Promise<StorePhotoEvidenceResult> {
  const capturedAt = Date.now()
  const evidenceId = createId()
  const originalBlob = file
  const mimeType = originalBlob.type || 'image/jpeg'
  const originalSha256 = await hashBlobSha256(originalBlob)
  const size = await probeImageSize(originalBlob)

  const optimizedBlob = opts.skipCompress
    ? originalBlob
    : await compressImage(
        originalBlob instanceof File ? originalBlob : new File([originalBlob], 'photo.jpg', { type: mimeType }),
        LOCAL_PHOTO_MAX_WIDTH,
        LOCAL_PHOTO_QUALITY,
      )

  const optimizedSha256 = await hashBlobSha256(optimizedBlob)
  const optimizedRef = await storePhoto(optimizedBlob)
  const optimizedPhotoId = optimizedRef.slice(PHOTO_REF_PREFIX.length)

  const optRecord = await db.getPhoto(optimizedPhotoId)
  if (optRecord) {
    await db.putPhoto({
      ...optRecord,
      originalEvidenceId: evidenceId,
      role: 'optimized',
    })
  }

  const record: PhotoEvidenceRecord = {
    ...buildPhotoEvidenceMeta({
      id: evidenceId,
      optimizedPhotoId,
      mimeType,
      byteSize: originalBlob.size,
      sha256: originalSha256,
      optimizedSha256,
      width: size?.width ?? null,
      height: size?.height ?? null,
      capturedAt,
      createdAt: capturedAt,
      inspectionId: opts.inspectionId,
      damageId: opts.damageId,
      vehicleId: opts.vehicleId,
      userId: opts.userId,
      device: opts.device,
      gps: opts.gps,
    }),
    blob: originalBlob,
  }
  await db.putPhotoEvidence(record)

  if (opts.audit !== false) {
    void appendAuditEvent({
      event_type: 'photo_capture',
      inspection_id: opts.inspectionId ?? null,
      metadata: {
        photo_id: evidenceId,
        optimized_photo_id: optimizedPhotoId,
        damage_id: opts.damageId ?? null,
        vehicle_id: opts.vehicleId ?? null,
        sha256: originalSha256,
        optimized_sha256: optimizedSha256,
        mime_type: mimeType,
        byte_size: originalBlob.size,
        width: size?.width ?? null,
        height: size?.height ?? null,
      },
    })
  }

  return { optimizedRef, evidenceId, originalSha256, optimizedSha256 }
}

/** Look up original SHA-256 for an optimized `blob:` / `storage:` display ref. */
export async function lookupOriginalSha256(photoRef: string): Promise<string | null> {
  if (!isPhotoRef(photoRef)) return null
  const optimizedId = photoRef.slice(PHOTO_REF_PREFIX.length)
  const byOpt = await db.getPhotoEvidenceByOptimizedId(optimizedId)
  if (byOpt?.sha256) return byOpt.sha256

  const opt = await db.getPhoto(optimizedId)
  if (opt?.originalEvidenceId) {
    const ev = await db.getPhotoEvidence(opt.originalEvidenceId)
    if (ev?.sha256) return ev.sha256
  }
  return null
}

/** Map of display ref → original SHA-256 for integrity-v2 photo_hashes. */
export async function collectOriginalPhotoHashes(
  refs: string[],
): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  for (const ref of refs) {
    const sha = await lookupOriginalSha256(ref)
    if (sha) out[ref] = sha
  }
  return out
}

/** Delete original evidence linked to an optimized photo id (best-effort). */
export async function deleteEvidenceForOptimizedId(optimizedId: string): Promise<void> {
  const ev = await db.getPhotoEvidenceByOptimizedId(optimizedId)
  if (ev) await db.deletePhotoEvidence(ev.id)
}
