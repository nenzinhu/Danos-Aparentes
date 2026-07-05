import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './_lib/supabaseAdmin.js'
import { getUserFromRequest } from './_lib/getUserFromRequest.js'

const STORAGE_REF_PREFIX = 'storage:'

function normalizeRemotePhotoRef(ref: string): string {
  if (ref.startsWith('data:') || ref.startsWith(STORAGE_REF_PREFIX)) return ref
  return `${STORAGE_REF_PREFIX}${ref}`
}

async function isCorporate(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('status, trial_ends_at, plan_tier')
    .eq('user_id', userId)
    .maybeSingle()
  if (!data || data.plan_tier !== 'corporativo') return false
  const trialActive = new Date(data.trial_ends_at).getTime() > Date.now()
  return data.status === 'active' || (data.status === 'trialing' && trialActive)
}

function mapInspection(insp: Record<string, unknown>, damages: Record<string, unknown>[]) {
  return {
    id: insp.id,
    savedAt: insp.updated_at,
    syncedAt: insp.updated_at,
    vehicleType: insp.vehicle_type ?? undefined,
    vehicleInfo: {
      owner: insp.owner, phone: insp.phone, brand: insp.brand, plate: insp.plate,
      generalNotes: insp.general_notes, profile: insp.profile, ref: insp.ref, color: insp.color,
      vehicleTypeDesc: insp.vehicle_type_desc, city: insp.city, state: insp.state,
      cpf: insp.cpf || '', cnh: insp.cnh || '', cnhCategory: insp.cnh_category || '',
      inspectorSignature: insp.inspector_signature || '', clientSignature: insp.client_signature || '',
    },
    damages: damages
      .filter(d => d.inspection_id === insp.id)
      .map(d => ({
        id: d.id, vehicle: d.vehicle, view: d.view, partId: d.part_id, partName: d.part_name,
        type: d.type, typeName: d.type_name, severity: d.severity, notes: d.notes,
        photos: ((d.photos as string[] | null) ?? []).map(normalizeRemotePhotoRef),
        photoNotes: (d.photo_notes as string[] | null) ?? [],
      })),
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Não autenticado' })
    return
  }

  if (!(await isCorporate(user.id))) {
    res.status(403).json({ error: 'Recurso disponível apenas no plano Corporativo' })
    return
  }

  try {
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!company) {
      res.status(200).json({ members: [], reports: [] })
      return
    }

    const { data: members, error: membersError } = await supabaseAdmin
      .from('team_members')
      .select('user_id, invited_email, status, invited_at, joined_at')
      .eq('company_id', company.id)
    if (membersError) throw membersError

    const acceptedUserIds = (members ?? [])
      .filter(m => m.status === 'accepted' && m.user_id)
      .map(m => m.user_id as string)

    const emailByUserId = new Map((members ?? []).map(m => [m.user_id, m.invited_email]))

    let reports: { inspectorEmail: string; report: ReturnType<typeof mapInspection> }[] = []
    if (acceptedUserIds.length > 0) {
      const { data: inspections, error: inspError } = await supabaseAdmin
        .from('vehicle_inspections')
        .select('*')
        .in('user_id', acceptedUserIds)
      if (inspError) throw inspError

      const { data: damages, error: dmgError } = await supabaseAdmin
        .from('damages')
        .select('*')
        .in('user_id', acceptedUserIds)
      if (dmgError) throw dmgError

      const damageRows = (damages ?? []) as Record<string, unknown>[]
      reports = (inspections ?? []).map((insp) => ({
        inspectorEmail: emailByUserId.get(insp.user_id as string) || '',
        report: mapInspection(insp as Record<string, unknown>, damageRows),
      }))
    }

    res.status(200).json({ members: members ?? [], reports })
  } catch (err) {
    console.error('Erro ao buscar laudos da equipe:', err)
    res.status(500).json({ error: 'Erro ao buscar laudos da equipe. Tente novamente em alguns instantes.' })
  }
}
