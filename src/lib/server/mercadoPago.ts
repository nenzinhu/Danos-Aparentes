import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

const MP_API = 'https://api.mercadopago.com'

export function getMercadoPagoAccessToken(): string | null {
  return (
    process.env.PIX_MERCADO_PAGO_ACCESS_TOKEN ||
    process.env.MERCADO_PAGO_ACCESS_TOKEN ||
    null
  )
}

export interface CreatePixPaymentParams {
  amountBrl: number
  description: string
  payerEmail: string
  externalReference: string
  metadata?: Record<string, string | number | boolean>
  notificationUrl?: string
  idempotencyKey: string
}

export interface PixTransactionData {
  qr_code?: string
  qr_code_base64?: string
  ticket_url?: string
}

export interface MercadoPagoPayment {
  id: number
  status: string
  status_detail?: string
  transaction_amount?: number
  external_reference?: string | null
  metadata?: Record<string, unknown> | null
  date_of_expiration?: string | null
  point_of_interaction?: {
    transaction_data?: PixTransactionData
  } | null
}

export class MercadoPagoError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'MercadoPagoError'
    this.status = status
    this.body = body
  }
}

async function mpFetch<T>(
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const token = getMercadoPagoAccessToken()
  if (!token) {
    throw new MercadoPagoError('PIX_MERCADO_PAGO_ACCESS_TOKEN não configurada', 500, null)
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  if (init.idempotencyKey) {
    headers['X-Idempotency-Key'] = init.idempotencyKey
  }

  const res = await fetch(`${MP_API}${path}`, {
    ...init,
    headers,
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const msg =
      body && typeof body === 'object' && 'message' in body && typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Mercado Pago HTTP ${res.status}`
    throw new MercadoPagoError(msg, res.status, body)
  }
  return body as T
}

export async function createPixPayment(params: CreatePixPaymentParams): Promise<MercadoPagoPayment> {
  return mpFetch<MercadoPagoPayment>('/v1/payments', {
    method: 'POST',
    idempotencyKey: params.idempotencyKey,
    body: JSON.stringify({
      transaction_amount: params.amountBrl,
      description: params.description,
      payment_method_id: 'pix',
      payer: { email: params.payerEmail },
      external_reference: params.externalReference,
      metadata: params.metadata ?? {},
      notification_url: params.notificationUrl,
    }),
  })
}

export async function getMercadoPagoPayment(paymentId: string | number): Promise<MercadoPagoPayment> {
  return mpFetch<MercadoPagoPayment>(`/v1/payments/${paymentId}`, { method: 'GET' })
}

/**
 * Valida o header x-signature do webhook do Mercado Pago quando
 * PIX_WEBHOOK_SECRET estiver configurado.
 * Docs: manifest = `id:{data.id};request-id:{x-request-id};ts:{ts};`
 */
export function verifyMercadoPagoWebhookSignature(opts: {
  dataId: string
  requestId: string | null
  xSignature: string | null
  secret: string
}): boolean {
  const { dataId, requestId, xSignature, secret } = opts
  if (!xSignature || !requestId) return false

  const parts = Object.fromEntries(
    xSignature.split(',').map((pair) => {
      const [k, v] = pair.trim().split('=')
      return [k, v]
    }),
  ) as { ts?: string; v1?: string }

  if (!parts.ts || !parts.v1) return false

  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(parts.v1, 'utf8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/** Hash estável para idempotency key a partir de userId + units + surcharge. */
export function buildPixIdempotencyKey(userId: string, units: number, surchargeBrl: number): string {
  const stamp = Math.floor(Date.now() / (5 * 60 * 1000)) // janela de 5 min
  return createHash('sha256')
    .update(`pix:${userId}:${units}:${surchargeBrl}:${stamp}`)
    .digest('hex')
    .slice(0, 48)
}
