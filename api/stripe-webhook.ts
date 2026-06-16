import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { stripe } from './_lib/stripeClient.js'
import { supabaseAdmin } from './_lib/supabaseAdmin.js'

// Desliga o parser automático de JSON: precisamos do corpo "crú" (raw) da
// requisição pra validar a assinatura criptográfica do Stripe.
export const config = {
  api: { bodyParser: false },
}

// Payloads de webhook do Stripe são tipicamente pequenos (poucos KB). 1MB é
// uma margem generosa que ainda protege contra payloads gigantes de origem
// não confiável consumindo memória antes da validação de assinatura.
const MAX_BODY_BYTES = 1024 * 1024

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let totalBytes = 0
    req.on('data', (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      totalBytes += buf.length
      if (totalBytes > MAX_BODY_BYTES) {
        reject(new Error('Corpo da requisição excede o tamanho máximo permitido'))
        return
      }
      chunks.push(buf)
    })
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
        const { data, error } = await supabaseAdmin.from('subscriptions').update({
          status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId).select('user_id')

        if (error) {
          console.error(`[stripe-webhook] Falha ao ativar assinatura do usuário ${userId}:`, error)
        } else if (!data || data.length === 0) {
          console.error(`[stripe-webhook] checkout.session.completed: nenhuma linha em subscriptions para user_id=${userId} — assinante fantasma (pago no Stripe, sem acesso liberado).`)
        }
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const status = event.type === 'customer.subscription.deleted'
        ? 'canceled'
        : mapStripeStatus(subscription.status)
      const periodEndUnix = getCurrentPeriodEnd(subscription)

      const { data, error } = await supabaseAdmin.from('subscriptions').update({
        status,
        current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', subscription.id).select('user_id')

      if (error) {
        console.error(`[stripe-webhook] Falha ao atualizar assinatura stripe_subscription_id=${subscription.id}:`, error)
      } else if (!data || data.length === 0) {
        console.error(`[stripe-webhook] ${event.type}: nenhuma linha em subscriptions para stripe_subscription_id=${subscription.id} — atualização perdida.`)
      }
    }

    res.status(200).json({ received: true })
  } catch (err) {
    console.error('Erro ao processar webhook do Stripe:', err)
    res.status(500).json({ error: 'Erro ao processar evento' })
  }
}
