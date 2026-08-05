/**
 * FASE 10 — Present audit events for the inspection timeline UI.
 * Labels only — no legal claims.
 */

import type { AuditLogRow } from './auditLog'
import { maskCpfInText } from '../verify/publicVerify'

export type TimelineTone = 'neutral' | 'ok' | 'warn' | 'ai' | 'block'

export type TimelinePresentation = {
  eventId: string
  eventType: string
  label: string
  detail: string
  when: string
  tone: TimelineTone
  eventHashShort: string
}

const LABELS: Record<string, { label: string; tone: TimelineTone }> = {
  creation: { label: 'Vistoria criada', tone: 'neutral' },
  start: { label: 'Vistoria iniciada', tone: 'neutral' },
  change: { label: 'Dados alterados', tone: 'neutral' },
  damage_create: { label: 'Avaria registrada', tone: 'neutral' },
  photo_capture: { label: 'Foto capturada', tone: 'ok' },
  ai_analysis: { label: 'Análise de IA', tone: 'ai' },
  human_decision: { label: 'Decisão humana (IA)', tone: 'ok' },
  review: { label: 'Revisão', tone: 'ok' },
  review_completed: { label: 'Revisão humana concluída', tone: 'ok' },
  signature: { label: 'Assinatura registrada', tone: 'ok' },
  gps: { label: 'GPS capturado', tone: 'ok' },
  pdf_generation: { label: 'PDF gerado', tone: 'ok' },
  hash_generation: { label: 'Hash registrado', tone: 'ok' },
  issuance: { label: 'Laudo emitido', tone: 'ok' },
  verification: { label: 'Verificação pública', tone: 'neutral' },
  correction: { label: 'Correção aberta', tone: 'warn' },
  cancellation: { label: 'Cancelamento', tone: 'block' },
  unauthorized_access_attempt: { label: 'Tentativa de acesso não autorizado', tone: 'block' },
  issued_mutation_attempt: { label: 'Tentativa de alterar laudo emitido', tone: 'block' },
  issue_blocked_without_review: { label: 'Emissão bloqueada (sem revisão)', tone: 'block' },
  vehicle_created: { label: 'Veículo criado', tone: 'neutral' },
  inspection_linked_to_vehicle: { label: 'Vistoria vinculada ao veículo', tone: 'ok' },
  comparison_created: { label: 'Comparação criada', tone: 'ai' },
  comparison_reviewed: { label: 'Comparação revisada', tone: 'ok' },
  damage_marked_new: { label: 'Dano marcado como novo', tone: 'warn' },
  damage_marked_existing: { label: 'Dano marcado como existente', tone: 'ok' },
  damage_marked_changed: { label: 'Dano marcado como alterado', tone: 'warn' },
  damage_marked_uncertain: { label: 'Dano marcado como incerto', tone: 'warn' },
  comparison_exported: { label: 'Comparação exportada', tone: 'neutral' },
}

function summarizeMetadata(meta: Record<string, unknown>): string {
  const parts: string[] = []
  const keys = ['decision', 'part', 'partName', 'provider', 'role', 'reason', 'notes', 'hash', 'public_code'] as const
  for (const k of keys) {
    const v = meta[k]
    if (v == null || v === '') continue
    const s = typeof v === 'string' ? v : JSON.stringify(v)
    parts.push(`${k}: ${maskCpfInText(s)}`)
  }
  if (parts.length === 0 && Object.keys(meta).length > 0) {
    const raw = JSON.stringify(meta)
    return maskCpfInText(raw.length > 120 ? `${raw.slice(0, 117)}…` : raw)
  }
  return parts.join(' · ')
}

export function presentAuditEvent(row: AuditLogRow): TimelinePresentation {
  const mapped = LABELS[row.event_type] || {
    label: row.event_type.replace(/_/g, ' '),
    tone: 'neutral' as TimelineTone,
  }
  const when = (() => {
    try {
      return new Date(row.timestamp).toLocaleString('pt-BR')
    } catch {
      return row.timestamp
    }
  })()
  return {
    eventId: row.event_id,
    eventType: row.event_type,
    label: mapped.label,
    detail: summarizeMetadata(row.metadata || {}),
    when,
    tone: mapped.tone,
    eventHashShort: (row.event_hash || '').slice(0, 12).toUpperCase(),
  }
}

export function presentAuditTimeline(rows: AuditLogRow[]): TimelinePresentation[] {
  return rows.map(presentAuditEvent)
}
