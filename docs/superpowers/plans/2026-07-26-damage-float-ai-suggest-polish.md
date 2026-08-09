# DamageFloat AI Suggest Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make DamageFloat's photo→IA path an explicit confirm flow — show a full Sugestão IA panel with Aceitar / Editar / Ignorar, and stop silently applying severity/notes on classify success.

**Architecture:** Extract pure helpers (`applySuggestion`, `ignoreSuggestion`, `deriveSuggestionUi`) into a sibling module next to `DamageFloat.tsx`, unit-test them with Vitest (no React mount). Rewire `DamageFloat` so classify success only sets `aiState: done`; the panel drives Aceitar (apply type+severity+notes if !notesTouched), Editar (prefill + `editedManually` label), and Ignorar (`aiState → idle`, keep photo). SVG draft severity is explicitly skipped (non-trivial wiring through VehicleViewer).

**Tech Stack:** React 19 client component (`DamageFloat.tsx`), TypeScript, existing `AiClassifyState` + `POST /api/damage-classify`, Vitest (`npm test` / `npx vitest run`) for pure-helper unit tests. No `@testing-library/react` in package.json — do not add it for this polish.

## Global Constraints

- **Never change `partId` / peça selecionada** — IA must not touch the SVG selection; only type, severity, and notes inside the float.
- **Honest copy only:** chip text exactly `Sugestão — revise antes de confirmar`. No invented confidence metrics (e.g. “IA 99% precisa”).
- **Do not touch** `DamageSuggestionsReview`, `damage-vision` / lote, or any new API / model.
- **No new schema** — Aceitar/Editar/Ignorar are UI state on the float only; reuse existing `AiClassifyState` and `classifyWithAi`.
- **YAGNI:** skip SVG draft severity (`damage-low|medium|high` preview) — wiring through `VehicleViewer` / `usePartProps` is non-trivial; marked optional and **skipped** in this plan.
- Keep step 1 (pick type) / step 2 (details + photo) flow; photo may still attach on step 2 as today.
- Follow repo style: 2-space indent, single quotes, Vitest `describe`/`it`/`expect` like `src/components/DamageCallouts.test.ts`.

---

## File map

| File | Responsibility |
|------|----------------|
| `src/components/damageFloatAiSuggest.ts` | **Create.** Pure helpers: types for suggestion payload + form snapshot; `applySuggestion`, `ignoreSuggestion`, `deriveSuggestionUi`. |
| `src/components/damageFloatAiSuggest.test.ts` | **Create.** Vitest unit tests for the helpers (TDD). |
| `src/components/DamageFloat.tsx` | **Modify.** Stop auto `setSeverity` / `setNotes` on classify success; replace “IA sugere” / “Usar” banners with full panel; wire Aceitar / Editar / Ignorar; PT-BR loading/error/auth copy. |
| `src/components/VehicleViewer.tsx` | **Do not modify** (draft severity skipped). |
| `DamageSuggestionsReview` / damage-vision | **Do not touch.** |

### Current code facts (as of plan write)

`DamageFloat.tsx` today:

- `AiClassifyState`: `idle` \| `loading` \| `done{type,severity,description}` \| `error` \| `auth-required`
- On classify success: **auto** `setSeverity(data.severity)` and `setNotes(description)` if `!notesTouched`
- UI: loading/error/auth banners; “IA sugere” + Usar only when `aiState.type !== chosenType.type`; weaker message when types match
- `applyAiType()` only sets `chosenType` from AI
- No unit tests for DamageFloat yet; project has Vitest (`"test": "vitest run"`)

---

### Task 1: Pure helpers + TDD (`applySuggestion` / `ignoreSuggestion` / `deriveSuggestionUi`)

**Files:**
- Create: `src/components/damageFloatAiSuggest.ts`
- Test: `src/components/damageFloatAiSuggest.test.ts`

**Interfaces:**
- Consumes: `DamageType`, `Severity` from `../types`
- Produces:
  - `AiSuggestion = { type: DamageType; severity: Severity; description: string }`
  - `FloatFormSnapshot = { chosenType: DamageType \| null; severity: Severity; notes: string; notesTouched: boolean }`
  - `SuggestionUiMode = 'hidden' \| 'loading' \| 'error' \| 'auth-required' \| 'panel' \| 'edited-manually'`
  - `deriveSuggestionUi(aiStatus, opts): { mode: SuggestionUiMode; chip: string \| null; showActions: boolean }`
  - `applySuggestion(suggestion, form): FloatFormSnapshot` — always applies type+severity; applies description to notes only if `!notesTouched`
  - `ignoreSuggestion(): { aiStatus: 'idle' }` — discard suggestion; caller keeps photo/form as-is

