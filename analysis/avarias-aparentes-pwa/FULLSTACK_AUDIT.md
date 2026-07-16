# Auditoria Full Stack — Danos Aparentes

**Data:** 2026-07-16 (revalidação do main)  
**Repo:** `nenzinhu/Danos-Aparentes`  
**Escopo:** PWA (vistoria + PDF + sync) + APIs + Supabase + billing PIX/Stripe + marketing  
**Método:** inspeção estática do código atual em `main`, schema/migrations, rotas API, shell do app, offline stack, testes e CI. Sem exploração runtime em produção.  
**Baseline anterior:** auditoria de 2026-07-15 (PR #7) — vários P0 já foram fechados; este doc é a fonte viva.

---

## 1. Resumo executivo

O **Danos Aparentes** é um SaaS PWA maduro na stack certa: **Next.js 16 + React 19 + TypeScript + Supabase + Stripe/Mercado Pago**, com offline-first (IndexedDB), laudo PDF, mapas SVG, times Corporativo e landings por vertical.

**Não precisa de reescrita.** O que falta é endurecer caminhos de dinheiro/dados, eliminar edge cases de sync que podem apagar laudos locais, e reduzir débito em componentes grandes + cobertura de testes.

| Dimensão | Nota | Comentário |
|---|---|---|
| Arquitetura geral | B+ | Shell modularizado; PDF já em `src/lib/pdf/*`; form parcialmente quebrado |
| Backend / APIs | B- | Auth boa nas rotas sensíveis; PIX/webhooks ainda frágeis em retry |
| Segurança de dados | B | Bucket privado ✅; histórico por placa ainda cross-tenant |
| Offline / Sync | C+ | Fila existe, mas `pullRemote` vazio em erro pode apagar local |
| Frontend / UX | B | God components menores; PDF/SavedReports ainda densos |
| Billing (Stripe + PIX) | C+ | Stripe ok; PIX sem idempotência real de webhook |
| Testes / CI | B- | 10 testes + CI schema; faltam sync failure + PIX duplicate |
| Marketing / SEO | B+ | Landings + blog; blog.tsx ainda monólito (~3.5k LOC) |

**Ordem estratégica:** **P0 dados/dinheiro → P1 sync/PDF/API guards → P2 DX/marketing polish**.

---

## 2. O que já foi feito (desde 2026-07-15)

| Item antigo | Status no main atual | Evidência |
|---|---|---|
| Bucket `damage-photos` público | ✅ Privado + signed URLs | `supabase/schema.sql`, migration `20260715_private_damage_photos.sql`, `photoStorage.ts` |
| Auth em `plate-lookup` | ✅ Auth + assinatura ativa | `src/app/api/plate-lookup/route.ts` |
| Rate limit só em memória | ✅ Upstash/KV com fallback | `src/lib/server/rateLimit.ts` |
| Credencial `pooler-url` no tree | ✅ Ausente | `src/supabase/.temp/` não versionado |
| PDF monolítico `pdf.ts` | ✅ Split em `lib/pdf/*` | `html.ts`, `sections.ts`, `render.ts`, `theme.ts` |
| `VehicleInfoForm` ~1.2k LOC | ✅ Parcial (~566 LOC + steps) | `vehicleInfoForm/*` |
| Testes de produto (só 2) | ✅ ~10 arquivos | sync, PIX, Stripe, CNH/plate parsers, rateLimit |
| Assets PWA / OG | ✅ Presentes | `icon-192/512`, `og-image.jpg`, `vehicles-img/`, `videos/` |

---

## 3. Mapa do sistema

```text
┌─────────────────────────────────────────────────────────────┐
│ Marketing SSR                                                 │
│ /, /planos, /faq, /blog, /locadoras,/oficinas,/frotas,/segur. │
│ /pagamento-pix                                                │
└───────────────────────────┬─────────────────────────────────┘
                            │ CTA → /app
┌───────────────────────────▼─────────────────────────────────┐
│ App Shell (client)  src/app/app/page.tsx                      │
│  Auth · Paywall · Tabs: Inspect | Dashboard | Team            │
│  InspectTab → VehicleInfoForm · VehicleViewer · DamageList    │
│               ReportActions (PDF) · Vision IA                 │
└───────────────┬───────────────────────────┬──────────────────┘
                │ IndexedDB                 │ Bearer / cookie JWT
                ▼                           ▼
         sync_queue / photos        src/app/api/* (~20 rotas)
                │                           │
                └──────────► Supabase ◄─────┘
                     Postgres + RLS + Storage (privado)
                     Stripe + Mercado Pago webhooks → subscriptions
```

### Inventário rápido (LOC aprox. em `src/`)

| Área | LOC | Papel |
|---|---|---|
| `src/components` | ~12k+ | UI produto + landings + SVG veículos |
| `src/app` | ~5k | Rotas App Router + API |
| `src/content` | ~3.5k | Blog monólito + chat support |
| `src/lib` | ~3k+ | Sync, PDF, DB, auth server, fotos, analytics |
| `src/hooks` | ~1k | Auth, damages, subscription, workflow, TTS |

---

## 4. Achados novos / ainda abertos (priorizados)

### P0 — risco de dinheiro, perda de dados ou vazamento

#### P0-1. Webhook PIX não é idempotente (pode estender assinatura duas vezes)
- **Onde:** `src/app/api/pix-webhook/route.ts`, `src/lib/subscriptionAccess.ts` (`extendSubscriptionExpiry`)
- **Problema:** após processar, `pending_months` vira `0`. Retry do MP chama `extendSubscriptionExpiry(..., 0)`, que **normaliza 0 → 1 mês**. Webhook duplicado pode dar mês extra.
- **Ação:**
  1. Tabela `pix_payment_events(payment_id unique, processed_at)` ou update condicional `WHERE pending_months > 0`.
  2. Em `extendSubscriptionExpiry`, tratar `months <= 0` como no-op (não default 1).
  3. Teste: pagamento já processado não altera `expires_at`.

#### P0-2. `pullRemote()` em erro parece “nuvem vazia” e pode apagar laudos locais
- **Onde:** `src/lib/sync.ts` (`pullRemote` ~166–172, `mergeRemoteReports` ~201–204)
- **Problema:** `if (error || !inspections) return []`. Merge remove locais com `syncedAt` e sem upsert pendente quando remoto não tem o id — ou seja, falha de rede/RLS vira delete local.
- **Ação:** retornar `{ ok: false }` / throw em erro; merge só remove quando pull foi bem-sucedido e remoto confirma ausência.

#### P0-3. Histórico `/historico/[token]` lista laudos por placa sem filtro de tenant
- **Onde:** `src/app/historico/[token]/page.tsx` (~29–33)
- **Problema:** QR do veículo mostra `report_hashes` de **qualquer** operador da mesma placa (ref/OS + contagem). Risco LGPD / concorrência entre locadoras.
- **Ação (produto):** filtrar por `user_id` do emissor do token **ou** minimizar campos e documentar como lista pública deliberada.

#### P0-4. HTML do PDF interpola campos do usuário sem escape
- **Onde:** `src/lib/pdf/sections.ts`, `src/lib/pdf/html.ts`, `src/lib/pdf/theme.ts`
- **Problema:** `owner`, `generalNotes`, custom fields, labels entram em template string. Risco de HTML quebrado / conteúdo inesperado no laudo.
- **Ação:** `escapeHtml()` em todo texto; validar data URLs de imagem separadamente.

#### P0-5. Cobrança PIX sobrescreve `pix_charge_id` (pagamento antigo órfão)
- **Onde:** `src/app/api/create-pix-charge/route.ts`, `pix-webhook`
- **Problema:** nova cobrança substitui o id na subscription; se o usuário paga QR antigo, webhook não encontra assinatura (404 + retries). Idempotency-Key do MP é aleatória → cobranças duplicadas em retry de rede.
- **Ação:** tabela `pix_payments` (payment_id, user_id, months, status); reutilizar cobrança pendente ou key determinística.

---

### P1 — robustez, segurança de API, confiabilidade do app

| # | Ação | Onde |
|---|---|---|
| P1-1 | Dead-letter local para sync após 5 retries (hoje remove da fila) | `sync.ts` + UI status no Header |
| P1-2 | Gate `plan_tier === 'corporativo'` em `report-by-plate` (hoje basta ter company/membership) | `api/report-by-plate/route.ts` |
| P1-3 | CSRF/Origin check em POSTs autenticados por cookie | `create-pix-charge`, checkout, team-*, signature-link |
| P1-4 | Idempotência Stripe (`event.id` único) + ordenação de eventos | `api/stripe-webhook/route.ts` |
| P1-5 | Webhook MP: validar freshness `ts`, igualdade query `data.id` vs body, body size limit, 200 para eventos não acionáveis | `pix-webhook/route.ts` |
| P1-6 | Race no load de vistoria: `clearDamages` + `addDamage` sem await; foto pode atualizar dano inexistente | `useInspectionWorkflow.ts`, `useDamages.ts` |
| P1-7 | PDF sem fotos em SavedReports/TeamTab (só `ReportActions` resolve `blob:`/`storage:`) | extrair `prepareReportForPdf()` |
| P1-8 | Rate limit em checkout, portal, team-invite/accept, signature-link, vehicle-qr, report-by-plate | rotas API |
| P1-9 | Assinatura remota: só PNG/JPEG, validar tamanho base64 | `remote-signature`, `signatureLink.ts` |
| P1-10 | Convites de equipe: `expires_at`, unique pending por email, rate limit | `team-invite`, migration |
| P1-11 | Timeouts (`AbortSignal`) em fetch externo (MP, Gemini, WDAPI, TTS) | `mercadoPagoClient`, `geminiVision`, plate-lookup, tts |
| P1-12 | Sanitizar erros de API (não vazar mensagem Gemini/Stripe/TTS) | `ia`, `tts`, `chat-support`, stripe-webhook |
| P1-13 | Registrar SW no boot do `/app` + precache mínimo do shell | `sw.js`, `PwaInstallButton`, `app/page` |
| P1-14 | GC de fotos órfãs no IndexedDB ao deletar dano/laudo | `useDamages`, `useSavedReports`, `photoStore` |

---

### P2 — manutenção, performance, DX

| # | Ação | Onde |
|---|---|---|
| P2-1 | Quebrar `SavedReportsModal` (~674), `VehicleViewer` (~467), `DashboardView` (~435) | components |
| P2-2 | Split `blog.tsx` (~3511) → índice leve + posts por slug | `content/blog*` |
| P2-3 | Unificar landings `frotas/oficinas/locadoras/seguradoras` em config + template | `app/*`, `*Ctas.tsx` |
| P2-4 | Home como Server Component + ilhas client; remover `animejs` se só `TrustSection` usa | `app/page.tsx`, `TrustSection` |
| P2-5 | Unificar registries SVG (`registry.ts` vs `staticRegistry.ts`) | `components/vehicles` |
| P2-6 | Extrair helpers `requireUser` / `requireCorporateOwner` / `parseJsonBody` | `lib/server` |
| P2-7 | Modelo `PhotoAttachment { ref, note }` em vez de arrays paralelos | `types.ts` |
| P2-8 | Parser runtime em `reportMapping` (sem `as` cego) | `lib/reportMapping.ts` |
| P2-9 | Error boundaries em `/app`, viewer e PDF | `app/app/error.tsx` + locais |
| P2-10 | A11y: AppTabBar roles, ChatSupport foco/Escape, FAQ focus ring, PIX `aria-live` | components + `pagamento-pix` |
| P2-11 | Religar ou remover `IaTab.tsx` (órfão) | `components/app/IaTab.tsx` |
| P2-12 | `Cache-Control: private, no-store` em GETs sensíveis | team-reports, report-by-plate, remote-signature |
| P2-13 | Ignorar `src/supabase/.temp/` no `.gitignore` (defesa em profundidade) | `.gitignore` |
| P2-14 | Bundle budget no CI (framer-motion, html2pdf, zxing, blog) | `package.json` / CI |

---

## 5. Testes que faltam (prioridade)

Existentes úteis: `sync.test.ts`, `pix-flow.test.ts`, `stripe-webhook/route.test.ts`, `subscriptionAccess.test.ts`, `mercadoPagoWebhook.test.ts`, parsers.

**Adicionar:**

1. Webhook PIX duplicado **não** estende assinatura  
2. `pullRemote` com erro **não** apaga laudos locais no merge  
3. `extendSubscriptionExpiry(…, 0)` é no-op  
4. Mismatch `data.id` query vs body no webhook MP  
5. `escapeHtml` no PDF (campo com `<script>`)  
6. Gate Corporate em `report-by-plate`  
7. JSON inválido → 400 nas rotas mutáveis  
8. Dead-letter de sync visível / reprocessável  

Vitest hoje usa `environment: 'node'` — ok para lib/API; para hooks, considerar `jsdom` + Testing Library depois.

---

## 6. Ordem sugerida de PRs

1. **fix-pix-webhook-idempotency** — eventos únicos + `months <= 0` no-op + testes  
2. **fix-sync-pull-safe-merge** — não deletar local em falha de pull + testes  
3. **fix-pdf-escape-html** — escape em sections/html  
4. **security-historico-tenant** — filtrar por emissor do QR (ou decisão de produto documentada)  
5. **fix-pix-payments-table** — cobranças sem sobrescrever charge id  
6. **fix-pdf-photo-prepare** — util único para SavedReports/Team/ReportActions  
7. **hardening-api-guards** — CSRF, rate limits, Corporate gate, timeouts, erros genéricos  
8. **refactor-god-components** — SavedReports / Viewer / blog split  
9. **pwa-sw-boot** — registro no boot + precache  

Cada PR: `npm run lint && npm run typecheck && npm run test`.

---

## 7. Fora de escopo agora

- Reescrever framework  
- PDF server-side (só se memória mobile virar ticket)  
- Monorepo / microserviços  
- Editar pastas de skills embutidas / videoforge renders  

---

## 8. Relação com docs anteriores

| Doc | Papel |
|---|---|
| `ASSESSMENT.md` | Baseline de modernização; item pooler-url resolvido |
| `FULLSTACK_AUDIT.md` (este) | **Fonte viva** do backlog engenharia |
| `seo-technical-audit.md` / `seo-audit-home.md` | SEO/marketing (complementar) |
| PR #7 (2026-07-15) | Versão anterior; vários P0 já ✅ neste main |

---

## 9. Como usar

1. Tratar a seção **P0** como backlog imediato.  
2. Antes de migration em produção: checklist de rollback.  
3. Ao fechar item, marcar `✅` na tabela e abrir PR focado.  
4. Não misturar refactor cosmético com fixes de sync/PIX no mesmo PR.
