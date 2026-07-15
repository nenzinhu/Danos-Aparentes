import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { MercadoPagoError, getMercadoPagoPayment } from '@/src/lib/server/mercadoPago'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const paymentId = req.nextUrl.searchParams.get('id')
  if (!paymentId || !/^\d+$/.test(paymentId)) {
    return NextResponse.json({ error: 'id do pagamento inválido' }, { status: 400 })
  }

  try {
    const payment = await getMercadoPagoPayment(paymentId)
    if (payment.external_reference && payment.external_reference !== user.id) {
      return NextResponse.json({ error: 'Pagamento não pertence a esta conta' }, { status: 403 })
    }

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail || null,
      approved: payment.status === 'approved',
    })
  } catch (err) {
    if (err instanceof MercadoPagoError) {
      return NextResponse.json({ error: err.message }, { status: err.status >= 400 ? err.status : 502 })
    }
    return NextResponse.json({ error: 'Falha ao consultar PIX' }, { status: 500 })
  }
}
