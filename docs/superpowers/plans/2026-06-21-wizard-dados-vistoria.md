# Wizard de Dados da Vistoria — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar `VehicleInfoForm` em wizard de 3 passos (Veículo → Cliente → Finalizar) para facilitar digitação no celular, sem alterar `VehicleInfo`, PDF ou sync.

**Architecture:** Novo `WizardStepper` + estado `wizardStep` em `VehicleInfoForm`. O bloco da placa permanece só no passo 1. Campos existentes são movidos para painéis condicionais (`wizardStep === 1|2|3`). Rodapé sticky com Voltar/Continuar. Reset do passo via prop `resetToken` incrementada em `handleClearAll`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS (classes existentes `inputClasses`, `labelClasses`, glass-card).

## Global Constraints

- Não alterar tipo `VehicleInfo` nem contratos de PDF/sync.
- Nenhum campo obrigatório para avançar entre passos.
- Manter ⚙️ filtro de campos visíveis; campos ocultos não renderizam no passo.
- Remover ↑/↓ de reordenar seções da UI principal (ordem fixa no wizard).
- Transição entre passos ~200ms; respeitar `prefers-reduced-motion`.
- Passo 1: apenas **Continuar**; passos 2–3: **Voltar** + ação principal.
- “Concluir dados” no passo 3: toast + minimizar card se `onToggleCollapse` existir.
- Spec: `docs/superpowers/specs/2026-06-21-wizard-dados-vistoria-design.md`

---

## File Structure

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/components/WizardStepper.tsx` | Barra 1–2–3, estados ativo/concluído/futuro |
| `src/components/VehicleInfoForm.tsx` | Wizard state, painéis por passo, nav sticky |
| `src/app/app/page.tsx` | `resetToken` em `handleClearAll`, passar para form |

---

### Task 1: Componente `WizardStepper`

**Files:**
- Create: `src/components/WizardStepper.tsx`

**Interfaces:**
- Produces:
  ```ts
  export type WizardStep = 1 | 2 | 3
  export const WIZARD_STEPS: { step: WizardStep; label: string }[]
  interface WizardStepperProps {
    current: WizardStep
    maxVisited: WizardStep
    onStepClick: (step: WizardStep) => void
  }
  ```

- [ ] **Step 1: Criar `WizardStepper.tsx`**

```tsx
'use client';
import type { WizardStep } from './wizardTypes'

export const WIZARD_STEPS = [
  { step: 1 as WizardStep, label: 'Veículo' },
  { step: 2 as WizardStep, label: 'Cliente' },
  { step: 3 as WizardStep, label: 'Finalizar' },
] as const

interface Props {
  current: WizardStep
  maxVisited: WizardStep
  onStepClick: (step: WizardStep) => void
}

