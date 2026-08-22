import { NextRequest, NextResponse } from 'next/server'
import { mercadoPagoRequest } from '@/src/lib/server/mercadoPagoClient'
import {
  parseMercadoPagoSignatureHeader,
  buildMercadoPagoManifest,
  verifyMercadoPagoHmac,
} from '@/src/lib/server/mercadoPagoWebhook'
import { activatePixSubscriptionByChargeId } from '@/src/lib/server/activatePixSubscription'

// Webhook de confirmação de pagamento PIX (Mercado Pago).
// Fluxo: valida HMAC → consulta status do pagamento → ativa assinatura se aprovado.

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: NextRequest) {
  const secret = process.env.PIX_WEBHOOK_SECRET
  if (!secret) {
    console.error('[pix-webhook] PIX_WEBHOOK_SECRET não configurado')
    return errorJson('Webhook não configurado', 500)
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const body = (raw ?? {}) as { data?: { id?: string | number }; type?: string }
  const paymentId = body.data?.id != null ? String(body.data.id) : ''
  if (!paymentId) {
    return errorJson('Payload sem data.id', 400)
  }

  const signatureHeader = req.headers.get('x-signature') || ''
  const parsed = parseMercadoPagoSignatureHeader(signatureHeader)
  if (!parsed) {
    return errorJson('Assinatura ausente ou malformada', 400)
  }

  const requestId = req.headers.get('x-request-id') || ''
  const manifest = buildMercadoPagoManifest(paymentId, requestId, parsed.ts)
  if (!verifyMercadoPagoHmac(secret, manifest, parsed.v1)) {
    return errorJson('Assinatura inválida', 400)
  }

  // Só Mercado Pago usa este esquema de assinatura hoje.
  const provider = process.env.PIX_PROVIDER || 'mercadopago'
  if (provider !== 'mercadopago') {
    console.warn(`[pix-webhook] provider ${provider} sem verificação implementada`)
    return errorJson('Provedor não suportado neste webhook', 400)
  }

  let status: string
  try {
    const payment = (await mercadoPagoRequest(`/v1/payments/${paymentId}`, 'GET')) as {
      status?: string
    }
    status = payment?.status ?? 'unknown'
  } catch (err) {
    console.error('[pix-webhook] falha ao consultar pagamento:', err)
    return errorJson('Falha ao consultar pagamento', 502)
  }

  if (status !== 'approved') {
    return NextResponse.json({ status })
  }

  const result = await activatePixSubscriptionByChargeId(paymentId)
  if (!result.ok) {
    console.error('[pix-webhook] falha ao ativar assinatura:', result.error)
    return errorJson(result.error || 'Falha ao ativar assinatura', result.status || 500)
  }

  return NextResponse.json({ status: 'approved' })
}