- [ ] **Step 1: Write the failing tests**

Create `src/components/damageFloatAiSuggest.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  applySuggestion,
  ignoreSuggestion,
  deriveSuggestionUi,
  type AiSuggestion,
  type FloatFormSnapshot,
} from './damageFloatAiSuggest'

const suggestion: AiSuggestion = {
  type: 'dent',
  severity: 'medium',
  description: 'Amassado na porta',
}

describe('applySuggestion', () => {
  it('applies type, severity, and description when notes not touched', () => {
    const form: FloatFormSnapshot = {
      chosenType: 'scratch',
      severity: 'low',
      notes: '',
      notesTouched: false,
    }
    expect(applySuggestion(suggestion, form)).toEqual({
      chosenType: 'dent',
      severity: 'medium',
      notes: 'Amassado na porta',
      notesTouched: false,
    })
  })

  it('applies type and severity but keeps notes when notesTouched', () => {
    const form: FloatFormSnapshot = {
      chosenType: 'scratch',
      severity: 'low',
      notes: 'nota do vistoriador',
      notesTouched: true,
    }
    expect(applySuggestion(suggestion, form)).toEqual({
      chosenType: 'dent',
      severity: 'medium',
      notes: 'nota do vistoriador',
      notesTouched: true,
    })
  })
})

describe('ignoreSuggestion', () => {
  it('returns idle ai status (photo/form unchanged by caller)', () => {
    expect(ignoreSuggestion()).toEqual({ aiStatus: 'idle' })
  })
})

describe('deriveSuggestionUi', () => {
  it('shows loading mode while classifying', () => {
    expect(deriveSuggestionUi('loading', { editedManually: false })).toEqual({
      mode: 'loading',
      chip: null,
      showActions: false,
    })
  })

  it('shows error and auth-required without actions', () => {
    expect(deriveSuggestionUi('error', { editedManually: false }).mode).toBe('error')
    expect(deriveSuggestionUi('auth-required', { editedManually: false }).mode).toBe('auth-required')
  })

  it('shows panel with honest chip when done and not edited manually', () => {
    expect(deriveSuggestionUi('done', { editedManually: false })).toEqual({
      mode: 'panel',
      chip: 'Sugestão — revise antes de confirmar',
      showActions: true,
    })
  })

  it('shows edited-manually mode after Editar (no Aceitar/Ignorar needed)', () => {
    expect(deriveSuggestionUi('done', { editedManually: true })).toEqual({
      mode: 'edited-manually',
      chip: 'ajustado manualmente',
      showActions: false,
    })
  })

  it('hides suggestion UI when idle', () => {
    expect(deriveSuggestionUi('idle', { editedManually: false }).mode).toBe('hidden')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/damageFloatAiSuggest.test.ts`

Expected: FAIL — module `./damageFloatAiSuggest` not found (or exports missing).

- [ ] **Step 3: Implement minimal helpers**

Create `src/components/damageFloatAiSuggest.ts`:

```ts
import type { DamageType, Severity } from '../types'

export type AiSuggestion = {
  type: DamageType
  severity: Severity
  description: string
}

export type FloatFormSnapshot = {
  chosenType: DamageType | null
  severity: Severity
  notes: string
  notesTouched: boolean
}

export type SuggestionUiMode =
  | 'hidden'
  | 'loading'
  | 'error'
  | 'auth-required'
  | 'panel'
  | 'edited-manually'

export type DeriveSuggestionUiResult = {
  mode: SuggestionUiMode
  chip: string | null
  showActions: boolean
}

type AiStatus = 'idle' | 'loading' | 'done' | 'error' | 'auth-required'

export function applySuggestion(
  suggestion: AiSuggestion,
  form: FloatFormSnapshot,
): FloatFormSnapshot {
  return {
    chosenType: suggestion.type,
    severity: suggestion.severity,
    notes: form.notesTouched ? form.notes : suggestion.description,
    notesTouched: form.notesTouched,
  }
}

export function ignoreSuggestion(): { aiStatus: 'idle' } {
  return { aiStatus: 'idle' }
}

export function deriveSuggestionUi(
  aiStatus: AiStatus,
  opts: { editedManually: boolean },
): DeriveSuggestionUiResult {
  if (aiStatus === 'loading') {
    return { mode: 'loading', chip: null, showActions: false }
  }
  if (aiStatus === 'error') {
    return { mode: 'error', chip: null, showActions: false }
  }
  if (aiStatus === 'auth-required') {
    return { mode: 'auth-required', chip: null, showActions: false }
  }
  if (aiStatus === 'done') {
    if (opts.editedManually) {
      return {
        mode: 'edited-manually',
        chip: 'ajustado manualmente',
        showActions: false,
      }
    }
    return {
      mode: 'panel',
      chip: 'Sugestão — revise antes de confirmar',
      showActions: true,
    }
  }
  return { mode: 'hidden', chip: null, showActions: false }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/damageFloatAiSuggest.test.ts`

Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add src/components/damageFloatAiSuggest.ts src/components/damageFloatAiSuggest.test.ts
git commit -m "$(cat <<'EOF'
feat(DamageFloat): extract AI suggest pure helpers

