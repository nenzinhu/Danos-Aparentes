---
version: alpha
name: Danos Aparentes
description: >-
  Design system da plataforma Danos Aparentes — PWA de inteligência histórica
  veicular (laudos de avarias com prova SHA-256 + QR). Tema escuro, dois
  acentos (azul = ação, âmbar = estrutura), escala de raio fechada, e cores
  semânticas de severidade de avaria.
colors:
  # Ação interativa (CTA, seleção ativa, links)
  primary: "#06B6D4"
  primary-hover: "#22D3EE"
  # Estrutura e dados (rótulos, eyebrows, molduras, valores mono)
  signal: "#f5a623"
  signal-bright: "#ffb938"
  # Gravidade de avaria (só para severidade)
  severity-low: "#94a3b8"
  severity-medium: "#f97316"
  severity-high: "#ef4444"
  # Semânticos de feedback
  success: "#34d399"
  # Superfícies / texto (tema escuro)
  bg-main: "#0B0F17"
  card-bg: "#111827"
  text-main: "#E5EDF5"
  text-muted: "#94A3B8"
  card-border: "#1F2937"
typography:
  h1:
    fontFamily: Outfit
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Outfit
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body-md:
    fontFamily: Outfit
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  eyebrow:
    fontFamily: Outfit
    fontSize: 0.75rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  # chip, badge, etiqueta
  sm: 6px
  # botão CTA, input grande
  md: 12px
  # card, .glass-card
  lg: 20px
  # pílula, dot, botão redondo
  pill: 9999px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#0B0F17"
    rounded: "{rounded.md}"
    padding: 12px
    typography: "{typography.body-md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#0B0F17"
    rounded: "{rounded.md}"
    padding: 12px
  button-secondary:
    backgroundColor: "rgba(0,170,255,0.07)"
    textColor: "{colors.text-main}"
    rounded: "{rounded.md}"
    padding: 12px
  card:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.text-main}"
    rounded: "{rounded.lg}"
  badge-signal:
    backgroundColor: "{colors.signal}"
    textColor: "#0B0F17"
    rounded: "{rounded.sm}"
    padding: 4px
  badge-severity-medium:
    backgroundColor: "{colors.severity-medium}"
    textColor: "#0B0F17"
    rounded: "{rounded.sm}"
    padding: 4px
---

## Overview

Danos Aparentes é uma PWA de inteligência histórica veicular. O sistema visual
é **dark-first**, de alta densidade de dados, construído em torno de uma regra
de dois acentos que nunca se cruzam:

- **Azul (`--primary`)** conduz toda a *ação* — CTAs, seleção ativa, links.
- **Âmbar (`--signal`)** conduz toda a *estrutura* — rótulos, eyebrows, molduras,
  valores mono, marcadores de avaria.

A confusão dos dois papéis é o erro de design mais comum no projeto: botão de
ação nunca usa âmbar; rótulo estrutural nunca usa azul.

## Colors

