# Integrity roadmap checkpoint — COMPLETE (FASE 1–19)

**Branch:** `cursor/starter-plan-quota`  
**As of:** 2026-07-27  
**Status:** Roadmap closed — phases 1–19 implemented locally; ready for commit/deploy.

## Done

| Fase | What | Notes |
|------|------|-------|
| 1 | Crypto integrity manifest v2 | prod |
| 2 | Issued immutability + versioning | prod |
| 3 | Audit log hash chain | prod |
| 4 | Photo ORIGINAL + OPTIMIZED | prod |
| 5 | AI decision trail | prod |
| 6 | Review gate before issue | prod |
| 7 | SignatureProvider (on-screen + meta) | prod |
| 8 | Public verify outcomes + code lookup | prod |
| 9 | PDF upload → SHA-256 vs `pdf_hash` | local — `/verify` upload |
| 10 | Inspection audit timeline UI | local — Laudo tab |
| 11 | LGPD technical controls (inventory, mask, export) | local — min slice |
| 12 | Multi-tenant `tenant_id` (= `companies.id`) | local — migration + sync/hash/audit writes |
| 13 | RBAC (solo / owner / inspector) | local — review + LGPD + team API guards |
| 14 | Offline idempotency keys | local — sync audit + hash register dedupe (best-effort) |
| 15 | PDF disclaimer copy | local — footer + signature caption |
| 16 | Org-wide audit dashboard | local — `/api/audit-log` + `AuditDashboard` (owner/solo) |
| 17 | Broader integrity tests | local — chain, RBAC, dashboard, idempotency integration |
| 18 | Public verify audit event | local — `POST /api/verify-audit` + `/verify` hook |
| 19 | Ops readiness | local — `idx_audit_log_tenant_ts` migration |

## Product rule

- No “validade jurídica garantida”
- Human picks part; AI classifies only
- On-screen signature ≠ qualified certificate
- LGPD module = technical controls only (not legal advice / fake compliance)

## FASE 12–19 code map

| Fase | Key files |
|------|-----------|
| 12 | `src/supabase/migrations/20260727080000_multi_tenant.sql`, `src/lib/tenant/resolveTenant.ts`, `src/lib/server/tenantScope.ts` |
| 13 | `src/lib/auth/rbac.ts`, `src/lib/server/rbac.ts`, UI guards in `InspectTab`, `ReportActions`, `SavedReportsModal`, `useSavedReports` |
| 14 | `src/lib/sync/idempotency.ts`, `auditLog.ts` idempotency_key, `hash.ts` hash-exists skip |
| 15 | `src/lib/pdf/disclaimer.ts`, `html.ts` footer, `sections.ts` signature caption |
| 16 | `src/app/api/audit-log/route.ts`, `src/components/AuditDashboard.tsx`, `src/lib/audit/dashboardQuery.ts` |
| 17 | `src/lib/audit/__tests__/integrityIntegration.test.ts`, `dashboardQuery.test.ts`, extended `rbac.test.ts` |
| 18 | `src/app/api/verify-audit/route.ts`, `src/lib/server/auditAppend.ts`, `src/lib/verify/logVerifyAudit.ts`, `Verify.tsx` |
| 19 | `src/supabase/migrations/20260727100000_audit_log_tenant_index.sql` |

## Migrations to apply

1. `20260727080000_multi_tenant.sql` (if not yet applied)
2. `20260727100000_audit_log_tenant_index.sql`

## Verify before deploy

```bash
npx vitest run src/lib/pdf/__tests__/disclaimer.test.ts src/lib/audit src/lib/auth/__tests__/rbac.test.ts src/lib/server/__tests__/auditAppend.test.ts src/lib/sync/__tests__/idempotency.test.ts
```
