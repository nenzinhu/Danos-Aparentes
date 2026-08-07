'use client'
import { useState, useEffect, useCallback } from 'react'
import { SavedReport, VehicleInfo, Damage, VehicleType, InspectionStatus } from '../types'
import { db } from '../lib/db'
import { mergeRemoteReports } from '../lib/sync'
import { supabaseEnabled } from '../lib/supabase'
import { createId } from '../lib/id'
import { appendAuditEvent } from '../lib/audit/auditLog'
import {
  canExportLgpdForReport,
  canIssueReport,
  canReviewReport,
} from '../lib/auth/rbac'
import { resolveTenantContext } from '../lib/tenant/resolveTenant'
import {
  assertCanIssue,
  assertCanMutateInspectionFields,
  clearReview,
  computeReviewContentHash,
  isReviewed,
  markAsReviewed,
} from '../lib/pdf/reviewGate'
import {
  assertCanSaveInspection,
  createCorrectionDraft,
  isIssuedLocked,
  markAsIssued,
  markAsSuperseded,
} from '../lib/pdf/reportIssuance'
import { resolveVehicleIdForSave } from '../lib/vehicleEvidence/resolveVehicle'
import { backfillLocalVehicleIds } from '../lib/vehicleEvidence/backfillLocalVehicleIds'
import { trackFirstInspection } from '../lib/analytics/events'
import { completeOnboarding } from '../lib/onboarding'

export type SaveReportOptions = {
  /** Atualiza a mesma prévia/vistoria em vez de criar outra. */
  id?: string
  status?: InspectionStatus
  publicCode?: string
  laudoVersion?: number
  parentInspectionId?: string
  correctionReason?: string
  correctedBy?: string
  correctedAt?: number
  issuedHash?: string
  reviewerId?: string
  reviewedAt?: number
  reviewNotes?: string
  reviewContentHash?: string
  /** FK lógica para vehicles — preservada se já existir. */
  vehicleId?: string
  inspectionPurpose?: import('../types').InspectionPurpose
  baselineInspectionId?: string
}

