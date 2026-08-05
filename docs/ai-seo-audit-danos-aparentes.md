# Auditoria AI SEO — Danos Aparentes (path D)

**Site:** https://danosaparentes.com.br  
**Data:** 2026-07-26  
**Escopo:** audit → gaps → input para plano de conteúdo  
**Fontes:** `aeo-geo-strategy.md`, `docs/icp-danos-aparentes.md`, código (`src/app/*`, `src/content/blog.tsx`, `src/components/PricingCards.tsx`), `public/llms.txt`, `robots.txt` live

---

## Design / status (1 linha)

Base técnica sólida (SSR/SSG, robots permissivo a bots de IA, `llms.txt` presente, schema Organization + SoftwareApplication + FAQPage + BlogPosting + HowTo parcial); citabilidade ainda fraca por falta de `pricing.md`, landings fora do `llms.txt`, poucas tabelas comparativas e zero presença third-party — alinhado ao wedge locadoras SME (prova retirada×devolução), sem inventar cases.

---

## Queries prioritárias (14)

Derivadas de `aeo-geo-strategy.md` §3 + ICP wedge (locadoras SME, prova pré-existência). Agrupadas por intent.

### Informational / definição

| # | Query | Página-alvo |
|---|--------|-------------|
| 1 | O que é laudo de avarias aparentes (vs cautelar) | `/blog/laudo-cautelar-vs-laudo-de-avarias` |
| 2 | Como provar que uma avaria já existia no carro | `/blog/avarias-preexistentes-como-provar` |
| 3 | O que é hash SHA-256 e QR Code num laudo de vistoria | `/blog/qr-code-e-hash-no-laudo-de-avarias` |

### How-to / operacional

| # | Query | Página-alvo |
|---|--------|-------------|
| 4 | Como fazer um laudo de vistoria veicular | `/blog/como-fazer-laudo-de-vistoria-veicular` |
| 5 | Checklist de vistoria de devolução de locadora | `/blog/checklist-vistoria-devolucao-locadora` |
| 6 | Como fotografar avarias de veículo corretamente | `/blog/como-fotografar-avarias` |
| 7 | Vistoria digital sem papel / offline | `/blog/vistoria-sem-papel`, home |

### Comercial / avaliação (ICP locadoras)

| # | Query | Página-alvo |
|---|--------|-------------|
| 8 | Sistema de vistoria digital para locadora (prova na devolução) | `/locadoras` |
| 9 | Quanto custa app / sistema de vistoria veicular digital | `/planos` (+ futuro `/pricing.md`) |
| 10 | App de vistoria veicular offline (PWA) | home, `/faq` |
| 11 | Software de vistoria white-label para locadoras | `/blog/laudo-white-label-para-locadoras` |

### Comparação / alternativas

| # | Query | Página-alvo |
|---|--------|-------------|
| 12 | Laudo cautelar vs laudo de avarias | `/blog/laudo-cautelar-vs-laudo-de-avarias` *(sem rota `/comparisons`)* |
| 13 | WhatsApp / prancheta vs laudo digital verificável | `/locadoras` (+ gap de página dedicada) |

### Trust / marca

| # | Query | Página-alvo |
|---|--------|-------------|
| 14 | Danos Aparentes é confiável / quem está por trás | home (`TrustSection`), `/sobre` |

**Próximo passo manual (DIY citation check):** rodar as 14 queries em ChatGPT (com busca), Perplexity e Google AI Overviews; registrar citação sim/não, URL citada e concorrentes. Sem APIs pagas nesta auditoria — ver planilha no plano.

---

## Checklist de extratabilidade (fonte = código/páginas)

Critérios (skill ai-seo): definição/abertura clara · blocos auto-contidos 40–60w · stats com fonte · tabela comparativa · FAQ NL · schema · atribuição de autor · frescor · H2 alinhado a query · AI bots em robots.

