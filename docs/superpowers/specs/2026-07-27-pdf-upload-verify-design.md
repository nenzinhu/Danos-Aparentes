# PDF upload verification (FASE 9)

## Goal

Allow `/verify` to accept a PDF upload, compute SHA-256 of the file bytes, and
compare against the stored integrity-v2 `pdf_hash` on `report_hashes`.

Any byte change → **INTEGRIDADE NÃO CONFIRMADA**.

## Flow

1. User selects a `.pdf` file.
2. Browser hashes bytes (`hashPdfBytes`).
3. Lookup `report_hashes` where `integrity_manifest->>'pdf_hash'` equals the digest.
4. If found → confirmed (then apply cancelled / superseded rules).
5. Optional: user also typed a hash — if row found by hash but `pdf_hash` differs → not confirmed.
6. Legacy rows without `pdf_hash` → not confirmed for upload path (cannot prove file).

## Code

- `src/lib/verify/pdfUploadVerify.ts`
- Wired in `src/views/Verify.tsx`

## Deferred

- Server-side upload API (rate limit) — client hash is enough for public verify
- Extract embedded QR hash from PDF text without user input