EOF
)"
```

---

### Task 2: Stop auto-apply on classify; show full Sugestão IA panel

**Files:**
- Modify: `src/components/DamageFloat.tsx` (classify success ~lines 103–106; AI UI block ~lines 342–379)

**Interfaces:**
- Consumes: `deriveSuggestionUi` from `./damageFloatAiSuggest`
- Produces: classify success only updates `aiState` to `done` (no `setSeverity` / `setNotes`); when `mode === 'panel'`, render chip + type/severity/description + placeholder action buttons (wired in Task 3)

- [ ] **Step 1: Remove auto-apply in `classifyWithAi`**

In `classifyWithAi`, replace the success branch so it **only** sets AI state:

```ts
      const data = await res.json() as { type: DamageType; severity: Severity; description: string }
      setAiState({ status: 'done', type: data.type, severity: data.severity, description: data.description })
      // do NOT setSeverity / setNotes here — Aceitar applies via applySuggestion
```

Delete the two lines:

```ts
      setSeverity(data.severity)
      if (!notesTouched) setNotes(data.description)
```

- [ ] **Step 2: Add `editedManually` state and derive UI**

Near other `useState` hooks:

```ts
  const [editedManually, setEditedManually] = useState(false)
```

After `aiState` is available, derive:

```ts
  const suggestionUi = deriveSuggestionUi(aiState.status, { editedManually })
```

Import:

```ts
import { deriveSuggestionUi } from './damageFloatAiSuggest'
```

Reset `editedManually` when a new classify starts (`setAiState({ status: 'loading' })`):

```ts
    setAiState({ status: 'loading' })
    setEditedManually(false)
```

- [ ] **Step 3: Replace old “IA sugere” / “Usar” / match banners with panel UI**

Remove the blocks that render when `aiState.status === 'done' && chosenType && aiState.type !== chosenType.type` (Usar) and the weaker “Severidade e descrição preenchidas pela IA” message.

Replace the AI status UI region (loading / error / auth / done) with:

```tsx
            {suggestionUi.mode === 'loading' && (
              <div className="mt-2 flex items-center gap-1.5 text-[0.7rem] font-bold text-sky-400">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-sky-400/40 border-t-sky-400 animate-spin" />
                Analisando foto…
              </div>
            )}

            {suggestionUi.mode === 'error' && (
              <div className="mt-2 text-[0.7rem] font-bold text-[var(--text-muted)]">
                Não foi possível analisar a foto. Preencha tipo e gravidade manualmente.
              </div>
            )}

            {suggestionUi.mode === 'auth-required' && (
              <div className="mt-2 text-[0.7rem] font-bold text-amber-500">
                Classificação por IA requer plano pago —{' '}
                <a href="/planos" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  ver planos
                </a>
                . Continue manualmente.
              </div>
            )}

            {suggestionUi.mode === 'edited-manually' && suggestionUi.chip && (
              <div className="mt-2 text-[0.68rem] font-bold text-[var(--text-muted)]">
                {suggestionUi.chip}
              </div>
            )}

            {suggestionUi.mode === 'panel' && aiState.status === 'done' && (
              <div className="mt-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-2 space-y-2">
                <div className="text-[0.65rem] font-black uppercase tracking-wide text-sky-400">
                  {suggestionUi.chip}
                </div>
                <div className="text-[0.72rem] font-bold text-[var(--text-main)]">
                  {TYPES.find(t => t.type === aiState.type)?.label}
                  {' · '}
                  {SEV.find(s => s.value === aiState.severity)?.label}
                </div>
                {aiState.description ? (
                  <p className="text-[0.68rem] text-[var(--text-muted)] line-clamp-2">
                    {aiState.description}
                  </p>
                ) : null}
                {suggestionUi.showActions && (
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    <button type="button" className="min-h-11 sm:min-h-9 px-3 rounded-lg bg-sky-500/20 border border-sky-500/40 text-[0.68rem] font-black uppercase text-sky-400 cursor-pointer">
                      Aceitar
                    </button>
                    <button type="button" className="min-h-11 sm:min-h-9 px-3 rounded-lg border border-[var(--border)] text-[0.68rem] font-bold text-[var(--text-main)] cursor-pointer">
                      Editar
                    </button>
                    <button type="button" className="min-h-11 sm:min-h-9 px-3 rounded-lg border border-transparent text-[0.68rem] font-bold text-[var(--text-muted)] underline underline-offset-2 cursor-pointer">
                      Ignorar sugestão
                    </button>
                  </div>
                )}
              </div>
            )}
