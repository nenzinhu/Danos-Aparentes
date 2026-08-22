import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user?.id) return errorJson('Não autenticado', 401)
  if (!supabaseAdmin) return errorJson('Serviço indisponível', 503)

  try {
    // Membros da empresa onde o user é dono ou aceito.
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('company_id')
      .or(`invited_email.eq.${user.email},user_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .maybeSingle()

    const companyId = membership?.company_id
    let members: unknown[] = []
    let reports: unknown[] = []

    if (companyId) {
      const { data: m } = await supabaseAdmin
        .from('team_members')
        .select('user_id, invited_email, status, invited_at, joined_at')
        .eq('company_id', companyId)
      members = m || []

      const { data: insp } = await supabaseAdmin
        .from('vehicle_inspections')
        .select('id, plate, brand, owner, status, updated_at, user_id')
        .eq('tenant_id', companyId)
        .order('updated_at', { ascending: false })
        .limit(100)
      reports = (insp || []).map((r) => ({
        report: r,
        inspectorEmail: r.user_id ? '' : '',
      }))
    }

    return NextResponse.json({ members, reports })
  } catch (err) {
    console.error('[team-reports]', err)
    return errorJson('Falha ao carregar equipe', 500)
  }
}
