# Design: Landing Pages por Segmento + Blog de Apoio (Crescimento Orgânico)

**Data:** 2026-07-13
**Status:** Aprovado (aguardando revisão do spec)
**Escopo:** Criar landing pages dedicadas para os 4 públicos-alvo (locadoras, oficinas, seguradoras, frotas) e um plano de conteúdo de blog de apoio, para gerar descoberta 100% orgânica via Google. Sem prospecção ativa, sem tráfego pago.

## Problema

O site tem 15 dias, zero clientes e zero contatos no ramo. O dono não quer prospectar ativamente (visitar/oferecer porta a porta) — o objetivo é que as pessoas encontrem o site sozinhas pelo Google e façam o teste grátis.

Hoje só existe `/locadoras` como landing de segmento (`src/app/locadoras/page.tsx`). Oficinas, seguradoras e frotas — três dos quatro públicos-alvo do produto — não têm nenhuma página dedicada; quem busca por esses termos cai na home genérica, que dilui a relevância de SEO e não fala a língua específica de cada dor.

## Objetivo

Criar 3 landing pages novas (`/oficinas`, `/seguradoras`, `/frotas`) seguindo o padrão de `/locadoras`, cada uma com gancho, exemplos e CTA específicos do segmento, e definir um plano de posts de blog que linkam para essas páginas — para capturar buscas de cauda longa e distribuir mais pontos de entrada orgânica.

## Decisões de produto (brainstorm)

| Decisão | Escolha |
|---|---|
| Público-alvo | Locadoras, oficinas, seguradoras e frotas — os 4 já pretendidos, nenhum descartado |
| Canal de aquisição | 100% orgânico/inbound (SEO + blog). Sem tráfego pago, sem prospecção ativa/porta a porta |
| Escopo desta fase | 4 landing pages de segmento + blog de apoio linkando para elas. Sem lead magnet, sem calculadora, sem parcerias de backlink |
| Prova social | Como ainda não há clientes, cada página usa demonstração real (ex: QR de exemplo escaneável) no lugar de depoimentos |
| Cadência de blog | 2-3 posts novos por semana no início, ajustada depois pelo Google Search Console |

## Abordagens consideradas

### A — Manter tudo centralizado na home (descartada)
Menor esforço imediato, mas dilui relevância de SEO para buscas específicas por segmento e não fala a dor de cada público na primeira dobra — pior para conversão.

### B — 4 landing pages de segmento + blog de apoio ✅ (escolhida)
Cada segmento busca de forma diferente no Google ("vistoria para locadora" vs. "laudo de avarias oficina" vs. "vistoria de frota app" vs. "QR code laudo anti-fraude seguradora"). Páginas dedicadas rankeiam melhor por intenção específica e convertem mais, reaproveitando a mesma base de funcionalidades (placa automática, SVG por tipo de veículo, assinatura, QR+hash, white-label) — muda só o gancho, exemplos e CTA.

### C — Só prospecção direta local (descartada)
Rejeitada explicitamente pelo usuário: ele não quer sair oferecendo o produto ativamente, quer que as pessoas cheguem sozinhas via busca.

---

## Estrutura de cada landing page de segmento

Baseada no padrão que `/locadoras` já usa, com 5 seções:

1. **Gancho de abertura** — a dor específica do segmento em 1 frase
   - Locadoras (já existe): "chega de discutir amassado que já existia"
   - Oficinas: laudo profissional em minutos, sem papel, com a marca da própria oficina
   - Seguradoras: eliminar disputas de sinistro com prova criptográfica (hash + QR)
   - Frotas: vistoria de múltiplos veículos sem depender de internet no local
2. **Como funciona** — passo a passo (placa → marcação no SVG por tipo de veículo → foto/fala natural → assinatura → PDF com QR/hash), com exemplos adaptados ao segmento
3. **Diferenciais em destaque** — hash SHA-256 + QR de verificação anti-fraude, funcionamento offline-first, PDF white-label (logo/marca da empresa), campos reordenáveis/customizáveis, IA (Gemini) para ajudar a redigir o laudo
4. **Prova/confiança** — QR de exemplo real e escaneável demonstrando a verificação (substitui depoimentos, que ainda não existem)
5. **CTA** — "Teste grátis agora", levando direto para o fluxo de vistoria no app, com o mínimo de fricção possível antes de cadastro

