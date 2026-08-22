/**
 * Apresentação humana da timeline de auditoria / histórico veicular.
 * Sem IDs técnicos, UUIDs, payloads ou jargão interno na UI.
 */

import type { AuditLogRow } from './auditLog'
import { maskCpfInText } from '../verify/publicVerify'

export type TimelineTone = 'neutral' | 'ok' | 'warn' | 'ai' | 'block'

/** Categorias de filtro / badge — alinhadas ao prontuário digital. */
export type TimelineCategory =
  | 'inspecao'
  | 'ia'
  | 'comparacao'
  | 'reparo'
  | 'sincronizacao'
  | 'venda'
  | 'transferencia'
  | 'documento'
  | 'alerta'
  | 'geral'

export type TimelineStatusKind =
  | 'validado'
  | 'pendente'
  | 'em_analise'
  | 'evidencias'
  | 'assinado'
  | 'sincronizado'
  | 'alerta'

export type TimelinePresentOptions = {
  /** Uso interno / debug — nunca ligado na UI do produto. */
  showIds?: boolean
}

export type TimelinePresentation = {
  eventId: string
  eventType: string
  /** @deprecated Prefer title — mantido para compat. */
  label: string
  title: string
  /** @deprecated Prefer description */
  detail: string
  description: string
  bullets: string[]
  when: string
  whenDate: string
  whenTime: string
  tone: TimelineTone
  category: TimelineCategory
  status: TimelineStatusKind
  statusLabel: string
  /** Hash curto só para debug interno — não renderizar na UI do produto. */
  eventHashShort: string
  meta: {
    confidence?: number | null
    severityLabel?: string | null
    partName?: string | null
    damageTypeLabel?: string | null
    photoCount?: number | null
    inspectionCount?: number | null
    evidenceCount?: number | null
  }
}

const CATEGORY_BY_EVENT: Record<string, TimelineCategory> = {
  creation: 'inspecao',
  start: 'inspecao',
  change: 'inspecao',
  damage_create: 'inspecao',
  photo_capture: 'documento',
  ai_analysis: 'ia',
  human_decision: 'ia',
  review: 'inspecao',
  review_completed: 'inspecao',
  signature: 'documento',
  gps: 'documento',
  pdf_generation: 'documento',
  hash_generation: 'documento',
  issuance: 'documento',
  verification: 'documento',
  correction: 'alerta',
  cancellation: 'alerta',
  unauthorized_access_attempt: 'alerta',
  issued_mutation_attempt: 'alerta',
  issue_blocked_without_review: 'alerta',
  vehicle_created: 'geral',
  inspection_linked_to_vehicle: 'sincronizacao',
  comparison_created: 'comparacao',
  comparison_reviewed: 'comparacao',
  damage_marked_new: 'comparacao',
  damage_marked_existing: 'comparacao',
  damage_marked_changed: 'comparacao',
  damage_marked_uncertain: 'comparacao',
  comparison_exported: 'documento',
  photo_reuse_alert: 'alerta',
  photo_context_alert: 'alerta',
  merge_resolved: 'sincronizacao',
}

