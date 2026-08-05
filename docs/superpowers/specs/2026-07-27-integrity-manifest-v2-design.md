# Integrity Manifest v2 (FASE 1)

## Goal

Add a layered SHA-256 integrity record (`integrity-v2`) next to the existing
public QR hash (`v1`), without breaking `/verify` or reissuing old laudos.

This is a technical integrity fingerprint of the inspection payload. It does
**not** claim legal validity, notarization, or court admissibility.

## v1 vs v2

| | v1 (`computeHash`) | v2 (`buildIntegrityManifest`) |
|---|---|---|
| Purpose | Public QR / `/verify` lookup key | Layered content integrity |
| Algorithm | SHA-256 | SHA-256 |
| Length | First **32** hex, **uppercase** | Full **64** hex, **lowercase** (`final_hash`) |
| Storage PK | `report_hashes.hash` | Extra columns; PK unchanged |
| PDF bytes | Not included | `pdf_hash` when bytes available |

v1 remains the primary public hash. QR codes and `/verify?hash=` keep using v1.

## Manifest fields

Stored in `report_hashes.integrity_manifest` (jsonb) plus:

- `integrity_scheme` — e.g. `integrity-v2`
- `final_hash` — SHA-256 of the canonical final payload (scheme, algorithm,
  system_version, inspection_id, all layer hashes, `pdf_hash`)

Layers (each independently hashed): vehicle, inspection metadata, damages
(structure + notes), ordered photo hashes, signatures, location, then
`structured_content_hash` (all layers except PDF).

`inspection_id` default: `DA-{UTC year}-{first 12 of sha256(plate|ref|ts)}`.

## Photo limitation

At hash time, only `data:` URLs have bytes in the client. For `blob:` /
`storage:` refs, v2 hashes the **UTF-8 reference string**, not the remote
file contents. Changing a stored file without changing the path would not
change `photos_hash` until a later phase resolves and hashes bytes.

## `pdf_hash`

- On HTML build / first insert: `pdf_hash = null` (bytes not ready yet).
- After PDF generation (`registerIntegrityPdfHash`): recompute with
  ArrayBuffer and update the row (authenticated author only).
- Unit tests cover both paths.

## Compatibility

- Additive migration (`IF NOT EXISTS` columns).
- No change to v1 `computeHash` output.
- Old rows without manifest still verify via v1 hash alone.
- `/verify` UI recompute / display of v2 layers = **later phase**.

## Code

- `src/lib/pdf/integrityManifest.ts` — pure helpers
- `src/lib/pdf/hash.ts` — `registerHash(..., manifest?)`, `registerIntegrityPdfHash`
- `src/lib/pdf/html.ts` — build v2 after v1, register together
- `src/lib/pdf/render.ts` — best-effort PDF backfill
