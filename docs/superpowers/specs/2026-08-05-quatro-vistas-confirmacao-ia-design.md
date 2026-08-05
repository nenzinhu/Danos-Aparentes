# Design: Quatro vistas — captura em lote + IA (lados e avarias)

**Data:** 2026-08-05  
**Produto:** Danos Aparentes — Histórico Digital do Veículo  
**Feature:** Fotos dos 4 lados do veículo (`viewPhotos`)  
**Idioma do spec:** português claro  
**Status:** desenho aprovado; plano em `docs/superpowers/plans/2026-08-05-quatro-vistas-confirmacao-ia.md`

---

## 1. Problema

Hoje o app pede foto **lado a lado**: a pessoa escolhe (ou o slot já diz) a vista e só então fotografa. No pátio isso é lento.

Queremos:
1. Tirar as **4 fotos rápido**, sem escolher o lado na hora do clique.
2. A **IA sugere** qual foto é Frontal / Traseira / Lado-Esquerdo / Lado-Direito.
3. A pessoa **confirma ou corrige** os lados.
4. Só depois a **IA sugere avarias** nessas fotos (etiqueta na vista).
5. A pessoa **confirma ou corrige/ignora** cada sugestão de dano — a IA **nunca** grava sozinha.

Regra de produto (igual Parte 1 — evidência): **IA só sugere; humano confirma.**

---

## 2. Objetivo

1. Captura em **lote** das 4 faces (~90°).
2. **Sugestão de IA** do mapeamento foto → vista (`ViewType`).
3. Tela de **confirmação/edição** dos 4 lados antes de seguir.
4. Após lados confirmados: **análise de avarias** por IA nas fotos confirmadas.
5. Sugestão de dano aparece como **tag** ao lado da vista correspondente.
6. Aceite humano obrigatório (Aceitar / Editar / Ignorar) com status `sugerido` → `confirmado` | `ignorado`.

---

## 3. Fora de escopo

- Comparação tipada entre vistorias (Parte 2: sem alteração / alteração / inconclusivo).
- IA criar pin no SVG sozinha sem a pessoa marcar peça (permanece regra da Parte 1 / DamageFloat).
- Reescrever PDFs já emitidos.
- Detectar peça específica do diagrama (`partId`) a partir só da foto dos 4 lados.
- Obrigatoriedade de IA offline: sem rede, fluxo manual de lados + avarias continua possível.
- Mudar o modelo de armazenamento final de `viewPhotos` (continua `Partial<Record<ViewType, string>>` após confirmação).

---

## 4. Nomes das vistas (UI ↔ código)

| Texto na tela (PT)     | Chave `ViewType`   | Alias aceito no copy do usuário |
|------------------------|--------------------|----------------------------------|
| Frontal                | `frontal`          | Frontal                          |
| Traseira               | `traseira`         | Traseira                         |
| Lateral Esquerda       | `lateral-left`     | Lado-Esquerdo                    |
| Lateral Direita        | `lateral-right`    | Lado-Direito                     |

Ordem de exibição padrão (já usada):  
`lateral-left` → `frontal` → `lateral-right` → `traseira`  
(Labels oficiais no app: `VIEW_NAME` em `constants.ts`.)

---

## 5. Fluxo do usuário (aceite de produto)

### Etapa A — Captura rápida (lote)

1. Na seção **Fotos dos 4 lados** (passo Veículo / evidência), a pessoa inicia **“Fotografar os 4 lados”** (ou anexa até 4 da galeria de uma vez).
2. **Não** é obrigatório escolher a vista antes de cada disparo.
3. Até 4 fotos entram num **rascunho** (ainda não amarradas de forma definitiva a `viewPhotos`).
4. Pode remover/refazer uma foto do lote antes de pedir análise.

### Etapa B — IA sugere os lados + humano confirma

5. Ao concluir o lote (4 fotos, ou o máximo disponível se a pessoa seguir com menos — ver casos especiais), o sistema chama a IA para **classificar a vista** de cada foto.
6. A tela mostra as **4 sugestões**: miniatura + vista sugerida.
7. A pessoa:
   - **Confirma tudo** se estiver certo, ou
   - **Edita** qualquer item e escolhe a vista correta (lista das 4; sem duplicar a mesma vista em duas fotos).
