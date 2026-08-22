# DamageFloat — polish Sugestão IA (confirmar tipo/gravidade)

## Contexto

No app de vistoria, o vistoriador escolhe a peça no diagrama SVG
([`VehicleViewer.tsx`](../../../src/components/VehicleViewer.tsx)) e registra
o dano no float ([`DamageFloat.tsx`](../../../src/components/DamageFloat.tsx)).

Já existe o caminho foto → `POST /api/damage-classify` (Groq) →
`type` / `severity` / `description`. A sugestão hoje é discreta (banner
“IA sugere” + “Usar” só quando o tipo diverge) e a gravidade/descrição
podem ser aplicadas sem um passo explícito de Aceitar / Editar / Ignorar.

Auto-detect de peça pela foto está em 410 / fora de escopo. Drag-to-rotate
do visualizador tem spec própria
([`2026-07-26-drag-to-rotate-vehicle-viewer-design.md`](./2026-07-26-drag-to-rotate-vehicle-viewer-design.md)).

## Objetivo

Reforçar o fluxo A de danos: **IA sugere; humano confirma**. Polish do
`DamageFloat` (abordagem 1 do brainstorm) — deixar a sugestão óbvia,
reversível e honesta, sem mudar o contrato da API nem o `partId`.

## Fluxo

1. Vistoriador toca uma peça no SVG → abre `DamageFloat` (como hoje).
2. Anexa foto (câmera ou galeria) → chama `/api/damage-classify` (como hoje).
3. Enquanto analisa: estado **“Analisando foto…”** — não confirmar tipo/gravidade
   pela IA ainda (confirmação manual continua possível).
4. Resposta OK → painel **Sugestão IA**: tipo + gravidade (Leve/Média/Grave) +
   texto curto de descrição. A peça já selecionada no SVG pode ganhar preview
   visual da gravidade sugerida (`damage-low|medium|high` em *draft*).
5. Ações:
   - **Aceitar** — aplica tipo, gravidade e descrição (nas notas, se o usuário
     não editou notas) e segue o confirmar atual.
   - **Editar** — libera campos manuais pré-preenchidos; label
     “ajustado manualmente”.
   - **Ignorar** — descarta a sugestão (`aiState` → idle), mantém a foto;
     usuário escolhe tipo/gravidade na mão.
6. Erro / timeout / sem crédito (`auth-required`): mensagem clara em PT-BR +
   fluxo 100% manual (sem travar a vistoria).
7. A IA **nunca** muda `partId` / peça selecionada.

## UI / componentes

**Onde mexe:** quase só [`DamageFloat.tsx`](../../../src/components/DamageFloat.tsx).
Prop opcional de “draft severity” para o SVG via
[`VehicleViewer.tsx`](../../../src/components/VehicleViewer.tsx) /
`usePartProps` **somente se for trivial** — sem pin/badge novo no diagrama.

**UI no float (após foto / step de detalhes):**

- Chip: **“Sugestão — revise antes de confirmar”** (tom honesto; sem métricas
  inventadas).
- Bloco com tipo + Leve/Média/Grave + 1 linha de descrição.
- Botões: **Aceitar** · **Editar** · **Ignorar sugestão**.
- Loading / erro / auth-required: copy curta PT-BR (estados já existem; deixar
  óbvios).

**Diagrama:** gravidade em *draft* só enquanto a sugestão estiver ativa;
some no Ignorar ou ao fechar sem Aceitar.

**Fora desta entrega (não tocar):**

- `DamageSuggestionsReview`
- `damage-vision` / lote
- nova API ou novos modelos

## Critérios de pronto

- Foto → loading → sugestão visível com Aceitar / Editar / Ignorar
- Aceitar grava o que a IA sugeriu (tipo + gravidade + descrição nas notas,
  se o usuário não editou notas)
- Ignorar não aplica sugestão; vistoria continua manual
- Erro de API não bloqueia marcar dano na mão
- Peça no SVG **nunca** muda pela IA
- Mobile: float usável (touch targets ok)

## Fora de escopo

- Detectar peça pela foto (auto-`partId`)
- Highlight de várias peças
- Novos modelos / nova API
- Copy com métricas inventadas (“IA 99% precisa”)
- Reativar revisão em lote (`DamageSuggestionsReview`)
- Callout/pin novo no SVG (abordagem 2 do brainstorm)
- Drag-to-rotate (spec separada)

## Teste mínimo

Check manual (ou 1 teste leve) cobrindo:

1. **Aceitar** — tipo/gravidade/descrição da IA entram no confirmar
2. **Ignorar** — sugestão some; foto permanece; preenchimento manual
3. **Erro de API** — mensagem + fluxo manual; nenhuma avaria errada gravada

## Notas de implementação (escopo pequeno)

- Reaproveitar `AiClassifyState` e `classifyWithAi` existentes.
- Aceitar/Editar/Ignorar são estados de UI no float; não exige schema novo.
- Draft de gravidade no SVG é opcional e descartável se não for trivial.
- Um único plano de implementação: este polish. Sem fase 2 embutida.
