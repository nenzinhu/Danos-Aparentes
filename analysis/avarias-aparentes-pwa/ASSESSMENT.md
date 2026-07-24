# Assessment de Modernização — AvariasAPARENTES PWA

> **Nota de escopo:** este é um sistema Next.js/React moderno em desenvolvimento ativo, não um sistema legado clássico. O framework do `/modernize-assess` (COCOMO, débito técnico, segurança) foi aplicado mesmo assim porque ainda gera sinal útil, mas a recomendação final não é "modernizar" — é consolidar uma migração de API já em andamento e fechar uma exposição de credencial ativa.

## Resumo Executivo

A AvariasAPARENTES é uma PWA de vistoria/laudo de danos veiculares (4 vistas do veículo, fotos por avaria, geração de PDF, QR code, CNH scan) construída em Next.js 16 + React 19 + TypeScript, com Supabase (auth/DB), Stripe (billing) e integrações de IA (Gemini/TTS) e consulta de placa. O código está migrando as antigas Vercel Serverless Functions (`api/`) para App Router routes (`src/app/api/`) — a migração parece completa e sem referências pendentes ao código antigo. O maior risco identificado não é arquitetural: é uma **credencial de banco de dados Supabase (connection string do pooler) presente no working tree** (`src/supabase/.temp/pooler-url`), sem `.gitignore` cobrindo o diretório. Recomendação: tratar isso como incidente de segurança imediato (rotação de credencial), depois seguir com a finalização/limpeza da migração de API.

## Inventário do Sistema

Ferramentas `scc`/`cloc` não disponíveis no ambiente; inventário feito via `find`/`wc -l` (fallback nível 2 do runbook).

| Área | Extensão dominante | Arquivos | LOC aprox. |
|---|---|---|---|
| `src/` (app completo) | `.tsx` (110), `.ts` (57) | ~230 arquivos de código | ~20.900 |
| `lib/` (raiz, legado) | `.ts` | 1 | 20 |
| `public/` | — | — | 41 |

**Stack:** Next.js `^16.2.9`, React `^19.2.7`, TypeScript `^5.2.2`, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Stripe `^22.2.1`, Three.js/`@react-three/fiber` (render 3D), Framer Motion, Tailwind CSS, Vitest para testes, ESLint 9 (flat config). Build: `next build`. Sem monorepo/workspace — projeto único.

## Arquitetura em Relance

Ver diagrama completo em [`ARCHITECTURE.mmd`](ARCHITECTURE.mmd).

| Domínio | Arquivos-chave | Depende de | Notas |
|---|---|---|---|
| App Shell / Wizard | `src/app/app/**`, `src/views/**` | todos os demais domínios | Ponto central de orquestração do fluxo de vistoria |
| Vehicle Views (SVG) | `src/components/vehicles/**` | — | **Duplicação:** `registry.ts` (dinâmico) e `staticRegistry.ts` (usado só por `ReportActions.tsx`) mapeiam os mesmos 30+ componentes de peças — risco de dessincronia |
| Auth / Sessão | `src/lib/server/auth.ts` | Supabase Data | JWT validado contra Supabase, não confiado cegamente |
| Supabase Data Layer | `src/supabase/**`, `src/lib/server/supabaseAdmin.ts` | — | Contém `.temp/pooler-url` com credencial ativa (ver Segurança) |
| PWA / Sync Offline | hooks de sync, `src/lib/sync.test.ts` | Supabase Data | |
| Billing / Stripe | `src/app/api/create-checkout-session/`, `create-portal-session/`, `stripe-webhook/`, `src/lib/server/stripeClient.ts` | Auth, Supabase Data | Webhook valida assinatura corretamente |
| Team Management | `src/app/api/team-invite/`, `team-accept-invite/`, `team-reports/` | Auth, Supabase Data | Auth + checagem de ownership presentes |
| AI / Plate Lookup / TTS | `src/app/api/ia/`, `src/app/api/plate-lookup/`, `src/app/api/tts/` | Auth (parcial), Supabase Data | `plate-lookup` e `tts` sem exigência de auth — só rate-limit por IP |
| CNH / Doc Scan | componentes de scan em `src/components/app` | PWA Sync | |
| PDF / Report Gen | `src/lib/pdf.ts`, `src/lib/manual.ts`, `src/lib/manualContent.ts` | Vehicle Views | `pdf.ts` fortemente tipado como `any`; `manual.ts`/`manualContent.ts` merecem revisão de sobreposição |
| Blog / Marketing | `src/content/blog.tsx` (2.361 linhas), `src/app/blog/**` | Vehicle Views, UI Kit | Arquivo "deus" de conteúdo |
| UI Kit | `src/components/ui/**` | — | |

**Referências pendentes:** nenhuma — grep por `api/_lib` e imports do diretório `api/` antigo não retornou resultados; a migração para `src/app/api/*` está estruturalmente completa.

## Perfil de Runtime em Produção

Não disponível — nenhuma integração de observabilidade/APM foi fornecida nesta sessão. Gap anotado; recomenda-se coletar telemetria (Vercel Analytics/Speed Insights já está nas dependências) antes de priorizar otimizações de performance.

## Débito Técnico (top 10, por valor de remediação)

