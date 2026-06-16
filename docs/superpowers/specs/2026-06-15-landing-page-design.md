# Landing Page — Design

## Objetivo

Página de marketing que apresenta o produto "Vistoria de Danos Aparentes" para quem ainda não conhece o sistema, terminando em call-to-action de cadastro/login. Funciona também como porta de entrada do app, já que o app agora exige conta (ver [[2026-06-15-migracao-banco-dados-design]]).

## Público-alvo

Oficinas mecânicas, seguradoras/peritos e locadoras de veículos — todos usam o sistema para documentar avarias de forma formal (antes/depois de reparo, sinistro, entrega/devolução de aluguel).

## Identidade visual

- Reaproveita o tema neon azul/dark já existente no app (variáveis CSS de `src/index.css`), garantindo consistência visual entre landing page e app.
- **Logo**: ícone de lupa de inspeção sobre o carro + nome "VISTORIA+", em gradiente azul neon (`#00d4ff` → `#0066cc`), conforme aprovado no companion visual.

## Estrutura da página

1. **Hero** (full-bleed): veículo 3D em opacidade reduzida como fundo, logo no canto superior, badge "NOVO: SINCRONIZAÇÃO EM NUVEM", título de impacto, subtítulo curto, e dois CTAs ("Criar conta grátis" / "Entrar").
2. **Funcionalidades**: grid de 4 cards — Mapa 3D do veículo, Fotos anexadas por avaria (com tag "NOVO"), Laudo em PDF, Funciona offline.
3. **Como funciona** (passo a passo, 4 etapas):
   1. Selecione o tipo e a vista do veículo
   2. Marque as avarias direto no modelo 3D (com foto, se quiser)
   3. Revise a lista de avarias e gere o laudo
   4. Exporte em PDF, compartilhe por WhatsApp ou link
4. **CTA final**: repetição do convite de cadastro/login, fechando a página.

Seções explicitamente fora de escopo por agora: Planos/Preços (sem modelo de precificação definido) e Depoimentos/clientes (sem clientes reais ainda) — podem ser adicionadas quando existirem de fato, para não comprometer a credibilidade da página.

## Arquitetura técnica

- O projeto é hoje um SPA único (Vite + React). A landing page vira uma segunda página dentro do **mesmo projeto Vite**, usando build multi-página (`build.rollupOptions.input` com `index.html` e `landing.html`, ou rota separada se for usado um router).
- `/` passa a servir a landing page; o app de vistoria (fluxo atual) passa a viver em `/app` (ou subdomínio, no futuro).
- Evita criar um segundo repositório/deploy — todo o projeto continua publicado junto, reduzindo esforço de manutenção.

## Fora de escopo (por agora)

- Seção de Planos/Preços e Depoimentos (ver acima).
- Internacionalização (página será só em pt-BR, como o resto do app).
- Blog/conteúdo institucional.

## Validação

Sem suite de testes automatizados; validação manual:
1. Acessar `/` e confirmar que a landing carrega sem precisar de login.
2. Clicar em "Criar conta grátis" e confirmar que leva à tela de cadastro do app.
3. Clicar em "Entrar" e confirmar que leva à tela de login.
4. Testar responsividade em mobile (já que o público pode acessar via celular em campo).