```

Also delete `applyAiType` if it is unused after this change (Task 3 replaces it with `handleAcceptSuggestion`).

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`

Expected: no errors in `DamageFloat.tsx` / `damageFloatAiSuggest.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/components/DamageFloat.tsx
git commit -m "$(cat <<'EOF'
feat(DamageFloat): show AI suggestion panel without auto-apply

EOF
)"
```

---

### Task 3: Wire Aceitar / Editar / Ignorar behaviors

**Files:**
- Modify: `src/components/DamageFloat.tsx`

**Interfaces:**
- Consumes: `applySuggestion`, `ignoreSuggestion` from `./damageFloatAiSuggest`
- Produces: handlers that mutate float state; Aceitar may leave `aiState` as `done` or clear to idle after apply — prefer clear to idle after Aceitar so the panel dismisses and fields stay filled; Editar prefills then sets `editedManually`; Ignorar resets AI only

- [ ] **Step 1: Import helpers and add handlers**

```ts
import {
  applySuggestion,
  ignoreSuggestion,
  deriveSuggestionUi,
} from './damageFloatAiSuggest'
```

Add handlers (replace any leftover `applyAiType`):

```ts
  function handleAcceptSuggestion() {
    if (aiState.status !== 'done') return
    const next = applySuggestion(
      {
        type: aiState.type,
        severity: aiState.severity,
        description: aiState.description,
      },
      {
        chosenType: chosenType?.type ?? null,
        severity,
        notes,
        notesTouched,
      },
    )
    const match = TYPES.find(t => t.type === next.chosenType)
    if (match) setChosenType({ type: match.type, label: match.label })
    setSeverity(next.severity)
    setNotes(next.notes)
    setAiState({ status: 'idle' })
    setEditedManually(false)
  }

  function handleEditSuggestion() {
    if (aiState.status !== 'done') return
    const next = applySuggestion(
      {
        type: aiState.type,
        severity: aiState.severity,
        description: aiState.description,
      },
      {
        chosenType: chosenType?.type ?? null,
        severity,
        notes,
        notesTouched,
      },
    )
    const match = TYPES.find(t => t.type === next.chosenType)
    if (match) setChosenType({ type: match.type, label: match.label })
    setSeverity(next.severity)
    setNotes(next.notes)
    setEditedManually(true)
    // keep aiState.done so deriveSuggestionUi can show "ajustado manualmente"
  }

  function handleIgnoreSuggestion() {
    const { aiStatus } = ignoreSuggestion()
    setAiState({ status: aiStatus })
    setEditedManually(false)
    // photoFile / photoPreview / chosenType / severity / notes unchanged
  }
```

- [ ] **Step 2: Wire `onClick` on the three buttons**

```tsx
                    <button
                      type="button"
                      onClick={handleAcceptSuggestion}
                      className="min-h-11 sm:min-h-9 px-3 rounded-lg bg-sky-500/20 border border-sky-500/40 text-[0.68rem] font-black uppercase text-sky-400 cursor-pointer"
                    >
                      Aceitar
                    </button>
                    <button
                      type="button"
                      onClick={handleEditSuggestion}
                      className="min-h-11 sm:min-h-9 px-3 rounded-lg border border-[var(--border)] text-[0.68rem] font-bold text-[var(--text-main)] cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={handleIgnoreSuggestion}
                      className="min-h-11 sm:min-h-9 px-3 rounded-lg border border-transparent text-[0.68rem] font-bold text-[var(--text-muted)] underline underline-offset-2 cursor-pointer"
                    >
                      Ignorar sugestão
                    </button>
```

