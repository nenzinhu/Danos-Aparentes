'use client'

import { useEffect, useMemo, useState } from 'react'
import { IconDocument, IconCar, IconSignature } from '../ui/AnimatedIcons'
import { trackEvent } from '@/src/lib/analytics/events'
import { completeOnboarding, dismissOnboarding } from '@/src/lib/onboarding'

type InspectSection = 'dados' | 'diagrama' | 'finalizar'

type Props = {
  hasPlate: boolean
  hasDamages: boolean
  hasSavedReport: boolean
  /** Seção atual do wizard — diagrama conta como ok se o user já está no laudo. */
  currentSection: InspectSection
  onGoToSection: (section: InspectSection) => void
  /** Salva draft/complete — critério real de ativação. */
  onSaveFirst: () => void | Promise<void>
  onHide: () => void
}

const STEPS = [
  {
    id: 'dados' as const,
    label: 'Identidade',
    hint: 'Digite a placa: marca e modelo preenchem sozinhos.',
    icon: IconDocument,
  },
  {
    id: 'diagrama' as const,
    label: 'Danos',
    hint: 'Toque nas peças com dano, ou continue sem danos.',
    icon: IconCar,
  },
  {
    id: 'finalizar' as const,
    label: 'Salvar',
    hint: 'Salve no histórico agora. O dossiê técnico com hash + QR fica para depois.',
    icon: IconSignature,
  },
]

/**
 * Ativação: um objetivo — concluir a 1ª inspeção salva no histórico.
 */
export default function FirstInspectionOnboarding({
  hasPlate,
  hasDamages,
  hasSavedReport,
  currentSection,
  onGoToSection,
  onSaveFirst,
  onHide,
}: Props) {
  const [skippedDamages, setSkippedDamages] = useState(false)
  const [saving, setSaving] = useState(false)

  const diagramaDone =
    hasDamages || skippedDamages || currentSection === 'finalizar'

  const done = {
    dados: hasPlate,
    diagrama: diagramaDone,
    finalizar: hasSavedReport,
  }

  const completedCount = (done.dados ? 1 : 0) + (done.diagrama ? 1 : 0) + (done.finalizar ? 1 : 0)
  const activeStep = !done.dados ? 'dados' : !done.diagrama ? 'diagrama' : 'finalizar'

  const progressPct = useMemo(() => Math.round((completedCount / 3) * 100), [completedCount])

  useEffect(() => {
    if (!hasSavedReport) return
    completeOnboarding()
    trackEvent('onboarding_complete', { steps_done: 3 })
    onHide()
  }, [hasSavedReport, onHide])

  function handleDismiss() {
    dismissOnboarding()
    trackEvent('onboarding_dismiss', { steps_done: completedCount })
    onHide()
  }

  async function handlePrimary() {
    trackEvent('onboarding_step_click', { step: activeStep })
    if (activeStep === 'finalizar') {
      setSaving(true)
      try {
        await onSaveFirst()
      } finally {
        setSaving(false)
      }
      return
    }
    onGoToSection(activeStep)
  }

  function handleSkipDamages() {
    setSkippedDamages(true)
    trackEvent('onboarding_step_click', { step: 'diagrama_skip' })
    onGoToSection('finalizar')
  }

  const current = STEPS.find(s => s.id === activeStep)!

  return (
    <aside
      aria-label="Ativação: primeira inspeção"
      className="w-full rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4 sm:p-5 mb-2"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.16em] uppercase text-sky-400 mb-1">
            Sua primeira inspeção · ~3 min
          </p>
          <h2 className="font-outfit font-extrabold text-sm sm:text-base text-[var(--text-main)]">
            Salve a primeira inspeção no histórico
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed max-w-xl">
            Um objetivo nesta sessão: gravar a inspeção. Dossiê técnico e hash vêm depois.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dispensar guia nesta sessão"
          className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-bold px-2 py-1 rounded-lg border border-[var(--card-border)] bg-[var(--btn-secondary-bg)] cursor-pointer"
        >
          Depois
        </button>
      </div>

      <div
        className="h-1.5 rounded-full bg-[var(--btn-secondary-border)]/60 overflow-hidden mb-4"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da primeira inspeção"
      >
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {STEPS.map((step, i) => {
          const isDone = done[step.id]
          const isActive = step.id === activeStep
          const Icon = step.icon
          return (
            <li
              key={step.id}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-left ${
                isDone
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : isActive
                    ? 'border-sky-500/40 bg-sky-500/10'
                    : 'border-[var(--card-border)]/50 bg-[var(--card-bg-solid)]/40'
              }`}
            >
              <span
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isDone ? 'bg-emerald-500 text-white' : 'bg-[var(--btn-secondary-bg)] text-[var(--text-muted)]'
                }`}
              >
                {isDone ? '✓' : i + 1}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-xs font-bold text-[var(--text-main)]">
                  <Icon size={12} className={isActive ? 'text-sky-400' : 'text-[var(--text-muted)]'} />
                  {step.label}
                </span>
              </span>
            </li>
          )
        })}
      </ol>

      <p className="text-xs text-[var(--text-muted)] mb-3">{current.hint}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { void handlePrimary() }}
          disabled={saving || (activeStep === 'finalizar' && !hasPlate)}
          className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[var(--primary)] hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {activeStep === 'dados' && 'Ir para Identidade do Veículo'}
          {activeStep === 'diagrama' && 'Abrir diagrama'}
          {activeStep === 'finalizar' && (saving ? 'Salvando…' : 'Salvar primeira inspeção')}
        </button>
        {activeStep === 'diagrama' && !hasDamages && (
          <button
            type="button"
            onClick={handleSkipDamages}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-muted)] border border-[var(--card-border)] hover:text-[var(--text-main)] cursor-pointer"
          >
            Continuar sem avarias
          </button>
        )}
      </div>
    </aside>
  )
}
