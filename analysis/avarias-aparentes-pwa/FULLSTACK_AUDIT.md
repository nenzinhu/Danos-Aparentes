# Auditoria Full Stack — Danos Aparentes

**Data:** 2026-07-15  
**Repo:** `nenzinhu/Danos-Aparentes`  
**Escopo:** produto PWA (vistoria + PDF + sync) + APIs + Supabase + billing + marketing  
**Método:** inspeção estática de código, schema/migrations, rotas API, shell do app, offline stack, testes e CI. Sem exploração runtime em produção.

---

## 1. Resumo executivo

O **Danos Aparentes** é um SaaS PWA maduro na stack correta: **Next.js 16 + React 19 + TypeScript + Supabase + Stripe**, com offline-first (IndexedDB), laudo PDF, mapas SVG, times Corporativo e landings por vertical.

Não precisa de reescrita. O que falta é **endurecimento de segurança/dados**, **fechar falhas de isolamento**, **reduzir débito em arquivos-deus** e **cobrir com testes** o que já quebrou em produção (sync/schema).

| Dimensão | Nota | Comentário |
|---|---|---|
| Arquitetura geral | B+ | Stack moderna; shell do `/app` já modularizado; domínio claro |
| Backend / APIs | B- | Auth boa nas rotas sensíveis; superfícies públicas com custo/PII |
| Segurança de dados | C+ | Bucket público de fotos + histórico por placa cross-tenant |
| Offline / Sync | B | Fila sólida, mas drop após retries e SW subdimensionado |
| Frontend / UX | B | God Form + God PDF concentram risco |
| Billing (Stripe) | B- | Happy path Pro ok; Corporate/falhas incompletos |
| Testes / CI | C | CI existe; só 2 testes de produto |
| Marketing / SEO | B+ | Landings + blog + auditorias SEO já feitas |
| Docs / ops schema | C+ | `schema.sql` + migrations em `src/supabase/` exigem disciplina |

**Recomendação estratégica:** consolidar in-place (não replatform). Ordem: **P0 segurança/isolamento → P1 sync/PDF/forms → P2 DX/marketing polish**.

---

## 2. Mapa do sistema (por parte)

```text
┌─────────────────────────────────────────────────────────────┐
│ Marketing SSR                                                 │
│ /, /planos, /faq, /blog, /locadoras,/oficinas,/frotas,/segur. │
└───────────────────────────┬─────────────────────────────────┘
                            │ CTA → /app
┌───────────────────────────▼─────────────────────────────────┐
│ App Shell (client)  src/app/app/page.tsx                      │
│  Auth · Paywall · Tabs: Inspect | Dashboard | Team            │
│  InspectTab → VehicleInfoForm · VehicleViewer · DamageList    │
│               ReportActions (PDF/WhatsApp) · TTS              │
└───────────────┬───────────────────────────┬──────────────────┘
                │ IndexedDB                 │ Bearer JWT
                ▼                           ▼
         sync_queue / photos        src/app/api/* (14 rotas)
                │                           │
                └──────────► Supabase ◄─────┘
                     Postgres + RLS + Storage
                     Stripe webhooks → subscriptions
```

### Inventário rápido (LOC aprox.)

| Área | LOC | Papel |
|---|---|---|
| `src/components` | ~12.5k | UI produto + landings + SVG veículos |
| `src/app` | ~4.6k | Rotas App Router + API |
| `src/content` | ~3.4k | Blog (arquivo-deus) + chat support |
| `src/lib` | ~2.8k | Sync, PDF, DB, auth server, fotos |
| `src/hooks` | ~0.8k | Auth, damages, subscription, TTS |
| `supabase` + migrations | schema + 5 SQL | Dados e RLS |

Tipos de veículo: `car`, `car2d`, `moto`, `truck`, `van`, `bus`, `microbus`, `custom` × 4 vistas.

---

## 3. O que já está bem feito

1. **Offline-first real** — IndexedDB + `sync_queue` + merge LWW + upload de fotos separado do Postgres (`src/lib/sync.ts`, `photoStore.ts`).
2. **RLS por usuário** + helper `user_has_active_subscription` no schema (insert/update de laudos exige assinatura/trial).
3. **CI útil** — lint, typecheck, tests e `check:sync-schema` (nasceu de incidente real de coluna ausente).
4. **Stripe webhook** valida assinatura (`constructEvent`); rotas de checkout/portal exigem JWT.
5. **Assinatura remota** com update atômico `client_signature = ''` (evita overwrite).
6. **Shell do app** já foi quebrado em tabs (`InspectTab`, `TeamTab`, etc.) — `page.tsx` ~365 linhas.
7. **Marketing separado do viewer vivo** — landings usam `LaudoSheet` / PNGs, não o SVG interativo.
8. **Document-photos privado** — contraste correto com dados sensíveis de CNH.
9. **Rate limiting** presente nas APIs pagas (mesmo que só in-memory).

---

## 4. Análise por camada — o que melhorar

### 4.1 Backend / APIs