1. **Credencial de banco vazada no working tree** — `src/supabase/.temp/pooler-url:1`, connection string Supabase Pooler sem `.gitignore`. Ver [`SECRETS.local.md`](SECRETS.local.md) (local, não versionado).
2. **Migração `api/` → `src/app/api/` sem verificação formal de paridade** — 7 endpoints antigos deletados, recriados como novas rotas ainda não commitadas; comparar com `git show HEAD~N:api/xxx.ts` antes do merge para garantir que nenhuma validação foi perdida.
3. **`src/lib/server/stripeClient.ts:9`** — `new Stripe(secretKey)` sem `apiVersion` fixado; risco de mudança silenciosa de comportamento em upgrades do SDK.
4. **Uso extensivo de `any`** — 30+ ocorrências em `src/lib/pdf.ts` (tema) e `src/app/api/ia/route.ts:53-103`; priorizar `pdf.ts` por ser reutilizado em todas as seções de geração de laudo.
5. **`src/content/blog.tsx` — arquivo "deus" (2.361 linhas)** misturando conteúdo/markup de múltiplos posts; dividir em `src/content/blog/<slug>.tsx` com índice central.
6. **`src/components/VehicleInfoForm.tsx` — componente "deus" (1.258 linhas)**, 19 `useState`/`useEffect` misturando estado de formulário, validação e submissão; extrair `useVehicleForm` + subcomponentes.
7. **`src/app/api/team-invite/route.ts:37`** — origem do link de convite derivada do header `Host`/`Origin` sem allowlist; usar `NEXT_PUBLIC_APP_URL` fixo.
8. **`src/app/api/plate-lookup/route.ts:29`** — URL de terceiro com token de API embutido no path, vazando o token em logs de proxy/servidor; mover para env var, evitar token na URL.
9. **`src/app/api/ia/route.ts:62`** — três variáveis de ambiente alternativas para a mesma chave (`GEMINI_API_KEY`/`GOOGLE_API_KEY`/`GOOGLE_TTS_API_KEY`); consolidar em uma só, documentada.
10. **`src/app/api/team-invite/route.ts:31`** — `req.json().catch(() => ({}))` engole erros de parse JSON silenciosamente; retornar 400 explícito.

Duplicação adicional fora do top 10: `registry.ts` vs `staticRegistry.ts` em vehicle views (ver Arquitetura).

## Achados de Segurança

| CWE | Severidade | Arquivo:Linha | Descrição |
|---|---|---|---|
| CWE-798 (Uso de credencial hardcoded) | **Crítica** | `src/supabase/.temp/pooler-url:1` | Connection string ativa do Supabase Postgres Pooler presente no working tree, sem `.gitignore`. Ver `SECRETS.local.md`. |
| CWE-284 (Improper Access Control) | Média | `src/app/api/plate-lookup/route.ts:8-26` | `GET` sem autenticação, só rate-limit por IP — permite esgotar cota paga do `WDAPI_TOKEN` sem login. |
| CWE-770 (Allocation Without Limits) | Baixa | `src/app/api/tts/route.ts`, `src/app/api/ia/route.ts` | Rate-limit só por IP (contornável); risco de abuso das APIs pagas Gemini/ElevenLabs/Google TTS. |
| CWE-770 (Allocation Without Limits) | Baixa | `src/app/api/plate-lookup/route.ts:9-16` | Rate-limit baseado em `X-Forwarded-For`, falsificável se o header não for estritamente confiável no ambiente de edge/proxy. |

**Sem problemas encontrados** (verificado explicitamente): `stripe-webhook` valida assinatura corretamente; `create-checkout-session`/`create-portal-session`/`team-*` exigem auth + checagem de ownership; `auth.ts` valida JWT contra o Supabase; nenhuma chave hardcoded em `src/` (exceto o item crítico acima, que é uma connection string, não uma chave de API); `.env.example` só tem placeholders; sem `eval`, CORS wildcard, ou padrões de SQL/command injection; `dangerouslySetInnerHTML` usado só com conteúdo estático/JSON-LD gerado no servidor.

Credencial inventariada em [`SECRETS.local.md`](SECRETS.local.md) (gitignored; não compartilhar).

## Gaps de Documentação

1. Nenhum README ou doc descreve a arquitetura de migração `api/` → `src/app/api/` em andamento — um novo dev não sabe que o diretório antigo já é obsoleto.
2. A duplicação `registry.ts`/`staticRegistry.ts` em vehicle views não está documentada — risco real de um dev atualizar só um dos dois.
3. `manual.ts` vs `manualContent.ts` (domínio PDF) não têm distinção clara documentada.
4. Nenhuma nota sobre por que existem 3 variáveis de ambiente alternativas para a mesma chave de IA (`GEMINI_API_KEY`/`GOOGLE_API_KEY`/`GOOGLE_TTS_API_KEY`).
5. Ausência de doc sobre o modelo de rate-limiting (por IP vs por usuário) e sua intenção — importante para decidir se `plate-lookup`/`tts`/`ia` deveriam exigir auth.

## Escala Relativa

- **LOC:** ~20,9 KSLOC em `src/` (medido via `find`/`wc -l`, `scc`/`cloc` indisponíveis no ambiente).
- **Índice COCOMO-II (nominal):** `2.94 × (20.9)^1.10 ≈ 83,3`.

**Isto é apenas um índice relativo de escala/complexidade** para comparar este sistema com outros em um portfólio — **não é uma estimativa de prazo ou custo de modernização**. A fórmula assume produtividade de equipe humana tradicional, o que não se aplica a transformação agentic. Nenhuma data, cronograma ou custo deve ser derivado deste número.

## Padrão de Modernização Recomendado

**Replatform / Refactor-in-place (mesma stack)** → `/modernize-uplift`

Não há necessidade de rearquitetura ou reescrita: a stack (Next.js/React/TypeScript/Supabase) é atual e adequada ao domínio. O trabalho real é (a) fechar a exposição de credencial imediatamente, (b) finalizar e validar a migração `api/` → `src/app/api/` já em curso, e (c) reduzir débito técnico pontual (arquivos "deus", duplicação de registries, tipagem `any`). Isso é consolidação incremental na mesma stack, não uma transformação cross-stack — daí o roteamento para `/modernize-uplift` em vez de `/modernize-transform` ou `/modernize-reimagine`.
