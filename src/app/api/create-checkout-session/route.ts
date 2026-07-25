import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/lib/server/stripeClient';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { getUserFromRequest } from '@/src/lib/server/auth';
import { getTrustedBaseUrl } from '@/src/lib/server/trustedBaseUrl';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const plan = req.nextUrl.searchParams.get('plan') === 'starter' ? 'starter' : 'pro';
  const priceId = plan === 'starter' ? process.env.STRIPE_PRICE_ID_STARTER : process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    const envVar = plan === 'starter' ? 'STRIPE_PRICE_ID_STARTER' : 'STRIPE_PRICE_ID';
    return NextResponse.json({ error: `${envVar} não configurada` }, { status: 500 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  const origin = getTrustedBaseUrl({
    origin: req.headers.get('origin'),
    host: req.headers.get('host'),
  });

  try {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: sub?.stripe_customer_id || undefined,
      customer_email: sub?.stripe_customer_id ? undefined : user.email,
      client_reference_id: user.id,
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/app?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Erro ao criar sessão de checkout:', err);
    const stripeMessage = err instanceof Error ? err.message : '';
    const testLiveMismatch =
      stripeMessage.includes('test mode') && stripeMessage.includes('live mode');
    return NextResponse.json(
      {
        error: testLiveMismatch
          ? 'Configuração Stripe inconsistente: o Price ID está em modo teste, mas a chave da API é live. Crie o preço no Dashboard Live e atualize STRIPE_PRICE_ID_STARTER / STRIPE_PRICE_ID na Vercel.'
          : 'Erro ao criar sessão de checkout. Tente novamente em alguns instantes.',
      },
      { status: 500 },
    );
  }
}
