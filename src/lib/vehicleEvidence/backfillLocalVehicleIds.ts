/**
 * FASE 13 — Backfill de vehicleId em laudos locais antigos.
 * Agrupa por placa normalizada; não altera laudos issued além do ponteiro vehicleId.
 */

import type { SavedReport } from '../../types'
import { createId } from '../id'
import { normalizePlate } from '../reportComparison'

export type BackfillResult = {
  updated: SavedReport[]
  changedCount: number
}

/**
 * Atribui o mesmo vehicleId a todos os laudos da mesma placa que ainda não têm.
 * Preserva vehicleId já existente; unifica grupos que misturam com/sem id.
 */
export function backfillLocalVehicleIds(reports: SavedReport[]): BackfillResult {
  const byPlate = new Map<string, SavedReport[]>()

  for (const r of reports) {
    const plate = normalizePlate(String(r.vehicleInfo.plate || ''))
    if (plate.length < 6) continue
    const list = byPlate.get(plate) ?? []
    list.push(r)
    byPlate.set(plate, list)
  }

  const idByReport = new Map<string, string>()
  let changedCount = 0

  for (const [, list] of byPlate) {
    const existingIds = [...new Set(list.map((r) => r.vehicleId).filter(Boolean))] as string[]
    // Preferência: id já usado (não local:); senão qualquer; senão novo
    const canonical =
      existingIds.find((id) => !id.startsWith('local:')) ||
      existingIds[0] ||
      createId()

    for (const r of list) {
      if (r.vehicleId !== canonical) {
        idByReport.set(r.id, canonical)
        changedCount++
      }
    }
  }

  const updated = reports.map((r) => {
    const nextId = idByReport.get(r.id)
    if (!nextId) return r
    return { ...r, vehicleId: nextId }
  })

  return { updated, changedCount }
}
