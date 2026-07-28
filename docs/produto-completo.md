# Danos Aparentes — documentação do produto

Documento de referência do que o aplicativo faz hoje. Baseado no
código em `main` (produção: [danosaparentes.com.br](https://danosaparentes.com.br)).

Atualizado em: 28 de julho de 2026.

---

## 1. O que é

O **Danos Aparentes** é um PWA de vistoria veicular. O vistoriador
marca avarias no diagrama SVG do veículo, anexa fotos (com GPS),
colhe assinaturas e emite um laudo em PDF com hash SHA-256 e QR Code
de verificação.

Público principal: locadoras, frotas, oficinas, despachantes,
concessionárias e peritos.

Arquitetura: **offline-first** (IndexedDB + fila de sync) com
sincronização para Supabase quando há rede.

---

## 2. Stack

| Camada | Tecnologia |
|--------|------------|
| App | Next.js (App Router), React, TypeScript |
| Estilo | Tailwind CSS |
| Local | IndexedDB (`avarias-pwa`) |
| Nuvem | Supabase (PostgreSQL + Storage + Auth) |
| PDF | `html2pdf.js` / `jspdf` (client-side) |
| Pagamentos | Stripe (cartão), Mercado Pago / Asaas (PIX) |
| IA | Groq Vision (classificação de dano), Gemini (chat marketing) |
| Testes | Vitest (261 testes na suíte atual) |

---

## 3. Fluxo de vistoria (app autenticado)

Rota: `/app`

### Abas

1. **Nova vistoria** — formulário + diagrama + laudo
2. **Estatísticas** — painel de métricas
3. **Equipe** — apenas plano Corporativo

### Seções da vistoria

1. **Dados** — cliente, veículo, extras (wizard)
2. **Diagrama** — 4 vistas SVG; clique na peça → tipo e severidade
3. **Laudo** — revisão, assinaturas, emissão do PDF

### Veículos e vistas

- Tipos: automóvel, carro 2/3 portas, moto, motoneta, caminhão,
  utilitário, ônibus, micro-ônibus, genérico
- Quatro vistas por tipo: lateral esquerda, lateral direita, frontal,
  traseira
- Zoom, pan, fullscreen, outline, pins/callouts no mobile, órbita
  por swipe entre vistas

### Avarias

- Tipos: arranhado, amassado, quebrado (e variantes na UI)
- Severidade: leve, média, grave
- Notas, fotos por avaria, legendas
- Comparativo por placa: marca avarias **novas** vs laudo anterior

### Dados auxiliares

- Scanner de CNH (PDF417 / ZXing, offline) — preenche nome e CPF
- Consulta automática de placa (WDAPI, assinante)
- Digitação por voz (Web Speech API)
- TTS: o app pode falar o nome da peça ao clicar
- GPS + reverse geocode (Nominatim)
- Fotos do interior
- Campos customizados e perfis (oficina / perito / seguradora)

### Assinaturas

- Canvas na tela (vistoriador e cliente)
- Link remoto: `/assinar/[id]` (token HMAC)

### Finalização

Status do laudo: `draft` → `complete` → `issued` (também
`superseded`, `cancelled`).

**Revisão humana obrigatória** antes de emitir o PDF oficial
(review gate). Sem confirmação, a emissão é bloqueada.

---

## 4. PDF e prova

### Geração

- Client-side em `src/lib/pdf/`
- Temas: moderno, editorial, técnico, corporativo, minimalista,
  vibrante
- White-label: nome da empresa, logo, cor (Pro+)
- Seções configuráveis: info, diagramas, resumo, tabela, galeria,
  interior, assinaturas, GPS
- Ações: PDF, WhatsApp (PDF), Copiar, TXT, selo/badge

### Integridade

- Hash SHA-256 do laudo (exibido e embutido)
- Manifesto `integrity-v2` (veículo, danos, fotos, assinaturas,
  localização, PDF)
- QR Code → `/verify?hash=…`
- Código público do tipo `DA-YYYY-…`
- Versionamento / supersede de laudos emitidos
- Imutabilidade após `issued`
- Evidência fotográfica: bytes originais + hash (além da versão
  otimizada)

### Cota mensal

| Plano | Laudos / mês |
|-------|----------------|
| Starter | 20 |
| Pro | 80 |
| Corporativo | Ilimitado |

API: `/api/report-quota`. Offline: fail-open (não trava a vistoria
no pátio).

---

## 5. Conta, planos e pagamento

- Auth Supabase (e-mail/senha, signup, reset)
- Trial de **7 dias**; depois paywall
- Planos em `/planos` (Starter, Pro, Corporativo)
- Cartão: Stripe (`/pagamento-cartao`)
- PIX: Mercado Pago / Asaas (`/pagamento-pix`)
- Status de assinatura: `trialing`, `active`, `past_due`,
  `canceled`, `pending_pix`, `active_pix`

### Equipe (Corporativo)

- Papéis: `solo`, `owner`, `inspector`
- Convite por e-mail, aceite em `/app/team/invite/[token]`
- Laudos do time, multi-tenant (`tenant_id`)

---

## 6. Offline, PWA e sync

- Manifest PWA (`start_url` → `/app`)
- Service worker em `public/sw.js`
- IndexedDB: `saved_reports`, `sync_queue`, `damage_photos`,
  `photo_evidence`
- Fila de sync: upsert/delete → Supabase quando online
- Fotos no Storage; cache local para uso offline

---

## 7. Inteligência artificial

| Recurso | Estado |
|---------|--------|
| Classificar tipo/severidade pela foto da peça (`/api/damage-classify`) | Ativo (assinante, Groq) |
| Trilha de decisões da IA (accept / edit / ignore) | Ativo |
| Scanner CNH | Ativo (offline) |
| Consulta de placa | Ativo |
| Speech-to-text / TTS | Ativo |
| Chat de suporte nas landings (`/api/chat-support`) | Ativo (Gemini) |
| Detecção automática de avarias / assistente IA (`/api/ia`, vision bulk) | **Desativado** (HTTP 410) |
| Verificação de vista por foto (`/api/view-photo-verify`) | Em PR draft (#41), **não** em `main` |

A IA **não cria** avarias sozinha no fluxo atual: o usuário aponta a
peça; a classificação sugere tipo/severidade a partir da foto.

---

## 8. Verificação pública e auditoria

### `/verify`

- Consulta por hash ou código público
- Upload de PDF para comparar com o manifesto
- Exibe versões, GPS e status de integridade

### Auditoria

- Log append-only com cadeia de hashes
- Timeline na vistoria
- Dashboard de auditoria (`/api/audit-log`)
- Eventos: criação, dano, foto, IA, revisão, assinatura, GPS, PDF,
  emissão, verificação, bloqueio sem revisão, etc.
- Controles LGPD (inventário, máscara, export) em `src/lib/lgpd/`

### Outros

- Histórico público por placa: `/historico/[token]` (QR do veículo)
- `/api/vehicle-qr`, `/api/verify-audit`

---

## 9. Site marketing e SEO

### Páginas

| Rota | Conteúdo |
|------|----------|
| `/` | Landing principal |
| `/locadoras`, `/oficinas`, `/seguradoras`, `/frotas` | Landings por segmento |
| `/planos` | Preços |
| `/blog`, `/blog/[slug]`, `/blog/categoria/...` | Blog (~44–48 posts) |
| `/faq`, `/sobre`, `/suporte` | Ajuda e institucional |
| `/privacidade`, `/termos` | Legal |
| `/demo` | Demonstração |

### SEO recente (julho 2026)

- Meta descriptions do blog (~150–160 caracteres) e categorias
- Capas ultrarrealistas por post (WebP 1536×1024)
- Correção GSC: `og:url` alinhado ao `canonical` em `/suporte` e
  `/privacidade` (alerta “canônico diferente”)
- `sitemap.ts`, `robots.ts`, `llms.txt`, `pricing.md`

---

## 10. Roadmap de integridade (entregue)

Fases implementadas no código (specs em `docs/superpowers/specs/`):

| Fase | Tema |
|------|------|
| 2 | Imutabilidade pós-emissão e versionamento |
| 3 | Audit log append-only com hash chain |
| 4 | Evidência fotográfica original + otimizada |
| 5 | Trilha de decisões da IA |
| 6 | Review gate antes da emissão |
| 7–8 | Provider de assinatura + verify público |
| 9–11 | Verify de PDF, timeline, LGPD |
| 12–15 | Multi-tenant, RBAC, idempotência, disclaimers |
| 15–19 | Dashboard de auditoria e verify-audit |

---

## 11. APIs principais

Ativas:

- `damage-classify`, `plate-lookup`, `report-quota`, `report-by-plate`
- `create-checkout-session`, `create-portal-session`, `stripe-webhook`
- `create-pix-charge`, `pix-webhook`, webhooks Mercado Pago / Asaas
- `team-invite`, `team-accept-invite`, `team-reports`
- `create-signature-link`, `remote-signature`
- `vehicle-qr`, `tts`, `chat-support`
- `audit-log`, `verify-audit`

Desativadas (410): `ia`, `damage-vision`, `damage-vision-bulk`

---

## 12. Estrutura de pastas (visão)

```text
src/app/           # Rotas Next.js (marketing + /app + APIs)
src/components/    # UI (vistoria, PDF, auth, landings)
src/lib/           # PDF, sync, db, audit, verify, LGPD
src/hooks/         # Estado da vistoria e relatórios
supabase/          # Schema, migrations, RLS
docs/              # Specs, planos, marketing, este documento
public/            # PWA, capas do blog, assets
```

---

## 13. Como desenvolver

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # Vitest
npm run build    # Build de produção
```

Pré-requisito: Node.js 18+.

Variáveis sensíveis (Supabase, Stripe, GROQ, etc.) ficam no ambiente
Vercel / `.env.local` — **nunca** no repositório.

---

## 14. Histórico recente de entregas (julho 2026)

| PR / tema | O que entrou |
|-----------|----------------|
| Integridade FASE 2–19 | Hash v2, review gate, audit, verify, RBAC, LGPD |
| Classificação IA por foto | Groq no `DamageFloat` |
| Viewer | Orbit, outline, pan-lock, pins mobile, contraste |
| PDF | Temas, encoding UTF-8 do seletor, falso sucesso corrigido |
| Blog | Meta descriptions, capas contextuais ultrarrealistas |
| SEO | Canônicos `/suporte` e `/privacidade` |
| Auth mobile | Login mais rápido em `/app` |

Itens **não** mergeados em `main` (só branch/PR):

- Verificação de foto por lado do veículo (PR #41 draft)
- Float compacto de tipo de avaria (PR #42, se ainda aberto)

---

## 15. Documentos relacionados

- `README.md` — visão geral e quick start
- `PROJECT.md` — foco histórico no motor de PDF
- `docs/superpowers/specs/` — designs de integridade e features
- `docs/ai-seo-plan-danos-aparentes.md` — plano SEO
- `TEST_READY.md` / `TEST_INFRA.md` — testes

---

## 16. Contato de produto

- Site: https://danosaparentes.com.br
- Suporte: https://danosaparentes.com.br/suporte
- E-mail: suporte@danosaparentes.com.br
