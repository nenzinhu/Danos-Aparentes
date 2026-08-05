// src/app/api/webhooks/asaas/route.ts
// Webhook Asaas — header `asaas-access-token` deve bater com ASAAS_WEBHOOK_TOKEN.

import { NextRequest, NextResponse } from 'next/server'
import { activatePixSubscriptionByChargeId, parsePixExternalReference } from '@/src/lib/server/activatePixSubscription'

const PAID_EVENTS = new Set([
  'PAYMENT_RECEIVED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_RECEIVED_IN_CASH',
])

const PAID_STATUSES = new Set(['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'])

type AsaasWebhookBody = {
  event?: string
  payment?: {
    id?: string
    status?: string
    billingType?: string
    /** user_id gravado em create-pix-charge */
    externalReference?: string | null
  }
}

export async function POST(req: NextRequest) {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN
  if (!expectedToken) {
    console.error('[asaas-webhook] ASAAS_WEBHOOK_TOKEN não configurado')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const incoming =
    req.headers.get('asaas-access-token') ||
    req.headers.get('Asaas-Access-Token') ||
    ''

  if (incoming !== expectedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  let body: AsaasWebhookBody
  try {
    body = (await req.json()) as AsaasWebhookBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event = body.event || ''
  const payment = body.payment
  const paymentId = payment?.id

  if (!paymentId) {
    return NextResponse.json({ received: true })
  }

  const statusOk = payment.status ? PAID_STATUSES.has(payment.status) : false
  const eventOk = PAID_EVENTS.has(event)

  if (!eventOk && !statusOk) {
    return NextResponse.json({ received: true, event, status: payment.status })
  }

  const chargeId = `asaas:${paymentId}`
  const parsedRef = parsePixExternalReference(payment.externalReference)
  const result = await activatePixSubscriptionByChargeId(chargeId, {
    userIdFallback: parsedRef.userId,
    planTierFallback: parsedRef.plan,
  })

  // Cobrança sem assinatura no app (teste manual, antigo, outro sistema):
  // ACK 200 para o Asaas parar retry/penalização. Não é falha da URL.
  if (!result.ok && result.status === 404) {
    console.warn('[asaas-webhook] cobrança sem subscription local', {
      chargeId,
      externalReference: payment.externalReference ?? null,
    })
    return NextResponse.json({
      received: true,
      ignored: true,
      reason: 'subscription_not_found',
    })
  }

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || 'Failed' },
      { status: result.status || 500 },
    )
  }

  return NextResponse.json({ received: true, userId: result.userId })
}
