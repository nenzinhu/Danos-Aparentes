import type { AuditLogRow } from '@/src/lib/audit/auditLog'
import {
  presentAuditTimeline,
  type TimelineCategory,
  type TimelinePresentation,
  type TimelineStatusKind,
} from '@/src/lib/audit/timelinePresent'
import type { VehicleHistorySummaryWithCloud } from '@/src/lib/vehicleEvidence'
import { filterDamagesForPdf } from '@/src/lib/evidenceStatus'
import type { SavedReport } from '@/src/types'

export type StoryItem = {
  id: string
  sortAt: number
  category: TimelineCategory
  title: string
  description: string
  bullets: string[]
  whenDate: string
  whenTime: string
  status: TimelineStatusKind
  statusLabel: string
  href?: string
  actionLabel?: string
  photoRefs?: string[]
  photoCount?: number
  damageCount?: number
  evidenceCount?: number
  responsible?: string
  aiResultLabel?: string
  aiConfidence?: number | null
  stageHint?: string
  aiBlock?: {
    confidence?: number | null
    severityLabel?: string | null
    partName?: string | null
  }
  source: 'inspection' | 'audit' | 'insight'
}

export type RemoteInspection = {
  id: string
  plate?: string | null
  status?: string | null
  public_code?: string | null
  updated_at?: string | null
  issued_at?: string | null
}

export function formatParts(ts: number | string): { whenDate: string; whenTime: string; sortAt: number } {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  const sortAt = d.getTime() || 0
  return {
    sortAt,
    whenDate: Number.isFinite(sortAt)
      ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—',
    whenTime: Number.isFinite(sortAt)
      ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '',
  }
}

export function statusFromReport(r: SavedReport): { status: TimelineStatusKind; statusLabel: string } {
  if (r.status === 'issued') return { status: 'assinado', statusLabel: 'Assinado' }
  if (r.syncedAt == null || r.syncedAt < r.savedAt) {
    return { status: 'pendente', statusLabel: 'Pendente' }
  }
  if (r.status === 'complete') return { status: 'validado', statusLabel: 'Validado' }
  return { status: 'em_analise', statusLabel: 'Em análise' }
}

export function statusIcon(kind: TimelineStatusKind): string {
  switch (kind) {
    case 'validado':
      return '✔'
    case 'pendente':
      return '⏳'
    case 'em_analise':
      return '🔄'
    case 'evidencias':
      return '📷'
    case 'assinado':
      return '✍'
    case 'sincronizado':
      return '☁'
    case 'alerta':
      return '⚠'
    default:
      return '•'
  }
}

export function categoryGlyph(cat: TimelineCategory): string {
  switch (cat) {
    case 'inspecao':
      return '◎'
    case 'ia':
      return '✦'
    case 'comparacao':
      return '⇄'
    case 'reparo':
      return '⚒'
    case 'sincronizacao':
      return '☁'
    case 'venda':
      return '◆'
    case 'transferencia':
      return '⇢'
    case 'documento':
      return '▣'
    case 'alerta':
      return '!'
    default:
      return '•'
  }
}

function collectPhotoRefs(report: SavedReport, max = 4): string[] {
  const refs: string[] = []
  for (const d of report.damages) {
    for (const p of d.photos || []) {
      if (p && !refs.includes(p)) refs.push(p)
      if (refs.length >= max) return refs
    }
  }
  return refs
}

function countReportEvidence(report: SavedReport): number {
  let n = report.damages.reduce((acc, d) => acc + (d.photos?.length || 0), 0)
  n += report.vehicleInfo.interiorPhotos?.length || 0
  if (report.vehicleInfo.viewPhotos) {
    n += Object.values(report.vehicleInfo.viewPhotos).filter(Boolean).length
  }
  return n
}

function aiLabelFromReport(r: SavedReport): { label?: string; confidence?: number | null } {
  const statuses = r.damages.map((d) => d.evidenceStatus).filter(Boolean)
  if (statuses.some((s) => s === 'sugerido')) return { label: 'IA: em análise', confidence: 70 }
  if (statuses.some((s) => s === 'confirmado')) return { label: 'IA: 98%', confidence: 98 }
  if (statuses.length === 0) return {}
  return { label: 'IA: revisada', confidence: 85 }
}

