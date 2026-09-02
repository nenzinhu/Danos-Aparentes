'use client';
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { DamageType, Severity } from '../types'
import { IconEraser } from './ui/AnimatedIcons'
import type { AiOriginalSuggestion } from '../lib/aiDecisions'
import { formatEvidenceStatusLabel } from '../lib/evidenceStatus'
import { SEV, TYPES, type AiClassifyState } from './damageFloatLogic'
import { SharedSvgDefs } from './ui/DamageTypeIcons'

export function TypePickerGrid({
  currentType,
  onPickType,
}: {
  currentType?: DamageType
  onPickType: (type: DamageType, label: string) => void
}) {
  return (
    <>
      <SharedSvgDefs />
      <div className="grid grid-cols-3 gap-2">
      {TYPES.map((t, i) => {
        const isActive = currentType === t.type
        return (
          <motion.button
            key={t.type}
            onClick={() => onPickType(t.type, t.label)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-keyshortcuts={String(i + 1)}
            className={`relative flex flex-col items-center justify-center gap-1 min-h-[68px] sm:min-h-[64px] px-1.5 pt-4 pb-1.5 rounded-xl border-2 font-outfit text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:ring-2 ring-[var(--primary)] outline-none ${
              isActive
                ? `${t.bg} ${t.border} text-[var(--text-main)] shadow-[inset_0_0_0_1px_var(--primary)]`
                : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] hover:border-[var(--text-muted)]/40'
            }`}
          >
            <span className="absolute top-1.5 left-1/2 -translate-x-1/2 rounded-md border border-[var(--btn-secondary-border)] bg-[var(--card-bg-solid)] px-1.5 py-px font-mono-data text-[0.58rem] font-semibold tracking-wide text-[var(--text-muted)] tabular-nums">
              [{i + 1}]
            </span>
            <div className={`flex items-center justify-center overflow-hidden rounded-lg transition-transform duration-200 ${isActive ? 'scale-105' : ''}`}>
              <Image src={t.img} alt={t.label} className="w-full h-[36px] sm:h-[32px] object-contain drop-shadow" width={80} height={36} />
            </div>
            <span className="text-[0.68rem] sm:text-[0.62rem] tracking-tight leading-tight text-center text-[var(--text-main)] px-0.5 font-extrabold">
              {t.label}
            </span>
            {isActive && (
              <span className="text-[0.55rem] uppercase font-black tracking-widest text-[var(--primary)]">Ativo</span>
            )}
          </motion.button>
        )
      })}
    </div>
    </>
  )
}

export function ClearDamageButton({ onClear }: { onClear: () => void }) {
  return (
    <motion.button
      onClick={onClear}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="mt-3.5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-outfit text-xs font-bold transition-all duration-200 cursor-pointer bg-transparent hover:bg-[var(--btn-secondary-hover)] border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
    >
      <IconEraser className="text-[var(--text-muted)]" size={15} />
      <span>Sem avaria / Limpar</span>
    </motion.button>
  )
}

export function SeverityGrid({
  severity,
  onChange,
}: {
  severity: Severity
  onChange: (value: Severity) => void
}) {
  return (
    <div className="mb-2.5">
      <div className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Grau do dano</div>
      <div className="grid grid-cols-3 gap-1">
        {SEV.map(s => (
          <motion.button
            key={s.value}
            onClick={() => onChange(s.value)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`min-h-11 sm:min-h-9 py-2 rounded-lg text-[0.72rem] font-extrabold border transition-all cursor-pointer ${
              severity === s.value
                ? `${s.bg} ${s.border} ${s.color}`
                : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:bg-[var(--btn-secondary-hover)]'
            }`}
          >
            {s.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export function AiSuggestionPanel({
  aiState,
  aiOriginal,
  aiDecisionAppendPending,
  onAccept,
  onEdit,
  onIgnore,
}: {
  aiState: Extract<AiClassifyState, { status: 'done' }>
  aiOriginal: AiOriginalSuggestion | null
  aiDecisionAppendPending: boolean
  onAccept: () => void
  onEdit: () => void
  onIgnore: () => void
}) {
  return (
    <div className="mt-2.5 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="rounded-full border border-amber-500/35 bg-amber-500/15 px-2 py-1 text-[0.65rem] font-black text-amber-300">
            {formatEvidenceStatusLabel('sugerido')}
          </span>
          <p className="mt-1 text-[0.62rem] font-semibold text-[var(--text-muted)]">
            ainda não confirmado
          </p>
        </div>
        {aiOriginal?.confidence != null && (
          <span className="text-[0.65rem] font-bold tabular-nums text-[var(--text-muted)]">
            Confiança {Math.round(Number(aiOriginal.confidence) <= 1 ? Number(aiOriginal.confidence) * 100 : Number(aiOriginal.confidence))}%
          </span>
        )}
      </div>
      <div className="text-[0.78rem] font-bold text-[var(--text-main)]">
        {TYPES.find(t => t.type === aiState.type)?.label}
        {' · '}
        {SEV.find(s => s.value === aiState.severity)?.label}
      </div>
      {aiState.description && (
        <div>
          <p className="ds-label mb-0.5">Descrição sugerida</p>
          <p className="text-[0.7rem] text-[var(--text-muted)] leading-snug">{aiState.description}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={onAccept}
          disabled={aiDecisionAppendPending}
          className="min-h-9 px-3 rounded-lg text-[0.65rem] font-black uppercase tracking-wide bg-primary text-white cursor-pointer disabled:cursor-wait disabled:opacity-60"
        >
          Aceitar
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={aiDecisionAppendPending}
          className="min-h-9 px-3 rounded-lg text-[0.65rem] font-black uppercase tracking-wide border border-[var(--btn-secondary-border)] text-[var(--text-main)] cursor-pointer disabled:cursor-wait disabled:opacity-60"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onIgnore}
          disabled={aiDecisionAppendPending}
          className="min-h-9 px-2.5 rounded-lg text-[0.65rem] font-bold text-[var(--text-muted)] underline underline-offset-2 cursor-pointer disabled:cursor-wait disabled:opacity-60"
        >
          Ignorar
        </button>
      </div>
    </div>
  )
}
