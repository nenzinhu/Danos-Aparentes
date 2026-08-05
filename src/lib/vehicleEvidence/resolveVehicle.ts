import { createId } from '../id'
import { normalizePlate } from '../reportComparison'
import type { SavedReport } from '../../types'

/**
 * Resolve vehicleId para um laudo offline.
 * Preferência: id já no laudo → id de outro laudo da mesma placa → novo id.
 * Placa curta demais → undefined (não cria veículo órfão).
 */
export function resolveVehicleIdForSave(
  plate: string,
  existingReports: SavedReport[],
  preferredVehicleId?: string | null,
): string | undefined {
  if (preferredVehicleId) return preferredVehicleId

  const norm = normalizePlate(plate)
  if (norm.length < 6) return undefined

  for (const r of existingReports) {
    if (r.vehicleId && normalizePlate(String(r.vehicleInfo.plate || '')) === norm) {
      return r.vehicleId
    }
  }

  return createId()
}

/** Mensagem fail-open quando comparação depende de sync. */
export function offlineCompareGate(
  previous: SavedReport | undefined,
  current: SavedReport | undefined,
  opts?: { requireSynced?: boolean },
): { ok: true } | { ok: false; reason: string } {
  if (!previous || !current) {
    return { ok: false, reason: 'Inspeção não encontrada localmente.' }
  }
  if (!opts?.requireSynced) return { ok: true }

  const pending =
    (previous.syncedAt == null) ||
    (current.syncedAt == null) ||
    (previous.syncedAt < previous.savedAt) ||
    (current.syncedAt < current.savedAt)

  if (pending) {
    return {
      ok: false,
      reason: 'Comparação será disponibilizada quando os dados estiverem sincronizados.',
    }
  }
  return { ok: true }
}
