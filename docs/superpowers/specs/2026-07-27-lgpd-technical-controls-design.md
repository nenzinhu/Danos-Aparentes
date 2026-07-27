# LGPD technical controls (FASE 11)

## Goal

Ship **technical** privacy controls only — inventory, minimization/masking, and subject data export for an inspection. No fake “LGPD compliant” claims and no legal-basis UI.

## Code

- `src/lib/lgpd/dataInventory.ts` — what personal data the product touches
- `src/lib/lgpd/maskPersonal.ts` — CPF / phone / name / plate masking
- `src/lib/lgpd/subjectExport.ts` — JSON package for access/portability (no photo blobs)
- Saved reports modal: **LGPD** button downloads the JSON

## Out of scope (later)

- Automated erasure workflows / retention jobs
- DPO / legal request ticketing
- Multi-tenant data residency (FASE 12+)
