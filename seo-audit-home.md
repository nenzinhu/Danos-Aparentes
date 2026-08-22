# On-Page SEO Audit: https://danosaparentes.com.br/

**Target query:** "vistoria veicular digital"
**Page role:** Commercial (landing page principal / hub de conversão)
**Audit date:** 2026-07-11
**Auditor:** Auditoria estrutural via inspeção de HTML servido (SSR bruto, sem execução de JS) + código-fonte (`src/app/page.tsx`, `src/app/layout.tsx`)

---

## Summary

O `<title>`, meta description e schema básico estão presentes e razoáveis. Mas a página tem um problema estrutural sério: **o H1 e boa parte do conteúdo comercial (preços, FAQ, showcase de veículos, prévia do laudo em PDF, teaser do blog) não existem no HTML que o servidor entrega** — são componentes com `dynamic(..., { ssr: false })`, ou seja, só aparecem depois que o JavaScript roda no navegador. Isso significa que crawlers que não executam JS de forma confiável (vários bots de IA, e o próprio Googlebot em cenários de orçamento de rastreamento apertado) veem uma página muito mais vazia do que um usuário vê. Some a isso um H1 que não menciona a query-alvo em nenhuma forma, e a página não vai competir bem por "vistoria veicular digital" apesar do produto ser exatamente isso.

**Overall score:** Needs work

| Dimension | Score | One-line note |
|---|---|---|
| Title tag | Pass | 58 caracteres, contém "Vistoria Digital", marca no fim. |
| Meta description | Needs work | 167 caracteres (acima do limite de ~160), sem CTA. |
| Header structure | Fail | H1 não contém nem parafraseia a query-alvo; 3 `<h2>` distintos disputando peso semântico sem hierarquia clara para o crawler. |
| Body content | Fail | Seções inteiras (preços, FAQ, showcase, PDF preview, blog teaser) renderizam vazias no HTML servido — só aparecem após hidratação client-side. |
| Internal links | Needs work | `/planos` não é linkado em lugar nenhum do HTML servido; só 4 links internos reais chegam ao crawler (`/blog`, `/faq`, `/privacidade`, `/termos`, `/suporte`, `/app`). |
| Images and media | Needs work | `alt="Logo"` genérico no header; logo do footer tem alt correto ("Danos Aparentes"). |
| URL slug | Pass | Raiz do domínio, não há o que otimizar. |
| On-page schema | Needs work | `SoftwareApplication` + `FAQPage` presentes, mas o `FAQPage` cobre só 3 das 7 perguntas reais (as outras 4 estão em `FAQSection`, que é `ssr:false` — mentem por omissão para o crawler). |

---

## Critical fixes

### 1. H1 não contém a query-alvo
- **Current:** `"Chega de discutir amassado que já existia no carro."` (rotativo via `TextCarousel`, mas este é o texto do primeiro slide, o que o servidor entrega)
- **Problem:** É um H1 forte em gancho emocional, mas zero relevância textual para "vistoria veicular digital" ou qualquer variação. Motores de busca usam o H1 como sinal primário de tópico da página — hoje esse sinal aponta para "disputa de amassado", não para o produto.
- **Fix:** Manter o gancho emocional no `<p>` de apoio (já está lá) e ajustar o H1 para incluir a categoria do produto. Ex.: manter a rotação, mas garantir que o **primeiro slide (o que é renderizado no servidor)** seja a variação com a query, tipo: `"Vistoria veicular digital que prova a si mesma."` — ou reordenar os slides do array em `TextCarousel` para que o mais rico em keyword seja o índice 0.

### 2. Seções inteiras ausentes do HTML servido (ssr: false)
- **Current:** `PricingSection`, `FAQSection`, `VehicleShowcaseSection`, `PdfPreviewSection` e `BlogTeaserSection` são importadas via `dynamic(() => import(...), { ssr: false })` em `src/app/page.tsx:71-77`.
- **Problem:** Confirmado por fetch direto do HTML bruto (sem JS): nenhum texto de preço (“Plano Pro”, “R$ 49,90”), nenhuma pergunta do FAQ, nenhum texto de showcase de veículos e nenhum teaser de blog aparece no payload inicial. O próprio código já reconhece parcialmente o problema — há um comentário em `page.tsx:46-48` explicando que o `PRICING_FAQ_JSONLD` foi duplicado manualmente porque "só um componente renderizado no servidor entra no HTML inicial que o Google rastreia". Isso é um band-aid parcial (cobre schema, não cobre o conteúdo visível real), e não cobre `VehicleShowcaseSection` nem `PdfPreviewSection` nem `BlogTeaserSection` de forma alguma.
- **Fix:** Remover `ssr: false` dessas seções (usar `dynamic()` sem a flag, ou import estático direto) sempre que a seção não depender de `window`/APIs client-only reais. Se alguma depender de fato de algo client-only (ex: animação com `IntersectionObserver`), separar o **conteúdo textual** (que pode ser SSR) da **animação** (que pode continuar client-only), em vez de tornar a seção inteira invisível ao crawler.

### 3. `/planos` não é linkado em nenhum lugar do HTML servido
- **Current:** Nenhum `href="/planos"` aparece no HTML bruto da home. A seção de preços na home (`PricingSection`) parece ser cards inline, não um link para a página `/planos` dedicada.
- **Problem:** A página `/planos` (auditada/reforçada em sessões anteriores deste projeto) fica órfã de link interno vindo da home — motores de busca dão menos peso a páginas sem links internos apontando para elas, e ainda por cima ela nem aparece no HTML servido por depender do `PricingSection` (ssr:false) — que talvez nem linke para lá.
- **Fix:** Adicionar ao menos um link direto e crawlable para `/planos` no HTML servido (ex: no header, ao lado de "Planos" que hoje é uma âncora `#pricing` só de scroll — trocar por link real para `/planos` ou adicionar ambos).

