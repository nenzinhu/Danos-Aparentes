/**
 * Inteligência do prontuário digital — KPIs, integridade e deltas.
 * Puro: sem I/O. Alimenta o painel executivo e o resumo do histórico.
 */

import type { SavedReport, VehicleType } from '../../types'
import type { VehicleHistorySummaryWithCloud } from './mergeRemoteVehicles'

export type AiStatusKind = 'validada' | 'em_analise' | 'pendente' | 'sem_dados'

export type ProntuarioStatusTone = 'ok' | 'warn' | 'info'

export type ProntuarioStatusLine = {
  tone: ProntuarioStatusTone
  text: string
}

export type ContextualKpi = {
  id: string
  label: string
  value: string | number
  hint: string
  href?: string
}

export type ExecutiveMetric = {
  id: string
  label: string
  value: string
  tone?: 'default' | 'signal' | 'warn' | 'ok'
}

export type ProntuarioIntel = {
  integrityPct: number
  lastInspectionLabel: string
  lastInspectionAt: number | null
  inspectionCount: number
  eventEstimate: number
  activeDamages: number
  evidenceCount: number
  lastSyncLabel: string
  aiStatus: AiStatusKind
  aiStatusLabel: string
  aiConfidenceAvg: number | null
  newDamages: number
  removedOrRepaired: number
  pendingCount: number
  issuedCount: number
  avgDaysBetween: number | null
  daysSinceLast: number | null
  totalChanges: number
  vehicleType: VehicleType
  modelLabel: string
  color: string
  year: string
  plate: string
  historyStatusLabel: string
  executiveMetrics: ExecutiveMetric[]
  contextualKpis: ContextualKpi[]
  statusLines: ProntuarioStatusLine[]
  summaryRows: { label: string; value: string; tone?: 'default' | 'ok' | 'warn' }[]
}

function countEvidence(reports: SavedReport[]): number {
  let n = 0
  for (const r of reports) {
    for (const d of r.damages) n += d.photos?.length || 0
    n += r.vehicleInfo.interiorPhotos?.length || 0
    if (r.vehicleInfo.viewPhotos) {
      n += Object.values(r.vehicleInfo.viewPhotos).filter(Boolean).length
    }
  }
  return n
}

