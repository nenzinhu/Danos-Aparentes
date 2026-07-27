'use client'
import { useState, useEffect, useCallback } from 'react'
import { SavedReport, VehicleInfo, Damage, VehicleType, InspectionStatus } from '../types'
import { db } from '../lib/db'
import { mergeRemoteReports } from '../lib/sync'
import { supabaseEnabled } from '../lib/supabase'
import { createId } from '../lib/id'
import {
  assertCanSaveInspection,
  createCorrectionDraft,
  isIssuedLocked,
  markAsIssued,
  markAsSuperseded,
} from '../lib/pdf/reportIssuance'

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
}

export function useSavedReports(userId?: string) {
  const [saved, setSaved] = useState<SavedReport[]>([])

  const refreshRemote = useCallback(async () => {
    if (!supabaseEnabled || !userId) return
    const merged = await mergeRemoteReports(userId)
    setSaved(merged)
  }, [userId])

  useEffect(() => {
    db.getAllSaved().then(setSaved)
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

    const existing = (await db.getAllSaved()).find(r => r.id === id)
    if (existing) {
      assertCanSaveInspection(existing.status, status)
    }

    const report: SavedReport = {
      id,
      savedAt: Date.now(),
      vehicleInfo,
      damages,
      vehicleType,
      status,
      publicCode: options?.publicCode ?? existing?.publicCode,
      laudoVersion: options?.laudoVersion ?? existing?.laudoVersion,
      parentInspectionId: options?.parentInspectionId ?? existing?.parentInspectionId,
      correctionReason: options?.correctionReason ?? existing?.correctionReason,
      correctedBy: options?.correctedBy ?? existing?.correctedBy,
      correctedAt: options?.correctedAt ?? existing?.correctedAt,
      issuedHash: options?.issuedHash ?? existing?.issuedHash,
    }
    await db.putSaved(report)
    setSaved(prev => {
      const without = prev.filter(r => r.id !== id)
      return [report, ...without]
    })
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

  /** Clone issued → new complete draft; leaves original untouched until correction is issued. */
  async function createCorrection(original: SavedReport, reason: string, correctedBy?: string) {
    const draft = createCorrectionDraft({
      original,
      reason,
      correctedBy: correctedBy || userId,
    })
    await db.putSaved(draft)
    setSaved(prev => [draft, ...prev.filter(r => r.id !== draft.id)])
    if (supabaseEnabled) {
      await db.addToSyncQueue({ type: 'upsert', reportId: draft.id, report: draft, timestamp: Date.now() })
    }
    return draft
  }

  /** After successful PDF hash: lock local snapshot as issued. */
  async function markReportIssued(id: string, hash: string) {
    const all = await db.getAllSaved()
    const existing = all.find(r => r.id === id)
    if (!existing) return null
    if (existing.status === 'issued') return existing
    const issued = markAsIssued(existing, { hash })
    await db.putSaved(issued)
    setSaved(prev => prev.map(r => (r.id === id ? issued : r)))
    if (supabaseEnabled) {
      await db.addToSyncQueue({ type: 'upsert', reportId: issued.id, report: issued, timestamp: Date.now() })
    }

    // If this was a correction, mark parent superseded (previous never deleted).
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

  return { saved, saveReport, deleteReport, refreshRemote, createCorrection, markReportIssued }
}