| Rota | Auth | Rate limit | Assinatura | Prioridade |
|---|---|---|---|---|
| `create-checkout/portal` | Sim | Não | — | P2 rate limit |
| `stripe-webhook` | Stripe sig | body 1MB | — | P1 eventos pagamento |
| `team-*` | Sim | Não | Corporate | P1 rate + expiração invite |
| `report-by-plate` | Sim | Não | **não checa Corporate** | **P0** |
| `remote-signature` | Público | só POST | — | **P0** token + rate GET |
| `plate-lookup` | Público | IP | — | **P0** auth (custo WDAPI) |
| `ia` / `damage-vision` | Soft se Supabase off | Soft | Soft | **P1** sempre auth+limit |
| `tts` / `chat-support` | Soft/público | IP | — | P1 abuso custo |
| `vehicle-qr` | Sim | Não | — | P2 |

**Gaps de Stripe:** falta `invoice.payment_failed` / recuperação; Corporate só via Payment Link; `checkout.session.completed` não garante `current_period_end` nem upsert se row sumiu; downgrade Corporate não limpa `companies`/`team_members`.

**Rate limit:** `src/lib/server/rateLimit.ts` é Map em memória — frágil em serverless multi-instância. Migrar para Upstash/Redis quando custo for real.

---

### 4.2 Dados / Supabase / Storage

**Drift de schema**

- Base: `supabase/schema.sql`
- Evolução: `src/supabase/migrations/*.sql` (teams, interior_*, sync_errors, vehicle_qr_tokens, plan_tier)
- Sync escreve `interior_*` — se alguém aplicar só o schema base, sync quebra (já aconteceu; daí o CI `check:sync-schema`).

**P0 — bucket `damage-photos` público**

```152:155:supabase/schema.sql
insert into storage.buckets (id, name, public)
values ('damage-photos', 'damage-photos', true)
```

Path previsível `{userId}/{inspectionId}/…`. Quem conhece a URL lê a foto **sem JWT**. Migration de jun/2026 já comentou `public=false` mas **não aplicou**.

**Ação:** migration `UPDATE … SET public = false` + trocar `getStoragePublicUrl` por `createSignedUrl` em `photoStorage.ts` / `photoStore.ts`.

**P0/P1 — histórico `/historico/[token]`**

Produto deliberadamente lista laudos **por placa** (QR no veículo). Hoje não filtra `user_id`:

```29:33:src/app/historico/[token]/page.tsx
.from('report_hashes')
.select('hash, ref, issued_at, damages_count')
.eq('plate', tokenRow.plate)
```

Isso vaza `ref`/OS e contagem de avarias entre operadores distintos da mesma placa (locadoras concorrentes). Decidir produto:

- **A)** filtrar por `vehicle_qr_tokens.user_id` (histórico só do emissor do QR), ou  
- **B)** manter público mas minimizar campos e documentar LGPD.

**P0 — `report-by-plate` sem gate Corporate** — qualquer user com company/member legado amplia escopo via service role sem checar `plan_tier`.

---

### 4.3 Frontend / PWA / PDF

| Parte | Estado | Melhorar |
|---|---|---|
| App shell | Bom | Reduzir prop-drilling do `InspectTab` (Context) |
| `VehicleInfoForm` (~1.2k LOC) | God component | Extrair steps, plate lookup, custom fields, assinaturas |
| Dual registry SVG | Drift risk | Uma fonte → `registry` + `staticRegistry` gerados |
| `pdf.ts` | Temas + HTML string | `escapeHtml`, tipar `PdfThemeName`, menos `any` |
| Sync queue | Drop @ 5 retries | Dead-letter + CTA “Tentar de novo” |
| Service Worker | Network-first mínimo | Registrar no boot do `/app`; precache shell |
| `IaTab.tsx` | Órfão | Religar na tab bar ou remover |
| Assinaturas | dataURL inline | Persistir como `blob:` ref (payload sync menor) |
| Fotos IDB | Sem GC | Sweep de blobs órfãos |

**HTML injection no PDF:** campos livres (`owner`, `notes`, `partName`, custom) interpolados sem escape — tratar como P0 de sanitização.

---

### 4.4 Auth / Assinatura / Multi-tenant

- Server `getUserFromRequest` valida JWT no Supabase — correto.
- Trial/active espelhado no cliente (`useSubscription`) e no server — bom.
- Team: RLS com `is_team_manager_of` + rotas admin com service role.
- Falhas: rotas service-role (`report-by-plate`, historico) reabrem cross-tenant; invites sem expiração; member vê placa da equipe em `report-by-plate` (pode ser feature — documentar).

---

### 4.5 Qualidade / Testes / DX

**Testes de produto hoje:** apenas

- `src/lib/sync.test.ts`
- `src/app/api/stripe-webhook/route.test.ts`

**Prioridade de novos testes**

1. `flushQueue` retries + dead-letter  
2. `cnhBarcode.extractCnhFieldsFromBarcode`  
3. `photoStore` normalize / branching de refs  
4. `computeHash` do PDF (integridade `/verify`)  
5. Paridade registry static vs dynamic  
6. Gate Corporate em `report-by-plate`  

