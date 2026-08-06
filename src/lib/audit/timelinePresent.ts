/**
 * FASE 10 — Present audit events for the inspection timeline UI.
 * Labels only — no legal claims.
 */

import type { AuditLogRow } from './auditLog'
import { maskCpfInText } from '../verify/publicVerify'

export type TimelineTone = 'neutral' | 'ok' | 'warn' | 'ai' | 'block'

export type TimelinePresentOptions = {
  /** When true, append vehicle_id / inspection ids and similar technical keys. Default: false. */
  showIds?: boolean
}

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
  photo_reuse_alert: { label: 'Alerta: foto reutilizada', tone: 'warn' },
  photo_context_alert: { label: 'Alerta: inconsistência de contexto', tone: 'warn' },
  merge_resolved: { label: 'Histórico mesclado na sincronização', tone: 'ok' },
}

/** Keys that are technical identifiers — hidden unless showIds is on. */
const ID_KEYS = new Set([
  'vehicle_id',
  'vehicleId',
  'inspection_id',
  'inspectionId',
  'idempotency_key',
  'idempotencyKey',
  'user_id',
  'userId',
  'actor_id',
  'actorId',
  'event_id',
  'eventId',
  'tenant_id',
  'tenantId',
  'report_id',
  'reportId',
])

function str(meta: Record<string, unknown>, key: string): string | null {
  const v = meta[key]
  if (v == null || v === '') return null
  if (typeof v === 'string') return maskCpfInText(v)
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return null
}

