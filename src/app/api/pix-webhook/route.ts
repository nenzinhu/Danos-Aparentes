// src/app/api/pix-webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { mercadoPagoRequest } from '@/src/lib/server/mercadoPagoClient'
import { extendSubscriptionExpiry } from '@/src/lib/subscriptionAccess'
import {
  buildMercadoPagoManifest,
  parseMercadoPagoSignatureHeader,
  verifyMercadoPagoHmac,
} from '@/src/lib/server/mercadoPagoWebhook'

/**
 * Webhook Mercado Pago PIX — valida x-signature, busca pagamento e ativa active_pix.
 */
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

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

  const { data: sub, error } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, expires_at, pending_months')
    .eq('pix_charge_id', paymentIdStr)
    .maybeSingle()

  if (error) {
    console.error('[pix-webhook] erro ao obter subscription:', error)
    return NextResponse.json({ error: 'Failed to find subscription' }, { status: 500 })
  }

  if (!sub) {
    console.error('[pix-webhook] nenhuma subscription com pix_charge_id=', paymentIdStr)
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  const extraMonths = sub.pending_months ?? 1
  const newExpires = extendSubscriptionExpiry(
    sub.expires_at as string | null,
    Number(extraMonths),
  )

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'active_pix',
      expires_at: newExpires.toISOString(),
      pending_months: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('pix_charge_id', paymentIdStr)
    .select('user_id')
    .maybeSingle()

  if (updateError) {
    console.error('[pix-webhook] erro ao atualizar subscription:', updateError)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }

  return NextResponse.json({ received: true, userId: updated?.user_id })
}
