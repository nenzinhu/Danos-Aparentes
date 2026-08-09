import { createId } from '../id'
import { normalizePlate } from '../reportComparison'
import { supabase } from '../supabase'
import type { SavedReport } from '../../types'

/**
 * Garante linha em `vehicles` na nuvem e devolve o id a usar no upsert da vistoria.
 * Best-effort: se a tabela ainda não existir / RLS bloquear, devolve vehicleId local.
 */
export async function ensureRemoteVehicle(
  report: SavedReport,
  userId: string,
  tenantId: string | null,
): Promise<string | null> {
  if (!supabase) return report.vehicleId ?? null

  const plate = normalizePlate(String(report.vehicleInfo.plate || ''))
  if (plate.length < 6 && !report.vehicleId) return null

  const vehicleId = report.vehicleId || createId()

  try {
    // Já existe?
    if (report.vehicleId) {
      const { data: existing } = await supabase
        .from('vehicles')
        .select('id')
        .eq('id', report.vehicleId)
        .maybeSingle()
      if (existing?.id) return existing.id as string
    }

    // Busca por placa no escopo do usuário/tenant
    let q = supabase
      .from('vehicles')
      .select('id')
      .eq('user_id', userId)
      .eq('plate', plate)
      .limit(1)
    if (tenantId) q = q.eq('tenant_id', tenantId)
    else q = q.is('tenant_id', null)

    const { data: byPlate } = await q.maybeSingle()
    if (byPlate?.id) return byPlate.id as string

    const { data: inserted, error } = await supabase
      .from('vehicles')
      .upsert({
        id: vehicleId,
        user_id: userId,
        tenant_id: tenantId,
        plate,
        vehicle_type: report.vehicleType ?? '',
        brand: report.vehicleInfo.brand || '',
        color: report.vehicleInfo.color || '',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select('id')
      .single()

    if (error) {
      // Tabela pode ainda não ter sido migrada — não bloqueia sync da vistoria
      console.warn('ensureRemoteVehicle:', error.message)
      return report.vehicleId ?? vehicleId
    }
    return (inserted?.id as string) || vehicleId
  } catch (e) {
    console.warn('ensureRemoteVehicle failed', e)
    return report.vehicleId ?? vehicleId
  }
}