| Check | `/` | `/locadoras` | `/planos` | `/faq` | Blog cautelar vs avarias | Blog avarias pré-existentes | Blog checklist devolução |
|-------|:---:|:------------:|:---------:|:------:|:------------------------:|:---------------------------:|:------------------------:|
| Definição / resposta no 1º bloco útil | **Pass** (hero + carousel) | **Pass** (hero 2 frases + mecanismo) | **Partial** (CTA de preço; pouca definição de categoria) | **Pass** (intro + Q&A) | **Partial** (abre bem; resposta “qual usar” só no fim) | **Pass** (problema + o que prova) | **Pass** (devolução = momento crítico) |
| Blocos auto-contidos ~40–60 palavras | **Partial** | **Partial** (FAQs curtas demais em alguns; steps bons) | **Partial** | **Pass** | **Partial** | **Pass** | **Partial** |
| Estatísticas com fonte citada | **Fail** (sem stats inventados — ok editorial; zero número próprio) | **Pass*** (cita ConJur/TJDFT = prova do *problema*) | **Fail** (só preços) | **Fail** | **Fail** | **Fail** | **Fail** |
| Tabela comparativa | **Fail** | **Partial** (Antes/Depois em cards, não `<table>`) | **Fail** (cards de plano ≠ tabela extractável) | N/A | **Fail** (lista `<ul>`, sem tabela) | N/A | N/A |
| FAQ em linguagem natural | **Pass** + FAQPage | **Pass** + FAQPage | **Pass** + FAQPage | **Pass** + FAQPage | **Fail** (sem `faq` no post) | **Fail** (sem `faq`) | **Fail** (sem `faq`) |
| Schema relevante | **Pass** SoftwareApplication + FAQPage + Org | **Pass** FAQPage | **Pass** FAQPage | **Pass** FAQPage | **Pass** BlogPosting | **Pass** BlogPosting + HowTo | **Pass** BlogPosting (sem HowTo) |
| Schema Product / Offer detalhado | **Partial** (Offer genérico no SoftApp) | **Fail** | **Fail** | N/A | N/A | N/A | N/A |
| Atribuição de autor com credenciais/`sameAs` | **Partial** (Org founder “Jeferson”) | N/A | N/A | N/A | **Partial** (name+role string) | **Partial** | **Partial** |
| Frescor (`dateModified` / updated) | **Pass** (HOME_UPDATED 2026-07-25) | **Partial** (sem data visível) | **Partial** | **Partial** | **Pass** updatedDate 2026-07-12 | **Fail** (sem updatedDate) | **Fail** (sem updatedDate) |
| H2 alinhados a queries | **Pass** | **Pass** | **Partial** | **Pass** | **Pass** | **Pass** | **Pass** |
| AI bots allowed (robots) | **Pass** (`Allow: /`; sem Disallow GPTBot/etc.) | idem | idem | idem | idem | idem | idem |

\*Citações jurídicas = autoridade do *problema de mercado*, não prova social do produto — correto e alinhado ao ban de fake metrics.

### Observações por URL

- **`/`:** forte em mecanismo (hash/QR/GPS) e FAQ de preço literal; home é `"use client"` mas JSON-LD e teaser de blog SSR-friendly — risco residual se crawler fraco ignorar JS para copy hero.
- **`/locadoras`:** melhor LP para ICP; honestidade (“app novo”, sem cases) é asset de trust; falta lead de 40–60w estilo “definição de categoria” e tabela retirada×devolução.
- **`/planos`:** preços reais no UI (`PricingCards`: Starter 29,90 / Pro 49,90 / Corp Start 299 / Growth 699 / Enterprise from 1.490); FAQ Corporativo ainda diz “sob consulta” — **desalinhado** das faixas publicadas nos cards.
- **`/faq`:** melhor página para extratabilidade Q&A; speakable selectors presentes.
- **Blog top 3:** cautelar vs avarias é o maior gap de formato (comparação sem tabela + sem FAQ schema); pré-existentes já tem HowTo; checklist tem lista boa mas falta HowTo + lead “resposta direta” sob cada H2.

---

## Gaps priorizados

### P0 — estrutura + machine-readable (impacto alto / esforço baixo)

