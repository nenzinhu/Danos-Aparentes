import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import {
  MercadoPagoError,
  buildPixIdempotencyKey,
  createPixPayment,
  getMercadoPagoAccessToken,
} from '@/src/lib/server/mercadoPago'
import {
  PIX_SURCHARGE_MAX_BRL,
  PIX_UNITS_MAX,
  PIX_UNITS_MIN,
  calculatePixAmount,
  getPixUnitPriceFromEnv,
} from '@/src/lib/pixPricing'

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (!getMercadoPagoAccessToken()) {
    return NextResponse.json(
      { error: 'PIX (Mercado Pago) não configurado no servidor' },
      { status: 503 },
    )
  }

  if (!user.email) {
    return NextResponse.json(
      { error: 'Conta sem e-mail — necessário para gerar o PIX' },
      { status: 400 },
    )
  }

  let body: { units?: unknown; surchargeBrl?: unknown } = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const unitsRaw = Number(body.units)
  const surchargeRaw = Number(body.surchargeBrl)
  if (!Number.isFinite(unitsRaw) || unitsRaw < PIX_UNITS_MIN || unitsRaw > PIX_UNITS_MAX) {
    return NextResponse.json(
      { error: `Informe de ${PIX_UNITS_MIN} a ${PIX_UNITS_MAX} unidades (meses)` },
      { status: 400 },
    )
  }
  if (Number.isFinite(surchargeRaw) && (surchargeRaw < 0 || surchargeRaw > PIX_SURCHARGE_MAX_BRL)) {
    return NextResponse.json(
      { error: `Acréscimo deve ser entre 0 e R$ ${PIX_SURCHARGE_MAX_BRL.toFixed(2)}` },
      { status: 400 },
    )
  }

  const breakdown = calculatePixAmount({
    units: unitsRaw,
    surchargeBrl: Number.isFinite(surchargeRaw) ? surchargeRaw : 0,
    unitPriceBrl: getPixUnitPriceFromEnv(),
  })

  if (breakdown.totalBrl < 0.01) {
    return NextResponse.json({ error: 'Valor do PIX inválido' }, { status: 400 })
  }

  const origin = req.headers.get('origin') || `https://${req.headers.get('host')}`
  const notificationUrl = `${origin}/api/pix-webhook`
  const idempotencyKey = buildPixIdempotencyKey(
    user.id,
    breakdown.units,
    breakdown.surchargeBrl,
  )

  const description =
    breakdown.surchargeBrl > 0
      ? `Danos Aparentes Pro — ${breakdown.units} mês(es) + acréscimo R$ ${breakdown.surchargeBrl.toFixed(2)}`
      : `Danos Aparentes Pro — ${breakdown.units} mês(es)`

  try {
    const payment = await createPixPayment({
      amountBrl: breakdown.totalBrl,
      description,
      payerEmail: user.email,
      externalReference: user.id,
      notificationUrl,
      idempotencyKey,
      metadata: {
        user_id: user.id,
        units: breakdown.units,
        surcharge_brl: breakdown.surchargeBrl,
        unit_price_brl: breakdown.unitPriceBrl,
        purpose: 'pro_subscription',
      },
    })

    const tx = payment.point_of_interaction?.transaction_data
    const qrCode = tx?.qr_code || null
    const qrCodeBase64 = tx?.qr_code_base64 || null
    const ticketUrl = tx?.ticket_url || null

    if (!qrCode && !qrCodeBase64 && !ticketUrl) {
      console.error(
        '[create-pix-payment] Pagamento criado sem dados de QR. payment_id=%s status=%s detail=%s',
        payment.id,
        payment.status,
        payment.status_detail,
      )
      return NextResponse.json(
        {
          error:
            'Mercado Pago não retornou QR Code. Verifique se a chave PIX da conta está ativa e se o Access Token é de produção/testes correto.',
          paymentId: payment.id,
          status: payment.status,
        },
        { status: 502 },
      )
    }

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      qrCode,
      qrCodeBase64,
      ticketUrl,
      expiresAt: payment.date_of_expiration || null,
      amount: breakdown,
    })
  } catch (err) {
    if (err instanceof MercadoPagoError) {
      console.error('[create-pix-payment] Mercado Pago:', err.status, err.body)
      return NextResponse.json(
        { error: err.message || 'Falha ao criar pagamento PIX' },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 },
      )
    }
    console.error('[create-pix-payment] Erro inesperado:', err)
    return NextResponse.json({ error: 'Erro ao criar PIX' }, { status: 500 })
  }
}
