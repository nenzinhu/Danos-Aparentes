# Photo Evidence — ORIGINAL + OPTIMIZED (FASE 4)

## Goal

Treat each inspection photo as **evidence**, not a disposable display asset.
Compression / resize for UI and PDF must never silently replace the capture
bytes. When optimization is needed: keep **ORIGINAL** + **OPTIMIZED**.

This phase does **not** claim legal chain-of-custody or court admissibility.

## Product fields (target)

| Field | Local (IndexedDB) | Cloud (`photo_evidence`) | Notes |
|---|---|---|---|
| UUID | `photo_evidence.id` | `id` | Same logical id when synced |
| inspection_id / damage_id | optional on record | columns | Linked when known at capture |
| original file | `blob` in `photo_evidence` | `original_storage_path` (deferred upload) | Never overwritten |
| MIME / size / resolution | yes | yes | Resolution best-effort |
| timestamp | `capturedAt` / `createdAt` | `captured_at` / `created_at` | |
| GPS | optional | optional | **Deferred**: EXIF parse |
| device | optional | optional | Best-effort UA / caller |
| SHA-256 of original | `sha256` | `sha256` | Integrity prefers this |
| author / user_id | optional local | required cloud | From session on sync |
| created_at | yes | yes | |

Display / PDF continue to use `damages.photos[]` → optimized `blob:` / `storage:` refs.

## Local model

- IndexedDB version **6** adds store `photo_evidence` (key `id`, indexes
  `optimizedPhotoId`, `inspectionId`).
- `damage_photos` (optimized) may carry `originalEvidenceId` + `role: 'optimized'`.
- Capture API: `storePhotoEvidence(file)` → save original → compress →
  `storePhoto(optimized)` → link both → optional `photo_capture` audit event.
- Legacy captures that only called `storePhoto(compressed)` remain valid;
  integrity falls back to hashing the ref string / data URL as before.

## Integrity-v2

`buildIntegrityManifest` accepts `originalPhotoHashes?: Record<ref, sha256>`.
`hashDataUrlOrRef(ref, preferredOriginalSha256)` uses the original digest when
present. Call sites (`html.ts`, `registerIntegrityPdfHash`) collect hashes via
`collectOriginalPhotoHashes` from IndexedDB.

## Cloud

Additive migration `20260727040000_photo_evidence.sql` creates metadata table +
RLS. **Deferred**: dual-upload of original blobs for all new captures and any
backfill of legacy optimized-only photos.

## Deferred

- EXIF GPS / device extraction from camera files
- Full cloud dual-upload of ORIGINAL for every new photo + sync queue
- Backfill / re-hash of pre-FASE-4 photos
- Client DELETE policy on `photo_evidence` (retention / admin purge)

## Code

- `src/lib/photoEvidence.ts` — types helpers + `storePhotoEvidence`
- `src/lib/db.ts` — v6 + evidence CRUD
- `src/lib/pdf/integrityManifest.ts` — prefer original SHA
- Capture: `useInspectionWorkflow`, `DamageList`, `VehicleInfoForm`
- Tests: `src/lib/__tests__/photoEvidence.test.ts`
