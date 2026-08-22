# Sistema de Tabs Genérico (`<Tabs>`) — Danos Aparentes

**Data:** 2026-08-09
**Status:** Aprovado (design)
**Autor:** Hermes (sob direção de Nei)

## Problem Statement

O app autenticado do Danos Aparentes já possui navegação por abas (`AppTabBar` dentro do `Header`), mas ela (1) não implementa acessibilidade real de tabs (`role=tablist`/`tab`/`tabpanel` só existe parcialmente no shell), (2) não tem indicador visual deslizante, (3) usa GSAP para micro-animações no tab, e (4) diverge de um segundo padrão de tab (`FieldVisibilityPanel`). O objetivo é criar um componente `<Tabs>` genérico, premium, limpo, mobile-first e acessível, sem nova dependência, que unifique o projeto.

## Recommended Direction

Criar um componente `Tabs` controlado (com suporte não-controlado) em `src/components/ui/Tabs.tsx`, usando apenas React + Tailwind + tokens CSS já existentes (`--primary`, `--card-bg-solid`, `--card-border`, `theme-tab-active/idle`). Indicador deslizante em CSS puro (sem GSAP). Adotar no `AppTabBar` (Inspecionar / Painel / Veículos / Equipe); CTA "Nova inspeção", Ajuda e PWA ficam ao lado, fora do `TabsList`. O conteúdo das telas não muda.

## Arquitetura

### Novos arquivos
- `src/components/ui/Tabs.tsx` — componente genérico (`Tabs`, `TabsList`, `Tab`, `TabPanel` + contexto interno).
- `src/components/ui/__tests__/Tabs.test.ts` — testes unitários.

### Refatorados
- `src/components/app/AppTabBar.tsx` — grupo de navegação usa `<Tabs>`; ações (Nova inspeção, Ajuda, PWA) ficam fora do `TabsList`.
- `src/components/app/AppAuthenticatedShell.tsx` — mapeia `shell.activeTab` → `value` do `<Tabs>`; conteúdo (`dashboard`/`team`/`vehicles`/`inspect`) continua igual, apenas troca o controle de abas.

### API
```tsx
<Tabs value={tab} onValueChange={setTab}>        // controlado
  <TabsList aria-label="Navegação do app">
    <Tab value="inspect">Inspecionar</Tab>
    <Tab value="dashboard">Painel</Tab>
    <Tab value="vehicles">Veículos</Tab>
    <Tab value="team">Equipe</Tab>
  </TabsList>
  <TabPanel value="inspect">{/* conteúdo */}</TabPanel>
  ...
</Tabs>
```
- `Tabs` = context provider (value atual, setter, refs das abas para roving tabindex e indicador).
- `Tab` e `TabPanel` são desacoplados (podem estar em pontos diferentes do DOM, igual ao padrão atual do app onde a barra fica no `Header` e o conteúdo no `main`).
- Suporte não-controlado: `<Tabs defaultValue="inspect">` com estado interno.

## Visual (tokens reutilizados)
- Container: `bg-[var(--card-bg-solid)] border border-[var(--card-border)] rounded-xl p-1 backdrop-blur-md shadow-sm`.
- Aba ativa: `bg-[var(--btn-secondary-bg)] text-[var(--primary)]` (token `theme-tab-active`).
- Aba inativa: `text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent hover:bg-white/[0.03]`.
- **Indicador deslizante:** elemento `absolute` sob a aba ativa, posicionado via `transform: translateX()` + `width` calculados a partir dos `ref`s das abas; `transition: transform/width 200ms ease`. CSS puro, sem GSAP.

## Animação / reduced-motion
- Indicador e reveal do painel usam `transition` CSS.
- Se `(prefers-reduced-motion: reduce)`, desativa transições (sem salto, sem fade). Substitui o GSAP atual do `AppTabBar`.

## Acessibilidade (web-design-guidelines)
- `role="tablist"` no `TabsList`; `role="tab"` + `aria-selected` + `aria-controls` + `id` em cada `Tab`; `role="tabpanel"` + `aria-labelledby` + `id` em cada `TabPanel`.
- **Roving tabindex**: apenas a aba ativa tem `tabIndex=0`; demais `tabIndex=-1`. Setas ←/→ movem o foco (cíclico), Home/End vão para primeira/última.
- `focus-visible:ring` visível.

## Mobile-first
- `TabsList`: `overflow-x-auto no-scrollbar` + `scroll-snap-x` no mobile; fade/seta nas bordas quando há overflow.
- Desktop (`lg:`): `justify-center`, sem scroll, indicador centralizado.

## Testes
- Unitário (`vitest`, `renderToStaticMarkup`): `role=tablist` presente, contagem de `tab` correta, `aria-selected=true` só na ativa, `aria-controls` aponta para painel existente, `aria-label` no `TabsList`.
- Keyboard nav: teste de lógica do roving tabindex (←/→/Home/End) — via `fireEvent`/`act` se testing-library disponível; senão teste da função de cálculo de próximo índice.
- Gate de pronto (padrão do projeto): `tsc --noEmit` + `vitest` + `npm run build` sem erros.

## Key Assumptions to Validate
- [ ] Tokens `--primary`, `--card-bg-solid`, `--card-border`, `theme-tab-active/idle` existem e funcionam em claro/escuro (já validado em `FieldVisibilityPanel`).
- [ ] `AppTabBar` não depende do GSAP para função crítica (apenas micro-animação) — pode ser removido do tab.
- [ ] Estado `shell.activeTab` aceita mapear 1:1 para `value` do `<Tabs>`.

## MVP Scope
- `Tabs.tsx` + testes + refactor do `AppTabBar`.
- `AppAuthenticatedShell` ajustado para o novo controle.

## Not Doing (e por quê)
- **Não muda a estrutura de navegação** (continua Inspecionar/Painel/Veículos/Equipe) — escopo é o componente, não a IA de navegação.
- **Não adiciona nova aba** — fora do escopo.
- **Não mexe no conteúdo das telas** (DashboardView, TeamTab, VehiclesListView, InspectTab) — só o controle de abas.
- **Não introduz lib externa** (Radix/Tailwind UI) — YAGNI para 4 abas; tokens já cobrem o visual.
- **Não migra `FieldVisibilityPanel` neste PR** — pode adotar o `<Tabs>` depois, mas fica fora para limitar blast radius.

## Open Questions
- (nenhuma bloqueante)