8. Só após confirmação humana o mapa definitivo grava em `vehicleInfo.viewPhotos[ViewType] = photoRef`.
9. Estado intermediário de sugestão de lado **não** vira laudo até confirmar.

### Etapa C — IA sugere avarias (depois dos lados confirmados)

10. **Somente depois** dos lados confirmados, a IA analisa as fotos confirmadas em busca de **danos aparentes**.
11. Se houver sugestão para uma vista, aparece uma **tag** ao lado dessa vista (ex.: “Amassado · Sugestão da IA”).
12. A pessoa abre a tag e decide:
    - **Aceitar** → `evidenceStatus: confirmado` (+ quem + quando, regra Parte 1)
    - **Editar** → ajusta texto/tipo/gravidade → `confirmado`
    - **Ignorar** → `ignorado` (não entra no PDF como prova)
13. Sem decisão humana, permanece `sugerido` — **nunca** auto-confirma.

### Etapa D — Seguir a vistoria

14. Com os 4 lados confirmados, a vistoria segue (diagrama, finalizar, PDF) como hoje: `hasAllViewPhotos` continua sendo o gate para PDF.
15. Tags de avaria sugeridas/confirmadas convivem com o fluxo atual de marcar peça no SVG (não substituem o diagrama; complementam evidência das faces).

---

## 6. Telas (comportamento esperado)

### 6.1 Captura em lote

- Botão primário: fotografar / anexar várias.
- Contador `n/4`.
- Miniaturas do rascunho sem rótulo de vista definitivo (ou rótulo “Aguardando IA…” só após envio).
- CTA: **“Identificar lados com IA”** (habilitado com ≥1 foto; idealmente 4).

### 6.2 Confirmar lados

- Grade 2×2 (ou lista) com foto + select/chips das 4 vistas.
- Chip “Sugestão da IA” em cada vista proposta até confirmar.
- Validação: as 4 vistas **únicas** se houver 4 fotos; se menos de 4, vistas faltantes ficam vazias (pessoa completa depois, modo atual ou novo lote).
- Ações: **Confirmar lados** · **Corrigir** (inline) · **Refazer fotos**.

### 6.3 Tags de avaria por vista

- Em cada card de vista confirmada: área de tags.
- Tag amarela: sugestão ainda aberta.
- Tag verde: confirmada (com quem/quando se couber no espaço).
- Toque na tag → painel Aceitar / Editar / Ignorar (mesmo espírito do `DamageFloat` / Parte 1).

---

## 7. Modelo de dados (notas)

### Já existe (permanece após confirmação)

```ts
viewPhotos?: Partial<Record<ViewType, string>>  // ref da foto por lado
```

### Rascunho / sugestão de lado (novo — só até confirmar)

Conceito (nome interno livre no plano):

- Lista ordenada de refs ainda **não** atribuídas: `pendingViewPhotoRefs: string[]`
- Sugestões da IA: `viewSideSuggestions?: { photoRef: string; suggestedView: ViewType; confidence?: number }[]`
- Flag de confirmação humana dos lados: `viewSidesConfirmedAt?: string` (ISO) e opcional `viewSidesConfirmedBy`

Após **Confirmar lados**:
- Preencher `viewPhotos`
- Limpar rascunho/sugestões de lado (ou arquivar só em trilha de decisão IA, se já existir padrão `ai_decisions`)

### Avarias sugeridas a partir das fotos de vista

- Reutilizar `Damage` + `evidenceStatus` (`sugerido` | `confirmado` | `ignorado`) da Parte 1.
- Cada sugestão liga-se à **vista** (`Damage.view: ViewType`) e à foto daquela vista.
- **Não** exige `partId` no SVG nesta feature (tag na vista); se no futuro a pessoa quiser amarrar à peça, usa o fluxo do diagrama.

### API (direção — detalhe no plano)

- Classificação de lado: endpoint dedicado ou extensão de vision (ex. lote) que devolve `ViewType` por imagem.
- Avarias: reutilizar caminho de vision/classify existente quando possível (`damage-classify` / `damage-vision` / bulk), **só após** lados confirmados.
- Rate limit e auth iguais às rotas de IA atuais.

