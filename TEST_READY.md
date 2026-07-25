# TEST_READY — PDF Report Generation Test Suite Status

**Project**: Danos Aparentes PWA
**Module**: PDF Report Generation Engine (`src/lib/pdf/`)
**Last verified**: 2026-07-25
**Status**: REAL COVERAGE IN PLACE (previous version of this document was a facade — see below)

---

## ⚠️ Correction notice

An earlier version of this document certified a "TEST SUITE COMPLETE & CERTIFIED READY" status for three
test files (`pdfCore.test.ts`, `pdfPhotosAndSections.test.ts`, `pdfPaginationAndEdgeCases.test.ts`) that
**did not exist on disk**. `src/lib/pdf/` had zero test coverage at the time — the 89 tests that were
passing under `npm test` belonged to unrelated modules (Stripe/Mercado Pago webhooks, plate lookup, sync,
rate limiting). That document also described `PdfSettings` fields (`CustomThemeColors`, `PdfSectionVisibility`,
`PdfHeaderFooterConfig`, `layoutMode`) that don't exist in `src/lib/pdf/types.ts` — it was describing an
aspirational future module, not the real one.

This version replaces it with what is actually implemented and tested today.

---

## 1. Real Test Suite (as of 2026-07-25)

All three files below now exist under `src/lib/pdf/__tests__/` and pass under `npm test`:

| Suite File | Scope | Tests |
| :--- | :--- | :---: |
| `pdfCore.test.ts` | `hash.ts` (SHA-256 determinism/tamper sensitivity, QR data URL), `theme.ts` (`resolveTheme` for all 6 static themes + fallback, `pillBadge`, `sectionTitle`) | 13 |
| `pdfPhotosAndSections.test.ts` | `sections.ts` — status badge severity escalation, damage summary counts, damage table rows/empty state, info table + custom fields, photo gallery chunking/captions, interior section, signature block | 21 |
| `pdfPaginationAndEdgeCases.test.ts` | `html.ts` `buildFullHtml` — zero damages, 15+ damages, zero/12+ photos, 1000+ char notes, UTF-8/emoji preservation, logo vs. company-name fallback, 6-theme matrix, 50-damage perf budget | 19 |

**Total: 53 tests, all passing.** Combined with the rest of the suite: `npm test` → 142 tests / 16 files passing.

## 2. What is NOT covered / does not exist yet

- `PdfSettings` today only supports `companyName`, `companyLogo`, `pdfTheme` (`src/lib/pdf/types.ts`). There is
  no custom brand HEX color override, no section-visibility toggles, no header/footer config, no
  `layoutMode`/dual-mode pagination. These were in the original M1/M2 milestone plan (`PROJECT.md`) but are
  **not implemented** — do not write tests for them until the code exists.
- **No HTML/XSS sanitization**: free-text fields (`generalNotes`, damage `notes`, photo captions) are
  interpolated directly into the generated HTML with no escaping. Confirmed via test (see
  `pdfPaginationAndEdgeCases.test.ts` — "does NOT escape HTML in free-text fields"). Low practical risk today
  since the HTML is only ever rendered client-side into a PDF from the inspector's own input, not served back
  as live HTML to other users — but worth hardening before any feature that echoes these fields elsewhere.
- `render.ts` (`generatePdf`, `generatePdfBlob`, `renderSinglePage`, `renderMultiPage`) is still untested —
  it depends on `html2pdf.js`/`html2canvas` DOM rendering, which needs a browser-like test environment
  (jsdom/playwright), not the current `node` vitest environment. Out of scope for this pass.

## 3. Running the tests

```bash
npm test                                              # full suite
npx vitest run src/lib/pdf/__tests__                  # PDF module only
npx vitest run src/lib/pdf/__tests__/pdfCore.test.ts  # single file
```
