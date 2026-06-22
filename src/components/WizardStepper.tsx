'use client';
import type { WizardStep } from './wizardTypes'

const WIZARD_STEPS: { step: WizardStep; label: string }[] = [
  { step: 1, label: 'Veículo' },
  { step: 2, label: 'Cliente' },
  { step: 3, label: 'Finalizar' },
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
              className={`flex flex-col items-center gap-1 flex-1 min-w-0 py-1 ${clickable ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
              aria-current={active ? 'step' : undefined}
            >
              <span className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center border shrink-0 ${
                done ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                active ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' :
                'bg-white/5 border-white/10 text-slate-500'
              }`}>
                {done ? '✓' : step}
              </span>
              <span className={`text-[0.65rem] font-bold truncate max-w-full ${active ? 'text-sky-400' : 'text-slate-500'}`}>
                {label}
              </span>
            </button>
            {i < WIZARD_STEPS.length - 1 && (
              <div
                className={`h-px w-3 shrink-0 ${step < current ? 'bg-green-500/40' : 'bg-white/10'}`}
                aria-hidden
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
