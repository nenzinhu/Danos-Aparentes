# Integrity roadmap checkpoint — through FASE 15

**Branch:** `cursor/starter-plan-quota`  
**As of:** 2026-07-27

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

## Next

- **16** Audit dashboard → **17** Broader tests

## Product rule

- No “validade jurídica garantida”
- Human picks part; AI classifies only
- On-screen signature ≠ qualified certificate
- LGPD module = technical controls only (not legal advice / fake compliance)

## FASE 12–15 code map

| Fase | Key files |
|------|-----------|
| 12 | `src/supabase/migrations/20260727080000_multi_tenant.sql`, `src/lib/tenant/resolveTenant.ts`, `src/lib/server/tenantScope.ts` |
| 13 | `src/lib/auth/rbac.ts`, `src/lib/server/rbac.ts`, UI guards in `InspectTab`, `ReportActions`, `SavedReportsModal`, `useSavedReports` |
| 14 | `src/lib/sync/idempotency.ts`, `auditLog.ts` idempotency_key, `hash.ts` hash-exists skip |
| 15 | `src/lib/pdf/disclaimer.ts`, `html.ts` footer, `sections.ts` signature caption |
