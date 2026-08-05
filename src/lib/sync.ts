import { useState, useEffect, useCallback, useRef } from 'react'
import { SavedReport } from '../types'
import { db, SyncQueueItem } from './db'
import { supabase, supabaseEnabled } from './supabase'
import { uploadDamagePhotosForSync, uploadInteriorPhotosForSync, uploadViewPhotosForSync, normalizeDamagePhotos, prefetchReportPhotoCache } from './photoStore'
import { deleteInspectionPhotos } from './photoStorage'
import { mapRemoteInspection } from './reportMapping'
import { appendAuditEvent } from './audit/auditLog'
import { isIssuedLocked } from './pdf/reportIssuance'
import { resolveTenantId } from './tenant/resolveTenant'
import { syncUpsertIdempotencyKey } from './sync/idempotency'
import { ensureRemoteVehicle } from './vehicleEvidence/ensureRemoteVehicle'
import { decideMergeWinner } from './sync/mergePolicy'

function inspectionRow(r: SavedReport, userId: string, tenantId: string | null) {
  const v = r.vehicleInfo
  const geo = v.geo
  return {
    id: r.id,
    user_id: userId,
    tenant_id: tenantId,
    vehicle_id: r.vehicleId || null,
    vehicle_type: r.vehicleType ?? r.damages[0]?.vehicle ?? 'car',
    owner: v.owner, phone: v.phone, brand: v.brand, plate: v.plate,
    general_notes: v.generalNotes, profile: v.profile, ref: v.ref, color: v.color,
    interior_notes: v.interiorNotes, interior_photos: v.interiorPhotos, interior_photo_notes: v.interiorPhotoNotes,
    view_photos: v.viewPhotos || {},
    vehicle_type_desc: v.vehicleTypeDesc, city: v.city, state: v.state,
    cpf: v.cpf || '',
    cnh: v.cnh || '',
    cnh_category: v.cnhCategory || '',
    inspector_signature: v.inspectorSignature || '',
    client_signature: v.clientSignature || '',
    inspector_signature_meta: v.inspectorSignatureMeta ?? null,
    client_signature_meta: v.clientSignatureMeta ?? null,
    status: r.status ?? 'complete',
    geo_lat: geo?.lat ?? null,
    geo_lng: geo?.lng ?? null,
    geo_accuracy: geo?.accuracy ?? null,
    geo_address: geo?.address ?? null,
    geo_captured_at: geo?.capturedAt ?? null,
    public_code: r.publicCode || '',
    laudo_version: r.laudoVersion ?? 1,
    parent_inspection_id: r.parentInspectionId || null,
    correction_reason: r.correctionReason || '',
    corrected_by: r.correctedBy || null,
    corrected_at: r.correctedAt ? new Date(r.correctedAt).toISOString() : null,
    issued_at: r.status === 'issued' || r.status === 'superseded'
      ? new Date(r.savedAt).toISOString()
      : null,
    issued_hash: r.issuedHash || '',
    reviewer_id: r.reviewerId || null,
    reviewed_at: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : null,
    review_notes: r.reviewNotes || '',
    review_content_hash: r.reviewContentHash || '',
    inspection_purpose: r.inspectionPurpose || '',
    baseline_inspection_id: r.baselineInspectionId || null,
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

  // issued → superseded: status-only update (content frozen by DB trigger).
  if (report.status === 'superseded') {
    const { error: eSupersede } = await supabase
      .from('vehicle_inspections')
      .update({
        status: 'superseded',
        updated_at: report.savedAt,
      })
      .eq('id', report.id)
      .eq('user_id', userId)
      .eq('status', 'issued')
    if (eSupersede) throw eSupersede
    await persistSyncedReport(report.id, report.damages, report.vehicleInfo)
    return
  }

  // Already locked on cloud â†’ do not re-upsert content (immutability).
  if (isIssuedLocked(report.status)) {
    const { data: remote } = await supabase
      .from('vehicle_inspections')
      .select('status')
      .eq('id', report.id)
      .eq('user_id', userId)
      .maybeSingle()
    if (
      remote?.status === 'issued' ||
      remote?.status === 'superseded' ||
      remote?.status === 'cancelled'
    ) {
      return
    }
    // else: first sync of issued (cloud still draft/complete) — fall through to upsert
  }

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
  const { remoteViewPhotos, localViewPhotos } = await uploadViewPhotosForSync(
    report.vehicleInfo.viewPhotos || {},
    userId,
    report.id,
  )
  const reportForSync: SavedReport = {
    ...report,
    damages: remoteDamages,
    vehicleInfo: {
      ...report.vehicleInfo,
      interiorPhotos: remoteInteriorPhotos,
      viewPhotos: remoteViewPhotos,
    },
  }
  const localReport: SavedReport = {
    ...report,
    damages: localDamages,
    vehicleInfo: {
      ...report.vehicleInfo,
      interiorPhotos: localInteriorPhotos,
      viewPhotos: localViewPhotos,
    },
  }

  const tenantId = await resolveTenantId(userId)
  const remoteVehicleId = await ensureRemoteVehicle(reportForSync, userId, tenantId)
  const reportWithVehicle: SavedReport = {
    ...reportForSync,
    vehicleId: remoteVehicleId || reportForSync.vehicleId,
  }
  const { error: e1 } = await supabase
    .from('vehicle_inspections')
    .upsert(inspectionRow(reportWithVehicle, userId, tenantId))
  if (e1) throw e1
  const rows = damageRows(reportWithVehicle, userId)
  if (rows.length > 0) {
    const { error: e2 } = await supabase.from('damages').upsert(rows)
    if (e2) throw e2
  }
  await persistSyncedReport(report.id, localDamages, localReport.vehicleInfo)
  if (remoteVehicleId && remoteVehicleId !== report.vehicleId) {
    const all = await db.getAllSaved()
    const local = all.find(r => r.id === report.id)
    if (local) {
      await db.putSaved({ ...local, vehicleId: remoteVehicleId, syncedAt: Date.now() })
    }
  }
  void appendAuditEvent({
    event_type: 'change',
    inspection_id: report.id,
    tenant_id: tenantId,
    idempotency_key: syncUpsertIdempotencyKey(report.id, report.savedAt),
    metadata: {
      status: report.status ?? 'complete',
      damages_count: report.damages.length,
      source: 'sync_upsert',
      vehicle_id: remoteVehicleId,
    },
  })
  if (remoteVehicleId) {
    void appendAuditEvent({
      event_type: 'inspection_linked_to_vehicle',
      inspection_id: report.id,
      tenant_id: tenantId,
      idempotency_key: `linked:${report.id}:${remoteVehicleId}`,
      metadata: { vehicle_id: remoteVehicleId, plate: report.vehicleInfo.plate },
    })
  }
}

async function deleteRemoteReport(id: string, userId: string) {
  if (!supabase) throw new Error('Supabase não configurado')

  const { data: remote } = await supabase
    .from('vehicle_inspections')
    .select('status')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()
  if (isIssuedLocked(remote?.status as import('../types').InspectionStatus | undefined)) {
    throw new Error('Laudo emitido não pode ser excluído — use correção (nova versão) ou cancele formalmente')
  }

  await deleteInspectionPhotos(userId, id)
  const { error } = await supabase.from('vehicle_inspections').delete().eq('id', id)
  if (error) throw error
}

const MAX_RETRIES = 5

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return String(err)
}

