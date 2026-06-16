import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { stripe } from './_lib/stripeClient'
import { supabaseAdmin } from './_lib/supabaseAdmin'

// Desliga o parser automático de JSON: precisamos do corpo "crú" (raw) da
// requisição pra validar a assinatura criptográfica do Stripe.
export const config = {
  api: { bodyParser: false },
}

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Lê o fim do período atual de um Subscription, cobrindo tanto a API antiga
// (campo no objeto subscription) quanto a API mais recente do Stripe (campo
// dentro de cada subscription item).
function getCurrentPeriodEnd(subscription: Stripe.Subscription): number | null {
  const fromItem = subscription.items.data[0]?.current_period_end
  if (typeof fromItem === 'number') return fromItem
  const legacy = (subscription as unknown as { current_period_end?: number }).current_period_end
  return typeof legacy === 'number' ? legacy : null
}

function mapStripeStatus(status: Stripe.Subscription.Status): 'active' | 'past_due' | 'canceled' {
  if (status === 'active' || status === 'trialing') return 'active'
  if (status === 'past_due' || status === 'unpaid' || status === 'incomplete') return 'past_due'
  return 'canceled'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  const signature = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    res.status(400).json({ error: 'Assinatura do webhook ausente ou não configurada' })
    return
  }

  let event: Stripe.Event
  try {
    const rawBody = await readRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, signature as string, webhookSecret)
  } catch (err) {
    res.status(400).json({ error: `Assinatura inválida: ${(err as Error).message}` })
    return
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id
      if (userId && session.customer && session.subscription) {
        await supabaseAdmin.from('subscriptions').update({
          status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const status = event.type === 'customer.subscription.deleted'
        ? 'canceled'
        : mapStripeStatus(subscription.status)
      const periodEndUnix = getCurrentPeriodEnd(subscription)

      await supabaseAdmin.from('subscriptions').update({
        status,
        current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', subscription.id)
    }

    res.status(200).json({ received: true })
  } catch (err) {
    console.error('Erro ao processar webhook do Stripe:', err)
    res.status(500).json({ error: 'Erro ao processar evento' })
  }
}
