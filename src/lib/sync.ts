import { useState, useEffect, useCallback, useRef } from 'react'
import { SavedReport } from '../types'
import { db } from './db'
import { supabase, supabaseEnabled } from './supabase'

function inspectionRow(r: SavedReport, userId: string) {
  const v = r.vehicleInfo
  return {
    id: r.id,
    user_id: userId,
    vehicle_type: r.damages[0]?.vehicle ?? 'car',
    owner: v.owner, phone: v.phone, brand: v.brand, plate: v.plate,
    general_notes: v.generalNotes, profile: v.profile, ref: v.ref, color: v.color,
    vehicle_type_desc: v.vehicleTypeDesc, city: v.city, state: v.state,
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

async function pushReport(report: SavedReport, userId: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error: e1 } = await supabase.from('vehicle_inspections').upsert(inspectionRow(report, userId))
  if (e1) throw e1
  const rows = damageRows(report, userId)
  if (rows.length > 0) {
    const { error: e2 } = await supabase.from('damages').upsert(rows)
    if (e2) throw e2
  }
}

async function deleteRemoteReport(id: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.from('vehicle_inspections').delete().eq('id', id)
  if (error) throw error
}

export async function flushQueue(userId: string): Promise<boolean> {
  const queue = await db.getSyncQueue()
  for (const item of queue.sort((a, b) => a.timestamp - b.timestamp)) {
    try {
      if (item.type === 'upsert' && item.report) {
        await pushReport(item.report, userId)
      } else if (item.type === 'delete') {
        await deleteRemoteReport(item.reportId)
      }
      await db.removeFromSyncQueue(item.qid)
    } catch {
      return false
    }
  }
  return true
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

  return inspections.map((insp: any): SavedReport => ({
    id: insp.id,
    savedAt: insp.updated_at,
    vehicleInfo: {
      owner: insp.owner, phone: insp.phone, brand: insp.brand, plate: insp.plate,
      generalNotes: insp.general_notes, profile: insp.profile, ref: insp.ref,
      color: insp.color, vehicleTypeDesc: insp.vehicle_type_desc, city: insp.city, state: insp.state,
    },
    damages: (damages ?? [])
      .filter((d: any) => d.inspection_id === insp.id)
      .map((d: any) => ({
        id: d.id, vehicle: d.vehicle, view: d.view, partId: d.part_id, partName: d.part_name,
        type: d.type, typeName: d.type_name, severity: d.severity, notes: d.notes,
        photos: d.photos ?? [], photoNotes: d.photo_notes ?? [],
      })),
  }))
}

export type SyncStatus = 'synced' | 'pending' | 'offline'

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
    setStatus(remaining.length === 0 ? 'synced' : (navigator.onLine ? 'pending' : 'offline'))
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
