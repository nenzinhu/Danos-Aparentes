import type { SupabaseClient } from '@supabase/supabase-js'
import { mapRemoteInspection } from '@/src/lib/reportMapping'
import type { SavedReport } from '@/src/types'

/**
 * Carrega uma inspeção + danos do Supabase (admin) pelo id e mapeia para SavedReport.
 * Usado por rotas server-side que precisam dos dados completos da vistoria.
 */
export async function loadInspectionReport(
  admin: SupabaseClient,
  inspectionId: string,
): Promise<SavedReport | null> {
  const { data: inspection, error } = await admin
    .from('vehicle_inspections')
    .select('*')
    .eq('id', inspectionId)
    .maybeSingle()
  if (error || !inspection) return null

  const { data: damages } = await admin
    .from('damages')
    .select('*')
    .eq('inspection_id', inspectionId)

  return mapRemoteInspection(
    inspection as Record<string, unknown>,
    (damages ?? []) as Record<string, unknown>[],
  )
}