## Arquitetura

### Responsabilidades por arquivo

| Item | Arquivo | Mudança |
|---|---|---|
| Referência de padrão | `src/app/locadoras/page.tsx` | Não muda — serve de modelo de estrutura/estilo para as 3 páginas novas |
| Landing oficinas | `src/app/oficinas/page.tsx` *(novo)* | 5 seções acima, gancho e exemplos de oficina mecânica |
| Landing seguradoras | `src/app/seguradoras/page.tsx` *(novo)* | 5 seções acima, gancho no hash+QR anti-fraude e disputa de sinistro |
| Landing frotas | `src/app/frotas/page.tsx` *(novo)* | 5 seções acima, gancho em vistoria offline de múltiplos veículos |
| Sitemap | `src/app/sitemap.ts` | Adiciona as 3 novas rotas (mesma prioridade/frequência de `/locadoras`) |
| Navegação | `src/components/Header.tsx` (ou equivalente) | Avaliar se as novas páginas entram em algum menu/rodapé de navegação, seguindo o que já existe para `/locadoras` |

### Blog de apoio

Reaproveita a estrutura de conteúdo já existente (`src/content/blog.tsx`, categorias `Locadora`/`Frota`/`Seguro`/etc. já usadas — ver spec [[2026-07-05-blog-seo-fase1-design]]). Não é criada infraestrutura nova de blog nesta fase; só entram posts novos que:

1. Respondem uma pergunta real de busca (cauda longa), por exemplo:
   - "Como provar que um amassado no carro já existia antes da locação" → linka `/locadoras`
   - "Vistoria de frota sem internet: como funciona" → linka `/frotas`
   - "Laudo de avaria com QR code: o que é e para que serve" → linka `/seguradoras`
   - "Como digitalizar a vistoria da sua oficina" → linka `/oficinas`
2. Usam a `category` correspondente (já suportada por `getPostsByCategorySlug`) e incluem ao menos 1 link interno para a landing de segmento relevante.

Cadência: 2-3 posts novos/semana, sem exigir mudança de infraestrutura — usa o fluxo de publicação de posts já existente em `BLOG_POSTS`.

### SEO técnico (checklist, maior parte já coberta pelo projeto)

- As 3 novas rotas entram automaticamente no IndexNow (script `scripts/indexnow.mjs` já existente) e no sitemap
- Meta title/description únicos por página, com a palavra-chave do segmento
- Schema.org: reaproveitar padrão de `Organization`/`Service` já usado em `/locadoras`; considerar `FAQPage` se a página tiver seção de perguntas frequentes
- Links internos: cada post de blog linkando para a landing de segmento certa, e cada landing linkando de volta para posts relacionados daquele segmento (via `getRelatedPosts`, já existente)

## Métricas de sucesso

Sem tráfego pago, os sinais de progresso são:
- Impressões e cliques por página no Google Search Console (separado por `/oficinas`, `/seguradoras`, `/frotas`, `/locadoras`)
- Posição média das palavras-chave alvo de cada segmento
- Taxa de quem chega numa landing de segmento e inicia um teste no app (evento a trackear, se ainda não existir)

---

## Fora de escopo (próximos passos, não agora)

- Lead magnet / captura de e-mail
- Calculadora interativa (já endereçada em spec própria: [[2026-07-11-loss-calculator-design]])
- Parcerias de conteúdo/backlink com sindicatos, corretoras, associações
- Tráfego pago (Ads) e prospecção ativa/porta a porta — descartados explicitamente pelo usuário nesta fase
- Depoimentos reais de clientes (ainda não existem) — trocar o QR de exemplo por depoimentos assim que houver os primeiros clientes

## Testes / verificação

- Build local (`next build`) gera as 3 novas rotas estáticas sem erro
- Cada nova landing page renderiza as 5 seções descritas, com CTA funcional para o fluxo de teste grátis
- Sitemap (`/sitemap.xml`) passa a listar `/oficinas`, `/seguradoras`, `/frotas`
- Verificação manual no navegador: cada landing abre, o QR de exemplo é escaneável/verificável em `/verify`, e a navegação (se aplicável) expõe as novas páginas