const LABELS: Record<string, { title: string; tone: TimelineTone; status: TimelineStatusKind }> = {
  creation: { title: 'Inspeção registrada', tone: 'neutral', status: 'pendente' },
  start: { title: 'Inspeção iniciada', tone: 'neutral', status: 'em_analise' },
  change: { title: 'Histórico atualizado', tone: 'neutral', status: 'validado' },
  damage_create: { title: 'Nova evidência registrada', tone: 'neutral', status: 'evidencias' },
  photo_capture: { title: 'Evidência fotográfica anexada', tone: 'ok', status: 'evidencias' },
  ai_analysis: { title: 'IA identificou alteração', tone: 'ai', status: 'em_analise' },
  human_decision: { title: 'Análise de IA validada', tone: 'ok', status: 'validado' },
  review: { title: 'Revisão em andamento', tone: 'ok', status: 'em_analise' },
  review_completed: { title: 'Revisão concluída', tone: 'ok', status: 'validado' },
  signature: { title: 'Assinatura registrada', tone: 'ok', status: 'assinado' },
  gps: { title: 'Localização registrada', tone: 'ok', status: 'validado' },
  pdf_generation: { title: 'Dossiê técnico gerado', tone: 'ok', status: 'validado' },
  hash_generation: { title: 'Integridade do dossiê registrada', tone: 'ok', status: 'validado' },
  issuance: { title: 'Dossiê emitido', tone: 'ok', status: 'assinado' },
  verification: { title: 'Verificação pública consultada', tone: 'neutral', status: 'validado' },
  correction: { title: 'Correção aberta', tone: 'warn', status: 'pendente' },
  cancellation: { title: 'Registro cancelado', tone: 'block', status: 'alerta' },
  unauthorized_access_attempt: { title: 'Tentativa de acesso bloqueada', tone: 'block', status: 'alerta' },
  issued_mutation_attempt: { title: 'Tentativa de alteração bloqueada', tone: 'block', status: 'alerta' },
  issue_blocked_without_review: { title: 'Emissão aguardando revisão', tone: 'block', status: 'pendente' },
  vehicle_created: { title: 'Prontuário do veículo criado', tone: 'neutral', status: 'validado' },
  inspection_linked_to_vehicle: { title: 'Inspeção vinculada ao histórico', tone: 'ok', status: 'sincronizado' },
  comparison_created: { title: 'Comparação concluída', tone: 'ai', status: 'em_analise' },
  comparison_reviewed: { title: 'Comparação revisada', tone: 'ok', status: 'validado' },
  damage_marked_new: { title: 'Novo dano identificado', tone: 'warn', status: 'validado' },
  damage_marked_existing: { title: 'Dano pré-existente confirmado', tone: 'ok', status: 'validado' },
  damage_marked_changed: { title: 'Evolução de dano registrada', tone: 'warn', status: 'validado' },
  damage_marked_uncertain: { title: 'Alteração sob análise', tone: 'warn', status: 'em_analise' },
  comparison_exported: { title: 'Documento do histórico gerado', tone: 'neutral', status: 'validado' },
  photo_reuse_alert: { title: 'Alerta de evidência reutilizada', tone: 'warn', status: 'alerta' },
  photo_context_alert: { title: 'Alerta de inconsistência na evidência', tone: 'warn', status: 'alerta' },
  merge_resolved: { title: 'Histórico sincronizado', tone: 'ok', status: 'sincronizado' },
}

const STATUS_LABEL: Record<TimelineStatusKind, string> = {
  validado: 'Validado',
  pendente: 'Pendente',
  em_analise: 'Em análise',
  evidencias: 'Evidências anexadas',
  assinado: 'Assinado',
  sincronizado: 'Sincronizado',
  alerta: 'Atenção',
}

