import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './_lib/supabaseAdmin.js'
import { getUserFromRequest } from './_lib/getUserFromRequest.js'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
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

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'E-mail inválido' })
    return
  }

  const origin = (req.headers.origin as string) || `https://${req.headers.host}`

  try {
    let { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!company) {
      const { data: created, error: createError } = await supabaseAdmin
        .from('companies')
        .insert({ owner_id: user.id, name: '' })
        .select('id')
        .single()
      if (createError) throw createError
      company = created
    }

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_members')
      .insert({ company_id: company.id, invited_email: email, status: 'pending' })
      .select('invite_token')
      .single()
    if (inviteError) throw inviteError

    res.status(200).json({ inviteUrl: `${origin}/app/team/invite/${invite.invite_token}` })
  } catch (err) {
    console.error('Erro ao gerar convite de equipe:', err)
    res.status(500).json({ error: 'Erro ao gerar convite. Tente novamente em alguns instantes.' })
  }
}