---

## Important fixes

### 1. Meta description acima do limite
- **Current:** `"Documente avarias veiculares com precisão pericial: marque os danos no desenho do veículo, anexe fotos por avaria e gere o laudo em PDF com QR Code de verificação."` (167 caracteres)
- **Problem:** Passa de ~160 caracteres, arriscando truncamento no SERP, e não tem CTA implícito.
- **Fix:** Ver proposta em "Drafted replacements" abaixo — reduzida para 155 caracteres com leve reforço de ação.

### 2. `alt="Logo"` genérico no header
- **Current:** `<Image src="/logo.svg" alt="Logo" ... />` em `src/app/page.tsx:236`.
- **Problem:** Alt text não descritivo. O logo do footer (`/brand/logo-full.svg`) já usa `alt="Danos Aparentes"` corretamente — inconsistência entre os dois.
- **Fix:** Trocar para `alt="Danos Aparentes"` (mesmo padrão do footer).

### 3. Três H2 competindo sem uma âncora clara de tópico
- **Current:** H2s atuais: "Da placa ao laudo assinado em 3 passos", "Um laudo que comprova a si mesmo", e um terceiro de FinalCtaSection ("Sua próxima avaria pode virar...").
- **Problem:** Nenhum dos três reforça a query-alvo nem termos relacionados ("vistoria", "digital") de forma explícita — todos são copy de conversão, o que é ótimo para o usuário, mas deixa o crawler sem reforço temático fora do H1/title.
- **Fix:** Não reescrever a copy (ela já converte bem, é resultado de trabalho anterior), mas considerar adicionar 1 H2 adicional, mais literal, em alguma seção (ex: a que hoje é `ssr:false` do showcase de veículos) do tipo "Vistoria digital para carro, moto, caminhão, van e ônibus" — que já é fiel ao conteúdo real da seção.

---

## Nice-to-have polish

- Adicionar `datePublished`/`dateModified` ao `SoftwareApplication` schema da home (hoje ausente) para reforçar frescor, seguindo o mesmo padrão já implementado no blog.
- Completar o `PRICING_FAQ_JSONLD` para as 7 perguntas reais (hoje só 3 das 7 usadas em `FAQSection` estão no JSON-LD server-rendered) — reduz a divergência entre "o que o crawler lê" e "o que o usuário vê".
- Considerar link para `/blog` com anchor text mais descritivo do que apenas "Blog" no footer (ex: "Guias de vistoria veicular").

---

## Drafted replacements

### Meta description
> **Current:** "Documente avarias veiculares com precisão pericial: marque os danos no desenho do veículo, anexe fotos por avaria e gere o laudo em PDF com QR Code de verificação." (167 chars)
> **Proposed:** "Vistoria veicular digital: marque avarias no diagrama do veículo, anexe fotos com GPS e gere o laudo em PDF com hash e QR Code. Teste grátis." (145 chars)

### H1 (primeiro slide do TextCarousel — o que o servidor entrega)
> **Current:** "Chega de discutir amassado que já existia no carro."
> **Proposed:** "Vistoria veicular digital que prova a si mesma — chega de discutir amassado que já existia no carro."

*(Alternativa mais curta, se o layout não comportar 2 orações no H1: "Vistoria veicular digital, sem discutir amassado que já existia.")*

### Header outline (proposto, mantendo a copy existente)
```
H1: Vistoria veicular digital que prova a si mesma
  H2: Da placa ao laudo assinado em 3 passos
  H2: Um laudo que comprova a si mesmo
  H2: Vistoria digital para carro, moto, caminhão, van e ônibus  ← novo, na seção de showcase
  H2: Planos para vistoriador autônomo, oficina, locadora e frota  ← novo, reforça link para /planos
  H2: Sua próxima avaria pode virar... (FinalCtaSection, mantém)
```

---

## Implementation notes

- A remoção de `ssr: false` em `PricingSection`, `VehicleShowcaseSection`, `PdfPreviewSection` e `BlogTeaserSection` é a mudança de maior impacto e maior risco — precisa ser testada seção por seção, porque cada uma pode ter dependências reais de `window`/`document` nas animações (ex: `IntersectionObserver`, `animejs`). Recomendo migrar uma seção por vez, confirmando no HTML bruto (`curl` sem JS) que o conteúdo passou a aparecer, antes de seguir para a próxima.
- `FAQSection` é a mais sensível: hoje o `PRICING_FAQ_JSONLD` já duplica 3 das 7 perguntas manualmente como paliativo. Se `FAQSection` virar SSR, esse JSON-LD duplicado deveria ser substituído por uma derivação direta de `faqItems` (a mesma lista já existe em `page.tsx:183-191`), evitando as duas fontes de verdade divergirem no futuro.
- Alterar o índice inicial do `TextCarousel` (ou reordenar `slides`) é uma mudança de baixo risco e pode ser feita isoladamente do resto.

---

## Verify after deploy

- [ ] `curl` do HTML bruto (sem JS) mostra o novo H1 e ao menos 1 ocorrência de "vistoria" no primeiro parágrafo
- [ ] `curl` do HTML bruto mostra texto de preços, FAQ, showcase de veículos e blog teaser (não apenas via JS)
- [ ] `href="/planos"` presente no HTML servido
- [ ] Meta description renderiza com 145 caracteres, sem truncamento no preview de SERP
- [ ] `alt="Danos Aparentes"` no logo do header
- [ ] Schema `FAQPage` valida no Rich Results Test com as 7 perguntas reais
- [ ] Nenhuma seção quebrou visualmente após remoção de `ssr: false` (checar animações no navegador)