/** Chaves técnicas — nunca na UI (salvo showIds interno). */
const TECHNICAL_KEYS = new Set([
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
  'comparison_id',
  'comparisonId',
  'identity_key',
  'identityKey',
  'decision',
  'source',
  'suggested_type',
  'suggestedType',
  'suggested_severity',
  'suggestedSeverity',
  'photo_id',
  'photoId',
  'match_photo_id',
  'matchPhotoId',
  'match_inspection_id',
  'matchInspectionId',
  'review_content_hash',
  'hamming',
  'payload',
  'stack',
  'raw',
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

function severityLabel(raw: string | null): string | null {
  if (!raw) return null
  const s = raw.toLowerCase()
  if (s === 'high' || s === 'alta') return 'Alta'
  if (s === 'medium' || s === 'media' || s === 'média') return 'Média'
  if (s === 'low' || s === 'baixa') return 'Baixa'
  return raw
}

function formatWhenParts(iso: string): { when: string; whenDate: string; whenTime: string } {
  try {
    const d = new Date(iso)
    const whenDate = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const whenTime = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return {
      when: `${whenDate} · ${whenTime}`,
      whenDate,
      whenTime,
    }
  } catch {
    return { when: iso, whenDate: iso, whenTime: '' }
  }
}

function resolvePresentation(
  eventType: string,
  meta: Record<string, unknown>,
): {
  title: string
  tone: TimelineTone
  status: TimelineStatusKind
  category: TimelineCategory
} {
  const mapped = LABELS[eventType] || {
    title: 'Evento registrado',
    tone: 'neutral' as TimelineTone,
    status: 'validado' as TimelineStatusKind,
  }
  let category = CATEGORY_BY_EVENT[eventType] || ('geral' as TimelineCategory)
  let title = mapped.title
  let tone = mapped.tone
  let status = mapped.status

  const kind = str(meta, 'kind')
  if (eventType === 'comparison_exported' && kind === 'vehicle_qr') {
    title = 'Link público do histórico gerado'
    category = 'documento'
  }
  if (eventType === 'inspection_linked_to_vehicle' && kind === 'hydrate_vehicle_reports') {
    title = 'Histórico sincronizado'
    category = 'sincronizacao'
    status = 'sincronizado'
    tone = 'ok'
  }
  if (eventType === 'change' && str(meta, 'source') === 'sync_upsert') {
    title = 'Dados sincronizados com a nuvem'
    category = 'sincronizacao'
    status = 'sincronizado'
  }
  if (eventType === 'ai_analysis') {
    const part = str(meta, 'part') ?? str(meta, 'partName')
    if (part) title = 'IA detectou novo dano'
  }

  return { title, tone, status, category }
}

/**
 * Descrição + bullets humanos — sem dump JSON e sem chaves técnicas.
 */
export function summarizeMetadata(
  meta: Record<string, unknown>,
  eventType?: string,
  options: TimelinePresentOptions = {},
): string {
  const { description, bullets } = narrateEvent(meta, eventType, options)
  if (bullets.length === 0) return description
  if (!description) return bullets.join(' · ')
  return [description, ...bullets].join(' · ')
}

export function narrateEvent(
  meta: Record<string, unknown>,
  eventType?: string,
  options: TimelinePresentOptions = {},
): { description: string; bullets: string[]; extras: TimelinePresentation['meta'] } {
  const showIds = options.showIds === true
  const bullets: string[] = []
  let description = ''
  const extras: TimelinePresentation['meta'] = {}
  const kind = str(meta, 'kind')

  if (kind === 'vehicle_qr') {
    const plate = str(meta, 'plate')
    description = plate
      ? `Link público do prontuário da placa ${plate} pronto para compartilhar.`
      : 'Link público do prontuário digital gerado com sucesso.'
  } else if (kind === 'hydrate_vehicle_reports') {
    const pulled = num(meta, 'pulled')
    const written = num(meta, 'written')
    if (written != null && written > 0) {
      description = 'Registros da nuvem foram baixados para este dispositivo.'
      bullets.push(`${written} inspeção${written === 1 ? '' : 'ões'} sincronizada${written === 1 ? '' : 's'}`)
      extras.inspectionCount = written
    } else if (pulled != null && pulled > 0) {
      description = 'O histórico local já estava atualizado com a nuvem.'
      bullets.push('Memória digital preservada')
    } else {
      description = 'Sincronização com a nuvem concluída.'
      bullets.push('Histórico íntegro')
    }
  }

  if (eventType === 'issuance' || eventType === 'hash_generation') {
    const code = str(meta, 'public_code')
    if (!description) {
      description =
        eventType === 'issuance'
          ? 'O dossiê técnico foi emitido e ficou disponível para verificação.'
          : 'A integridade criptográfica do dossiê foi registrada.'
    }
    if (code) bullets.push(`Código de verificação ${code}`)
  }

  if (eventType === 'change' || str(meta, 'source') === 'sync_upsert') {
    const status = str(meta, 'status')
    const damages = num(meta, 'damages_count') ?? num(meta, 'damagesCount')
    if (!description) description = 'As informações do veículo foram atualizadas no histórico.'
    if (status === 'issued') bullets.push('Dossiê emitido')
    else if (status === 'complete') bullets.push('Inspeção concluída')
    else if (status === 'draft') bullets.push('Rascunho em andamento')
    if (damages != null) {
      bullets.push(`${damages} dano${damages === 1 ? '' : 's'} no registro`)
      extras.photoCount = damages
    }
  }

  if (eventType === 'review_completed' || eventType === 'review') {
    const notes = str(meta, 'review_notes') ?? str(meta, 'notes')
    if (!description) description = 'A revisão humana do registro foi registrada.'
    if (notes) bullets.push(notes)
    else if (!kind) bullets.push('Sem observações adicionais')
  }

  if (eventType === 'inspection_linked_to_vehicle' && kind !== 'hydrate_vehicle_reports') {
    const plate = str(meta, 'plate')
    if (!description) description = 'A inspeção passou a fazer parte do prontuário deste veículo.'
    if (plate) bullets.push(`Placa ${plate}`)
  }

  if (eventType === 'photo_reuse_alert') {
    description = 'O sistema detectou possível reaproveitamento de evidência fotográfica.'
    const reuseKind = str(meta, 'kind')
    if (reuseKind === 'exact') bullets.push('Imagem idêntica a outra inspeção')
    else if (reuseKind === 'perceptual') bullets.push('Imagem muito similar a outra inspeção')
    else bullets.push('Revisar evidência anexada')
  }

  if (eventType === 'photo_context_alert') {
    description = 'Há inconsistência entre o contexto da foto e o da inspeção.'
    const detail = str(meta, 'detail')
    if (detail) bullets.push(detail)
    else {
      const ctxKind = str(meta, 'kind')
      if (ctxKind === 'gps_mismatch') bullets.push('Local da foto diverge do registro')
      else if (ctxKind === 'time_mismatch') bullets.push('Horário da foto diverge do registro')
    }
  }

  if (eventType === 'merge_resolved') {
    if (!description) description = 'Conflitos de sincronização foram resolvidos no histórico.'
    const localOnly = num(meta, 'damages_local_only')
    const remoteOnly = num(meta, 'damages_remote_only')
    if (localOnly != null || remoteOnly != null) {
      bullets.push(`Deste dispositivo: +${localOnly ?? 0}`)
      bullets.push(`De outro dispositivo: +${remoteOnly ?? 0}`)
    }
    if (meta.multi_contributor === true) bullets.push('Mais de um vistoriador contribuiu')
  }

  if (eventType === 'ai_analysis' || eventType === 'damage_marked_new') {
    const part = str(meta, 'part') ?? str(meta, 'partName')
    const sev = severityLabel(str(meta, 'severity') ?? str(meta, 'suggested_severity'))
    const conf = num(meta, 'confidence') ?? num(meta, 'score')
    if (!description) {
      description = part
        ? `A Inteligência Artificial identificou uma alteração em ${part}.`
        : 'A Inteligência Artificial identificou uma alteração no veículo.'
    }
    if (part) {
      bullets.push(`Componente: ${part}`)
      extras.partName = part
    }
    if (sev) {
      bullets.push(`Severidade: ${sev}`)
      extras.severityLabel = sev
    }
    if (conf != null) {
      const pct = conf <= 1 ? Math.round(conf * 100) : Math.round(conf)
      bullets.push(`Confiança ${pct}%`)
      extras.confidence = pct
    }
  }

  if (eventType === 'comparison_created' || eventType === 'comparison_reviewed') {
    if (!description) {
      description = 'A inspeção foi comparada com o registro anterior do veículo.'
    }
    const neu = num(meta, 'new') ?? num(meta, 'newDamages')
    const unc = num(meta, 'unchanged')
    if (neu != null) bullets.push(neu > 0 ? `${neu} novo${neu === 1 ? '' : 's'} dano${neu === 1 ? '' : 's'}` : 'Sem novos danos')
    if (unc != null) bullets.push(`Sem alterações em ${unc} componente${unc === 1 ? '' : 's'}`)
    bullets.push('Histórico atualizado')
  }

  if (eventType === 'damage_create' || eventType === 'photo_capture') {
    const part = str(meta, 'part') ?? str(meta, 'partName')
    if (!description) {
      description = part
        ? `Evidência registrada em ${part}.`
        : 'Nova evidência foi anexada ao prontuário.'
    }
    if (part) extras.partName = part
  }

  // Campos amigáveis adicionais (sem chaves técnicas)
  const friendly: Array<[string, string]> = [
    ['plate', 'Placa'],
    ['notes', 'Observação'],
    ['reason', 'Motivo'],
    ['role', 'Papel'],
    ['provider', 'Provedor'],
    ['public_code', 'Código'],
  ]
  for (const [key, label] of friendly) {
    const v = str(meta, key)
    if (!v) continue
    if (bullets.some((b) => b.includes(v))) continue
    if (description.includes(v)) continue
    bullets.push(`${label} ${v}`)
  }

  if (showIds) {
    for (const key of Object.keys(meta)) {
      if (!TECHNICAL_KEYS.has(key)) continue
      const v = str(meta, key)
      if (v) bullets.push(`${key}: ${v}`)
    }
  }

  if (!description && bullets.length === 0 && Object.keys(meta).length > 0) {
    const visibleKeys = Object.keys(meta).filter(
      (k) => k !== 'kind' && (showIds || !TECHNICAL_KEYS.has(k)),
    )
    for (const k of visibleKeys) {
      const v = str(meta, k)
      if (v && v.length <= 80 && !/^[0-9a-f-]{8,}$/i.test(v)) bullets.push(v)
    }
    if (!description && bullets.length === 0) {
      description = 'Evento registrado no prontuário digital.'
    }
  }

  if (!description && bullets.length > 0) {
    description = 'Detalhes do evento no histórico do veículo.'
  }

  return { description, bullets, extras }
}

export function presentAuditEvent(
  row: AuditLogRow,
  options: TimelinePresentOptions = {},
): TimelinePresentation {
  const meta = row.metadata || {}
  const resolved = resolvePresentation(row.event_type, meta)
  const { when, whenDate, whenTime } = formatWhenParts(row.timestamp)
  const narrated = narrateEvent(meta, row.event_type, options)
  const detail =
    narrated.bullets.length > 0
      ? [narrated.description, ...narrated.bullets].filter(Boolean).join(' · ')
      : narrated.description

  return {
    eventId: row.event_id,
    eventType: row.event_type,
    label: resolved.title,
    title: resolved.title,
    detail,
    description: narrated.description,
    bullets: narrated.bullets,
    when,
    whenDate,
    whenTime,
    tone: resolved.tone,
    category: resolved.category,
    status: resolved.status,
    statusLabel: STATUS_LABEL[resolved.status],
    eventHashShort: (row.event_hash || '').slice(0, 12).toUpperCase(),
    meta: narrated.extras,
  }
}

export function presentAuditTimeline(
  rows: AuditLogRow[],
  options: TimelinePresentOptions = {},
): TimelinePresentation[] {
  return rows.map((row) => presentAuditEvent(row, options))
}

export const TIMELINE_FILTERS: Array<{ id: TimelineCategory | 'todos'; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'inspecao', label: 'Inspeções' },
  { id: 'ia', label: 'IA' },
  { id: 'comparacao', label: 'Comparações' },
  { id: 'reparo', label: 'Reparos' },
  { id: 'documento', label: 'Documentos' },
  { id: 'sincronizacao', label: 'Sincronizações' },
  { id: 'venda', label: 'Venda' },
  { id: 'transferencia', label: 'Transferência' },
  { id: 'alerta', label: 'Alertas' },
]

export const CATEGORY_STYLE: Record<
  TimelineCategory,
  { badge: string; dot: string; ring: string; iconBg: string; label: string }
> = {
  inspecao: {
    label: 'Inspeção',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    dot: 'bg-sky-400',
    ring: 'ring-sky-500/20',
    iconBg: 'bg-sky-500/15 text-sky-300',
  },
  ia: {
    label: 'IA',
    badge: 'bg-[var(--primary)]/15 text-violet-300 border-[var(--primary)]/30',
    dot: 'bg-violet-400',
    ring: 'ring-violet-500/20',
    iconBg: 'bg-[var(--primary)]/15 text-violet-300',
  },
  comparacao: {
    label: 'Comparação',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    ring: 'ring-emerald-500/20',
    iconBg: 'bg-emerald-500/15 text-emerald-300',
  },
  reparo: {
    label: 'Reparo',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    dot: 'bg-orange-400',
    ring: 'ring-orange-500/20',
    iconBg: 'bg-orange-500/15 text-orange-300',
  },
  sincronizacao: {
    label: 'Sincronização',
    badge: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
    dot: 'bg-zinc-400',
    ring: 'ring-zinc-500/20',
    iconBg: 'bg-zinc-500/15 text-zinc-300',
  },
  venda: {
    label: 'Venda',
    badge: 'bg-green-800/30 text-green-300 border-green-700/40',
    dot: 'bg-green-600',
    ring: 'ring-green-700/20',
    iconBg: 'bg-green-800/25 text-green-300',
  },
  transferencia: {
    label: 'Transferência',
    badge: 'bg-teal-800/30 text-teal-200 border-teal-600/40',
    dot: 'bg-teal-500',
    ring: 'ring-teal-600/20',
    iconBg: 'bg-teal-800/25 text-teal-200',
  },
  documento: {
    label: 'Documento',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-400',
    ring: 'ring-indigo-500/20',
    iconBg: 'bg-indigo-500/15 text-indigo-300',
  },
  alerta: {
    label: 'Alerta',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
    ring: 'ring-rose-500/20',
    iconBg: 'bg-rose-500/15 text-rose-300',
  },
  geral: {
    label: 'Evento',
    badge: 'bg-[var(--card-bg-solid)] text-[var(--text-muted)] border-[var(--card-border)]',
    dot: 'bg-[var(--text-muted)]',
    ring: 'ring-[var(--card-border)]',
    iconBg: 'bg-[var(--card-bg-solid)] text-[var(--text-muted)]',
  },
}
