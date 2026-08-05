// src/app/api/pix-webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { mercadoPagoRequest } from '@/src/lib/server/mercadoPagoClient'
import { activatePixSubscriptionByChargeId } from '@/src/lib/server/activatePixSubscription'
import {
  buildMercadoPagoManifest,
  parseMercadoPagoSignatureHeader,
  verifyMercadoPagoHmac,
} from '@/src/lib/server/mercadoPagoWebhook'

/**
 * Webhook Mercado Pago PIX — valida x-signature, busca pagamento e ativa active_pix.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signatureHeader = req.headers.get('x-signature')
  const requestId = req.headers.get('x-request-id') || ''
  const webhookSecret = process.env.PIX_WEBHOOK_SECRET

  if (!signatureHeader || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  const parsedSig = parseMercadoPagoSignatureHeader(signatureHeader)
  if (!parsedSig) {
    return NextResponse.json({ error: 'Malformed signature header' }, { status: 400 })
  }

  let payload: { type?: string; data?: { id?: string | number } }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const dataIdFromQuery = req.nextUrl.searchParams.get('data.id')
  const dataId = dataIdFromQuery || payload?.data?.id
  if (!dataId) {
    return NextResponse.json({ error: 'Missing data.id' }, { status: 400 })
  }

  const dataIdStr = String(dataId)
  const manifest = buildMercadoPagoManifest(dataIdStr, requestId, parsedSig.ts)
  if (!verifyMercadoPagoHmac(webhookSecret, manifest, parsedSig.v1)) {
    console.error('[pix-webhook] assinatura inválida', { manifest })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const type = payload.type
  const paymentId = payload?.data?.id

  if (type !== 'payment' || paymentId == null) {
    return NextResponse.json({ received: true })
  }

  const paymentIdStr = String(paymentId)

  if (!process.env.PIX_MERCADO_PAGO_ACCESS_TOKEN) {
    console.error('[pix-webhook] PIX_MERCADO_PAGO_ACCESS_TOKEN não configurado')
    return NextResponse.json({ error: 'Payment provider not configured' }, { status: 500 })
  }

  let payment: { status?: string }
  try {
    payment = (await mercadoPagoRequest(`/v1/payments/${paymentIdStr}`, 'GET')) as { status?: string }
  } catch (err) {
    console.error('[pix-webhook] erro ao buscar pagamento no Mercado Pago:', err)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 502 })
  }

  if (payment.status !== 'approved') {
    return NextResponse.json({ received: true, status: payment.status })
  }

  const result = await activatePixSubscriptionByChargeId(paymentIdStr)
  // Sem assinatura local: ACK para o provedor não insistir em retry.
  if (!result.ok && result.status === 404) {
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
