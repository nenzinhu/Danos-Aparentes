# Quatro vistas — captura em lote + IA (lados e avarias) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir tirar as 4 fotos dos lados rápido (sem escolher vista no disparo); a IA sugere qual foto é cada lado; o humano confirma/edita; só então a IA sugere avarias como tag na vista; o humano Aceita/Edita/Ignora — a IA nunca confirma sozinha.

**Architecture:** Evoluir `ViewPhotosCapture` com rascunho de fotos + tela de confirmação de lados; novo endpoint Groq Vision para classificar `ViewType` por imagem; após confirmação humana gravar em `viewPhotos` (modelo atual); rodar classificação de dano (reuso `damage-classify`) por vista e criar `Damage` com `partId` sentinela de face + `evidenceStatus: sugerido`; UI de tags com o mesmo gate Aceitar/Editar/Ignorar da Parte 1.

**Tech Stack:** TypeScript, React 19, Next.js App Router API routes, Groq Vision (`callGroqVision`), Vitest, `storePhotoEvidence`, helpers `evidenceStatus` / `viewPhotos` existentes.

**Spec:** `docs/superpowers/specs/2026-08-05-quatro-vistas-confirmacao-ia-design.md`

---

## Global Constraints

- **IA só sugere; confirmação sempre humana** — lados e avarias.
- **Ordem fixa:** lote → IA lados → humano confirma lados → IA avarias → humano Aceitar/Editar/Ignorar.
- **`viewPhotos` definitivo** só após **Confirmar lados**; sugestão sozinha **não** conta como 4/4 para PDF.
- **Duplicata de vista:** UI bloqueia confirmar se duas fotos tiverem o mesmo `ViewType`.
- **Offline / falha IA:** atribuição manual de lados na mesma tela; avarias opcionais; SVG/`DamageFloat` continua.
- **Sem `partId` de SVG nesta feature:** usar sentinela `partId: 'view-face'` e `partName` = `VIEW_NAME[view]` (não inventar peça no diagrama).
- **`damage-vision-bulk` está 410** — não reativar detecção automática antiga; criar rota nova de **classificação de lado** e reusar `damage-classify` para avaria por foto.
- **Fora de escopo:** Parte 2 comparação tipada; IA criar pin SVG; reescrever PDF emitido; `partId` real pela foto.
- **Commits:** este workspace pode não ter `.git`. Se não houver, pule commits. Se houver, commits por task.
- Indent 2 espaços, aspas simples, Vitest `describe`/`it`/`expect`.
- Copy UI em PT-BR; labels de vista via `VIEW_NAME` (`Lateral Esquerda` / `Lateral Direita` = Lado-Esquerdo/Direito do produto).