- [ ] **Step 3: Re-run helper tests + typecheck**

Run:

```bash
npx vitest run src/components/damageFloatAiSuggest.test.ts
npx tsc --noEmit
```

Expected: all helper tests PASS; no TS errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/DamageFloat.tsx
git commit -m "$(cat <<'EOF'
feat(DamageFloat): wire Aceitar, Editar, Ignorar for AI suggest

EOF
)"
```

---

### Task 4: Manual QA checklist (+ optional SVG draft — **SKIP**)

**Files:**
- None for product code (verification only)
- Optional draft severity: **SKIP** — would need new prop plumbing through `VehicleViewer` / `usePartProps` for `damage-low|medium|high` while suggestion is active; non-trivial and marked optional in the spec. Do not implement.

- [ ] **Step 1: Manual QA in the app**

With `npm run dev`, open the vistoria app, select a part, go to step 2, attach a photo (or mock classify if needed):

| # | Check | Pass? |
|---|--------|-------|
| 1 | Loading shows **Analisando foto…**; tipo/gravidade not confirmed by IA yet | |
| 2 | On success: panel with chip **Sugestão — revise antes de confirmar**, tipo + Leve/Média/Grave + descrição | |
| 3 | **Aceitar** — tipo, gravidade, and notes (if notes untouched) match IA; panel dismisses; Confirmar still works | |
| 4 | **Ignorar sugestão** — panel gone; photo remains; user can set type/severity manually | |
| 5 | **Editar** — fields prefilled; label **ajustado manualmente**; user can change before Confirmar | |
| 6 | API error / timeout — clear PT-BR message; manual flow works; no wrong damage saved | |
| 7 | auth-required — message + link to planos; manual flow works | |
| 8 | Peça / `partId` never changes because of IA | |
| 9 | Touch targets usable on mobile (`min-h-11` on action buttons) | |
| 10 | No fake confidence metrics in UI copy | |

- [ ] **Step 2: Confirm out-of-scope files untouched**

```bash
git diff --name-only
```

Expected: only `DamageFloat.tsx`, `damageFloatAiSuggest.ts`, `damageFloatAiSuggest.test.ts` (and this plan if already committed). No `VehicleViewer`, no `DamageSuggestionsReview`, no damage-vision routes.

- [ ] **Step 3: No commit required** unless QA found a bug fix — then fix and commit with a focused message (e.g. `fix(DamageFloat): …`).

---

### Task 5: Final verification commit note

- [ ] **Step 1: Run full targeted checks**

```bash
npx vitest run src/components/damageFloatAiSuggest.test.ts
npx tsc --noEmit
```

Expected: PASS / clean.

- [ ] **Step 2: If there are any leftover uncommitted polish fixes, commit once**

```bash
git add src/components/DamageFloat.tsx src/components/damageFloatAiSuggest.ts src/components/damageFloatAiSuggest.test.ts
git commit -m "$(cat <<'EOF'
chore(DamageFloat): finalize AI suggest polish

EOF
)"
```

If working tree is clean after Tasks 1–3, skip this commit.

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Loading “Analisando foto…” without IA confirming yet | Task 2 copy + Task 4 QA #1 |
| Panel: tipo + gravidade + descrição + Aceitar/Editar/Ignorar | Tasks 2–3 |
| Chip “Sugestão — revise antes de confirmar” | Task 1 `deriveSuggestionUi` + Task 2 UI |
| Aceitar applies type+severity+notes if !notesTouched | Tasks 1 + 3 |
| Editar prefills + “ajustado manualmente” | Tasks 1 + 3 |
| Ignorar → idle, keep photo | Tasks 1 + 3 |
| Error/auth clear PT-BR + manual flow | Task 2 |
| Never change partId | Global Constraints + QA #8 |
| No DamageSuggestionsReview / damage-vision / new API | Global Constraints + Task 4 Step 2 |
| No fake metrics | Global Constraints + QA #10 |
| Draft SVG severity optional | Task 4 **SKIP** (non-trivial) |
| Minimal test Aceitar/Ignorar/erro | Task 1 unit + Task 4 manual |

No placeholders. Types/signatures consistent across tasks (`AiSuggestion`, `FloatFormSnapshot`, `deriveSuggestionUi`, `applySuggestion`, `ignoreSuggestion`).
