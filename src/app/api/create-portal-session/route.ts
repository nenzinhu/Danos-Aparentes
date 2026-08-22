import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { getStripe } from '@/src/lib/server/stripeClient'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user?.id) {
    return errorJson('Não autenticado', 401)
  }

  const appUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://danosaparentes.com.br'
  const returnUrl = `${appUrl.replace(/\/$/, '')}/planos`

  try {
    const stripe = getStripe()
    const customers = await stripe.customers.list({ email: user.email, limit: 1 })
    const customerId = customers.data[0]?.id
    if (!customerId) {
      return errorJson('Nenhum cliente Stripe encontrado para esta conta.', 404)
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    if (!session.url) {
      return errorJson('Falha ao criar sessão do portal (sem URL)', 502)
    }
    return NextResponse.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao abrir portal'
    console.error('[create-portal-session]', msg)
    return errorJson(msg, 500)
  }
}
