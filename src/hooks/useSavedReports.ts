'use client';
import { useState, useEffect, useCallback } from 'react'
import { SavedReport, VehicleInfo, Damage, VehicleType, InspectionStatus } from '../types'
import { db } from '../lib/db'
import { mergeRemoteReports } from '../lib/sync'
import { supabaseEnabled } from '../lib/supabase'
import { createId } from '../lib/id'

export type SaveReportOptions = {
  /** Atualiza a mesma prévia/vistoria em vez de criar outra. */
  id?: string
  status?: InspectionStatus
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
    void refreshRemote()
  }, [userId, refreshRemote])

  async function saveReport(
    vehicleInfo: VehicleInfo,
    damages: Damage[],
    vehicleType: VehicleType,
    options?: SaveReportOptions,
  ) {
    const status: InspectionStatus = options?.status ?? 'complete'
    const id = (options?.id || createId()) as SavedReport['id']
    const report: SavedReport = {
      id,
      savedAt: Date.now(),
      vehicleInfo,
      damages,
      vehicleType,
      status,
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
    await db.deleteSaved(id)
    setSaved(prev => prev.filter(r => r.id !== id))
    if (supabaseEnabled) {
      await db.addToSyncQueue({ type: 'delete', reportId: id, timestamp: Date.now() })
    }
  }

  return { saved, saveReport, deleteReport, refreshRemote }
}
