# Design: Blog SEO — Fase 1 (Autoria, Links Internos, Páginas de Categoria)

**Data:** 2026-07-05
**Status:** Aprovado (aguardando revisão do spec)
**Escopo:** Três melhorias de SEO on-page no blog existente (24 posts): autor real no schema, artigos relacionados e páginas de categoria. Sem lead magnet, sem calculadora, sem parcerias de backlink nesta fase.

## Problema

O blog (`src/content/blog.tsx`, 24 posts) já tem fundamentos técnicos de SEO (sitemap dinâmico, canonical, OpenGraph, JSON-LD de `BlogPosting`/`BreadcrumbList`, e um CTA reutilizável presente em 100% dos posts via `<Cta />`/`<RecursosLaudo />`). Um raio-x do canal orgânico identificou três lacunas reais que ainda não foram exploradas:

1. **Autoria genérica.** Todos os 24 posts assinam como "Equipe Danos Aparentes" (marca), e o JSON-LD declara `author` como `Organization`. O site já expõe o proprietário como pessoa real em outro ponto (`ShareBar.tsx`: "Sou o Jeferson, proprietário da Danos Aparentes"). Conteúdo com peso legal/segurador (laudos, contestação de sinistro) se beneficia de sinal de E-E-A-T ligado a uma pessoa identificável, não a uma marca genérica.
2. **Zero link interno entre posts.** Cada artigo só linka de volta para `/blog` (índice). Não há sugestão de posts relacionados, então não existe distribuição de autoridade entre artigos do mesmo tema nem incentivo a navegação/tempo de permanência.
3. **Sem páginas de categoria.** Cada post já tem um campo `category` (`Vistoria`, `Locadora`, `Frota`, `Seguro`, etc. — 11 valores distintos), mas não existe nenhuma rota que agregue posts por categoria. É buscas mais amplas ("vistoria de frota", "laudo para locadora") sem página dedicada para capturá-las, e o badge de categoria em cada post é hoje só um `<span>`, não um link.

*(Nota: um achado inicial de que "o blog não tem CTA de conversão" se mostrou incorreto após inspeção — o CTA existe e cobre os 24 posts via componente compartilhado. Por isso não faz parte desta spec.)*

## Objetivo

Fazer o conteúdo que já existe (nenhum post novo) trabalhar mais para SEO: sinal de autoria mais forte, melhor distribuição de link interno entre posts do mesmo tema, e páginas de categoria indexáveis.

## Decisões de produto (brainstorm)

| Decisão | Escolha |
|---|---|
| Autor visível e no schema | Trocar "Equipe Danos Aparentes" por "Jeferson" em todos os 24 posts (texto visível **e** JSON-LD, para não haver descompasso entre conteúdo exibido e dados estruturados) |
| Critério de "relacionados" | Mesma `category` primeiro; completa com posts que compartilham `tags` se faltar |
| Categorias | Geradas a partir do campo `category` já existente — sem nova taxonomia, sem edição manual por post |
| Fora de escopo | Lead magnet (captura de e-mail), calculadora interativa, parcerias de backlink — ficam para specs futuras |

## Abordagens consideradas

### A — Só o fix de autor (descartada)
Resolve o item 1 isoladamente, mas é uma mudança de duas linhas — não justifica um ciclo de implementação por si só, e deixa os gaps de link interno (que têm mais potencial de impacto) intocados.

### B — Autor + relacionados + categorias ✅ (escolhida)
Os três itens usam os mesmos dados já presentes em `BLOG_POSTS` (`category`, `tags`), não exigem conteúdo novo, e reforçam o mesmo objetivo: fazer o Google entender melhor a estrutura temática do blog e valorizar a autoria.

### C — Pacote completo incluindo lead magnet (fase 2, não agora)
Captura de e-mail exige decisões de produto adicionais (formato do material, ferramenta de e-mail, fluxo de nutrição) que não foram brainstormadas ainda. Fica como spec própria depois que os itens A/B estiverem no ar.

---

## Arquitetura

### Responsabilidades por arquivo

| Item | Arquivo | Mudança |
|---|---|---|
| Autor | `src/content/blog.tsx` | `author.name` de `'Equipe Danos Aparentes'` → `'Jeferson'` nos 24 posts |
| Autor (schema) | `src/app/blog/[slug]/page.tsx` | JSON-LD `author` de `{'@type': 'Organization', ...}` → `{'@type': 'Person', name, jobTitle: 'Proprietário', worksFor: {'@type': 'Organization', name: 'Danos Aparentes'}}` |
| Relacionados | `src/content/blog.tsx` | Nova função `getRelatedPosts(post, limit = 3)` |
| Relacionados (UI) | `src/app/blog/[slug]/page.tsx` | Nova seção "Leia também" antes do rodapé de tags, usando `getRelatedPosts` |
| Categorias (util) | `src/content/blog.tsx` | Nova função `categorySlug(category: string)` (slugify sem acentos/espaços) e `getPostsByCategorySlug(slug)` |
| Categorias (rota) | `src/app/blog/categoria/[categoria]/page.tsx` *(novo)* | Lista posts da categoria, `generateStaticParams` a partir das categorias distintas em `BLOG_POSTS`, metadata + canonical + `BreadcrumbList` |
| Categorias (link) | `src/app/blog/[slug]/page.tsx` | Badge de categoria sobre a capa do artigo passa a ser `<Link href="/blog/categoria/{slug}">` em vez de `<span>` |
| Card de post (refactor) | `src/components/BlogPostCard.tsx` *(novo)* | Extrai o card (capa + categoria + título + meta) hoje duplicado em `blog/page.tsx` e `BlogTeaserSection.tsx`, para não duplicar uma 3ª e 4ª vez nas seções de relacionados e categoria |
| Sitemap | `src/app/sitemap.ts` | Adiciona uma entrada por categoria distinta (`priority: 0.6`, `changeFrequency: 'weekly'`) |

