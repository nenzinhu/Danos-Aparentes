import crypto from 'crypto'
import { supabase, supabaseEnabled } from '../supabase'

export interface WebhookPayload {
  event: 'inspection.created' | 'vehicle.event_created' | 'vehicle.updated'
  timestamp: string
  data: Record<string, unknown>
}

export async function dispatchWebhookEvent(
  companyId: string,
  event: WebhookPayload['event'],
  payloadData: Record<string, unknown>,
): Promise<void> {
  if (!supabaseEnabled || !supabase || !companyId) return

  try {
    const { data: subs, error } = await supabase
      .from('webhook_subscriptions')
      .select('url, secret')
      .eq('company_id', companyId)
      .eq('active', true)

    if (error || !subs || subs.length === 0) return

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: payloadData,
    }

    const payloadString = JSON.stringify(payload)

    for (const sub of subs) {
      const signature = crypto
        .createHmac('sha256', sub.secret)
        .update(payloadString)
        .digest('hex')

      fetch(sub.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-DanosAparentes-Signature': signature,
          'User-Agent': 'DanosAparentes-Webhook/1.0',
        },
        body: payloadString,
      }).catch(err => {
        console.warn(`[webhookDispatcher] Failed to dispatch to ${sub.url}:`, err.message)
      })
    }
  } catch (err) {
    console.warn('[webhookDispatcher] Error dispatching webhooks:', err)
  }
}
