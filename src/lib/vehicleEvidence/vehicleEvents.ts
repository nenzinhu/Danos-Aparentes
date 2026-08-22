import { supabase, supabaseEnabled } from '../supabase'
import type { VehicleEvent, VehicleEventType } from './types'

export async function fetchVehicleEvents(
  vehicleId: string,
  accessToken?: string | null,
): Promise<VehicleEvent[]> {
  if (!supabaseEnabled || !supabase) return []

  try {
    const client = supabase
    const { data, error } = await client
      .from('vehicle_events')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false })

    if (error) {
      console.warn('[vehicleEvents] Error fetching events:', error.message)
      return []
    }

    return (data || []).map(row => ({
      id: row.id,
      vehicleId: row.vehicle_id,
      tenantId: row.tenant_id,
      type: row.type as VehicleEventType,
      title: row.title,
      description: row.description,
      date: row.date,
      createdAt: row.created_at,
      createdBy: row.created_by,
      location: row.location,
      latitude: row.latitude,
      longitude: row.longitude,
      photos: row.photos || [],
      documents: row.documents || [],
      inspectionId: row.inspection_id,
      status: row.status,
      hash: row.hash,
      signature: row.signature,
    }))
  } catch (err) {
    console.warn('[vehicleEvents] Failed to fetch events:', err)
    return []
  }
}

export async function createVehicleEvent(
  input: {
    vehicleId: string
    tenantId: string
    type: VehicleEventType
    title: string
    description?: string
    location?: string
    latitude?: number
    longitude?: number
    photos?: string[]
    documents?: Array<{ name: string; url: string }>
    inspectionId?: string
    status?: string
    hash?: string
    signature?: { signerName?: string; signedAt?: string }
  },
  accessToken?: string | null,
): Promise<VehicleEvent | null> {
  if (!supabaseEnabled || !supabase) return null

  try {
    const client = supabase
    const newRecord = {
      vehicle_id: input.vehicleId,
      tenant_id: input.tenantId,
      type: input.type,
      title: input.title,
      description: input.description || null,
      date: new Date().toISOString(),
      location: input.location || null,
      latitude: input.latitude || null,
      longitude: input.longitude || null,
      photos: input.photos || [],
      documents: input.documents || [],
      inspection_id: input.inspectionId || null,
      status: input.status || 'completed',
      hash: input.hash || null,
      signature: input.signature || null,
    }

    const { data, error } = await client
      .from('vehicle_events')
      .insert(newRecord)
      .select('*')
      .single()

    if (error || !data) {
      console.warn('[vehicleEvents] Error creating event:', error?.message)
      return null
    }

    return {
      id: data.id,
      vehicleId: data.vehicle_id,
      tenantId: data.tenant_id,
      type: data.type as VehicleEventType,
      title: data.title,
      description: data.description,
      date: data.date,
      createdAt: data.created_at,
      createdBy: data.created_by,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      photos: data.photos || [],
      documents: data.documents || [],
      inspectionId: data.inspection_id,
      status: data.status,
      hash: data.hash,
      signature: data.signature,
    }
  } catch (err) {
    console.warn('[vehicleEvents] Failed to create event:', err)
    return null
  }
}