### Fluxo de dados

```
BLOG_POSTS (fonte única, já existe)
   │
   ├─ getRelatedPosts(post) ──► seção "Leia também" em /blog/[slug]
   │
   └─ categorySlug(category) ──► rotas estáticas /blog/categoria/[categoria]
                                       │
                                       └─ listadas no sitemap.ts
```

Nenhum dado novo é criado — tudo deriva de `category`/`tags` que já existem em cada post.

### Autor como Person

```ts
author: {
  '@type': 'Person',
  name: post.author.name, // 'Jeferson'
  jobTitle: 'Proprietário',
  worksFor: { '@type': 'Organization', name: 'Danos Aparentes' },
}
```

O campo `role` da interface `BlogPost` (hoje `'Vistoria digital'`, não renderizado em nenhum lugar) não é alterado — fica fora de escopo por não ser exibido nem consumido atualmente.

### Componente de card compartilhado

`src/components/BlogPostCard.tsx` (novo): recebe um `BlogPost` e renderiza capa (`BlogCover`) + badge de categoria + título + meta (data/tempo de leitura), no mesmo visual hoje duplicado em `src/app/blog/page.tsx` e `src/components/BlogTeaserSection.tsx`. Esses dois arquivos passam a importar `BlogPostCard` em vez de repetir o JSX. É pré-requisito dos dois itens abaixo, que também usam esse card.

### Artigos relacionados

`getRelatedPosts(post, limit = 3)`:
1. Filtra `BLOG_POSTS` excluindo o post atual.
2. Prioriza posts com a mesma `category`.
3. Se não completar `limit`, preenche com posts que compartilham ao menos uma `tag`.
4. Retorna no máximo `limit` posts, ordenados por data (mais recentes primeiro) dentro de cada critério.

UI: seção "Leia também" com 3 `BlogPostCard`, inserida entre o conteúdo do artigo e o bloco de tags/rodapé em `src/app/blog/[slug]/page.tsx`.

### Páginas de categoria

- Rota: `src/app/blog/categoria/[categoria]/page.tsx`, onde `[categoria]` é o slug (ex.: `boas-praticas` para `"Boas práticas"`).
- `categorySlug(category)`: lowercase, remove acentos, espaços → hífen. Usada tanto para gerar os slugs quanto para o lookup reverso (`getPostsByCategorySlug`).
- `generateStaticParams`: itera as categorias distintas de `BLOG_POSTS`.
- Página: título "Artigos sobre {category} | Blog Danos Aparentes", grid de `BlogPostCard`, `BreadcrumbList` JSON-LD (`Blog` → categoria).
- Caso a categoria não exista (`notFound()`), mesmo padrão do `[slug]/page.tsx` atual.

**Nota de correção:** nos cards de grid (`BlogPostCard`, usado no índice do blog, na seção "Do blog" da landing e nos relacionados), o card inteiro já é um `<Link>` para o post — por isso a categoria ali continua como texto simples (`<span>`), não um `<Link>` aninhado dentro de outro `<Link>` (HTML inválido, quebraria o clique). O link de categoria clicável fica só no badge sobre a capa em `src/app/blog/[slug]/page.tsx`, que não está dentro de nenhum Link.

---

## Fora de escopo (próximos passos, não agora)

- Lead magnet / captura de e-mail (checklist em PDF) — spec própria.
- Calculadora interativa embutida em posts.
- Parcerias de conteúdo/backlink com sindicatos, corretoras, associações.
- Ajuste de `dateModified` no JSON-LD e schema `FAQPage` em `/faq` — pequenos, sem prioridade própria; ficam para quando algum desses arquivos for tocado por outro motivo.

## Testes / verificação

- Build local (`next build`) gera as novas rotas estáticas de categoria sem erro.
- Cada uma das 24 entradas em `BLOG_POSTS` deve resultar em `author.name === 'Jeferson'`.
- Para cada post, `getRelatedPosts` retorna no máximo 3 itens e nunca inclui o próprio post.
- Sitemap (`/sitemap.xml`) passa a listar as rotas de categoria.
- Verificação manual no navegador: badge de categoria em `/blog` e em um post individual navega para `/blog/categoria/{slug}` e lista os posts esperados.