---

## 8. Casos especiais

| Situação | Comportamento |
|----------|----------------|
| Menos de 4 fotos | IA classifica as que existem; faltantes ficam vazias; PDF ainda exige 4 (regra atual). |
| IA de lados falha / offline | Pessoa atribui lados **na mão** na mesma tela de confirmação (sem sugestão). |
| IA sugere a mesma vista em 2 fotos | UI impede confirmar até resolver conflito (edição humana). |
| IA de avaria falha | Lados confirmados permanecem; sem tags; vistoria segue; dano no SVG continua disponível. |
| Pessoa edita lado depois de já ter tags de avaria | Se a foto mudou de vista, tags/sugestões da vista antiga são reavaliadas ou invalidadas (preferência: invalidar sugestões não confirmadas daquela foto e permitir nova análise). |
| Substituir uma foto de vista já confirmada | Volta aquela vista a “precisa confirmar”; não reprocessa as outras sem pedido. |
| Prompt ao trocar vista no diagrama (`ViewSidePhotoPrompt`) | Continua como atalho para lado vazio; não substitui o fluxo em lote. |

---

## 9. Critérios de aceite

1. Dá para capturar até 4 fotos **sem** escolher a vista no disparo.  
2. A IA **propõe** Frontal / Traseira / Lateral Esquerda / Lateral Direita para cada foto.  
3. Sem **Confirmar lados** humano, `viewPhotos` definitivo **não** fecha o gate “4/4” com base só na sugestão.  
4. Pessoa consegue **editar** qualquer lado sugerido antes de confirmar.  
5. Análise de avaria por IA roda **somente depois** da confirmação dos lados.  
6. Sugestão de dano aparece como **tag** na vista correspondente, status `sugerido`.  
7. Aceitar / Editar / Ignorar humanos obrigatórios; IA não auto-confirma (alinhado a `evidenceStatus`).  
8. Sem IA/rede: atribuição manual de lados + vistoria manual de danos continuam possíveis.  
9. PDF continua exigindo as 4 fotos de vista confirmadas; itens `ignorado` não entram na tabela de avarias.

---

## 10. Decisões travadas no brainstorm

- Captura em **lote** (dor: não escolher lado a cada foto).  
- **IA sugere os 4 lados**; humano confirma/edita.  
- **Depois** disso, **IA sugere avarias**; tag na vista; humano confirma (Aceitar/Editar/Ignorar).  
- Chaves de vista = `ViewType` existente; labels PT oficiais = `VIEW_NAME` (Lado-Esquerdo/Direito = Lateral Esquerda/Direita).  
- Mesma filosofia da Parte 1: máquina sugere, gente decide.

---

## 11. Relação com o que já existe

| Peça atual | Papel neste design |
|------------|--------------------|
| `ViewPhotosCapture` | Evolui para lote + tela de confirmação (ou componente irmão). |
| `viewPhotos` / `VIEW_PHOTO_ORDER` / `hasAllViewPhotos` | Continuam como verdade após confirmação. |
| `ViewSidePhotoPrompt` | Atalho residual; não é o caminho principal. |
| `DamageFloat` + `evidenceStatus` | Padrão de Aceitar/Editar/Ignorar e status para tags de avaria. |
| APIs damage-vision / classify | Reuso preferencial para etapa de avarias. |

---

## 12. Próximos passos (após aprovação deste spec)

1. Plano de implementação (`docs/superpowers/plans/…`).  
2. Implementar no workspace do app (não landing).  
3. Testes manuais no fluxo mobile (câmera + galeria).  
4. Só então commit/deploy se o produto pedir.

---

## 13. Self-review (spec)

- [x] Sem placeholders “TBD” no fluxo principal.  
- [x] `ViewType` e labels alinhados ao código.  
- [x] IA nos **dois** passos (lados + avarias); humano nos **dois** gates.  
- [x] Ordem explícita: captura → IA lados → confirma → IA avarias → confirma.  
- [x] Offline/falha cobertos.  
- [x] Fora de escopo delimitado (SVG partId, Parte 2, PDF antigo).  
- [x] Critérios de aceite testáveis.
