# E2E & Unit Test Infra: Danos Aparentes PDF Generator

## Test Philosophy
- Requirement-driven, opaque-box & modular unit testing for PDF HTML compiler, visual themes, custom brand colors, photo gallery grid, page density modes, section visibility, and cryptographic SHA-256 integrity hashing.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial + Workload Testing.

## Feature Inventory & Test Coverage Matrix

| # | Feature Area | Requirement | Tier 1 (Coverage) | Tier 2 (Boundaries) | Tier 3 (Interactions) | Tier 4 (Workloads) |
|---|--------------|-------------|:-----------------:|:------------------:|:--------------------:|:------------------:|
| 1 | Core HTML Compiler & Layout | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Theme & Brand Color System | R1 | 5 | 5 | ✓ | ✓ |
| 3 | Logo & Header/Footer Branding | R1 | 5 | 5 | ✓ | ✓ |
| 4 | Photo Gallery, Captions & Badges | R2 | 5 | 5 | ✓ | ✓ |
| 5 | Dual-Mode Page Density (Pagination) | R1 | 5 | 5 | ✓ | ✓ |
| 6 | SHA-256 Hash & Security Verification | R3 | 5 | 5 | ✓ | ✓ |

---

## Test Suite Architecture & File Layout
- **Test Runner**: Vitest (`vitest run` invoked via `npm test` or `npm run test`).
- **Configuration**: `vitest.config.ts`.
- **Target Suite Files**:
  - `src/lib/pdf/__tests__/pdfCore.test.ts` (HTML compilation, theme presets, custom brand HEX colors, SHA-256 integrity hash, QR code Data URL generation).
  - `src/lib/pdf/__tests__/pdfPhotosAndSections.test.ts` (Photo gallery 3-column grid rendering, captions, notes, severity badges, section visibility flags).
  - `src/lib/pdf/__tests__/pdfPaginationAndEdgeCases.test.ts` (Layout density modes single-page/multi-page/auto, boundary scenarios: 0/15+ damages, 0/12+ photos, 1000+ char text notes, logo alignments).

---

## Coverage Threshold Goals
- **Tier 1 (Feature Coverage)**: Happy path tests for all PDF settings, section generators, and theme resolvers.
- **Tier 2 (Boundary & Corner Cases)**: Empty inputs, maximum photo counts, zero damage reports, long text wrapping, custom color hex inputs.
- **Tier 3 (Cross-Feature Combinations)**: Combination matrix across 6 themes x 3 layout modes x logo positions x section visibility toggles.
- **Tier 4 (Real-World Application Workloads)**: Multi-damage vehicle inspections with photos, signatures, GPS, and custom fields.