function formatRelativePast(ts: number | null, now = Date.now()): string {
  if (ts == null || !Number.isFinite(ts)) return '—'
  const diff = Math.max(0, now - ts)
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'Agora'
  if (min < 60) return `Há ${min} min`
  const hours = Math.floor(min / 60)
  if (hours < 24) {
    const d = new Date(ts)
    const today = new Date(now)
    if (d.toDateString() === today.toDateString()) {
      return `Hoje às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }
    return `Há ${hours}h`
  }
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Ontem'
  if (days < 30) return `Há ${days} dias`
  return new Date(ts).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function resolveVehicleType(vehicle: VehicleHistorySummaryWithCloud): VehicleType {
  const raw = vehicle.vehicleType || vehicle.reports[vehicle.reports.length - 1]?.vehicleType
  const allowed: VehicleType[] = [
    'car',
    'car2d',
    'moto',
    'motoneta',
    'truck',
    'van',
    'bus',
    'microbus',
    'custom',
  ]
  if (raw && (allowed as string[]).includes(raw)) return raw as VehicleType
  return 'car'
}

function averageAiConfidence(reports: SavedReport[]): number | null {
  const scores: number[] = []
  for (const r of reports) {
    for (const d of r.damages) {
      if (d.evidenceStatus === 'confirmado') scores.push(95)
      else if (d.evidenceStatus === 'sugerido') scores.push(70)
      else if (d.evidenceStatus === 'ignorado') scores.push(40)
    }
  }
  if (scores.length === 0) return null
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

function resolveAiStatus(reports: SavedReport[], confidence: number | null): {
  kind: AiStatusKind
  label: string
} {
  const statuses = reports.flatMap((r) => r.damages.map((d) => d.evidenceStatus).filter(Boolean))
  if (statuses.length === 0 && confidence == null) {
    return { kind: 'sem_dados', label: 'Sem dados' }
  }
  if (statuses.some((s) => s === 'sugerido')) {
    return { kind: 'em_analise', label: 'Em análise' }
  }
  if (statuses.some((s) => s === 'confirmado') || (confidence != null && confidence >= 80)) {
    return { kind: 'validada', label: 'Validada' }
  }
  if (statuses.length > 0) return { kind: 'pendente', label: 'Pendente' }
  return { kind: 'sem_dados', label: 'Sem dados' }
}

/** Estimativa de peças reparadas / removidas entre as duas últimas inspeções. */
export function estimateDamageDelta(prev: SavedReport | null, curr: SavedReport | null): {
  newCount: number
  removedCount: number
} {
  if (!prev || !curr) return { newCount: 0, removedCount: 0 }
  const prevKeys = new Set(prev.damages.map((d) => `${d.partId}|${d.type}`))
  const currKeys = new Set(curr.damages.map((d) => `${d.partId}|${d.type}`))
  let newCount = 0
  let removedCount = 0
  for (const k of currKeys) if (!prevKeys.has(k)) newCount++
  for (const k of prevKeys) if (!currKeys.has(k)) removedCount++
  return { newCount, removedCount }
}

function integrityScore(input: {
  reports: SavedReport[]
  cloudPending: number
  evidenceCount: number
  newDamages: number
  issuedCount: number
  syncedRatio: number
}): number {
  if (input.reports.length === 0 && input.cloudPending === 0) return 0
  let score = 55
  if (input.reports.length >= 1) score += 10
  if (input.reports.length >= 2) score += 8
  if (input.evidenceCount > 0) score += 8
  if (input.evidenceCount >= 4) score += 4
  if (input.issuedCount > 0) score += 8
  score += Math.round(input.syncedRatio * 10)
  const withGeo = input.reports.filter((r) => r.vehicleInfo.geo).length
  if (withGeo > 0) score += 4
  const withSig = input.reports.filter(
    (r) => r.vehicleInfo.inspectorSignature || r.vehicleInfo.clientSignature,
  ).length
  if (withSig > 0) score += 4
  if (input.cloudPending > 0) score -= Math.min(18, input.cloudPending * 6)
  if (input.newDamages > 3) score -= 4
  return Math.max(12, Math.min(99, score))
}

function avgDaysBetweenInspections(reports: SavedReport[]): number | null {
  if (reports.length < 2) return null
  const sorted = [...reports].sort((a, b) => a.savedAt - b.savedAt)
  let sum = 0
  for (let i = 1; i < sorted.length; i++) {
    sum += Math.max(0, sorted[i].savedAt - sorted[i - 1].savedAt)
  }
  const avgMs = sum / (sorted.length - 1)
  return Math.max(0, Math.round(avgMs / 86_400_000))
}

export function computeProntuarioIntel(
  vehicle: VehicleHistorySummaryWithCloud,
  opts?: { cloudPendingCount?: number; eventCount?: number; now?: number },
): ProntuarioIntel {
  const now = opts?.now ?? Date.now()
  const reports = [...vehicle.reports].sort((a, b) => a.savedAt - b.savedAt)
  const last = reports[reports.length - 1] ?? null
  const prev = reports.length >= 2 ? reports[reports.length - 2] : null
  const cloudPending = opts?.cloudPendingCount ?? 0
  const evidenceCount = countEvidence(reports)
  const delta = estimateDamageDelta(prev, last)
  const newDamages = vehicle.newDamagesOnLast > 0 ? vehicle.newDamagesOnLast : delta.newCount
  const removedOrRepaired = delta.removedCount
  const issuedCount = reports.filter((r) => r.status === 'issued').length
  const pendingCount =
    reports.filter((r) => r.syncedAt == null || r.syncedAt < r.savedAt).length + cloudPending
  const synced = reports.filter((r) => r.syncedAt != null && r.syncedAt >= r.savedAt).length
  const syncedRatio = reports.length ? synced / reports.length : 0
  const lastSyncAt = Math.max(
    0,
    ...reports.map((r) => r.syncedAt || 0).filter((n) => n > 0),
  )
  const aiConfidenceAvg = averageAiConfidence(reports)
  const ai = resolveAiStatus(reports, aiConfidenceAvg)
  const integrityPct = integrityScore({
    reports,
    cloudPending,
    evidenceCount,
    newDamages,
    issuedCount,
    syncedRatio,
  })
  const avgDaysBetween = avgDaysBetweenInspections(reports)
  const lastAt = last?.savedAt ?? vehicle.lastInspectedAt
  const daysSinceLast =
    lastAt != null ? Math.max(0, Math.floor((now - lastAt) / 86_400_000)) : null
  const fipe = vehicle.fipe ?? [...reports].reverse().find((r) => r.vehicleInfo.fipe)?.vehicleInfo.fipe
  const year = fipe?.anoModelo || ''
  const modelLabel =
    [fipe?.textoMarca, fipe?.textoModelo].filter(Boolean).join(' ') ||
    vehicle.brand ||
    'Veículo'
  const color = vehicle.color || last?.vehicleInfo.color || ''
  const plate = vehicle.plate || String(last?.vehicleInfo.plate || '')
  const historyStatusLabel =
    integrityPct >= 85 ? 'Íntegro' : integrityPct >= 60 ? 'Monitorar' : 'Incompleto'
  const eventEstimate = opts?.eventCount ?? Math.max(
    reports.length * 3 + (newDamages > 0 ? 1 : 0) + cloudPending,
    reports.length,
  )
  const totalChanges = newDamages + removedOrRepaired

  const executiveMetrics: ExecutiveMetric[] = [
    {
      id: 'integrity',
      label: 'Integridade do Histórico',
      value: `${integrityPct}%`,
      tone: integrityPct >= 85 ? 'ok' : integrityPct >= 60 ? 'signal' : 'warn',
    },
    {
      id: 'last',
      label: 'Última inspeção',
      value: lastAt != null ? formatRelativePast(lastAt, now) : 'Sem inspeção',
      tone: 'default',
    },
    {
      id: 'inspections',
      label: 'Inspeções',
      value: String(reports.length + cloudPending),
      tone: 'default',
    },
    {
      id: 'events',
      label: 'Eventos',
      value: String(eventEstimate),
      tone: 'default',
    },
    {
      id: 'damages',
      label: 'Danos ativos',
      value: String(vehicle.activeDamageCount),
      tone: vehicle.activeDamageCount > 0 ? 'warn' : 'ok',
    },
    {
      id: 'evidence',
      label: 'Evidências',
      value: String(evidenceCount),
      tone: 'default',
    },
    {
      id: 'sync',
      label: 'Última sincronização',
      value: lastSyncAt > 0 ? formatRelativePast(lastSyncAt, now) : pendingCount > 0 ? 'Pendente' : 'Sem sincronização',
      tone: pendingCount > 0 ? 'warn' : 'ok',
    },
    {
      id: 'ai',
      label: 'Status da IA',
      value: ai.label,
      tone:
        ai.kind === 'validada' ? 'ok' : ai.kind === 'em_analise' ? 'signal' : ai.kind === 'pendente' ? 'warn' : 'default',
    },
  ]

  const compareHref = `/app/vehicles/${encodeURIComponent(vehicle.id)}/compare`
  const contextualKpis: ContextualKpi[] = [
    {
      id: 'inspections',
      label: 'Inspeções',
      value: reports.length + cloudPending,
      hint:
        daysSinceLast == null
          ? 'Aguardando primeiro registro'
          : daysSinceLast === 0
            ? 'Atualizado hoje'
            : `Última há ${daysSinceLast} dia${daysSinceLast === 1 ? '' : 's'}`,
    },
    {
      id: 'damages',
      label: 'Danos',
      value: vehicle.activeDamageCount,
      hint:
        newDamages > 0
          ? `+${newDamages} desde a última inspeção`
          : removedOrRepaired > 0
            ? `${removedOrRepaired} ${removedOrRepaired === 1 ? 'possível reparo' : 'possíveis reparos'}`
            : 'Sem alteração recente',
    },
    {
      id: 'evidences',
      label: 'Evidências',
      value: evidenceCount,
      hint:
        evidenceCount === 0
          ? 'Nenhuma foto anexada'
          : lastAt && daysSinceLast === 0
            ? 'Última enviada hoje'
            : `${evidenceCount} arquivo${evidenceCount === 1 ? '' : 's'} no prontuário`,
    },
    {
      id: 'comparisons',
      label: 'Comparações',
      value: reports.length >= 2 ? Math.max(1, reports.length - 1) : 0,
      hint: reports.length >= 2 ? 'Histórico comparável' : 'Clique para comparar',
      href: compareHref,
    },
    {
      id: 'events',
      label: 'Eventos',
      value: eventEstimate,
      hint: avgDaysBetween != null ? `Média ${avgDaysBetween}d entre inspeções` : 'Linha do tempo ativa',
    },
    {
      id: 'ai',
      label: 'Análises IA',
      value: aiConfidenceAvg != null ? `${aiConfidenceAvg}%` : ai.label,
      hint:
        ai.kind === 'validada'
          ? 'Validação humana concluída'
          : ai.kind === 'em_analise'
            ? 'Aguardando revisão'
            : 'Sem análise recente',
    },
  ]

  const statusLines: ProntuarioStatusLine[] = [
    {
      tone: integrityPct >= 85 ? 'ok' : integrityPct >= 60 ? 'warn' : 'warn',
      text:
        integrityPct >= 85
          ? 'Histórico íntegro'
          : integrityPct >= 60
            ? `Integridade em ${integrityPct}% — monitore pendências`
            : `Histórico incompleto (${integrityPct}%)`,
    },
    {
      tone: vehicle.activeDamageCount > 0 ? 'warn' : 'ok',
      text:
        vehicle.activeDamageCount > 0
          ? `Possui ${vehicle.activeDamageCount} dano${vehicle.activeDamageCount === 1 ? '' : 's'} ativo${vehicle.activeDamageCount === 1 ? '' : 's'}`
          : 'Nenhum dano ativo no último registro',
    },
    {
      tone: newDamages > 0 ? 'warn' : 'ok',
      text:
        newDamages > 0
          ? `${newDamages} novo${newDamages === 1 ? '' : 's'} dano${newDamages === 1 ? '' : 's'} desde a inspeção anterior`
          : 'Nenhuma inconsistência encontrada na comparação',
    },
    {
      tone: ai.kind === 'validada' || ai.kind === 'sem_dados' ? 'ok' : 'info',
      text:
        ai.kind === 'validada'
          ? 'Última validação de IA concluída'
          : ai.kind === 'em_analise'
            ? 'IA aguardando validação humana'
            : pendingCount > 0
              ? `${pendingCount} pendência${pendingCount === 1 ? '' : 's'} de sincronização`
              : 'Última validação concluída',
    },
  ]

  const summaryRows: ProntuarioIntel['summaryRows'] = [
    { label: 'Última inspeção', value: formatRelativePast(lastAt, now) },
    {
      label: 'Comparado com anterior',
      value: prev ? 'Sim' : reports.length <= 1 ? 'Aguardando 2ª inspeção' : 'Indisponível',
      tone: prev ? 'ok' : 'default',
    },
    {
      label: 'Novos danos',
      value: String(newDamages),
      tone: newDamages > 0 ? 'warn' : 'ok',
    },
    {
      label: 'Reparos detectados',
      value: removedOrRepaired > 0 ? String(removedOrRepaired) : '0',
      tone: removedOrRepaired > 0 ? 'ok' : 'default',
    },
    {
      label: 'Pendências',
      value: String(pendingCount),
      tone: pendingCount > 0 ? 'warn' : 'ok',
    },
    {
      label: 'Integridade',
      value: `${integrityPct}% · ${historyStatusLabel}`,
      tone: integrityPct >= 85 ? 'ok' : 'warn',
    },
    {
      label: 'Confiabilidade da IA',
      value:
        aiConfidenceAvg != null
          ? `${aiConfidenceAvg}% · ${ai.label}`
          : ai.label,
      tone: ai.kind === 'validada' ? 'ok' : ai.kind === 'em_analise' ? 'warn' : 'default',
    },
  ]

  return {
    integrityPct,
    lastInspectionLabel: formatRelativePast(lastAt, now),
    lastInspectionAt: lastAt,
    inspectionCount: reports.length + cloudPending,
    eventEstimate,
    activeDamages: vehicle.activeDamageCount,
    evidenceCount,
    lastSyncLabel:
      lastSyncAt > 0 ? formatRelativePast(lastSyncAt, now) : pendingCount > 0 ? 'Pendente' : 'Sem sincronização',
    aiStatus: ai.kind,
    aiStatusLabel: ai.label,
    aiConfidenceAvg,
    newDamages,
    removedOrRepaired,
    pendingCount,
    issuedCount,
    avgDaysBetween,
    daysSinceLast,
    totalChanges,
    vehicleType: resolveVehicleType(vehicle),
    modelLabel,
    color,
    year,
    plate,
    historyStatusLabel,
    executiveMetrics,
    contextualKpis,
    statusLines,
    summaryRows,
  }
}
