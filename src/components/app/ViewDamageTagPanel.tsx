'use client'

import { useState } from 'react'
import type { Damage, DamageType, Severity } from '@/src/types'
import { formatEvidenceStatusLabel } from '@/src/lib/evidenceStatus'
import Button from '@/src/components/ui/Button'
import { ButtonGroup } from '@/src/components/ui/ButtonGroup'

const TYPE_OPTIONS: { type: DamageType; label: string }[] = [
  { type: 'scratch', label: 'Risco / Arranhado' },
  { type: 'dent', label: 'Amassado' },
  { type: 'broken', label: 'Quebrado' },
]

const SEVERITY_OPTIONS: { severity: Severity; label: string }[] = [
  { severity: 'low', label: 'Leve' },
  { severity: 'medium', label: 'Moderado' },
  { severity: 'high', label: 'Grave' },
]

type Props = {
  damage: Damage
  decidedByName?: string
  onUpdate: (id: string, patch: Partial<Damage>) => void
}

export default function ViewDamageTagPanel({ damage, decidedByName, onUpdate }: Props) {
  const status = damage.evidenceStatus || 'sugerido'
  const [open, setOpen] = useState(status === 'sugerido')
  const [editing, setEditing] = useState(false)
  const [draftType, setDraftType] = useState(damage.type)
  const [draftSeverity, setDraftSeverity] = useState(damage.severity)
  const [draftNotes, setDraftNotes] = useState(damage.notes)

  if (status === 'ignorado') return null

  const typeLabel = TYPE_OPTIONS.find((t) => t.type === damage.type)?.label || 'Avaria'
  const fullDescription = (damage.notes || '').trim() || typeLabel
  const chipLabel = typeLabel

  function stampConfirm(patch: Partial<Damage>) {
    onUpdate(damage.id, {
      ...patch,
      evidenceStatus: 'confirmado',
      evidenceDecidedBy: decidedByName || undefined,
      evidenceDecidedAt: new Date().toISOString(),
    })
    setEditing(false)
    setOpen(false)
  }

  return (
    <div className="mt-2 space-y-2 relative">
      <button
        type="button"
        title={fullDescription}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex max-w-full items-center gap-1.5 rounded-lg px-2 py-1 text-[0.65rem] font-bold text-left transition-colors ${
          status === 'confirmado'
            ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
            : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
        }`}
      >
        <span className="truncate">{chipLabel}</span>
        <span className="opacity-80">·</span>
        <span className="shrink-0">
          {formatEvidenceStatusLabel(status, {
            decidedBy: damage.evidenceDecidedBy,
            decidedAt: damage.evidenceDecidedAt,
          })}
        </span>
      </button>

      {open && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-3 space-y-2 shadow-lg z-10 relative">
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">
            {status === 'sugerido' ? 'Sugestão da IA' : 'Avaria'}
          </p>
          <p className="text-sm text-[var(--text-main)] leading-relaxed whitespace-pre-wrap">
            {fullDescription}
          </p>
          <p className="text-[0.7rem] text-[var(--text-muted)]">
            {typeLabel}
            {' · '}
            {SEVERITY_OPTIONS.find((s) => s.severity === damage.severity)?.label || damage.severity}
          </p>

          {status === 'sugerido' && !editing && (
            <ButtonGroup align="center" className="pt-1">
              <Button type="button" variant="primary" size="sm" onClick={() => stampConfirm({})}>
                Aceitar
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDraftType(damage.type)
                  setDraftSeverity(damage.severity)
                  setDraftNotes(damage.notes)
                  setEditing(true)
                }}
              >
                Editar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onUpdate(damage.id, {
                    evidenceStatus: 'ignorado',
                    evidenceDecidedBy: decidedByName || undefined,
                    evidenceDecidedAt: new Date().toISOString(),
                  })
                }
              >
                Ignorar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </ButtonGroup>
          )}

          {status === 'confirmado' && !editing && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          )}

          {editing && (
            <div className="space-y-2 pt-1 border-t border-[var(--card-border)]">
              <div className="flex flex-wrap gap-1">
                {TYPE_OPTIONS.map((o) => (
                  <button
                    key={o.type}
                    type="button"
                    onClick={() => setDraftType(o.type)}
                    className={`min-h-8 px-2 rounded-lg text-[0.7rem] font-bold border ${
                      draftType === o.type
                        ? 'border-[var(--primary)] text-[var(--primary)]'
                        : 'border-[var(--card-border)]'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {SEVERITY_OPTIONS.map((o) => (
                  <button
                    key={o.severity}
                    type="button"
                    onClick={() => setDraftSeverity(o.severity)}
                    className={`min-h-8 px-2 rounded-lg text-[0.7rem] font-bold border ${
                      draftSeverity === o.severity
                        ? 'border-[var(--primary)] text-[var(--primary)]'
                        : 'border-[var(--card-border)]'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--card-border)] bg-transparent px-2 py-1.5 text-sm"
              />
              <ButtonGroup align="center" className="pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    stampConfirm({
                      type: draftType,
                      typeName: TYPE_OPTIONS.find((t) => t.type === draftType)?.label || draftType,
                      severity: draftSeverity,
                      notes: draftNotes,
                    })
                  }
                >
                  Salvar
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
              </ButtonGroup>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