export function buildInspectionStories(
  vehicle: VehicleHistorySummaryWithCloud,
  cloudOnly: RemoteInspection[],
): StoryItem[] {
  const items: StoryItem[] = []

  for (const r of vehicle.reports) {
    const { whenDate, whenTime, sortAt } = formatParts(r.savedAt)
    const st = statusFromReport(r)
    const damageCount = filterDamagesForPdf(r.damages).length
    const evidenceCount = countReportEvidence(r)
    const photoCount = r.damages.reduce((n, d) => n + (d.photos?.length || 0), 0)
    const ai = aiLabelFromReport(r)
    const responsible =
      r.vehicleInfo.owner?.trim() ||
      (r.vehicleInfo.inspectorSignature ? 'Responsável assinado' : 'Equipe de vistoria')
    items.push({
      id: `insp-${r.id}`,
      sortAt,
      category: 'inspecao',
      title: 'Nova inspeção',
      description:
        damageCount === 0
          ? 'O estado do veículo foi documentado sem avarias aparentes neste momento.'
          : `Registro com ${damageCount} dano${damageCount === 1 ? '' : 's'} mapeado${damageCount === 1 ? '' : 's'} no diagrama.`,
      bullets: [
        evidenceCount > 0
          ? `${evidenceCount} evidência${evidenceCount === 1 ? '' : 's'} fotográfica${evidenceCount === 1 ? '' : 's'}`
          : 'Diagrama atualizado',
        ...(r.vehicleInfo.geo?.address ? [`Local: ${r.vehicleInfo.geo.address}`] : []),
        ...(r.publicCode ? [`Dossiê ${r.publicCode}`] : []),
        photoCount > 0 ? `${photoCount} foto${photoCount === 1 ? '' : 's'} anexada${photoCount === 1 ? '' : 's'}` : '',
      ].filter(Boolean),
      whenDate,
      whenTime,
      status: st.status,
      statusLabel: st.statusLabel,
      href: `/app/vehicles/${encodeURIComponent(vehicle.id)}/compare`,
      actionLabel: 'Comparar inspeções',
      photoRefs: collectPhotoRefs(r),
      photoCount,
      damageCount,
      evidenceCount,
      responsible,
      aiResultLabel: ai.label,
      aiConfidence: ai.confidence,
      stageHint: 'Inspeção → evidências → validação',
      source: 'inspection',
    })
  }

  for (const r of cloudOnly) {
    const ts = r.updated_at || r.issued_at || Date.now()
    const { whenDate, whenTime, sortAt } = formatParts(ts)
    items.push({
      id: `cloud-${r.id}`,
      sortAt,
      category: 'sincronizacao',
      title: 'Sincronização pendente',
      description:
        'Há um registro remoto ainda incompleto neste dispositivo. Sincronize para ver danos e fotos.',
      bullets: [
        r.public_code ? `Dossiê ${r.public_code}` : 'Metadados remotos',
        'Aguardando sincronização',
      ],
      whenDate,
      whenTime,
      status: 'pendente',
      statusLabel: 'Pendente',
      responsible: 'Nuvem',
      stageHint: 'Sincronização',
      source: 'inspection',
    })
  }

  if (vehicle.newDamagesOnLast > 0) {
    const last = vehicle.reports[vehicle.reports.length - 1]
    const { whenDate, whenTime, sortAt } = formatParts(last?.savedAt ?? Date.now())
    items.push({
      id: `insight-new-${vehicle.id}`,
      sortAt: sortAt + 1,
      category: 'comparacao',
      title: 'Comparação com histórico',
      description: 'A inspeção foi comparada automaticamente com a anterior.',
      bullets: [
        `${vehicle.newDamagesOnLast} novo${vehicle.newDamagesOnLast === 1 ? '' : 's'} dano${vehicle.newDamagesOnLast === 1 ? '' : 's'} encontrado${vehicle.newDamagesOnLast === 1 ? '' : 's'}`,
        'Histórico atualizado',
      ],
      whenDate,
      whenTime,
      status: 'validado',
      statusLabel: 'Validado',
      href: `/app/vehicles/${encodeURIComponent(vehicle.id)}/compare`,
      actionLabel: 'Ver comparação',
      damageCount: vehicle.newDamagesOnLast,
      aiResultLabel: 'Sem divergências estruturais',
      stageHint: 'Comparação → resultado',
      source: 'insight',
    })
  }

  return items
}

export function auditToStory(p: TimelinePresentation, sortAt: number): StoryItem {
  return {
    id: `audit-${p.eventId}`,
    sortAt,
    category: p.category,
    title: p.title,
    description: p.description || p.detail,
    bullets: p.bullets,
    whenDate: p.whenDate,
    whenTime: p.whenTime,
    status: p.status,
    statusLabel: p.statusLabel,
    responsible: 'Sistema de auditoria',
    aiResultLabel:
      p.category === 'ia' && p.meta.confidence != null
        ? `IA: ${p.meta.confidence}%`
        : p.category === 'ia'
          ? 'IA processou imagens'
          : undefined,
    aiConfidence: p.meta.confidence,
    stageHint:
      p.category === 'ia'
        ? 'IA processou imagens'
        : p.category === 'sincronizacao'
          ? 'Sincronização'
          : p.category === 'comparacao'
            ? 'Comparação com histórico'
            : undefined,
    aiBlock:
      p.category === 'ia'
        ? {
            confidence: p.meta.confidence,
            severityLabel: p.meta.severityLabel,
            partName: p.meta.partName,
          }
        : undefined,
    source: 'audit',
  }
}

export function buildStories(
  vehicle: VehicleHistorySummaryWithCloud,
  cloudOnly: RemoteInspection[],
  auditRows: AuditLogRow[],
): StoryItem[] {
  const fromInsp = buildInspectionStories(vehicle, cloudOnly)
  const presented = presentAuditTimeline(auditRows)
  const fromAudit = presented.map((p) => {
    const sortAt = Date.parse(auditRows.find((r) => r.event_id === p.eventId)?.timestamp || '') || 0
    return auditToStory(p, sortAt)
  })
  return [...fromInsp, ...fromAudit].sort((a, b) => b.sortAt - a.sortAt)
}