---

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/viewSideAssign.ts` | **Create.** Helpers puros: validar mapa único, aplicar confirmação rascunho→`viewPhotos`, invalidar sugestões de dano não confirmadas ao trocar vista. |
| `src/lib/__tests__/viewSideAssign.test.ts` | **Create.** Testes dos helpers. |
| `src/types.ts` | **Modify.** Campos opcionais em `VehicleInfo`: `pendingViewPhotoRefs?`, `viewSideSuggestions?`, `viewSidesConfirmedAt?`, `viewSidesConfirmedBy?`. Constante/`VIEW_FACE_PART_ID`. |
| `src/app/api/view-side-classify/route.ts` | **Create.** POST: 1–4 fotos (data URL) → `{ suggestions: { index, view: ViewType }[] }` via Groq Vision. Auth + rate limit (espelhar `damage-classify`). |
| `src/lib/server/__tests__/viewSideClassifyParse.test.ts` | **Create.** Testes de parse/normalização da resposta da IA (funções exportadas puras no route ou módulo auxiliar). |
| `src/lib/viewSideClassifyClient.ts` | **Create.** Client fetch + resolver refs locais para data URL antes do POST. |
| `src/components/PhotoAttachButtons.tsx` | **Modify (mínimo).** Prop opcional `multiple` / `onFiles?: (files: File[]) => void` para galeria multi-select (máx. 4). Câmera continua 1 a 1. |
| `src/components/app/ViewPhotosCapture.tsx` | **Modify.** Fluxo lote + estados (rascunho / sugerindo / confirmar / confirmado + tags). |
| `src/components/app/ViewSideConfirmPanel.tsx` | **Create.** Grade foto + chips de vista + Confirmar / Refazer; bloqueio de duplicata. |
| `src/components/app/ViewDamageTagPanel.tsx` | **Create.** Tag + Aceitar/Editar/Ignorar usando `evidenceStatus`. |
| `src/hooks/useInspectionWorkflow.ts` (ou pai que tem `damages`) | **Modify.** Callbacks para criar/atualizar `Damage[]` a partir das tags de vista (precisa do setter de damages — ver InspectTab). |
| `src/components/app/InspectTab.tsx` | **Modify.** Passar `damages` / `onDamagesChange` (ou equivalente) para `ViewPhotosCapture`; manter `ViewSidePhotoPrompt` como atalho. |
| `src/lib/viewPhotos.ts` | **Modify (leve).** Documentar que `hasAllViewPhotos` só olha `viewPhotos` confirmados (já é o caso); helpers de contagem de pending se útil. |
| `src/lib/server/rateLimit.test.ts` | **Modify.** Budget da nova chave `view-side-classify`. |

---

### Task 1: Helpers puros de atribuição de lados

**Files:**
- Create: `src/lib/viewSideAssign.ts`
- Test: `src/lib/__tests__/viewSideAssign.test.ts`

**Interfaces:**
- `ViewSideSuggestion = { photoRef: string; suggestedView: ViewType }`
- `hasDuplicateViews(assignments: Partial<Record<string, ViewType>> | Array<{ view: ViewType }>): boolean`
- `buildViewPhotosFromAssignments(items: { photoRef: string; view: ViewType }[]): Partial<Record<ViewType, string>>`
- `canConfirmSideAssignments(items: { photoRef: string; view: ViewType }[]): { ok: true } | { ok: false; reason: string }`
- `filterDamagesToInvalidateOnViewChange(damages: Damage[], opts: { view: ViewType; photoRef?: string }): Damage[]` — retorna ids/`Damage` com `evidenceStatus === 'sugerido'` e `partId === VIEW_FACE_PART_ID` naquela vista (para o caller remover/invalidar)

- [ ] **Step 1: Write failing tests** for duplicate detection, build map, canConfirm (0 items fail; 4 unique ok; duplicate fail).
- [ ] **Step 2: Implement helpers** + export `VIEW_FACE_PART_ID = 'view-face'`.
- [ ] **Step 3: Run** `npx vitest run src/lib/__tests__/viewSideAssign.test.ts` — expect PASS.
- [ ] **Step 4: Commit** (se git) `test: helpers atribuição de vistas em lote`.

---

### Task 2: Tipos em `VehicleInfo`

**Files:**
- Modify: `src/types.ts`

```ts
// Em VehicleInfo (opcionais):
pendingViewPhotoRefs?: string[]
viewSideSuggestions?: { photoRef: string; suggestedView: ViewType; confidence?: number }[]
viewSidesConfirmedAt?: string
viewSidesConfirmedBy?: string
```

- [ ] **Step 1: Add fields** — não quebrar `EMPTY_INFO` (campos opcionais).
- [ ] **Step 2: Re-export ou importar `VIEW_FACE_PART_ID`** de `viewSideAssign` onde Damage for criado (não precisa no type Damage).
- [ ] **Step 3: Commit** `feat(types): rascunho e sugestão de lados nas 4 vistas`.

---

### Task 3: API `POST /api/view-side-classify`

**Files:**
- Create: `src/app/api/view-side-classify/route.ts`
- Create: `src/lib/server/viewSideClassify.ts` (prompt + `parseViewSideResponse` puro)
- Test: `src/lib/server/__tests__/viewSideClassifyParse.test.ts`
- Modify: `src/lib/server/rateLimit.test.ts` (budget ~15 req/10min user, alinhado a vision)

**Contrato request:**
```ts
{ photos: string[] } // 1..4 data URLs image/*
```

**Contrato response 200:**
```ts
{
  suggestions: Array<{ index: number; view: 'frontal' | 'traseira' | 'lateral-left' | 'lateral-right' }>
}
```

**Regras:**
- Auth assinante = espelho de `damage-classify` (401/403/429).
- Prompt: classificar **apenas** a face do veículo; JSON estrito; um `view` por índice; preferir atribuições distintas quando houver 4 fotos.
- Parse defensivo: sinônimos PT (`frente`→`frontal`, `esquerda`→`lateral-left`, etc.); rejeitar view inválida.
- Se o modelo repetir vistas, o **cliente** ainda valida; API pode tentar post-process greedy unique (opcional Task 3b). Preferência: API devolve o que o modelo disse; UI força edição humana.

- [ ] **Step 1: Testes de parse** (PT → ViewType, JSON sujo, view inválida).
- [ ] **Step 2: Implementar** `viewSideClassify.ts` + route.
- [ ] **Step 3: Manual smoke** (curl ou script) com 1 imagem fake se chave disponível; senão confiar nos testes de parse.
- [ ] **Step 4: Commit** `feat(api): classificar lado do veículo por foto (IA)`.

---

### Task 4: Client de classificação de lados

**Files:**
- Create: `src/lib/viewSideClassifyClient.ts`

- [ ] **Step 1: Implement** `classifyViewSides(photoRefs: string[], accessToken?: string | null): Promise<ViewSideSuggestion[]>`
  - Resolver cada ref → data URL (reusar helpers já usados por DamageFloat / photoStore).
  - POST `/api/view-side-classify` com Bearer se houver token.
  - Mapear `index` → `photoRef` na ordem enviada.
- [ ] **Step 2: Tratar erros** 401/403/429/5xx → throw com mensagem PT-BR curta para toast.
- [ ] **Step 3: Commit** `feat(client): chamar view-side-classify`.

---

### Task 5: PhotoAttachButtons multi-galeria

**Files:**
- Modify: `src/components/PhotoAttachButtons.tsx`

- [ ] **Step 1: Add** props opcionais `multiple?: boolean`, `maxFiles?: number` (default 4), `onFiles?: (files: File[]) => void`.
- [ ] **Step 2: Galeria** com `multiple` quando `multiple === true`; câmera permanece single `onFile`.
- [ ] **Step 3: Se só `onFile` (legado), comportamento idêntico ao atual.
- [ ] **Step 4: Commit** `feat(ui): galeria multi-arquivo para 4 vistas`.

---

### Task 6: Painel Confirmar lados (UI)

**Files:**
- Create: `src/components/app/ViewSideConfirmPanel.tsx`

**UI:**
- Lista/grade: `ResolvedPhoto` + chips das 4 vistas (`VIEW_NAME`).
- Chip “Sugestão da IA” se veio de `viewSideSuggestions`.
- `canConfirmSideAssignments` → desabilita **Confirmar lados** se duplicata ou vazio.
- Botões: **Confirmar lados** · **Refazer fotos**.

Props sugeridas:
```ts
{
  items: { photoRef: string; view: ViewType }[]
  onChangeView: (photoRef: string, view: ViewType) => void
  onConfirm: () => void
  onRedo: () => void
  confirming?: boolean
}
```

- [ ] **Step 1: Implementar** painel puro controlado.
- [ ] **Step 2: Commit** `feat(ui): painel confirmar lados das 4 vistas`.

---

### Task 7: Evoluir `ViewPhotosCapture` — lote + confirmação

**Files:**
- Modify: `src/components/app/ViewPhotosCapture.tsx`
- Use: `ViewSideConfirmPanel`, `viewSideClassifyClient`, `storePhotoEvidence`, `viewSideAssign`

**Estados de UI:**
1. `batch` — rascunho `pendingViewPhotoRefs` (0–4), CTA **Identificar lados com IA**
2. `classifying` — loading
3. `confirm` — `ViewSideConfirmPanel` (com ou sem sugestões se IA falhou → views vazias/editáveis)
4. `done` — grade atual com `viewPhotos` + tags (Task 8)

**Fluxo:**
- Adicionar foto(s) → `storePhotoEvidence` → push em `pendingViewPhotoRefs` via `onChange(info)`.
- Remover do rascunho → `deletePhotoRef`.
- CTA IA → `classifyViewSides` → gravar `viewSideSuggestions` + pré-preencher assignments locais.
- Se IA falhar → ir para `confirm` com assignments vazios / ordem `VIEW_PHOTO_ORDER` só como placeholder **não** escrito em `viewPhotos` até confirmar (melhor: exigir escolha humana explícita; pré-selecionar pela ordem do lote **somente** se produto aceitar fallback — **preferência do spec:** manual sem sugestão, chips sem valor até o usuário escolher **ou** pré-preencher ordem do lote como palpite não-IA. **Decisão de plano:** pré-preencher na ordem `VIEW_PHOTO_ORDER` **sem** chip “Sugestão da IA” quando fallback, para não travar o pátio; usuário ainda edita/confirma).
- **Confirmar lados** → `buildViewPhotosFromAssignments` → `viewPhotos` + `viewSidesConfirmedAt/By` + limpar pending/suggestions.
- Manter caminho legado: se já existem `viewPhotos` completos e sem pending, mostrar grade `done` (compatível com vistorias antigas / prompt do diagrama).

- [ ] **Step 1: Wire batch + classify + confirm** sem tags de dano ainda.
- [ ] **Step 2: Garantir** `hasAllViewPhotos` só true após confirm (não durante pending).
- [ ] **Step 3: Smoke manual mental checklist** (4 fotos → IA → editar duplicata → confirmar).
- [ ] **Step 4: Commit** `feat(app): captura em lote e confirmação IA dos 4 lados`.

---

### Task 8: Tags de avaria por vista + gate humano

**Files:**
- Create: `src/components/app/ViewDamageTagPanel.tsx`
- Modify: `ViewPhotosCapture.tsx`
- Modify: `InspectTab.tsx` (passar `damages`, `setDamages` / `onDamagesChange`, `accessToken`, nome do usuário para `evidenceDecidedBy`)

**Após confirmar lados:**
- Auto-disparar análise **uma vez** por confirmação (flag local / `viewSidesConfirmedAt`): para cada vista com foto, chamar `damage-classify` (ou `/api/damage-vision`) com `partName: VIEW_NAME[view]`.
- Se a API indicar dano aparente (tipo/descrição): criar `Damage`:
  ```ts
  {
    id: newId,
    vehicle,
    view,
    partId: VIEW_FACE_PART_ID,
    partName: VIEW_NAME[view],
    type, typeName, severity, notes: description,
    photos: [viewPhotos[view]],
    photoNotes: [],
    evidenceStatus: 'sugerido',
  }
  ```
- Se “sem dano aparente” (prompt deve permitir `none` / descrição vazia): **não** criar Damage.
- **Estender `damage-classify`?** Preferência: novo campo opcional no prompt `allowNone: true` **ou** rota thin wrapper `view-damage-suggest`. **Decisão de plano:** estender `damage-classify` com body opcional `allowNoDamage?: boolean`; quando true, JSON pode retornar `{ type: null, noDamage: true }` e o client não cria Damage. Manter compatibilidade: sem a flag, comportamento atual.

**UI tag:**
- Amarela: `formatEvidenceStatusLabel('sugerido')` + resumo curto.
- Verde: confirmado.
- Painel: Aceitar / Editar / Ignorar → atualizar `evidenceStatus` + `evidenceDecidedBy` + `evidenceDecidedAt` (mesma regra Parte 1).
- Ignorar → `ignorado` (PDF já filtra via `filterDamagesForPdf`).

**Falha IA avaria:** toast; lados permanecem; sem tags.

- [ ] **Step 1: Extender** `damage-classify` para `allowNoDamage` + testes de parse se houver helper.
- [ ] **Step 2: `ViewDamageTagPanel`** + wire em capture `done`.
- [ ] **Step 3: InspectTab** plumb damages.
- [ ] **Step 4: Commit** `feat(app): tags de avaria IA nas 4 vistas com confirmação humana`.

---

### Task 9: Invalidação ao trocar/substituir foto

**Files:**
- Modify: `ViewPhotosCapture.tsx` + helpers Task 1

- [ ] **Step 1: Ao substituir foto de uma vista confirmada**, limpar só essa chave de `viewPhotos`, voltar item ao pending **ou** exigir reconfirm daquela face; invalidar `Damage` sugeridos com `VIEW_FACE_PART_ID` naquela view.
- [ ] **Step 2: Não** reprocessar as outras vistas automaticamente.
- [ ] **Step 3: Commit** `fix(app): invalidar sugestões ao trocar foto de vista`.

---

### Task 10: Testes de regressão + aceite

**Files:**
- Existing: `src/lib/__tests__/evidenceStatus.test.ts` (não quebrar)
- Existing: `viewPhotos` tests se existirem
- Manual checklist no PR/notas

- [ ] **Step 1: Run** `npx vitest run` nos testes tocados + suite relevante.
- [ ] **Step 2: Checklist manual** (mobile se possível):
  1. 4 fotos sem escolher lado
  2. IA sugere lados
  3. Editar um lado / bloquear duplicata
  4. Confirmar → `4/4` no contador
  5. Tags amarelas → Aceitar/Ignorar
  6. Offline/simular 500 na classify de lado → confirmação manual
  7. PDF ainda exige 4 vistas; `ignorado` fora da tabela
- [ ] **Step 3: Commit** `test: cobertura quatro vistas + IA` (se houver novos testes).

---

## Ordem de execução sugerida

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

Tasks 5 e 6 podem paralelizar após 4.

---

## Self-review do plano

- [x] Spec coberta: lote, IA lados, confirm/edit, depois IA avarias + tags, gate humano.
- [x] `ViewType` / `VIEW_NAME` / `viewPhotos` consistentes.
- [x] `damage-vision-bulk` 410 respeitado (rota nova + classify).
- [x] Offline/falha e duplicatas tratados.
- [x] `partId` sentinela documentado (sem pin SVG).
- [x] Tasks pequenas com arquivos e steps checkbox.
- [x] Sem implementação neste passo — só plano.
- [x] Extensão `allowNoDamage` explícita para não forçar dano fantasma.

---

## Próximo passo (humano)

Aprovar este plano e pedir **“pode implementar”** (ou equivalente). Não começar código até essa confirmação.
