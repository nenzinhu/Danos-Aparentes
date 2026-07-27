import type { Damage, DamageId, InspectionStatus, ReportId, SavedReport, VehicleInfo } from '../../types'
import { createId } from '../id'
import { buildReportKey } from './hash'

/** Statuses whose inspection snapshot must not be mutated in place. */
export const LOCKED_STATUSES: readonly InspectionStatus[] = [
  'issued',
  'superseded',
  'cancelled',
]

export function isIssuedLocked(status?: InspectionStatus | null): boolean {
  return status === 'issued' || status === 'superseded' || status === 'cancelled'
}

export function canMutateInspectionContent(status?: InspectionStatus | null): boolean {
  return !isIssuedLocked(status)
}

/**
 * Human-facing public code.
 * Original: DA-2026-A1B2C3
 * Revision N (laudoVersion = N+1): DA-2026-A1B2C3-RN
 * Does not replace the QR hash — only a readable label alongside report_key/version.
 */
export function formatPublicCode(baseCode: string, version: number): string {
  const base = stripRevisionSuffix(baseCode)
  if (!base) return ''
  if (version <= 1) return base
  return `${base}-R${version - 1}`
}

export function stripRevisionSuffix(code: string): string {
  return (code || '').replace(/-R\d+$/i, '')
}

/**
 * Deterministic base code from plate+ref (same grouping as buildReportKey) + year.
 * Sync FNV-1a — no crypto dependency so UI/tests stay sync-friendly.
 */
export function deriveBasePublicCode(
  info: Pick<VehicleInfo, 'plate' | 'ref'>,
  year: number,
): string {
  const key = buildReportKey(info) || 'UNLINKED'
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 6)
  return `DA-${year}-${hex}`
}

export function nextLaudoVersion(parentVersion?: number | null): number {
  const v = parentVersion && parentVersion > 0 ? parentVersion : 1
  return v + 1
}

function cloneDamages(damages: Damage[]): Damage[] {
  return damages.map((d) => ({
    ...d,
    id: createId() as DamageId,
    photos: [...(d.photos || [])],
    photoNotes: [...(d.photoNotes || [])],
  }))
}

function cloneVehicleInfo(info: VehicleInfo): VehicleInfo {
  return {
    ...info,
    interiorPhotos: [...(info.interiorPhotos || [])],
    interiorPhotoNotes: [...(info.interiorPhotoNotes || [])],
    customFields: info.customFields?.map((f) => ({ ...f })),
    geo: info.geo ? { ...info.geo } : undefined,
  }
}

export type CorrectionInput = {
  original: SavedReport
  reason: string
  correctedBy?: string
  correctedAt?: number
  newId?: string
}

/**
 * Clone an issued inspection into a new editable complete draft.
 * Does not delete or mutate the original — caller marks original superseded on issue.
 */
export function createCorrectionDraft(input: CorrectionInput): SavedReport {
  const reason = input.reason.trim()
  if (!reason) {
    throw new Error('Motivo da correção é obrigatório')
  }
  if (input.original.status !== 'issued') {
    throw new Error('Só é possível criar correção a partir de um laudo emitido')
  }

  const now = input.correctedAt ?? Date.now()
  const version = nextLaudoVersion(input.original.laudoVersion)
  const year = new Date(input.original.savedAt || now).getUTCFullYear()
  const base =
    stripRevisionSuffix(input.original.publicCode || '') ||
    deriveBasePublicCode(input.original.vehicleInfo, year)

  return {
    id: (input.newId || createId()) as ReportId,
    savedAt: now,
    vehicleInfo: cloneVehicleInfo(input.original.vehicleInfo),
    damages: cloneDamages(input.original.damages),
    vehicleType: input.original.vehicleType,
    status: 'complete',
    publicCode: formatPublicCode(base, version),
    laudoVersion: version,
    parentInspectionId: input.original.id,
    correctionReason: reason,
    correctedBy: input.correctedBy,
    correctedAt: now,
  }
}

export type MarkIssuedOpts = {
  hash: string
  issuedAt?: number
  /** Prefer stable base already on the report; otherwise derive. */
  publicCodeBase?: string
}

/** Transition complete/draft → issued after a successful PDF hash register. */
export function markAsIssued(report: SavedReport, opts: MarkIssuedOpts): SavedReport {
  if (isIssuedLocked(report.status) && report.status !== 'issued') {
    throw new Error('Laudo cancelado ou substituído não pode ser reemitido neste registro')
  }
  const now = opts.issuedAt ?? Date.now()
  const year = new Date(now).getUTCFullYear()
  const version = report.laudoVersion && report.laudoVersion > 0 ? report.laudoVersion : 1
  const base =
    opts.publicCodeBase ||
    stripRevisionSuffix(report.publicCode || '') ||
    deriveBasePublicCode(report.vehicleInfo, year)

  return {
    ...report,
    status: 'issued',
    issuedHash: opts.hash,
    publicCode: formatPublicCode(base, version),
    laudoVersion: version,
    savedAt: now,
  }
}

export function markAsSuperseded(report: SavedReport, at = Date.now()): SavedReport {
  if (report.status !== 'issued') {
    throw new Error('Somente laudos emitidos podem ser marcados como substituídos')
  }
  return {
    ...report,
    status: 'superseded',
    savedAt: at,
  }
}

/**
 * Guard for upsert/save paths. Allows superseded transition metadata only
 * when explicitly requested via nextStatus.
 */
export function assertCanSaveInspection(
  existingStatus: InspectionStatus | undefined | null,
  nextStatus?: InspectionStatus,
): void {
  if (!isIssuedLocked(existingStatus)) return
  if (existingStatus === 'issued' && nextStatus === 'superseded') return
  throw new Error('Laudo emitido é imutável — use "Criar correção (nova versão)"')
}
