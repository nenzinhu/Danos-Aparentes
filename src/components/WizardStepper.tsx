'use client';
import type { WizardStep } from './wizardTypes'

const WIZARD_STEPS: { step: WizardStep; label: string }[] = [
  { step: 1, label: 'Dados do Cliente' },
  { step: 2, label: 'Dados do Veículo' },
  { step: 3, label: 'Evidências' },
]

interface Props {
  current: WizardStep
  maxVisited: WizardStep
  onStepClick: (step: WizardStep) => void
}

export default function WizardStepper({ current, maxVisited, onStepClick }: Props) {
  return (
    <nav aria-label="Progresso do formulário" className="flex items-center gap-1 mb-4">
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
              className={`group flex items-center gap-2 flex-1 min-w-0 py-1 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              aria-current={active ? 'step' : undefined}
            >
              <span className={`w-6 h-6 rounded-full text-[0.7rem] font-black flex items-center justify-center border shrink-0 transition-colors ${
                done
                  ? 'bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success)]'
                  : active
                    ? 'bg-[var(--primary)]/15 border-[var(--primary)]/60 text-[var(--primary)]'
                    : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-muted)]'
              }`}>
                {done ? '✓' : step}
              </span>
              <span className={`text-[0.7rem] font-bold truncate max-w-full transition-colors ${
                active ? 'text-[var(--primary)]' : done ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'
              }`}>
                {label}
              </span>
            </button>
            {i < WIZARD_STEPS.length - 1 && (
              <div
                className={`h-px w-4 shrink-0 ${step < current ? 'bg-[var(--success-border)]' : 'bg-[var(--card-border)]'}`}
                aria-hidden
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