- **Primary (#06B6D4):** ciano de ação. Usado só em CTAs, foco e links ativos.
  Variante `#22D3EE` para hover/estado ativo.
- **Signal (#f5a623):** âmbar de estrutura, derivado das cores de severidade da
  vistoria. Usado em eyebrows, molduras de sheet e marcação de dados.
- **Severity (low/medium/high):** escala semântica de gravidade de avaria —
  `#94a3b8` (baixa), `#f97316` (média), `#ef4444` (alta). Nunca reaproveitada
  para ação ou estrutura.
- **Success (#34d399):** verde de feedback positivo, funciona nos dois temas.
- **Superfícies:** fundo `#0B0F17`, card `#111827`, borda `#1F2937`. Texto
  `#E5EDF5` (principal) e `#94A3B8` (mudo).

## Typography

Família única **Outfit** para tudo (configurada em `tailwind.config.js` como
`fontFamily.outfit`). Títulos com tracking negativo (`-0.02em`) para densidade;
labels minúsculas em maiúsculas com tracking positivo (`0.08em`) como eyebrow.

## Layout

Escala de raio **fechada** (não introduzir `rounded-3xl` nem raios fora dela):
chip/badge `6px`, controle/CTA `12px`, card `20px`, pílula `9999px`. Espaçamento
base em múltiplos de 8px (`sm 8 / md 16 / lg 24`).

## Components

- `button-primary` é a única ação de alta ênfase por tela (texto escuro sobre
  ciano para contraste AA).
- `button-secondary` é ação de baixa ênfase (fundo translúcido azulado).
- `card` é a unidade de superfície (fundo `#111827`, raio `20px`).
- `badge-signal` / `badge-severity-*` rotulam dados — texto escuro sobre cor
  saturada.

## Buttons — estados e acessibilidade (heurísticas Nielsen)

Regras reutilizáveis para qualquer botão/CTA do produto, mapeadas às heurísticas.

### Hierarquia (heurística 8 — minimalismo)
- **1 botão primário por view.** Ação principal da tela. Mais de um dilui a decisão.
- `secondary` = ação de apoio; `ghost` = terciária (só texto); `success` = confirmação/conclusão;
  `danger` = ação destrutiva (excluir/limpar), texto claro sobre `--severity-high`.
- Nunca usar `--signal` (âmbar) em botão de ação — âmbar é só estrutura/dado.
- Ações destrutivas NUNCA usam `primary` nem `success`; usam `danger` (sólido) ou
  `ghost` + `text-[var(--severity-high)]` (baixa ênfase). Nunca `text-red-400` hardcoded.

### Alvos de toque (heurística 6 — reconhecimento)
- Altura mínima **44px** em mobile, **40px** em desktop (área clicável real, com padding).
- Espaçamento entre botões adjacentes ≥ 12px (evita toque acidental).
- Em mobile, CTA primário único = **100% da largura** (ex.: `fullWidth`).

### Estados (todos obrigatórios — heurística 1, visibilidade do status)
- **Default / Hover / Active / Focus / Loading / Disabled.**
- `Button` do design system já entrega: `focus-visible:ring`, `active:scale-[0.98]`,
  `loading` com spinner + `aria-busy`, `disabled:opacity-60`, `motion-reduce`.
- **Ação assíncrona** → estado loading imediato + bloqueio de reenvio. Nunca sem feedback.

### Contraste (WCAG 2.1 AA — heurística 2, mundo real)
- Padrão do sistema: **fundo acento + texto `--bg-main`** (ex.: `primary`, `success`).
  Isso passa AA nos dois temas sem regra extra.
- **Não** usar cores fora dos tokens (`green-500` hardcoded reprova AA em 2.28:1).
  Troque por `bg-success hover:bg-success-bright`.
- Verifique contraste de qualquer cor nova antes de aplicar (mín. 4.5:1 texto normal).

### Microcopy (heurísticas 2, 4, 8)
- Verbo de ação primeiro e conciso (1–3 palavras): "Começar grátis", "Salvar alterações".
- Específico > genérico: "Ir ao diagrama" > "OK"; "Enviar mensagem" > "Confirmar".
- Tom consistente (sentence-case) em todo o app — nunca misturar case.

### Abas (Tabs — heurísticas 1, 6)
- `Tabs`/`Tab` do `ui/Tabs.tsx` é a fonte única: role=tablist, roving tabindex e
  indicador deslizante com tinta `--primary` (14%) + borda (28%).
- Aba ativa: texto `--primary` + `font-extrabold` + indicador; inativa: `--text-muted`,
  hover `--text-main`. O indicador usa `color-mix` — em tema claro herda `--primary`/`--signal` do tema.
- Estado ativo de aba é AÇÃO → `--primary`. Nunca usar `--signal` para "selecionado".

### Regras de lint (ast-grep) — impedem recorrência
Rodar com `npm run lint:ast` (ast-grep scan src). Regras em `.ast-grep/rules/`:
- `no-outside-radius-scale`: bloqueia `rounded-3xl` (fora da escala fechada).
- `no-hardcoded-green`: bloqueia `green-500` hardcoded (fura tokens + reprova AA).
Adicione aqui/regras novas ao criar tokens — não corrija à mão toda vez; codifique a regra.

### Anti-padrões
- ❌ Dois primários competindo na mesma view.
- ❌ Texto longo truncado no botão (reduzir padding antes de reduzir fonte).
- ❌ Disabled sem razão aparente (explicar quando bloqueado).
- ❌ Clicar sem feedback visual (hover/active).
- ❌ Ícone ambíguo sem texto ou `aria-label`.
- ❌ Vermelho/âmbar para ação não-destrutiva.

## Do's and Don'ts

- **Do** manter azul = ação e âmbar = estrutura.
- **Do** usar a escala de raio fechada.
- **Don't** usar âmbar em botão de ação nem azul em rótulo estrutural.
- **Don't** inventar cores fora dos tokens acima; adicione ao `globals.css` e
  aqui antes de usar.
