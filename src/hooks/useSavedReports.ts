'use client';
import { useState, useEffect } from 'react'
import { SavedReport, VehicleInfo, Damage } from '../types'
import { db } from '../lib/db'
import { pullRemote } from '../lib/sync'
import { supabaseEnabled } from '../lib/supabase'

export function useSavedReports(userId?: string) {
  const [saved, setSaved] = useState<SavedReport[]>([])

  useEffect(() => {
    db.getAllSaved().then(setSaved)
  }, [])

  useEffect(() => {
    if (!supabaseEnabled || !userId) return
    pullRemote(userId).then(async remote => {
      const local = await db.getAllSaved()
      const localIds = new Set(local.map(r => r.id))
      const missing = remote.filter(r => !localIds.has(r.id))
      for (const r of missing) await db.putSaved(r)
      if (missing.length > 0) setSaved(prev => [...missing, ...prev])
    })
  }, [userId])

  async function saveReport(vehicleInfo: VehicleInfo, damages: Damage[]) {
    const report: SavedReport = {
      id: Date.now().toString(),
      savedAt: Date.now(),
      vehicleInfo,
      damages,
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

  return { saved, saveReport, deleteReport }
}