function num(meta: Record<string, unknown>, key: string): number | null {
  const v = meta[key]
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

/** Refine label when metadata.kind distinguishes the action. */
function resolveLabel(
  eventType: string,
  meta: Record<string, unknown>,
): { label: string; tone: TimelineTone } {
  const mapped = LABELS[eventType] || {
    label: eventType.replace(/_/g, ' '),
    tone: 'neutral' as TimelineTone,
  }
  const kind = str(meta, 'kind')
  if (eventType === 'comparison_exported' && kind === 'vehicle_qr') {
    return { label: 'QR do veículo gerado', tone: 'neutral' }
  }
  if (eventType === 'inspection_linked_to_vehicle' && kind === 'hydrate_vehicle_reports') {
    return { label: 'Histórico sincronizado', tone: 'ok' }
  }
  if (eventType === 'change' && str(meta, 'source') === 'sync_upsert') {
    return { label: 'Dados sincronizados', tone: 'neutral' }
  }
  return mapped
}

/**
 * Human-readable description of what happened — no raw JSON dump, no IDs by default.
 */
export function summarizeMetadata(
  meta: Record<string, unknown>,
  eventType?: string,
  options: TimelinePresentOptions = {},
): string {
  const showIds = options.showIds === true
  const parts: string[] = []
  const kind = str(meta, 'kind')

  // Kind-specific narratives first
  if (kind === 'vehicle_qr') {
    const plate = str(meta, 'plate')
    parts.push(plate ? `Link público do histórico da placa ${plate}` : 'Link público do histórico gerado')
  } else if (kind === 'hydrate_vehicle_reports') {
    const pulled = num(meta, 'pulled')
    const written = num(meta, 'written')
    if (written != null && written > 0) {
      parts.push(`${written} inspeção(ões) baixada(s) neste dispositivo`)
    } else if (pulled != null && pulled > 0) {
      parts.push('Histórico local já estava atualizado')
    } else {
      parts.push('Sincronização com a nuvem concluída')
    }
  }

  // Event-type specific friendly fields
  if (eventType === 'issuance' || eventType === 'hash_generation') {
    const code = str(meta, 'public_code')
    const hash = str(meta, 'hash')
    if (code) parts.push(`código ${code}`)
    if (hash) parts.push(`hash ${hash.slice(0, 12).toUpperCase()}…`)
  }

  if (eventType === 'change' || str(meta, 'source') === 'sync_upsert') {
    const status = str(meta, 'status')
    const damages = num(meta, 'damages_count') ?? num(meta, 'damagesCount')
    const source = str(meta, 'source')
    if (status) parts.push(`status: ${status}`)
    if (damages != null) parts.push(`${damages} dano(s)`)
    if (source && source !== 'sync_upsert') parts.push(`origem: ${source}`)
  }

  if (eventType === 'review_completed' || eventType === 'review') {
    const notes = str(meta, 'review_notes') ?? str(meta, 'notes')
    if (notes) parts.push(`notas: ${notes}`)
    else if (!kind) parts.push('Sem observações registradas')
  }

  if (eventType === 'inspection_linked_to_vehicle' && kind !== 'hydrate_vehicle_reports') {
    const plate = str(meta, 'plate')
    if (plate) parts.push(`placa ${plate}`)
  }

  if (eventType === 'photo_reuse_alert') {
    const reuseKind = str(meta, 'kind')
    if (reuseKind === 'exact') parts.push('mesma imagem (SHA-256 idêntico) em outra vistoria')
    else if (reuseKind === 'perceptual') {
      const ham = num(meta, 'hamming')
      parts.push(
        ham != null
          ? `imagem muito similar a outra vistoria (distância ${ham})`
          : 'imagem muito similar a outra vistoria',
      )
    } else {
      parts.push('possível reaproveitamento de foto')
    }
  }

  if (eventType === 'photo_context_alert') {
    const detail = str(meta, 'detail')
    if (detail) parts.push(detail)
    else {
      const ctxKind = str(meta, 'kind')
      if (ctxKind === 'gps_mismatch') parts.push('GPS da foto diverge do local da vistoria')
      else if (ctxKind === 'time_mismatch') parts.push('horário da foto diverge do registro')
    }
  }

  if (eventType === 'merge_resolved') {
    const localOnly = num(meta, 'damages_local_only')
    const remoteOnly = num(meta, 'damages_remote_only')
    const partsMerge: string[] = []
    if (localOnly != null || remoteOnly != null) {
      partsMerge.push(
        `danos: +${localOnly ?? 0} deste dispositivo · +${remoteOnly ?? 0} de outro`,
      )
    }
    if (meta.multi_contributor === true) partsMerge.push('contribuições de mais de um vistoriador')
    parts.push(...partsMerge)
  }

  // Generic meaningful fields (never IDs)
  const friendlyKeys = [
    'decision',
    'part',
    'partName',
    'provider',
    'role',
    'reason',
    'notes',
    'plate',
    'status',
    'public_code',
  ] as const
  for (const k of friendlyKeys) {
    if (parts.some((p) => p.includes(String(meta[k])))) continue
    const v = str(meta, k)
    if (!v) continue
    // Avoid duplicating plate/status already narrated
    if (k === 'plate' && parts.some((p) => p.includes(v))) continue
    if (k === 'status' && parts.some((p) => p.startsWith('status:'))) continue
    if (k === 'public_code' && parts.some((p) => p.includes(v))) continue
    if (k === 'notes' && parts.some((p) => p.startsWith('notas:'))) continue
    parts.push(k === 'plate' ? `placa ${v}` : k === 'public_code' ? `código ${v}` : `${k}: ${v}`)
  }

  if (showIds) {
    for (const key of Object.keys(meta)) {
      if (!ID_KEYS.has(key)) continue
      const v = str(meta, key)
      if (v) parts.push(`${key}: ${v}`)
    }
  }

  // If still empty but meta has content, describe count — never dump raw JSON
  if (parts.length === 0 && Object.keys(meta).length > 0) {
    const visibleKeys = Object.keys(meta).filter((k) => showIds || !ID_KEYS.has(k))
    if (visibleKeys.length === 0) return ''
    // Last resort: short key=value for non-id primitives only
    for (const k of visibleKeys) {
      if (k === 'kind') continue
      const v = str(meta, k)
      if (v && v.length <= 80) parts.push(`${k}: ${v}`)
    }
  }

  return parts.join(' · ')
}

export function presentAuditEvent(
  row: AuditLogRow,
  options: TimelinePresentOptions = {},
): TimelinePresentation {
  const meta = row.metadata || {}
  const mapped = resolveLabel(row.event_type, meta)
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
    detail: summarizeMetadata(meta, row.event_type, options),
    when,
    tone: mapped.tone,
    eventHashShort: (row.event_hash || '').slice(0, 12).toUpperCase(),
  }
}

export function presentAuditTimeline(
  rows: AuditLogRow[],
  options: TimelinePresentOptions = {},
): TimelinePresentation[] {
  return rows.map((row) => presentAuditEvent(row, options))
}
