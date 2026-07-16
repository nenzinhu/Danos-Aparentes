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

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'Usuário ainda não tem assinatura registrada' }, { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/app`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error('Erro ao abrir portal de gerenciamento:', err);
    return NextResponse.json(
      { error: 'Erro ao abrir o portal de gerenciamento. Tente novamente em alguns instantes.' },
      { status: 500 },
    );
  }
}
