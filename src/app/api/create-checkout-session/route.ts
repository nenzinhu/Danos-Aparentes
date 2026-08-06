import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/src/lib/server/stripeClient'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { getTrustedBaseUrl } from '@/src/lib/server/trustedBaseUrl'
import { STRIPE_PLAN_METADATA_KEY } from '@/src/lib/billing/plans'
import {
  assertStripePriceAvailable,
  checkoutIntegrationId,
  classifyStripePriceError,
  resolveCheckoutPlan,
  stripePriceUserMessage,
} from '@/src/lib/server/stripePlans'

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { plan, priceId, envVar } = resolveCheckoutPlan(req.nextUrl.searchParams.get('plan'))
  if (!priceId) {
    return NextResponse.json({ error: `${envVar} não configurada` }, { status: 500 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const priceCheck = await assertStripePriceAvailable(priceId, envVar)
  if (!priceCheck.ok) {
    return NextResponse.json({ error: priceCheck.error }, { status: priceCheck.status })
  }

  const origin = getTrustedBaseUrl({
    origin: req.headers.get('origin'),
    host: req.headers.get('host'),
  })

  try {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    // Checkout Session em mode=subscription (Stripe Billing best practice).
    // Sem payment_method_types — métodos dinâmicos via Dashboard.
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: sub?.stripe_customer_id || undefined,
      customer_email: sub?.stripe_customer_id ? undefined : user.email,
      client_reference_id: user.id,
      allow_promotion_codes: true,
      integration_identifier: checkoutIntegrationId(plan),
      metadata: {
        [STRIPE_PLAN_METADATA_KEY]: plan,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          [STRIPE_PLAN_METADATA_KEY]: plan,
          user_id: user.id,
        },
      },
      success_url: `${origin}/app?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app?checkout=canceled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Erro ao criar sessão de checkout:', err)
    const issue = classifyStripePriceError(err)
    return NextResponse.json(
      {
        error:
          issue === 'other'
            ? 'Erro ao criar sessão de checkout. Tente novamente em alguns instantes.'
            : stripePriceUserMessage(issue, envVar),
      },
      { status: issue === 'other' ? 500 : 503 },
    )
  }
}
