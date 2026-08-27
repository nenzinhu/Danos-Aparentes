# Project: Danos Aparentes — Plataforma de Inteligência Histórica Veicular

> **Status do documento:** atualizado em 2026-08-27 para refletir o estado real do código em `E:/workspaces/Danos-Aparentes-main`.
> Substitui a versão anterior (que documentava apenas a fase "PDF Report Generation Enhancement" numa máquina diferente `c:/Users/Nei/...` e estava obsoleta).

## Executive Overview

O **Danos Aparentes** é uma plataforma web brasileira (PWA offline-first) de inspeção veicular que mapeia, lauda e audita avarias em campo — com prova criptográfica (hash SHA-256 + QR Code). Posiciona-se como **"Histórico e Sistema de Evidência Veicular"**, atendendo múltiplos segmentos B2B (estacionamentos, valets, locadoras, guinchos, depósitos e frotas) a partir da mesma engine.

O repositório cobre toda a stack: PWA de campo, motor de PDF, backend de sync/server (Supabase + rotas de API), billing (PIX + Stripe + Asaas/Mercado Pago), multi-tenancy, camada de auditoria/integridade, verificação pública via QR e pipeline de marketing/vídeo.

- **Site:** https://www.danosaparentes.com.br
- **Codebase:** `E:/workspaces/Danos-Aparentes-main`

## Architecture Overview

- **Framework & Runtime:** Next.js 16 (App Router), React 19, TypeScript 5.2 (strict), Vitest 4.1.
- **PDF Core Stack:** render **híbrido server+client** em `src/lib/pdf/` — `html2pdf.js` (`^0.14.0`), `jspdf` (`^4.2.1`), `html2canvas`, SHA-256 (`hash.ts`), builder HTML inline (`html.ts`, `sections*.ts`, `theme.ts`). Prefere render server-side; cai no client se offline/503.
- **Data & Storage:** IndexedDB (`avarias-pwa`, `damage_photos`), Supabase Postgres + Storage (`damage-photos` bucket) com Row-Level Security por tenant, fila de sync local⇄nuvem.
- **Billing:** planos self-serve (Starter R$29,90 / Pro R$79,90 / Corporativo R$299) via **Stripe** + **PIX** (Asaas, Mercado Pago).
- **Auditoria & Prova:** `integrity_manifest`, `issued_immutability`, `audit_log`, `photo_antifraud`, `ai_decisions`, `review_gate`, `disclosure_scope`, código público de procedência (`DA-YYYY-XXXXXX`).
- **IA / Visão Computacional:** sugestão de tipo/severidade/lado de avaria a partir de foto (Gemini, Groq, Qwen), via rotas `api/damage-vision`, `api/damage-classify`, `api/view-side-classify`.

## Code Layout (principais módulos)

### PDF Engine — `src/lib/pdf/`
- `types.ts` — `PdfSettings`, `PdfSectionVisibility` (inclui `showChecklistSection`, `showGeoAuditSection`), `SvgPdfData`, `PdfHeaderFooterConfig`.
- `theme.ts` — paleta de temas (`modern` | `editorial` | `tecnico` | `corporativo` | `minimalista` | `vibrante`), resolver de HEX custom, badges de severidade.
- `sections.ts` / `sectionsBody.ts` / `sectionsHeader.ts` / `sectionsViews.ts` — geradores HTML de Header, Info Table, Diagramas, Summary, Damage Table, Photo Gallery, Interior, Signatures, Checklist, Geo-Audit, Footer.
- `html.ts` — compilador mestre `buildFullHtml` (Google Fonts, CSS, hashes de integridade, QR de verificação).
- `render.ts` — engine de render (`generatePdf`, `generatePdfBlob`, `renderSinglePage`, `renderMultiPage`, `yieldToMainThread`).
- `clientOrchestrator.ts` — orquestra preferência server→client.
- `serverRender.ts` — render server-side.
- `hash.ts` — `computeHash` SHA-256 + builder de QR Data URL.
- `integrityManifest.ts`, `reportIssuance.ts`, `reviewGate.ts`, `comparativeReport.ts` — manifesto de integridade, emissão imutável, gate de revisão humana, relatório comparativo.
- `__tests__/` — suite de testes (HTML compiler, theme resolver, photo gallery, pagination, perf).
- `src/lib/pdf.ts` — re-export público (tipos de `pdf/types`, funções de `clientOrchestrator`/`render`).

