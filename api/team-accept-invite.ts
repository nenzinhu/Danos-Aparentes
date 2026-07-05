import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './_lib/supabaseAdmin.js'
import { getUserFromRequest } from './_lib/getUserFromRequest.js'

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

  const token = typeof req.body?.token === 'string' ? req.body.token : ''
  if (!token) {
    res.status(400).json({ error: 'Convite inválido' })
    return
  }

  try {
    const { data: invite, error: findError } = await supabaseAdmin
      .from('team_members')
      .select('id, invited_email, status')
      .eq('invite_token', token)
      .maybeSingle()

    if (findError) throw findError
    if (!invite) {
      res.status(404).json({ error: 'Convite não encontrado' })
      return
    }
    if (invite.status === 'accepted') {
      res.status(409).json({ error: 'Este convite já foi aceito' })
      return
    }
    if ((invite.invited_email || '').toLowerCase() !== (user.email || '').toLowerCase()) {
      res.status(403).json({ error: 'Este convite foi enviado para outro e-mail' })
      return
    }

    const { error: updateError } = await supabaseAdmin
      .from('team_members')
      .update({ user_id: user.id, status: 'accepted', joined_at: new Date().toISOString() })
      .eq('id', invite.id)
    if (updateError) throw updateError

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Erro ao aceitar convite de equipe:', err)
    res.status(500).json({ error: 'Erro ao aceitar convite. Tente novamente em alguns instantes.' })
  }
}
