/**
 * FASE 6 — Review gate before issue.
 * complete → reviewed (human) → issued. Does not claim legal validity.
 */

import type { Damage, SavedReport, VehicleInfo } from '../../types'
import { appendAuditEvent } from '../audit/auditLog'

export class IssueBlockedWithoutReviewError extends Error {
  readonly code = 'issue_blocked_without_review' as const
  constructor(message = 'Emissão bloqueada: confirme a revisão humana antes de emitir o laudo') {
    super(message)
    this.name = 'IssueBlockedWithoutReviewError'
  }
}

export class ReviewContentStaleError extends Error {
  readonly code = 'review_content_stale' as const
  constructor(message = 'Conteúdo alterado após a revisão — revise novamente antes de emitir') {
    super(message)
    this.name = 'ReviewContentStaleError'
  }
}

export class ReviewFrozenError extends Error {
  readonly code = 'review_frozen' as const
  constructor(message = 'Campos congelados após revisão — reabra a revisão para editar') {
    super(message)
    this.name = 'ReviewFrozenError'
  }
}

export type MarkReviewedOpts = {
  reviewerId: string
  contentHash: string
  reviewedAt?: number
  notes?: string
}

/** Stable snapshot for review hash (vehicle + damages + version). */
export function buildReviewContentPayload(
  info: VehicleInfo,
  damages: Damage[],
  laudoVersion?: number | null,
): string {
  const geo = info.geo ? { lat: info.geo.lat, lng: info.geo.lng } : null
  return JSON.stringify({
    v: 1,
    laudoVersion: laudoVersion && laudoVersion > 0 ? laudoVersion : 1,
    geo,
    info: {
      owner: info.owner,
      phone: info.phone,
      brand: info.brand,
      plate: info.plate,
      generalNotes: info.generalNotes,
      interiorNotes: info.interiorNotes,
      interiorPhotos: info.interiorPhotos,
      interiorPhotoNotes: info.interiorPhotoNotes,
      profile: info.profile,
      ref: info.ref,
      color: info.color,
      vehicleTypeDesc: info.vehicleTypeDesc,
      city: info.city,
      state: info.state,
      cpf: info.cpf,
      cnh: info.cnh,
      cnhCategory: info.cnhCategory,
      inspectorSignature: info.inspectorSignature,
      clientSignature: info.clientSignature,
      customFields: info.customFields,
    },
    damages: damages.map((d) => ({
      vehicle: d.vehicle,
      view: d.view,
      partId: d.partId,
      partName: d.partName,
      type: d.type,
      typeName: d.typeName,
      severity: d.severity,
      notes: d.notes,
      photos: d.photos,
      photoNotes: d.photoNotes,
    })),
  })
}

export async function computeReviewContentHash(
  info: VehicleInfo,
  damages: Damage[],
  laudoVersion?: number | null,
): Promise<string> {
  const payload = buildReviewContentPayload(info, damages, laudoVersion)
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
    .toUpperCase()
}

export function isReviewed(report: Pick<SavedReport, 'reviewedAt' | 'reviewerId' | 'reviewContentHash'>): boolean {
  return Boolean(report.reviewedAt && report.reviewerId && report.reviewContentHash)
}

export function canMutateInspectionFields(
  report: Pick<SavedReport, 'reviewedAt' | 'status'>,
): boolean {
  if (report.status === 'issued' || report.status === 'superseded' || report.status === 'cancelled') {
    return false
  }
  return !report.reviewedAt
}

export function assertCanMutateInspectionFields(
  report: Pick<SavedReport, 'reviewedAt' | 'status'>,
): void {
  if (!canMutateInspectionFields(report)) {
    throw new ReviewFrozenError()
  }
}

export function markAsReviewed(report: SavedReport, opts: MarkReviewedOpts): SavedReport {
  if (report.status === 'issued' || report.status === 'superseded' || report.status === 'cancelled') {
    throw new Error('Laudo emitido/cancelado não pode ser marcado como revisado neste registro')
  }
  const reviewedAt = opts.reviewedAt ?? Date.now()
  return {
    ...report,
    reviewerId: opts.reviewerId,
    reviewedAt,
    reviewNotes: opts.notes?.trim() || undefined,
    reviewContentHash: opts.contentHash,
  }
}

export function clearReview(report: SavedReport): SavedReport {
  const next = { ...report }
  delete next.reviewerId
  delete next.reviewedAt
  delete next.reviewNotes
  delete next.reviewContentHash
  return next
}

export function canIssue(
  report: Pick<SavedReport, 'reviewedAt' | 'reviewerId' | 'reviewContentHash'>,
  expectedContentHash?: string,
): boolean {
  if (!isReviewed(report)) return false
  if (expectedContentHash && report.reviewContentHash !== expectedContentHash) return false
  return true
}

/**
 * Gate for complete → issued.
 * Pass `expectedContentHash` (current snapshot) to detect stale review.
 */
export function assertCanIssue(
  report: Pick<SavedReport, 'reviewedAt' | 'reviewerId' | 'reviewContentHash' | 'id'>,
  expectedContentHash?: string,
): void {
  if (!isReviewed(report)) {
    void appendAuditEvent({
      event_type: 'issue_blocked_without_review',
      inspection_id: report.id,
      metadata: { reason: 'missing_review' },
    })
    throw new IssueBlockedWithoutReviewError()
  }
  if (expectedContentHash && report.reviewContentHash !== expectedContentHash) {
    void appendAuditEvent({
      event_type: 'issue_blocked_without_review',
      inspection_id: report.id,
      metadata: { reason: 'stale_review_hash' },
    })
    throw new ReviewContentStaleError()
  }
}
