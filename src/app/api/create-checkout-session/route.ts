import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { getStripe } from '@/src/lib/server/stripeClient'
import { resolveCheckoutPlan, assertStripePriceAvailable } from '@/src/lib/server/stripePlans'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabaseEnv'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user?.id) {
    return errorJson('Não autenticado', 401)
  }

  const url = new URL(req.url)
  const planParam = url.searchParams.get('plan')
  const { plan, priceId, envVar } = resolveCheckoutPlan(planParam)
  if (!priceId) {
    return errorJson(
      `Price ID do Stripe não configurado (${envVar}). Defina a variável de ambiente na Vercel.`,
      503,
    )
  }

  const assert = await assertStripePriceAvailable(priceId, envVar)
  if (!assert.ok) {
    return errorJson(assert.error, assert.status)
  }

  const appUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://danosaparentes.com.br'
  const successUrl = `${appUrl.replace(/\/$/, '')}/app?checkout=success&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${appUrl.replace(/\/$/, '')}/planos?checkout=cancel`

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      subscription_data: { metadata: { plan_tier: plan } },
      metadata: { user_id: user.id, plan_tier: plan },
    })
    if (!session.url) {
      return errorJson('Falha ao criar sessão de checkout (sem URL)', 502)
    }
    return NextResponse.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar checkout'
    console.error('[create-checkout-session]', msg)
    return errorJson(msg, 500)
  }
}