export function useSavedReports(userId?: string) {
  const [saved, setSaved] = useState<SavedReport[]>([])
  const [mergeNotice, setMergeNotice] = useState<string | null>(null)

  const clearMergeNotice = useCallback(() => setMergeNotice(null), [])

  const refreshRemote = useCallback(async () => {
    if (!supabaseEnabled || !userId) return
    try {
      const { reports, merges } = await mergeRemoteReports(userId)
      // Nunca esvaziar a lista local se a sync falhar ou retornar vazia
      // inadvertidamente: só atualiza se houver um array válido.
      if (Array.isArray(reports)) setSaved(reports)
      const multi = merges.filter((m) => m.multiContributor)
      if (multi.length > 0) {
        const totalExtra = multi.reduce(
          (s, m) => s + m.damagesFromLocalOnly + m.damagesFromRemoteOnly,
          0,
        )
        setMergeNotice(
          multi.length === 1
            ? `Histórico mesclado na sync: contribuições de mais de um dispositivo (${totalExtra} dano(s) unidos).`
            : `${multi.length} vistorias mescladas na sync (multi-dispositivo).`,
        )
      }
    } catch (err) {
      // Falha de sync não deve zerar o histórico local já carregado.
      console.error('[sync] falha ao mesclar relatórios remotos:', err)
    }
  }, [userId])

  useEffect(() => {
    ;(async () => {
      const all = await db.getAllSaved()
      const { updated, changedCount } = backfillLocalVehicleIds(all)
      if (changedCount > 0) {
        for (const r of updated) {
          if (all.find((x) => x.id === r.id)?.vehicleId !== r.vehicleId) {
            await db.putSaved(r)
          }
        }
      }
      setSaved(updated)
    })()
  }, [])

  useEffect(() => {
    if (!supabaseEnabled || !userId) return
    ;(async () => {
      await refreshRemote()
    })()
  }, [userId, refreshRemote])

  async function saveReport(
    vehicleInfo: VehicleInfo,
    damages: Damage[],
    vehicleType: VehicleType,
    options?: SaveReportOptions,
  ) {
    const status: InspectionStatus = options?.status ?? 'complete'
    const id = (options?.id || createId()) as SavedReport['id']

    const allSaved = await db.getAllSaved()
    const existing = allSaved.find(r => r.id === id)
    if (existing) {
      assertCanSaveInspection(existing.status, status)
      if (isReviewed(existing)) {
        const version = existing.laudoVersion ?? 1
        const nextHash = await computeReviewContentHash(vehicleInfo, damages, version)
        if (nextHash !== existing.reviewContentHash) {
          assertCanMutateInspectionFields(existing)
        }
      }
    }

    const vehicleId =
      options?.vehicleId ??
      existing?.vehicleId ??
      resolveVehicleIdForSave(
        String(vehicleInfo.plate || ''),
        allSaved.filter(r => r.id !== id),
      )

    const report: SavedReport = {
      id,
      savedAt: Date.now(),
      vehicleInfo,
      damages,
      vehicleType,
      status,
      vehicleId,
      publicCode: options?.publicCode ?? existing?.publicCode,
      laudoVersion: options?.laudoVersion ?? existing?.laudoVersion,
      parentInspectionId: options?.parentInspectionId ?? existing?.parentInspectionId,
      correctionReason: options?.correctionReason ?? existing?.correctionReason,
      correctedBy: options?.correctedBy ?? existing?.correctedBy,
      correctedAt: options?.correctedAt ?? existing?.correctedAt,
      issuedHash: options?.issuedHash ?? existing?.issuedHash,
      reviewerId: options?.reviewerId ?? existing?.reviewerId,
      reviewedAt: options?.reviewedAt ?? existing?.reviewedAt,
      reviewNotes: options?.reviewNotes ?? existing?.reviewNotes,
      reviewContentHash: options?.reviewContentHash ?? existing?.reviewContentHash,
      inspectionPurpose: options?.inspectionPurpose ?? existing?.inspectionPurpose,
      baselineInspectionId: options?.baselineInspectionId ?? existing?.baselineInspectionId,
    }
    await db.putSaved(report)
    setSaved(prev => {
      const without = prev.filter(r => r.id !== id)
      return [report, ...without]
    })
    // Ativação: primeira vistoria salva neste navegador (funil landing → uso)
    if (!existing && allSaved.length === 0) {
      trackFirstInspection({ status })
      completeOnboarding()
    }
    if (supabaseEnabled) {
      await db.addToSyncQueue({ type: 'upsert', reportId: report.id, report, timestamp: Date.now() })
    }
    return report
  }

  async function deleteReport(id: string) {
    const existing = (await db.getAllSaved()).find(r => r.id === id)
    if (existing && isIssuedLocked(existing.status)) {
      throw new Error('Laudo emitido não pode ser excluído — use "Criar correção (nova versão)"')
    }
    await db.deleteSaved(id)
    setSaved(prev => prev.filter(r => r.id !== id))
    if (supabaseEnabled) {
      await db.addToSyncQueue({ type: 'delete', reportId: id, timestamp: Date.now() })
    }
  }

  async function createCorrection(original: SavedReport, reason: string, correctedBy?: string) {
    const draft = createCorrectionDraft({
      original,
      reason,
      correctedBy: correctedBy || userId,
    })
    const withVehicle: SavedReport = {
      ...draft,
      vehicleId: original.vehicleId || resolveVehicleIdForSave(
        String(original.vehicleInfo.plate || ''),
        (await db.getAllSaved()).filter(r => r.id !== draft.id),
        original.vehicleId,
      ),
    }
    await db.putSaved(withVehicle)
    setSaved(prev => [withVehicle, ...prev.filter(r => r.id !== withVehicle.id)])
    if (supabaseEnabled) {
      await db.addToSyncQueue({ type: 'upsert', reportId: withVehicle.id, report: withVehicle, timestamp: Date.now() })
    }
    void appendAuditEvent({
      event_type: 'correction',
      inspection_id: withVehicle.id,
      metadata: {
        parent_inspection_id: original.id,
        correction_reason: reason,
        laudo_version: withVehicle.laudoVersion ?? null,
        vehicle_id: withVehicle.vehicleId ?? null,
      },
    })
    return withVehicle
  }

  async function markReviewComplete(
    id: string,
    vehicleInfo: VehicleInfo,
    damages: Damage[],
    vehicleType: VehicleType,
    reviewerId: string,
    notes?: string,
  ) {
    const { role } = await resolveTenantContext(reviewerId)
    const reportOwnerId = userId || reviewerId
    if (!canReviewReport(role, reviewerId, reportOwnerId)) {
      throw new Error('Somente o gestor da equipe pode confirmar revisão deste laudo')
    }
    const all = await db.getAllSaved()
    const existing = all.find(r => r.id === id)
    const base: SavedReport = existing ?? {
      id: id as SavedReport['id'],
      savedAt: Date.now(),
      vehicleInfo,
      damages,
      vehicleType,
      status: 'complete',
    }
    const version = base.laudoVersion ?? 1
    const contentHash = await computeReviewContentHash(vehicleInfo, damages, version)
    const reviewed = markAsReviewed(
      { ...base, vehicleInfo, damages, vehicleType, status: base.status ?? 'complete' },
      { reviewerId, contentHash, notes, reviewedAt: Date.now() },
    )
    await db.putSaved(reviewed)
    setSaved(prev => {
      const without = prev.filter(r => r.id !== id)
      return [reviewed, ...without]
    })
    if (supabaseEnabled) {
      await db.addToSyncQueue({ type: 'upsert', reportId: reviewed.id, report: reviewed, timestamp: Date.now() })
    }
    void appendAuditEvent({
      event_type: 'review_completed',
      inspection_id: reviewed.id,
      metadata: {
        review_content_hash: contentHash,
        review_notes: reviewed.reviewNotes || '',
      },
    })
    return reviewed
  }

  async function clearReviewReport(id: string) {
    const existing = (await db.getAllSaved()).find(r => r.id === id)
    if (!existing) return null
    if (isIssuedLocked(existing.status)) {
      throw new Error('Laudo emitido não pode reabrir revisão — use correção (nova versão)')
    }
    const cleared = clearReview(existing)
    await db.putSaved(cleared)
    setSaved(prev => prev.map(r => (r.id === id ? cleared : r)))
    if (supabaseEnabled) {
      await db.addToSyncQueue({ type: 'upsert', reportId: cleared.id, report: cleared, timestamp: Date.now() })
    }
    return cleared
  }

  async function markReportIssued(id: string, hash: string) {
    const all = await db.getAllSaved()
    const existing = all.find(r => r.id === id)
    if (!existing) return null
    let bypassReview = false
    if (userId) {
      const { role } = await resolveTenantContext(userId)
      if (!canIssueReport(role)) {
        throw new Error('Permissão negada para emitir laudo')
      }
      // Inspetor pode emitir o próprio laudo sem permissão `review` (RBAC).
      bypassReview = role === 'inspector'
    }
    if (existing.status === 'issued') return existing
    const contentHash = await computeReviewContentHash(
      existing.vehicleInfo,
      existing.damages,
      existing.laudoVersion ?? 1,
    )
    assertCanIssue(existing, contentHash, { bypassReview })
    const issued = markAsIssued(existing, {
      hash,
      expectedContentHash: contentHash,
      bypassReview,
    })
    await db.putSaved(issued)
    setSaved(prev => prev.map(r => (r.id === id ? issued : r)))
    if (supabaseEnabled) {
      await db.addToSyncQueue({ type: 'upsert', reportId: issued.id, report: issued, timestamp: Date.now() })
    }

    void appendAuditEvent({
      event_type: 'issuance',
      inspection_id: issued.id,
      metadata: {
        hash,
        public_code: issued.publicCode || '',
        laudo_version: issued.laudoVersion ?? null,
        parent_inspection_id: issued.parentInspectionId || null,
      },
    })

    if (issued.parentInspectionId) {
      const parent = all.find(r => r.id === issued.parentInspectionId)
      if (parent && parent.status === 'issued') {
        const superseded = markAsSuperseded(parent)
        await db.putSaved(superseded)
        setSaved(prev => prev.map(r => (r.id === superseded.id ? superseded : r)))
        if (supabaseEnabled) {
          await db.addToSyncQueue({
            type: 'upsert',
            reportId: superseded.id,
            report: superseded,
            timestamp: Date.now(),
          })
        }
      }
    }
    return issued
  }

  return {
    saved,
    saveReport,
    deleteReport,
    refreshRemote,
    mergeNotice,
    clearMergeNotice,
    createCorrection,
    markReportIssued,
    markReviewComplete,
    clearReviewReport,
  }
}