**DX**

- Imports mistos `@/src/...` e `@/lib/...` (paths `@/*` → raiz). Padronizar.
- `Stripe` sem `apiVersion` fixo (`stripeClient.ts:9`).
- `blog.tsx` ~3.3k linhas — dividir por slug.
- README ainda fala em Vite/paths legados em trechos mentais; manter alinhado à estrutura Next.

---

### 4.6 Marketing / SEO / conversão

Já auditado em `seo-technical-audit.md` / keyword research. Pendências leves:

- Linkar `/demo` e `/verify` (ou `noindex` explícito em `/verify` vazio).
- Preferir `next/image` onde ainda houver `<img>` cru.
- `sitemap` `lastModified: new Date()` dilui sinal de frescor em páginas estáticas.
- Conteúdo `IaTab`/feature IA alinhada ao ads vs produto.

---

## 5. Roadmap priorizado (o que fazer)

### P0 — fazer primeiro (segurança / perda de dados)

| # | Ação | Onde |
|---|---|---|
| 1 | Bucket `damage-photos` → privado + signed URLs | `schema`/migration + `photoStorage.ts` |
| 2 | Decisão + fix isolamento `/historico/[token]` | `historico/[token]/page.tsx` |
| 3 | Gate `plan_tier === 'corporativo'` em `report-by-plate` | `api/report-by-plate/route.ts` |
| 4 | Auth (ou token de sessão) em `plate-lookup` | `api/plate-lookup/route.ts` |
| 5 | Token single-use/expirável + rate limit GET em assinatura remota | `api/remote-signature` + migration |
| 6 | `escapeHtml` em `pdf.ts` | `src/lib/pdf.ts` |
| 7 | Não descartar sync sem retry manual / dead-letter UI | `sync.ts` + Header sync status |

### P1 — próximos (robustez / custo / dívida)

| # | Ação |
|---|---|
| 8 | Quebrar `VehicleInfoForm` em subcomponentes/hooks |
| 9 | Unificar registries de veículos |
| 10 | Auth+rate sempre em `ia` / `damage-vision` (mesmo sem Supabase) |
| 11 | Stripe: `payment_failed`, upsert seguro, limpar team no downgrade |
| 12 | Registrar SW no boot `/app` + precache mínimo |
| 13 | Suite Vitest: sync flush, CNH barcode, hash PDF, photo refs |
| 14 | Rate limit distribuído (Upstash) se tráfego crescer |
| 15 | Expiração + rate em `team-invite` |
| 16 | Tipar temas PDF; `apiVersion` Stripe fixa |
| 17 | Remover ou religar `IaTab` |

### P2 — polish / crescimento

| # | Ação |
|---|---|
| 18 | Split `blog.tsx` por post |
| 19 | Padronizar imports `@/` |
| 20 | SEO: links internos demo/verify; `lastmod` estático |
| 21 | GC IndexedDB de fotos órfãs |
| 22 | Assinaturas como blob refs |
| 23 | Observabilidade: dash Speed Insights + alertas `sync_errors` |
| 24 | Documentar pipeline `schema.sql` + migrations + `db:push` num runbook curto |

---

## 6. Ordem sugerida de PRs (técnico, sem prazo)

1. **security-storage-signed-urls** — bucket privado + signed URLs  
2. **security-tenant-gates** — historico + report-by-plate + plate-lookup auth  
3. **security-remote-signature-tokens** — tokens de assinatura  
4. **fix-pdf-escape-sync-deadletter** — escape HTML + fila sync  
5. **refactor-vehicle-form-registry** — form + registries  
6. **billing-hardening** — webhooks + downgrade corporate  
7. **tests-core-paths** — Vitest nos caminhos críticos  
8. **pwa-sw-boot** — SW no boot + precache  

Cada PR deve passar `npm run lint && npm run typecheck && npm run test`.

---

## 7. Fora de escopo (não fazer agora)

- Reescrever em outro framework  
- Migrar PDF para servidor (avaliar só se tamanho de laudo/memória mobile virar ticket real)  
- Monorepo / microserviços  
- Editar `_legacy` / pastas de skills embutidas  

---

## 8. Relação com assessments anteriores

- `ASSESSMENT.md` (modernização): ainda válido; item da credencial `pooler-url` **não aparece mais** em `src/supabase/` (hoje há `config.toml` + migrations + `.gitignore` local). Manter vigilância em `.temp/`.  
- `seo-technical-audit.md`: complementar; esta auditoria foca produto/API/dados.  
- Este arquivo (`FULLSTACK_AUDIT.md`) é a **fonte viva** de roadmap full stack a partir de 2026-07-15.

---

## 9. Como usar este documento

1. Tratar a tabela P0 como backlog imediato de engenharia.  
2. Antes de cada item P0 em produção: migration + checklist de rollback.  
3. Após P0, rodar `npm run check:sync-schema` contra prod e amostrar signed URLs.  
4. Atualizar este arquivo quando um item for concluído (marcar `✅` na tabela).
