import type { HumanDecisionKind } from './aiDecisions'

export type EvidenceStatus = 'sugerido' | 'confirmado' | 'ignorado'

/** Campos futuros de Damage relacionados a evidência (Task 2). */
export type DamageEvidenceFields = {
  evidenceStatus?: EvidenceStatus
  decidedBy?: string | null
  decidedAt?: string | null
}

export function deriveEvidenceStatusFromDecision(
  kind: HumanDecisionKind | null | undefined,
  hasAiSuggestion: boolean,
): EvidenceStatus | undefined {
  if (kind === 'accept' || kind === 'edit') return 'confirmado'
  if (kind === 'ignore') return 'ignorado'
  if (hasAiSuggestion) return 'sugerido'
  return undefined
}

export function formatEvidenceStatusLabel(
  status: EvidenceStatus,
  opts?: { decidedBy?: string | null; decidedAt?: string | null },
): string {
  if (status === 'sugerido') return 'Sugestão da IA'
  if (status === 'ignorado') return 'Ignorado'
  const who = (opts?.decidedBy || '').trim()
  let when = ''
  if (opts?.decidedAt) {
    const d = new Date(opts.decidedAt)
    if (!Number.isNaN(d.getTime())) {
      when = d.toLocaleDateString('pt-BR')
    }
  }
  const parts = ['Confirmado']
  if (who) parts.push(`por ${who}`)
  if (when) parts.push(when)
  return parts.join(' · ')
}

export function filterDamagesForPdf<T extends { evidenceStatus?: EvidenceStatus }>(
  damages: T[],
): T[] {
  return damages.filter((d) => d.evidenceStatus !== 'ignorado')
}

export function evidenceStatusBadgeColors(status: EvidenceStatus): {
  bg: string
  fg: string
} {
  if (status === 'sugerido') return { bg: '#FEF3C7', fg: '#92400E' }
  if (status === 'confirmado') return { bg: '#DCFCE7', fg: '#166534' }
  return { bg: '#F1F5F9', fg: '#64748B' }
}