### Billing — `src/lib/billing/`, `src/lib/server/`
- `billing/plans.ts` — catálogo canônico de planos (Stripe Products, quotas, PIX).
- `server/stripeClient.ts`, `server/stripePlans.ts`, `server/asaasClient.ts`, `server/asaasPix.ts`, `server/mercadoPagoClient.ts`, `server/mercadoPagoWebhook.ts`, `server/activatePixSubscription.ts` — integrações de pagamento.
- `server/rbac.ts`, `server/apiKeyAuth.ts`, `server/tenantScope.ts`, `server/vehicleScope.ts` — autorização e escopo.

### Multi-tenant & Tenant — `src/lib/tenant/`, `src/lib/supabase/`
- `tenant/resolveTenant.ts` — resolução de tenant.
- `supabase/browser.ts`, `supabase/server.ts`, `supabase/middleware.ts` — clients e SSR.

### Auditoria & Integridade — `src/lib/audit/`, `src/lib/verify/`, `src/lib/lgpd/`
- `audit/auditLog.ts`, `audit/anchor.ts`, `audit/photoAntifraud.ts`, `audit/timelinePresent.ts`, `audit/dashboardQuery.ts`, `audit/reliability.ts`.
- `verify/publicVerify.ts`, `verify/publicReceipt.ts`, `verify/pdfUploadVerify.ts`, `verify/disclosureScope.ts`, `verify/logVerifyAudit.ts` — verificação pública por QR/hash (sem login).
- `lgpd/dataInventory.ts`, `lgpd/maskPersonal.ts`, `lgpd/subjectExport.ts` — LGPD.

### Histórico & Evidência Veicular — `src/lib/vehicleEvidence/`
- `lifeHistory.ts`, `vehicleEvents.ts`, `vehicleIdentity.ts`, `compareInspections.ts`, `groupReports.ts`, `fleetKpis.ts`, `prontuarioIntel.ts`, `auditEvents.ts` — timeline, comparação antes/depois, KPIs de frota.

### Sync & Offline — `src/lib/sync/`
- `sync.ts`, `sync.test.ts`, `idempotency.ts`, `mergePolicy.ts` — merge por placa, fila com flush de 10s + throttle.

### IA / Visão — `src/lib/server/`
- `geminiVision.ts`, `groqVision.ts`, `qwenVision.ts`, `viewSideClassify.ts`, `groqRetry.ts`, `groqClient.ts`.

### UI / Páginas — `src/app/`, `src/views/`, `src/components/`
- Rotas B2B: `/locadoras`, `/oficinas`, `/frotas`, `/seguradoras`, `/historico`, `/comparativo`, `/planos`, `/verify`, `/assinar`, `/pagamento-pix`, `/pagamento-cartao`, `/selo`, `/blog`, etc.
- `views/`: `Demo.tsx`, `Login.tsx`, `Verify.tsx`.
- `components/ReportActions.tsx`, `CompanySettingsModal.tsx` — export PDF, share WhatsApp, branding.

### Database — `supabase/schema.sql` + `src/supabase/migrations/`
- **44 migrations** (de `20260101000000_additive_phases.sql` até `20260823_clients_registry.sql`) cobrindo: segurança/monitoring, company teams, CNH/assinatura, QR tokens, PIX subscription, private damage photos, multi-tenant, integrity manifest, issued immutability, audit log, photo evidence, AI decisions, review gate, signature meta, vehicles, vehicle events, API keys, lifecycle email flags, inspection purpose, view photos, perf indexes/RLS/storage, audit anchors, photo antifraud, disclosure scope, laudo quota, public report receipt RPC, sync/vehicle RLS indexes, assinafy certification, clients registry.

### Vídeo / Marketing — `videoforge/`, `docs/marketing/`, `marketing/`
- `videoforge/remotion/` — composições de anúncio (Ad15/30/60) com Remotion, storyboards e vozes.
- `docs/marketing/` — ICP, landing pages, lead scoring, meta/google ads, wireframes.
- `task-report.md`, `tareas.md`, `plan_implementacion.md` — artefatos de conversão B2B e vídeo.

## Interface Contracts (atualizados)

