'use client';
import { useState, useEffect, useCallback } from 'react'
import { SavedReport, VehicleInfo, Damage, VehicleType } from '../types'
import { db } from '../lib/db'
import { mergeRemoteReports } from '../lib/sync'
import { supabaseEnabled } from '../lib/supabase'
import { createId } from '../lib/id'

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

  async function saveReport(vehicleInfo: VehicleInfo, damages: Damage[], vehicleType: VehicleType) {
    const report: SavedReport = {
      id: createId() as SavedReport['id'],
      savedAt: Date.now(),
      vehicleInfo,
      damages,
      vehicleType,
    }
    await db.putSaved(report)
    setSaved(prev => [report, ...prev])
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
