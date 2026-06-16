import type { VercelRequest, VercelResponse } from '@vercel/node'
import { stripe } from './_lib/stripeClient'
import { supabaseAdmin } from './_lib/supabaseAdmin'
import { getUserFromRequest } from './_lib/getUserFromRequest'

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

  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    res.status(500).json({ error: 'STRIPE_PRICE_ID não configurada' })
    return
  }

  const origin = (req.headers.origin as string) || `https://${req.headers.host}`

  try {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: sub?.stripe_customer_id || undefined,
      customer_email: sub?.stripe_customer_id ? undefined : user.email,
      client_reference_id: user.id,
      success_url: `${origin}/app.html?checkout=success`,
      cancel_url: `${origin}/app.html?checkout=canceled`,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Erro ao criar sessão de checkout:', err)
    res.status(500).json({ error: 'Erro ao criar sessão de checkout. Tente novamente em alguns instantes.' })
  }
}
