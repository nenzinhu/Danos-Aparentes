import { useState, useEffect, useCallback, useRef } from 'react'
import { SavedReport } from '../types'
import { db, SyncQueueItem } from './db'
import { supabase, supabaseEnabled } from './supabase'
import { uploadDamagePhotosForSync, uploadInteriorPhotosForSync, normalizeDamagePhotos, prefetchReportPhotoCache } from './photoStore'
import { deleteInspectionPhotos } from './photoStorage'
import { mapRemoteInspection } from './reportMapping'

function inspectionRow(r: SavedReport, userId: string) {
  const v = r.vehicleInfo
  return {
    id: r.id,
    user_id: userId,
    vehicle_type: r.vehicleType ?? r.damages[0]?.vehicle ?? 'car',
    owner: v.owner, phone: v.phone, brand: v.brand, plate: v.plate,
    general_notes: v.generalNotes, profile: v.profile, ref: v.ref, color: v.color,
    interior_notes: v.interiorNotes, interior_photos: v.interiorPhotos, interior_photo_notes: v.interiorPhotoNotes,
    vehicle_type_desc: v.vehicleTypeDesc, city: v.city, state: v.state,
    cpf: v.cpf || '',
    cnh: v.cnh || '',
    cnh_category: v.cnhCategory || '',
    inspector_signature: v.inspectorSignature || '',
    client_signature: v.clientSignature || '',
    updated_at: r.savedAt,
  }
}

function damageRows(r: SavedReport, userId: string) {
  return r.damages.map(d => ({
    id: d.id,
    inspection_id: r.id,
    user_id: userId,
    vehicle: d.vehicle, view: d.view, part_id: d.partId, part_name: d.partName,
    type: d.type, type_name: d.typeName, severity: d.severity, notes: d.notes,
    photos: d.photos, photo_notes: d.photoNotes,
    updated_at: r.savedAt,
  }))
}

async function persistSyncedReport(reportId: string, damages: SavedReport['damages'], vehicleInfo: SavedReport['vehicleInfo']) {
  const all = await db.getAllSaved()
  const report = all.find(r => r.id === reportId)
  if (!report) return
  await db.putSaved({ ...report, damages, vehicleInfo, syncedAt: Date.now() })
}

async function pushReport(report: SavedReport, userId: string) {
  if (!supabase) throw new Error('Supabase não configurado')

  const { remoteDamages, localDamages } = await uploadDamagePhotosForSync(
    report.damages,
    userId,
    report.id,
  )
  const { remotePhotos: remoteInteriorPhotos, localPhotos: localInteriorPhotos } = await uploadInteriorPhotosForSync(
    report.vehicleInfo.interiorPhotos,
    report.vehicleInfo.interiorPhotoNotes,
    userId,
    report.id,
  )
  const reportForSync: SavedReport = {
    ...report,
    damages: remoteDamages,
    vehicleInfo: { ...report.vehicleInfo, interiorPhotos: remoteInteriorPhotos },
  }
  const localReport: SavedReport = {
    ...report,
    damages: localDamages,
    vehicleInfo: { ...report.vehicleInfo, interiorPhotos: localInteriorPhotos },
  }

  const { error: e1 } = await supabase.from('vehicle_inspections').upsert(inspectionRow(reportForSync, userId))
  if (e1) throw e1
  const rows = damageRows(reportForSync, userId)
  if (rows.length > 0) {
    const { error: e2 } = await supabase.from('damages').upsert(rows)
    if (e2) throw e2
  }
  await persistSyncedReport(report.id, localDamages, localReport.vehicleInfo)
}

async function deleteRemoteReport(id: string, userId: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  await deleteInspectionPhotos(userId, id)
  const { error } = await supabase.from('vehicle_inspections').delete().eq('id', id)
  if (error) throw error
}

const MAX_RETRIES = 5

async function logSyncError(userId: string, item: SyncQueueItem, error: unknown) {
  if (!supabase) return
  const message = error instanceof Error ? error.message : String(error)
  await supabase.from('sync_errors').insert({
    user_id: userId,
    type: item.type,
    report_id: item.reportId,
    error: message,
    retry_count: item.retry_count,
    timestamp: Date.now()
  })
}

export async function flushQueue(userId: string): Promise<boolean> {
  const queue = await db.getSyncQueue()
  let hasErrors = false

  for (const item of queue.sort((a, b) => a.timestamp - b.timestamp)) {
    const delay = Math.pow(2, item.retry_count) * 1000
    const now = Date.now()

    if (item.retry_count > 0 && now - item.timestamp < delay) {
      hasErrors = true
      continue
    }

    try {
      if (item.type === 'upsert' && item.report) {
        await pushReport(item.report, userId)
      } else if (item.type === 'delete') {
        await deleteRemoteReport(item.reportId, userId)
      }
      await db.removeFromSyncQueue(item.qid)
    } catch (err: unknown) {
      hasErrors = true
      const newRetryCount = item.retry_count + 1
      const lastError = err instanceof Error ? err.message : String(err)

      if (newRetryCount >= MAX_RETRIES) {
        await logSyncError(userId, item, err)
        await db.removeFromSyncQueue(item.qid)
      } else {
        await db.updateSyncQueueItem({
          ...item,
          retry_count: newRetryCount,
          last_error: lastError,
          timestamp: now
        })
      }
    }
  }
  return !hasErrors
}