async function logSyncError(userId: string, item: SyncQueueItem, error: unknown) {
  if (!supabase) return
  const message = errorMessage(error)
  try {
    await supabase.from('sync_errors').insert({
      user_id: userId,
      type: item.type,
      report_id: item.reportId,
      error: message,
      retry_count: item.retry_count,
      timestamp: Date.now(),
    })
  } catch {
    // sync_errors is best-effort telemetry; never block queue drain
  }
}

export type DroppedSyncItem = { reportId: string; error: string }

export type FlushResult = {
  ok: boolean
  dropped: DroppedSyncItem[]
}

export async function flushQueue(userId: string): Promise<FlushResult> {
  const queue = await db.getSyncQueue()
  let hasErrors = false
  const dropped: DroppedSyncItem[] = []

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
      const lastError = errorMessage(err)

      if (newRetryCount >= MAX_RETRIES) {
        await logSyncError(userId, item, err)
        await db.removeFromSyncQueue(item.qid)
        dropped.push({ reportId: item.reportId, error: lastError })
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
  return { ok: !hasErrors, dropped }
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

function hydrateRemoteReport(remoteR: SavedReport): SavedReport {
  return {
    ...remoteR,
    damages: remoteR.damages.map(d => ({
      ...d,
      photos: normalizeDamagePhotos(d.photos),
    })),
    vehicleInfo: {
      ...remoteR.vehicleInfo,
      interiorPhotos: normalizeDamagePhotos(remoteR.vehicleInfo.interiorPhotos),
      viewPhotos: remoteR.vehicleInfo.viewPhotos
        ? Object.fromEntries(
            Object.entries(remoteR.vehicleInfo.viewPhotos).map(([k, v]) => [
              k,
              v ? normalizeDamagePhotos([v])[0] : v,
            ]),
          )
        : remoteR.vehicleInfo.viewPhotos,
    },
    syncedAt: remoteR.savedAt,
  }
}

async function enqueueLocalUpsert(localR: SavedReport, pendingUpsertIds: Set<string>) {
  if (pendingUpsertIds.has(localR.id)) return
  await db.addToSyncQueue({
    type: 'upsert',
    reportId: localR.id,
    report: localR,
    timestamp: Date.now(),
  })
  pendingUpsertIds.add(localR.id)
}

/**
 * Merge local + remoto com política anti-corrupção de laudos emitidos.
 * Drafts/completos: last-write-wins por savedAt.
 * Locked (issued/superseded/cancelled): nunca perde para unlocked remoto.
 */
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
        // Laudo emitido local nunca some só porque o pull falhou em achar a linha.
        if (isIssuedLocked(localR.status)) {
          merged.push(localR)
          await enqueueLocalUpsert(localR, pendingUpsertIds)
          continue
        }
        await db.deleteSaved(localR.id)
        continue
      }
      merged.push(localR)
      continue
    }

    const decision = decideMergeWinner(localR, remoteR)
    if (decision === 'take-remote') {
      const winner = hydrateRemoteReport(remoteR)
      await db.putSaved(winner)
      merged.push(winner)
      void prefetchReportPhotoCache(winner.damages)
    } else if (decision === 'keep-local-and-push') {
      merged.push(localR)
      await enqueueLocalUpsert(localR, pendingUpsertIds)
    } else {
      merged.push(localR)
    }
  }

  for (const remoteR of remote) {
    if (!localById.has(remoteR.id)) {
      const incoming = hydrateRemoteReport(remoteR)
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

export type UseSyncStatusOptions = {
  onPermanentFailure?: (dropped: DroppedSyncItem[]) => void
}

export function useSyncStatus(userId: string | undefined, options?: UseSyncStatusOptions) {
  const [status, setStatus] = useState<SyncStatus>('synced')
  const [lastError, setLastError] = useState<string | undefined>()
  const flushing = useRef(false)
  const onPermanentFailureRef = useRef(options?.onPermanentFailure)

  useEffect(() => { onPermanentFailureRef.current = options?.onPermanentFailure }, [options?.onPermanentFailure]);

const tryFlush = useCallback(async () => {
    if (!supabaseEnabled || !userId || flushing.current) return
    const queue = await db.getSyncQueue()
    if (queue.length === 0) {
      setStatus('synced')
      setLastError(undefined)
      return
    }
    if (!navigator.onLine) {
      setStatus('offline')
      setLastError(queue.find(i => i.last_error)?.last_error)
      return
    }
    flushing.current = true
    setStatus('pending')
    const { ok, dropped } = await flushQueue(userId)
    if (dropped.length > 0) {
      onPermanentFailureRef.current?.(dropped)
    }
    flushing.current = false
    const remaining = await db.getSyncQueue()
    if (remaining.length === 0) {
      setStatus('synced')
      setLastError(undefined)
    } else if (!navigator.onLine) {
      setStatus('offline')
      setLastError(remaining.find(i => i.last_error)?.last_error)
    } else if (!ok || remaining.some(i => i.retry_count > 0)) {
      setStatus('error')
      setLastError(remaining.find(i => i.last_error)?.last_error)
    } else {
      setStatus('pending')
      setLastError(undefined)
    }
    return ok
  }, [userId])

  useEffect(() => {
    if (!supabaseEnabled || !userId) return
    setTimeout(() => { tryFlush(); }, 0)
    const onOnline = () => setTimeout(() => { tryFlush(); }, 0)
    const onOffline = () => setStatus('offline')
    const onVisible = () => {
      if (document.visibilityState === 'visible') setTimeout(() => { tryFlush(); }, 0)
    }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    document.addEventListener('visibilitychange', onVisible)
    const interval = setInterval(() => { tryFlush(); }, 30000)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(interval)
    }
  }, [userId, tryFlush])

  return { status, lastError, tryFlush }
}
