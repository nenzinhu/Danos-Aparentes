# Issued immutability & laudo versioning (FASE 2)

## Goal

After a laudo is **issued** (PDF + `report_hashes` row), its inspection snapshot
must not be overwritten in place. Corrections create a **new version**; the
previous version is kept forever.

This is an integrity / auditability control. It does **not** claim
"validade jurídica garantida", notarization, or court admissibility.

## Status model

`vehicle_inspections.status`:

| Status | Meaning |
|--------|---------|
| `draft` | Prévia cadastral (unchanged) |
| `complete` | Saved inspection, still editable |
| `issued` | PDF registered — snapshot locked |
| `superseded` | Replaced by a correction version |
| `cancelled` | Voided without replacement |

Legacy rows without the new statuses remain `complete` / `draft`.

## How it relates to `report_key` / `version`

FASE 1 already groups re-emissions in `report_hashes` via:

- `report_key` = `buildReportKey(plate + ref)`
- `version` = sequential count within that key

FASE 2 **reuses** that:

- Each PDF issue still inserts a new `report_hashes` row (new v1 hash / QR).
- `version` continues to increment for the same `report_key`.
- New columns: `correction_reason`, `supersedes_hash`, `inspection_id`, `public_code`.
- Re-download of an already-issued snapshot uses `skipHashRegister` so a mere
  reprint does **not** bump `version`.

Human-facing code `DA-YYYY-XXXXXX` / `DA-YYYY-XXXXXX-R1` is a readable label
derived from the same plate+ref grouping; it does **not** replace the QR hash.

## Correction flow

1. User selects an **issued** laudo → "Criar correção (nova versão)".
2. Must provide `correction_reason`.
3. System clones into a new `complete` inspection (`parent_inspection_id`,
   bumped `laudo_version`, new damage ids, photos refs preserved).
4. Original stays `issued` until the correction PDF is issued, then becomes
   `superseded` (never deleted).
5. New PDF → new `report_hashes` row with `correction_reason` + `supersedes_hash`.

## Immutability enforcement

| Layer | Behavior |
|-------|----------|
| Pure helpers | `assertCanSaveInspection`, `isIssuedLocked` |
| IndexedDB / UI | Block load-for-edit, delete, overwrite of issued |
| Sync push | Skip content re-upsert if cloud already locked; status-only for superseded |
| Postgres triggers | Block UPDATE of issued content; block damage mutations on locked inspections |

## Deferred (offline / later)

- Full offline conflict resolution when a device edits a stale local copy of an
  issued inspection before pull (documented: cloud trigger wins; UI should
  refresh).
- Formal `cancelled` UX flow.
- `/verify` UI showing correction reason / public_code (hash version banner
  already exists).
- Strict "save before PDF" requirement when emitting without an active report id
  (today: auto-save on first emit).

## Code

- `src/lib/pdf/reportIssuance.ts` — pure logic + tests
- `src/supabase/migrations/20260727020000_issued_immutability.sql`
- `src/hooks/useSavedReports.ts` — `createCorrection`, `markReportIssued`
- `src/components/SavedReportsModal.tsx` — lock + correction CTA
