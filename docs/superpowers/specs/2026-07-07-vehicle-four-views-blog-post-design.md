# Post de blog: demonstração das 4 vistas do veículo

## Contexto

O usuário quer mostrar, em conteúdo de marketing, como a vistoria cobre as 4
vistas do veículo (Lateral Esquerda, Lateral Direita, Frontal, Traseira) —
inspirado nas telas reais do app (`/app`), que já navegam entre essas vistas
com uma barra de progresso "X de 4 vistas vistas" e um painel de avarias por
vista.

Decisão: em vez de alterar a landing page (`src/app/page.tsx` /
`VehicleShowcaseSection.tsx`, que já mostra um seletor de *tipos* de veículo),
isso vira um **post novo no blog**, seguindo a infraestrutura existente em
`src/content/blog.tsx` (capa, SEO/`generateMetadata`, sitemap automático via
`BLOG_POSTS`).

## O que existe hoje (reaproveitado)

- SVGs reais e clicáveis do carro para as 4 vistas, os mesmos usados no app:
  `src/components/vehicles/CarLateralLeft.tsx`, `CarLateralRight.tsx`,
  `CarFrontal.tsx`, `CarTraseira.tsx`.
- Padrão de post do blog: `BlogPost.content: React.ReactNode`, permitindo
  embutir componentes React customizados diretamente no corpo do post
  (ex.: `LaudoSheet`, `Cta` em `src/content/blog.tsx`).
- `sitemap.ts` já inclui todo item de `BLOG_POSTS` automaticamente — nenhuma
  mudança necessária ali.

## Escopo

### 1. Componente novo: `src/components/blog/VehicleViewsDemo.tsx`

Client component (`'use client'`), autocontido, sem dependência do estado do
app (`SavedReport`, sync, etc.) — usa apenas dados mockados locais.

- Tabs de vista: "Lat. Esquerda" | "Lat. Direita" | "Frontal" | "Traseira",
  com indicador de progresso "X de 4 vistas vistas" (X = índice da vista ativa
  + 1, sempre "4 de 4" pois é demonstração — todas as vistas já têm avaria de
  exemplo).
- Renderiza o SVG real correspondente à vista ativa (`CarLateralLeft` etc.),
  **sem** handlers de clique reais — é ilustrativo, não editável. Os
  componentes SVG acham marcadores de avaria pré-definidos via props/dados
  mockados (mesma estrutura de `Damage` usada em `VehicleShowcaseSection`).
- Painel lateral (por vista) listando 1-2 avarias de exemplo com nome da
  peça, tipo (Risco/Amassado/etc.) e severidade — reaproveita o visual dos
  cards de avaria já usados no app (ver prints: nome em negrito, subtítulo
  "Tipo · Severidade · Posição").
- Dados mockados: 4 vistas, cada uma com 1-2 avarias fixas (não editáveis),
  cobrindo os 4 lados. Não reutiliza `mockDamages` de `VehicleShowcaseSection`
  diretamente (aquele é por *tipo de veículo*, este é por *vista* do mesmo
  veículo) — array próprio no componente.

### 2. Post novo em `src/content/blog.tsx`

- `slug`: `como-funciona-vistoria-4-vistas-do-veiculo` (ajustável).
- Categoria/tags alinhadas aos posts existentes (`Vistoria`, etc.).
- Corpo do post: explica o fluxo de marcar avarias nas 4 vistas, embute
  `<VehicleViewsDemo />`, e inclui um parágrafo dedicado a **anexar fotos por
  avaria** (com GPS, mesma linguagem usada em outros posts/`RecursosLaudo`).
- Termina com o bloco `<Cta />` já existente (padrão dos outros posts).
- Cover: gradiente + imagem `/vehicles-img/car.png` (mesmo padrão dos posts
  de veículo).

### Fora de escopo

- Nenhuma mudança na landing page (`page.tsx`, `VehicleShowcaseSection.tsx`).
- Nenhuma interatividade real (clique para adicionar/editar avaria) — é
  demonstração fixa, não um editor.
- Nenhuma mudança em `sitemap.ts`/`robots.ts` (já cobrem posts automaticamente).

## Testagem / verificação

- Rodar o dev server, abrir `/blog/<slug>` e conferir visualmente as 4 vistas
  trocando corretamente, sem erros no console.
- Rodar `npm run typecheck` e `npm run build`.
