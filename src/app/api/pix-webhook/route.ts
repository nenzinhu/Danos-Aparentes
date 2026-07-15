import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import {
  getMercadoPagoPayment,
  verifyMercadoPagoWebhookSignature,
} from '@/src/lib/server/mercadoPago'
import { PIX_UNITS_MAX, PIX_UNITS_MIN } from '@/src/lib/pixPricing'

function addMonths(from: Date, months: number): Date {
  const d = new Date(from.getTime())
  d.setUTCMonth(d.getUTCMonth() + months)
  return d
}

export function monthsFromPaymentMetadata(metadata: Record<string, unknown> | null | undefined): number {
  const raw = metadata?.units
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return 1
  return Math.min(PIX_UNITS_MAX, Math.max(PIX_UNITS_MIN, Math.floor(n)))
}

export async function GET(req: NextRequest) {
  // Mercado Pago às vezes consulta a URL com GET no cadastro da notificação.
  const id = req.nextUrl.searchParams.get('data.id') || req.nextUrl.searchParams.get('id')
  if (id) {
    await processPaymentNotification(String(id), req)
  }
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const urlId = req.nextUrl.searchParams.get('data.id') || req.nextUrl.searchParams.get('id')

  let bodyId: string | null = null
  let topic: string | null = null
  try {
    const json = (await req.json()) as {
      data?: { id?: string | number }
      id?: string | number
      type?: string
      action?: string
      topic?: string
    }
    bodyId = json?.data?.id != null ? String(json.data.id) : json?.id != null ? String(json.id) : null
    topic = json?.type || json?.topic || json?.action || null
  } catch {
    // body vazio / não-JSON — ainda tentamos query string
  }

  const paymentId = urlId || bodyId
  if (!paymentId) {
    return NextResponse.json({ ok: true, skipped: 'no_payment_id' })
  }

  // Só processamos notificações de pagamento (quando o tipo vier informado).
  if (topic && !/payment/i.test(topic) && topic !== 'payment.updated' && topic !== 'payment.created') {
    return NextResponse.json({ ok: true, skipped: 'not_payment' })
  }

  await processPaymentNotification(paymentId, req)
  return NextResponse.json({ received: true })
}

async function processPaymentNotification(paymentId: string, req: NextRequest): Promise<void> {
  const secret = process.env.PIX_WEBHOOK_SECRET
  if (secret) {
    const ok = verifyMercadoPagoWebhookSignature({
      dataId: paymentId,
      requestId: req.headers.get('x-request-id'),
      xSignature: req.headers.get('x-signature'),
      secret,
    })
    if (!ok) {
      console.error('[pix-webhook] Assinatura inválida para payment_id=', paymentId)
      return
    }
  }

  if (!supabaseAdmin) {
    console.error('[pix-webhook] Supabase admin não configurado')
    return
  }

  let payment
  try {
    payment = await getMercadoPagoPayment(paymentId)
  } catch (err) {
    console.error('[pix-webhook] Falha ao buscar pagamento', paymentId, err)
    return
  }

  if (payment.status !== 'approved') {
    return
  }

  const userId = payment.external_reference
  if (!userId) {
    console.error('[pix-webhook] Pagamento aprovado sem external_reference', paymentId)
    return
  }

  const months = monthsFromPaymentMetadata(payment.metadata ?? undefined)
  const periodEnd = addMonths(new Date(), months).toISOString()

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'active',
      plan_tier: 'pro',
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('user_id')

  if (error) {
    console.error('[pix-webhook] Falha ao ativar assinatura user_id=', userId, error)
  } else if (!data || data.length === 0) {
    console.error(
      '[pix-webhook] Nenhuma linha em subscriptions para user_id=',
      userId,
      '— PIX pago sem acesso liberado',
    )
  }
}