| Gap | Pilar | Nota |
|-----|-------|------|
| Não existia `/pricing.md` | Machine-readable | **Remediado nesta entrega:** `public/pricing.md` (preços de `PricingCards.tsx`). Manter em sync com `/planos`. |
| `llms.txt` desatualizado vs rotas | Machine-readable | **Remediado nesta entrega:** landings + Starter + link `/pricing.md`. Revisar a cada rota estratégica nova. |
| Respostas curtas / leads 40–60w em `/locadoras` (definição + “como provar”) | Structure | Hero bom; seções Amplify/Solution podem abrir com parágrafo citável auto-contido |
| FAQ `/planos` Corporativo “sob consulta” vs faixas R$ 299/699/1.490 | Authority / honesty | Inconsistência prejudica citação de preço |

### P1 — structure + authority

| Gap | Pilar | Nota |
|-----|-------|------|
| Sem rotas `/alternatives` ou `/comparisons` | Structure | Só comparação in-blog; OK por enquanto se o post cautelar vs avarias ganhar `<table>` + FAQ + answer leads |
| Post cautelar vs avarias sem tabela e sem FAQ schema | Structure | ~33% das citações AI são comparisons — formato errado |
| FAQ schema ausente nos 3 posts ICP acima | Structure | Padrão `faq:` já existe em outros posts de `blog.tsx` — reutilizar |
| HowTo ausente no checklist de devolução | Structure | Conteúdo procedural; pré-existentes já é modelo |
| `updatedDate` faltando em posts ICP (checklist, pré-existentes) | Authority | Campo já existe no tipo `BlogPost` |
| Sem schema `Product` com offers tipados | Structure | SoftApp Offer genérico; Product não é obrigatório se `pricing.md` + FAQ cobrirem preço |
| `Person.sameAs` / perfis externos | Authority | Ainda o gargalo da Camada 5 em `aeo-geo-strategy.md` |

### P2 — presence + depth

| Gap | Pilar | Nota |
|-----|-------|------|
| Zero menções third-party controladas (diretórios BR, imprensa nicho, LinkedIn empresa) | Presence | Brands are cited more via third-party; sem spam Reddit |
| Sem dados originais próprios (tempo de vistoria, taxa de disputa) | Authority | Só publicar se medidos de verdade |
| Wikipedia/Wikidata | Presence | Não elegível ainda — reavaliar 12+ meses |
| OKF bundle | Machine-readable | Opcional / emergente — não bloquear P0 |

---

## O que NÃO fazer

1. **Inventar cases, NPS, “X empresas”, ROI ou depoimentos** — ban editorial e ICP; prova = mecanismo (hash/QR/GPS) + trial 7 dias.
2. **Scaled AI content abuse** — não gerar dezenas de posts thin “para IA”; Google people-first; mesmo conteúdo serve humano e motor.
3. **Chunking artificial** — não fragmentar páginas em micro-blocos “para o modelo”; H2 + parágrafos normais + tabelas quando fizer sentido.
4. **Spam Reddit / menções inauténticas** — participação real ou nada.
5. **Prometer validade jurídica absoluta / sentença** — FAQ já calibra; manter.
6. **Preços inventados em `pricing.md`** — só espelhar `PricingCards` / PIX `2990`/`4990` centavos.
7. **Bloquear GPTBot / PerplexityBot / ClaudeBot / Google-Extended** se o objetivo é citação.

---

## Delta vs `aeo-geo-strategy.md` (2026-07-11)

| Item antigo | Status 2026-07-26 |
|-------------|-------------------|
| “Não existe `llms.txt`” | **Resolvido** — existe; precisa refresh de rotas |
| “Nenhum HowTo” | **Parcial** — vários posts com `howTo` (ex.: avarias pré-existentes) |
| `dateModified` sempre = publish | **Parcial** — `updatedDate` em parte dos posts |
| SoftwareApplication na home | **Presente** (não citado na auditoria antiga) |
| Landings `/locadoras` etc. | **Existem** — fora do `llms.txt` original |

---

## Links relacionados

- `aeo-geo-strategy.md` (raiz)
- `docs/icp-danos-aparentes.md`
- `docs/ai-seo-plan-danos-aparentes.md` (plano de execução)
- `public/llms.txt` / `public/pricing.md`
