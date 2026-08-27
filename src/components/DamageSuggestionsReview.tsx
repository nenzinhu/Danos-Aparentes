'use client';
import React from 'react'
import { DamageType, Severity } from '../types'

export interface DamageSuggestion {
  partId: string
  partName: string
  type: DamageType
  typeName: string
  severity: Severity
  description: string
  accepted: boolean
}

const SEVERITY_LABEL: Record<Severity, string> = { low: 'Leve', medium: 'Média', high: 'Grave' }
const SEVERITY_CLASS: Record<Severity, string> = {
  low: 'bg-[color-mix(in_srgb,var(--severity-low)_15%,transparent)] border-[var(--severity-low)]/30 text-[var(--severity-low)]',
  medium: 'bg-[color-mix(in_srgb,var(--severity-medium)_15%,transparent)] border-[var(--severity-medium)]/30 text-[var(--severity-medium)]',
  high: 'bg-[color-mix(in_srgb,var(--severity-high)_15%,transparent)] border-[var(--severity-high)]/30 text-[var(--severity-high)]',
}

interface Props {
  suggestions: DamageSuggestion[]
  onToggle: (partId: string) => void
  onConfirm: () => void
  onDiscard: () => void
}

export default function DamageSuggestionsReview({ suggestions, onToggle, onConfirm, onDiscard }: Props) {
  const acceptedCount = suggestions.filter(s => s.accepted).length

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[var(--card-bg)] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col border border-[var(--panel-border)]">
        <div className="p-5 border-b border-[var(--panel-border)]">
          <h2 className="font-extrabold text-base text-[var(--text-main)]">Avarias detectadas</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Revise as sugestões da IA. Desmarque o que não for uma avaria real antes de confirmar.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {suggestions.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] text-center py-6">
              Nenhuma avaria identificada com confiança nesta foto.
            </p>
          )}
          {suggestions.map(s => (
            <label
              key={s.partId}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                s.accepted ? 'bg-[var(--primary)]/5 border-[var(--primary)]/25' : 'bg-black/10 border-white/5 opacity-50'
              }`}
            >
              <input
                type="checkbox"
                checked={s.accepted}
                onChange={() => onToggle(s.partId)}
                className="mt-0.5 accent-[var(--primary)] w-4 h-4 shrink-0 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-[var(--text-main)]">{s.partName}</span>
                  <span className={`text-[0.65rem] font-black uppercase tracking-wide border rounded-full px-2 py-0.5 ${SEVERITY_CLASS[s.severity]}`}>
                    {SEVERITY_LABEL[s.severity]}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">{s.typeName} — {s.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--panel-border)] flex gap-2">
          <button
            onClick={onDiscard}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm border border-[var(--panel-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            Descartar tudo
          </button>
          <button
            onClick={onConfirm}
            disabled={acceptedCount === 0}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-[var(--primary)] text-[var(--bg-main)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar {acceptedCount > 0 ? `(${acceptedCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
