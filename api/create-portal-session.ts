import type { VercelRequest, VercelResponse } from '@vercel/node'
import { stripe } from './_lib/stripeClient.js'
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

  const origin = (req.headers.origin as string) || `https://${req.headers.host}`

  try {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!sub?.stripe_customer_id) {
      res.status(400).json({ error: 'Usuário ainda não tem assinatura registrada' })
      return
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/app.html`,
    })

    res.status(200).json({ url: portalSession.url })
  } catch (err) {
    console.error('Erro ao abrir portal de gerenciamento:', err)
    res.status(500).json({ error: 'Erro ao abrir o portal de gerenciamento. Tente novamente em alguns instantes.' })
  }
}