### `PdfSettings` (`src/lib/pdf/types.ts`)
```typescript
export interface CustomThemeColors {
  accentColor?: string;     // HEX marca, ex. "#0284c7"
  headerBg?: string;        // gradiente ou cor sólida
  colorStripe?: string;     // faixa accent do rodapé do header
}

export interface PdfSectionVisibility {
  showInfoTable?: boolean;
  showChecklistSection?: boolean;   // NOVO
  showGeoAuditSection?: boolean;    // NOVO
  showSvgDiagrams?: boolean;
  showSummaryStats?: boolean;
  showDamageTable?: boolean;
  showPhotoGallery?: boolean;
  showInteriorSection?: boolean;
  showSignatures?: boolean;
}

export interface PdfHeaderFooterConfig {
  logoPosition?: 'left' | 'center' | 'right';
  logoMaxHeight?: number;         // Default: 42
  headerSubtitle?: string;        // Default: "RELATÓRIO DE VISTORIA VEICULAR"
  showQrCode?: boolean;
  showGpsLocation?: boolean;
  customFooterText?: string;
}

export interface PdfSettings {
  companyName?: string;
  companyLogo?: string;
  pdfTheme?: 'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante';
  customColors?: CustomThemeColors;
  layoutMode?: 'single-page' | 'multi-page' | 'auto';
  sections?: PdfSectionVisibility;
  headerFooter?: PdfHeaderFooterConfig;
}
```

### PDF Generator API (híbrido)
```typescript
// src/lib/pdf.ts → re-exporta de clientOrchestrator/render
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

// Controle de acesso (novo): PdfAccessOpts (ver src/lib/pdf/clientOrchestrator.ts)
```

### Billing Plans (`src/lib/billing/plans.ts`)
```typescript
export type SelfServePlanId = 'starter' | 'pro'
export type PlanTierId = SelfServePlanId | 'corporativo'
// starter: R$29,90 · 20 laudos/mês
// pro:     R$79,90 · 80 laudos/mês
// corporativo: R$299 · 5 usuários · ilimitado
```

## Project Milestones (estado consolidado)

| # | Milestone | Track | Status |
|---|-----------|-------|--------|
| **PDF-CORE** | Motor de PDF client + server, temas, seções, dual-mode, performance/offline | PDF | COMPLETED |
| **PDF-TEST** | E2E test infra + suite Vitest (`TEST_READY.md`, `TEST_INFRA.md`) | QA | COMPLETED |
| **INTEGRITY** | Hash SHA-256, integrity manifest, issued immutability, audit log, antifraud | Auditoria | COMPLETED |
| **MULTI-TENANT** | RLS por tenant, escopo, API keys, clients registry | Plataforma | COMPLETED |
| **BILLING** | Planos Starter/Pro/Corporativo, Stripe + PIX (Asaas/Mercado Pago) | Monetização | COMPLETED |
| **VERIFY** | Verificação pública via QR/hash, código de procedência, disclosure scope | Confiança | COMPLETED |
| **VEHICLE-EVIDENCE** | Histórico por placa, vehicle events, comparativo, fleet KPIs | Produto | COMPLETED |
| **AI-VISION** | Sugestão de avaria por foto (Gemini/Groq/Qwen), view-side classify | IA | PARTIAL (sugestão + humano confirma; falta bounding box no diagrama) |
| **B2B-CONVERSION** | Reposicionamento "Histórico/Evidência", CTAs trial, landings, message match | Growth | COMPLETED (P0/P1/P3; P2 A/B pendente) |
| **VIDEO** | Anúncios Remotion 15/30/60s, logo sting | Marketing | COMPLETED |

## Acceptance Verification Criteria
- `npm test` (Vitest): suites de PDF, sync, audit, onboarding, billing, verify, photoStore passam com 0 erros.
- `npm run build` + `npm run typecheck` (`tsc --noEmit`): compilação e checagem TS com 0 erros.
- Geração de PDF em browser/servidor: sem overlap, clipping ou escala ilegível.
- Auditoria forense: verificação CLEAN (0 violações de integridade/facades).
- Verificação pública (`/verify`): QR/hash resolvem para o laudo original imutável.

## Notas de atualização
- O `PROJECT.md` anterior citava `c:/Users/Nei/Desktop/Danos-Aparentes-main_4/...` e documentava apenas a fase de PDF — **obsoleto**.
- Esta versão reflete `E:/workspaces/Danos-Aparentes-main` com arquitetura multi-tenant, billing, auditoria e verificação pública.