export async function pullRemote(userId: string): Promise<SavedReport[]> {
  if (!supabase) return []
  const { data: inspections, error } = await supabase
    .from('vehicle_inspections')
    .select('*')
    .eq('user_id', userId)
  if (error || !inspections) return []
  const { data: damages } = await supabase
    .from('damages')
    .select('*')
    .eq('user_id', userId)

  const damageRows = (damages ?? []) as Record<string, unknown>[]
  return inspections.map((insp) => mapRemoteInspection(insp as Record<string, unknown>, damageRows))
}

/** Merge local + remoto: last-write-wins por savedAt; remove laudos deletados na nuvem. */
export async function mergeRemoteReports(userId: string): Promise<SavedReport[]> {
  const [remote, local, queue] = await Promise.all([
    pullRemote(userId),
    db.getAllSaved(),
    db.getSyncQueue(),
  ])

  const remoteById = new Map(remote.map(r => [r.id, r]))
  const localById = new Map(local.map(r => [r.id, r]))
  const pendingUpsertIds = new Set(
    queue.filter(q => q.type === 'upsert').map(q => q.reportId),
  )

  const merged: SavedReport[] = []

  for (const localR of local) {
    const remoteR = remoteById.get(localR.id)

    if (!remoteR) {
      if (localR.syncedAt && !pendingUpsertIds.has(localR.id)) {
        await db.deleteSaved(localR.id)
        continue
      }
      merged.push(localR)
      continue
    }

    if (remoteR.savedAt > localR.savedAt) {
      const winner = {
        ...remoteR,
        damages: remoteR.damages.map(d => ({
          ...d,
          photos: normalizeDamagePhotos(d.photos),
        })),
        vehicleInfo: { ...remoteR.vehicleInfo, interiorPhotos: normalizeDamagePhotos(remoteR.vehicleInfo.interiorPhotos) },
        syncedAt: remoteR.savedAt,
      }
      await db.putSaved(winner)
      merged.push(winner)
      void prefetchReportPhotoCache(winner.damages)
    } else if (localR.savedAt > remoteR.savedAt) {
      merged.push(localR)
      if (!pendingUpsertIds.has(localR.id)) {
        await db.addToSyncQueue({
          type: 'upsert',
          reportId: localR.id,
          report: localR,
          timestamp: Date.now(),
        })
      }
    } else {
      merged.push(localR)
    }
  }

  for (const remoteR of remote) {
    if (!localById.has(remoteR.id)) {
      const incoming = {
        ...remoteR,
        damages: remoteR.damages.map(d => ({
          ...d,
          photos: normalizeDamagePhotos(d.photos),
        })),
        vehicleInfo: { ...remoteR.vehicleInfo, interiorPhotos: normalizeDamagePhotos(remoteR.vehicleInfo.interiorPhotos) },
        syncedAt: remoteR.savedAt,
      }
      await db.putSaved(incoming)
      merged.push(incoming)
      void prefetchReportPhotoCache(incoming.damages)
    }
  }

  return merged
    .filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i)
    .sort((a, b) => b.savedAt - a.savedAt)
}

export type SyncStatus = 'synced' | 'pending' | 'offline' | 'error'

export function useSyncStatus(userId: string | undefined) {
  const [status, setStatus] = useState<SyncStatus>('synced')
  const flushing = useRef(false)

  const tryFlush = useCallback(async () => {
    if (!supabaseEnabled || !userId || flushing.current) return
    const queue = await db.getSyncQueue()
    if (queue.length === 0) {
      setStatus('synced')
      return
    }
    if (!navigator.onLine) {
      setStatus('offline')
      return
    }
    flushing.current = true
    setStatus('pending')
    const ok = await flushQueue(userId)
    flushing.current = false
    const remaining = await db.getSyncQueue()
    if (remaining.length === 0) {
      setStatus('synced')
    } else if (!navigator.onLine) {
      setStatus('offline')
    } else if (!ok || remaining.some(i => i.retry_count > 0)) {
      setStatus('error')
    } else {
      setStatus('pending')
    }
    return ok
  }, [userId])

  useEffect(() => {
    if (!supabaseEnabled || !userId) return
    tryFlush()
    const onOnline = () => tryFlush()
    const onOffline = () => setStatus('offline')
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    const interval = setInterval(tryFlush, 30000)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      clearInterval(interval)
    }
  }, [userId, tryFlush])

  return { status, tryFlush }
}
