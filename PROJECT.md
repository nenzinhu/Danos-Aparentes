# Project: PDF Report Generation Enhancement for Danos Aparentes PWA

## Executive Overview
This project enhances the PDF report generation engine for Danos Aparentes PWA. The target codebase is located at `c:/Users/Nei/Desktop/Danos-Aparentes-main_4/Danos-Aparentes-main`.

## Architecture Overview
- **Framework & Runtime**: Next.js 16 (App Router), React 19, TypeScript 5.2, Vitest 4.1.
- **PDF Core Stack**: Client-side rendering in `src/lib/pdf/` utilizing `html2pdf.js` (`^0.14.0`), `jspdf` (`^4.2.1`), `html2canvas`, SHA-256 cryptographic hashing (`hash.ts`), and dynamic inline HTML builder (`html.ts`, `sections.ts`, `theme.ts`).
- **Data & Storage**: IndexedDB (`avarias-pwa`, `damage_photos`), Supabase Storage (`damage-photos` bucket), and local storage state.

## Code Layout
- `src/lib/pdf/types.ts`: PDF settings, theme types, layout options, and SVG capture interfaces.
- `src/lib/pdf/theme.ts`: Color palette themes, custom HEX color resolver, severity badges, and typography definitions.
- `src/lib/pdf/sections.ts`: HTML string generators for Header, Info Table, Diagrams, Summary, Damage Table, Photo Gallery, Interior, Signatures, and Footer.
- `src/lib/pdf/html.ts`: Master HTML document compiler (`buildFullHtml`) integrating Google Fonts, CSS styles, integrity hashes, and QR code verification.
- `src/lib/pdf/render.ts`: Rendering engine (`generatePdf`, `generatePdfBlob`, `renderSinglePage`, `renderMultiPage`).
- `src/lib/pdf/hash.ts`: SHA-256 integrity calculation (`computeHash`) and QR code Data URL builder.
- `src/components/ReportActions.tsx`: UI component triggering PDF export, WhatsApp sharing, and setting controls.
- `src/components/CompanySettingsModal.tsx`: Company branding, logo upload, and company name configuration modal.
- `src/lib/pdf/__tests__/`: Dedicated test suite for PDF HTML compiler, theme resolver, photo gallery, pagination, and performance helpers.

---

## Interface Contracts

### 1. `PdfSettings` Data Contract (`src/lib/pdf/types.ts`)
```typescript
export interface CustomThemeColors {
  accentColor?: string;     // Primary brand accent HEX e.g. "#0284c7"
  headerBg?: string;        // CSS gradient or solid color string
  colorStripe?: string;     // Header bottom accent stripe
}

export interface PdfSectionVisibility {
  showInfoTable?: boolean;        // Default: true
  showSvgDiagrams?: boolean;      // Default: true
  showSummaryStats?: boolean;     // Default: true
  showDamageTable?: boolean;      // Default: true
  showPhotoGallery?: boolean;     // Default: true
  showInteriorSection?: boolean;  // Default: true
  showSignatures?: boolean;       // Default: true
}

export interface PdfHeaderFooterConfig {
  logoPosition?: 'left' | 'center' | 'right';
  logoMaxHeight?: number;         // Default: 42 (px)
  headerSubtitle?: string;        // Default: "RELATÓRIO DE VISTORIA VEICULAR"
  showQrCode?: boolean;           // Default: true
  showGpsLocation?: boolean;      // Default: true
  customFooterText?: string;      // Custom legal disclaimer or contact info
}

export interface PdfSettings {
  companyName?: string;
  companyLogo?: string;
  pdfTheme?: 'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante';
  customColors?: CustomThemeColors;
  layoutMode?: 'single-page' | 'multi-page' | 'auto'; // Page density control
  sections?: PdfSectionVisibility;
  headerFooter?: PdfHeaderFooterConfig;
}
```

### 2. PDF Generator API (`src/lib/pdf.ts` & `src/lib/pdf/render.ts`)
```typescript
export async function generatePdf(
  info: VehicleInfo,
  damages: Damage[],
  svgData?: SvgPdfData,
  settings?: PdfSettings
): Promise<string>;

export async function generatePdfBlob(
  info: VehicleInfo,
  damages: Damage[],
  svgData?: SvgPdfData,
  settings?: PdfSettings
): Promise<Blob>;
```

---

## Project Milestones

| # | Milestone Name | Track | Scope | Dependencies | Status |
|---|----------------|-------|-------|--------------|--------|
| **M-TEST** | **E2E Test Suite Infrastructure** | E2E Testing Track | Design E2E test infra, write unit & integration tests for PDF compiler, themes, photo gallery, pagination, publish `TEST_READY.md`. | None | IN_PROGRESS |
| **M1** | **Layout Customization & Theme System** | Implementation Track | Implement custom brand HEX colors, expanded `PdfSettings`, header/footer config, logo positioning, section toggles in `theme.ts`, `sections.ts`, `html.ts`, and UI modals. | None | PLANNED |
| **M2** | **Advanced Photo Gallery & Dual-Mode Density** | Implementation Track | Responsive photo grid layout, natural aspect ratio, photo captions/notes/severity tags, Dual-Mode PDF Engine (`renderSinglePage` vs `renderMultiPage` with clean page breaks). | M1 | PLANNED |
| **M3** | **Performance, Offline Resilience & Optimization** | Implementation Track | Async UI thread yielding during PDF export, memory cleanup (`URL.revokeObjectURL`), offline font fallbacks, resilient photo blob handling. | M1, M2 | PLANNED |
| **M-FINAL** | **Final Verification & Hardening** | Implementation Track | Phase 1: Pass 100% of E2E tests (Tiers 1-4). Phase 2: Tier 5 adversarial coverage hardening, Forensic Audit verification. | M-TEST, M1, M2, M3 | PLANNED |

---

## Acceptance Verification Criteria
- `npm test`: All existing and new automated tests must pass with 0 errors.
- `npm run build`: Production Next.js compilation and TypeScript check (`tsc --noEmit`) must succeed with 0 errors.
- Local Browser PDF Generation: PDF files generate cleanly without layout overlap, text clipping, or unreadable scaling.
- Integrity Audit: Forensic auditor verification must be CLEAN with 0 integrity violations or facades.
