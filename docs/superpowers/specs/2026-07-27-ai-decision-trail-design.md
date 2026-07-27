# AI Decision Trail — immutable original + human decision (FASE 5)

## Goal

Persist every damage-classification AI suggestion with an **immutable original
payload**, then record the human decision (Aceitar / Editar / Ignorar) and the
**final** values used in the inspection — without ever overwriting what the
model returned.

Product rule preserved: **HUMAN picks the part**; AI assists classification
only. The trail never stores an autonomous part choice.

This phase does **not** claim legal validity, notarization, or court
admissibility.

## Example

| Stage | Severity |
|-------|----------|
| AI original | Grave (`high`) |
| Human decision | Editar → Médio (`medium`) |
| Final | Médio (`medium`) |

`original_payload` / suggested_* columns stay Grave forever.

## Table `ai_decisions`

| Column | Notes |
|--------|-------|
| `id` | uuid PK |
| `user_id` | owner (RLS) |
| `inspection_id` / `damage_id` | optional links |
| `part_name` | piece already chosen by human (context only) |
| `model` / `model_version` | e.g. Groq vision model id |
| `analyzed_at` | AI timestamp |
| `suggested_type` / `suggested_severity` / `suggested_description` | denormalized for query |
| `confidence` | nullable (Groq path may omit) |
| `original_payload` | jsonb — **frozen**; never updated |
| `human_decision` | `accept` \| `edit` \| `ignore` \| null until decided |
| `human_type` / `human_severity` / `human_description` | what the human chose (null on ignore) |
| `final_type` / `final_severity` / `final_description` | effective result (null on ignore) |
| `decided_by` / `decided_at` | who confirmed/corrected |

## Lifecycle

1. **Classify done** → `INSERT` row with model metadata + original suggestion;
   `human_*` / `final_*` null.
2. **Aceitar / Editar / Ignorar** → `UPDATE` **only** human/final/decided_*
   columns (trigger blocks changes to `original_payload` and suggested_*).
3. Optional: on Confirmar after Editar, refresh `final_*` to match the form.

## RLS

- Authenticated: INSERT / SELECT / UPDATE own (`auth.uid() = user_id`).
- Manager SELECT when `is_team_manager_of` exists (same pattern as FASE 3/4).
- No DELETE via client (retention).

## Code

- `src/lib/aiDecisions.ts` — pure `applyHumanDecision` + `appendAiDecision` /
  `recordHumanDecision`
- Migration `20260727050000_ai_decisions.sql`
- `DamageFloat` wires Aceitar / Editar / Ignorar to the trail
- Audit: existing `ai_analysis` / `human_decision` events; metadata may include
  `ai_decision_id`

## Deferred

- Confidence from model when provider exposes it
- Offline queue for trail rows
- Linking `damage_id` after Confirmar when id is minted later
- UI Timeline (FASE 10) rendering of AI vs human
- Reactivating `DamageSuggestionsReview` / batch vision