export default function WizardStepper({ current, maxVisited, onStepClick }: Props) {
  return (
    <nav aria-label="Progresso do formulário" className="flex items-center justify-between gap-1 mb-4">
      {WIZARD_STEPS.map(({ step, label }, i) => {
        const done = step < current
        const active = step === current
        const clickable = step <= maxVisited
        return (
          <div key={step} className="flex flex-1 items-center min-w-0">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(step)}
              className={`flex flex-col items-center gap-1 flex-1 min-w-0 ${clickable ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
              aria-current={active ? 'step' : undefined}
            >
              <span className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center border ${
                done ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                active ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' :
                'bg-white/5 border-white/10 text-slate-500'
              }`}>
                {done ? '✓' : step}
              </span>
              <span className={`text-[0.65rem] font-bold truncate ${active ? 'text-sky-400' : 'text-slate-500'}`}>
                {label}
              </span>
            </button>
            {i < WIZARD_STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-1 ${step < current ? 'bg-green-500/40' : 'bg-white/10'}`} aria-hidden />
            )}
          </div>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Criar `src/components/wizardTypes.ts`**

```ts
export type WizardStep = 1 | 2 | 3
```

Atualizar import em `WizardStepper.tsx` para usar `./wizardTypes`.

- [ ] **Step 3: Verificar compilação**

Run: `npm run build`
Expected: compila (componente ainda não importado — OK se sem erros TS no arquivo)

- [ ] **Step 4: Commit** (somente se o usuário pedir commit)

---

### Task 2: Estado do wizard em `VehicleInfoForm`

**Files:**
- Modify: `src/components/VehicleInfoForm.tsx`
- Modify: `src/components/VehicleInfoForm.tsx` — interface `Props`

**Interfaces:**
- Consumes: `WizardStepper`, `WizardStep` from `./wizardTypes`
- Produces: props estendidas:
  ```ts
  interface Props {
    // ...existentes
    resetToken?: number
    onWizardComplete?: () => void
  }
  ```

- [ ] **Step 1: Adicionar imports e estado**

No topo de `VehicleInfoFormComponent`, após outros `useState`:

```ts
import WizardStepper from './WizardStepper'
import type { WizardStep } from './wizardTypes'

// dentro do componente:
const [wizardStep, setWizardStep] = useState<WizardStep>(1)
const [maxVisited, setMaxVisited] = useState<WizardStep>(1)

useEffect(() => {
  setWizardStep(1)
  setMaxVisited(1)
}, [resetToken])
```

Adicionar `resetToken` e `onWizardComplete` à desestruturação de `Props`.

- [ ] **Step 2: Helpers de navegação**

```ts
const goToStep = useCallback((step: WizardStep) => {
  setWizardStep(step)
  setMaxVisited(prev => (step > prev ? step : prev) as WizardStep)
}, [])

const goNext = useCallback(() => {
  if (wizardStep < 3) goToStep((wizardStep + 1) as WizardStep)
}, [wizardStep, goToStep])

const goBack = useCallback(() => {
  if (wizardStep > 1) setWizardStep((wizardStep - 1) as WizardStep)
}, [wizardStep])

const handleComplete = useCallback(() => {
  onWizardComplete?.()
  onToggleCollapse?.()
}, [onWizardComplete, onToggleCollapse])
```

- [ ] **Step 3: Inserir stepper abaixo do header interno**

Após o bloco do título “Dados da Vistoria” / botões ⚙️, antes do bloco da placa:

```tsx
<p className="text-[0.72rem] font-bold text-slate-500 mb-2">
  Dados da vistoria — Passo {wizardStep} de 3
</p>
<WizardStepper
  current={wizardStep}
  maxVisited={maxVisited}
  onStepClick={goToStep}
/>
```

- [ ] **Step 4: `npm run build`** — deve passar

---

### Task 3: Agrupar campos por passo

**Files:**
- Modify: `src/components/VehicleInfoForm.tsx` (~linhas 454–804)

**Interfaces:**
- Consumes: `wizardStep`, helpers `goNext`, `goBack`, `handleComplete`
- Produces: JSX com 3 painéis condicionais

- [ ] **Step 1: Envolver bloco da placa + veículo + local em `{wizardStep === 1 && (...)}`**

Mover para dentro do painel passo 1:
- `div` gradiente consulta placa (linhas ~454–528)
- Grid `veiculo` (brand, color, vehicleTypeDesc)
- Grid `local` (city, state)

Remover `style={{ order: orderIndex(...) }}` desses blocos (ordem fixa no wizard).

- [ ] **Step 2: Painel passo 2 — `{wizardStep === 2 && (...)}`**

Incluir:
- Grid `perfil` (profile, ref)
- Grid `cliente` (owner, phone)
- Grid `documentos` (cpf, cnh, cnhCategory)

- [ ] **Step 3: Painel passo 3 — `{wizardStep === 3 && (...)}`**

Incluir:
- `observacoes` (textarea + SpeechButton)
- `personalizados` (customFieldDefs grid)
- `assinaturas` (SignaturePad x2)

- [ ] **Step 4: Remover wrapper `flex flex-col` com `order:` CSS** — substituído pelos painéis

- [ ] **Step 5: `npm run build`**

---

### Task 4: Rodapé sticky `WizardNav`

**Files:**
- Modify: `src/components/VehicleInfoForm.tsx`

- [ ] **Step 1: Adicionar rodapé antes do fechamento do card principal**

```tsx
<div className="sticky bottom-0 z-10 mt-4 pt-3 pb-1 bg-[var(--card-bg)]/95 border-t border-white/5 flex gap-2">
  {wizardStep > 1 && (
    <button type="button" onClick={goBack}
      className="flex-1 py-3 rounded-xl text-sm font-bold border border-white/10 text-slate-300 hover:bg-white/5">
      ← Voltar
    </button>
  )}
  {wizardStep < 3 ? (
    <button type="button" onClick={goNext}
      className="flex-1 py-3 rounded-xl text-sm font-black bg-sky-600 hover:bg-sky-500 text-white">
      Continuar →
    </button>
  ) : (
    <button type="button" onClick={handleComplete}
      className="flex-1 py-3 rounded-xl text-sm font-black bg-green-600 hover:bg-green-500 text-white">
      Concluir dados
    </button>
  )}
</div>
```

Passo 1: só botão Continuar (sem Voltar) — `wizardStep > 1` já cobre.

- [ ] **Step 2: Adicionar `pb-20` ou padding no container do passo** para não cobrir campos

- [ ] **Step 3: Animação opcional entre passos**

```tsx
<div key={wizardStep} className="animate-in fade-in slide-in-from-right-2 duration-200 motion-reduce:animate-none">
  {/* painel do passo */}
</div>
```

---

### Task 5: Limpar UI de reordenar seções

**Files:**
- Modify: `src/components/VehicleInfoForm.tsx`

- [ ] **Step 1: Remover bloco “↕️ Ordem das Seções”** do dropdown ⚙️ (linhas ~376–396)

Manter: checkboxes de campos visíveis + campos personalizados.

- [ ] **Step 2: Remover `sectionOrder`, `moveSection`, `orderIndex`, `loadSectionOrder`, `saveSectionOrder`** se não usados em outro lugar

Opcional: manter `SECTION_DEFS` apenas se referenciado; senão remover código morto.

- [ ] **Step 3: `npm run build`**

---

### Task 6: Integração com `app/page.tsx`

**Files:**
- Modify: `src/app/app/page.tsx`

**Interfaces:**
- Consumes: `resetToken`, `onWizardComplete` em `VehicleInfoForm`

- [ ] **Step 1: Adicionar estado reset**

```ts
const [formResetToken, setFormResetToken] = useState(0)
```

- [ ] **Step 2: Em `handleClearAll`, incrementar token**

```ts
setFormResetToken(t => t + 1)
```

- [ ] **Step 3: Passar props ao `VehicleInfoForm`**

```tsx
<VehicleInfoForm
  info={vehicleInfo}
  onChange={setVehicleInfo}
  collapsed={formCollapsed}
  onToggleCollapse={() => setFormCollapsed(c => !c)}
  onVehicleTypeDetected={(type) => setVehicleType(type)}
  resetToken={formResetToken}
  onWizardComplete={() => showToast('✅ Dados da vistoria prontos')}
/>
```

- [ ] **Step 4: `npm run build`**

---

### Task 7: QA manual (critérios de aceite)

**Files:** nenhum

- [ ] **1.** `npm run dev` → `/app` → login → formulário mostra stepper e passo 1 só com placa/veículo
- [ ] **2.** Placa 7 chars → API preenche → Continuar → passo 2 cliente
- [ ] **3.** Voltar passo 2→1 → dados preservados
- [ ] **4.** ⚙️ desmarcar CPF → passo 2 sem CPF
- [ ] **5.** Passo 3 → Concluir dados → toast + card minimiza
- [ ] **6.** Limpar tudo → passo 1 + campos vazios
- [ ] **7.** Salvar/carregar vistoria → dados OK no PDF
- [ ] **8.** Viewport 390px — sem scroll excessivo por passo; botões tocáveis

---

## Self-Review (plan vs spec)

| Requisito spec | Task |
|----------------|------|
| 3 passos fixos | Task 3 |
| Stepper clicável passos visitados | Task 1, 2 |
| Sem campos obrigatórios | Global constraint |
| ⚙️ campos visíveis | Task 5 mantém |
| Remover ↑/↓ UI principal | Task 5 |
| Reset em Limpar tudo | Task 6 |
| Concluir + toast + minimizar | Task 4, 6 |
| PDF/sync inalterados | Global constraint |
| Fora de escopo respeitado | Sem API placa, sem dual layout |

Nenhum placeholder TBD restante.
