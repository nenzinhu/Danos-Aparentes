/**
 * FASE 22–23 — hidrata laudos completos da nuvem para um veículo (IndexedDB).
 * Somente leitura: não cria danos, não muta issued, não enfileira upsert.
 * Com accessToken, usa API com escopo de equipe (FASE 23).
 */

import type { SavedReport } from '../../types'
import { db } from '../db'
import { supabase, supabaseEnabled } from '../supabase'
import { mapRemoteInspection } from '../reportMapping'
import { normalizeDamagePhotos, prefetchReportPhotoCache } from '../photoStore'
import { normalizePlate } from '../reportComparison'

export type HydrateVehicleResult = {
  pulled: number
  written: number
  reports: SavedReport[]
}

/** LWW só para decidir se o remoto entra no IndexedDB (sem push). */
export function shouldWriteRemoteOverLocal(
  local: SavedReport | undefined,
  remote: SavedReport,
): boolean {
  if (!local) return true
  return remote.savedAt > local.savedAt
}

function prepareIncoming(remote: SavedReport): SavedReport {
  return {
    ...remote,
    damages: remote.damages.map((d) => ({
      ...d,
      photos: normalizeDamagePhotos(d.photos),
    })),
    vehicleInfo: {
      ...remote.vehicleInfo,
      interiorPhotos: normalizeDamagePhotos(remote.vehicleInfo.interiorPhotos),
    },
    syncedAt: remote.savedAt,
  }
}

/** Baixa via API (tenant-aware) quando há token. */
async function pullViaApi(
  vehicleId: string,
  accessToken: string,
): Promise<SavedReport[]> {
  if (vehicleId.startsWith('local:')) return []
  try {
    const res = await fetch(`/api/vehicles/${encodeURIComponent(vehicleId)}/reports`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return []
    const data = await res.json()
    const reports = Array.isArray(data.reports) ? data.reports : []
    return reports as SavedReport[]
  } catch {
    return []
  }
}

/**
 * Baixa inspeções remotas do veículo (UUID) ou, se `local:PLACA`, por placa normalizada.
 * Solo-path via Supabase client (user_id).
 */
export async function pullRemoteForVehicle(
  userId: string,
  vehicleId: string,
  accessToken?: string | null,
): Promise<SavedReport[]> {
  if (accessToken && !vehicleId.startsWith('local:')) {
    const viaApi = await pullViaApi(vehicleId, accessToken)
    if (viaApi.length > 0) return viaApi
  }

  if (!supabaseEnabled || !supabase || !userId || !vehicleId) return []

  let inspections: Record<string, unknown>[] = []

  if (vehicleId.startsWith('local:')) {
    const plateNorm = vehicleId.slice('local:'.length)
    if (plateNorm.length < 6) return []
    const { data, error } = await supabase
      .from('vehicle_inspections')
      .select('*')
      .eq('user_id', userId)
      .limit(200)
    if (error || !data) return []
    inspections = (data as Record<string, unknown>[]).filter((row) => {
      const p = normalizePlate(String(row.plate || ''))
      return p === plateNorm
    })
  } else {
    const { data, error } = await supabase
      .from('vehicle_inspections')
      .select('*')
      .eq('user_id', userId)
      .eq('vehicle_id', vehicleId)
    if (error || !data) return []
    inspections = data as Record<string, unknown>[]
  }

  if (inspections.length === 0) return []

  const ids = inspections.map((i) => String(i.id))
  const { data: damages } = await supabase
    .from('damages')
    .select('*')
    .eq('user_id', userId)
    .in('inspection_id', ids)

  const damageRows = (damages ?? []) as Record<string, unknown>[]
  return inspections.map((insp) => mapRemoteInspection(insp, damageRows))
}

/**
 * Escreve laudos remotos no IndexedDB (LWW). Não remove outros laudos locais.
 */
export async function hydrateVehicleReportsLocally(
  userId: string,
  vehicleId: string,
  accessToken?: string | null,
): Promise<HydrateVehicleResult> {
  const remote = await pullRemoteForVehicle(userId, vehicleId, accessToken)
  if (remote.length === 0) {
    return { pulled: 0, written: 0, reports: [] }
  }

  const local = await db.getAllSaved()
  const localById = new Map(local.map((r) => [r.id, r]))
  const written: SavedReport[] = []

  for (const remoteR of remote) {
    const existing = localById.get(remoteR.id)
    if (!shouldWriteRemoteOverLocal(existing, remoteR)) continue
    const incoming = prepareIncoming(remoteR)
    if (!incoming.vehicleId && !vehicleId.startsWith('local:')) {
      incoming.vehicleId = vehicleId
    }
    await db.putSaved(incoming)
    written.push(incoming)
    void prefetchReportPhotoCache(incoming.damages)
  }

  return { pulled: remote.length, written: written.length, reports: written }
}
