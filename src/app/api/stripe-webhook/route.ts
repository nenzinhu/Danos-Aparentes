import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/src/lib/server/stripeClient';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';

// Payloads de webhook do Stripe são tipicamente pequenos (poucos KB). 1MB é
// uma margem generosa que ainda protege contra payloads gigantes de origem
// não confiável consumindo memória antes da validação de assinatura.
const MAX_BODY_BYTES = 1024 * 1024;

// Lê o corpo em chunks e aborta assim que o total de bytes recebidos excede
// o limite, em vez de confiar apenas no header Content-Length — que pode
// estar ausente (chunked transfer-encoding) ou não refletir o tamanho real.
async function readRawBody(req: NextRequest, maxBytes: number): Promise<string> {
  const reader = req.body?.getReader();
  if (!reader) return '';

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error('Corpo da requisição excede o tamanho máximo permitido');
      }
      chunks.push(value);
    }
  }

  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf-8');
}

// Lê o fim do período atual de um Subscription, cobrindo tanto a API antiga
// (campo no objeto subscription) quanto a API mais recente do Stripe (campo
// dentro de cada subscription item).
export function getCurrentPeriodEnd(subscription: Stripe.Subscription): number | null {
  const fromItem = subscription.items.data[0]?.current_period_end;
  if (typeof fromItem === 'number') return fromItem;
  const legacy = (subscription as unknown as { current_period_end?: number }).current_period_end;
  return typeof legacy === 'number' ? legacy : null;
}

export function mapStripeStatus(status: Stripe.Subscription.Status): 'active' | 'past_due' | 'canceled' {
  if (status === 'active' || status === 'trialing') return 'active';
  if (status === 'past_due' || status === 'unpaid' || status === 'incomplete') return 'past_due';
  return 'canceled';
}

// Deriva o plan_tier a partir dos Price IDs realmente comprados, em vez de
// confiar em metadata enviada pelo client — funciona tanto para checkout
// self-serve quanto para Payment Links criados manualmente pra vendas
// Corporativo (fechadas via WhatsApp/consultivo, fora do fluxo de app).
// Corporativo tem um Price "base" obrigatório + Prices opcionais de inspetor
// adicional na mesma assinatura, então checamos TODOS os itens, não só o
// primeiro — a ordem dos line items não é uma garantia confiável.
// Precedência: corporativo > starter > pro (default), caso mais de um Price
// apareça por engano na mesma assinatura.
export function resolvePlanTier(subscription: Stripe.Subscription): 'starter' | 'pro' | 'corporativo' {
  const corporateBasePriceId = process.env.STRIPE_PRICE_ID_CORPORATE;
  const starterPriceId = process.env.STRIPE_PRICE_ID_STARTER;

  if (corporateBasePriceId && subscription.items.data.some(item => item.price.id === corporateBasePriceId)) {
    return 'corporativo';
  }
  if (starterPriceId && subscription.items.data.some(item => item.price.id === starterPriceId)) {
    return 'starter';
  }
  return 'pro';
}

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Corpo da requisição excede o tamanho máximo permitido' }, { status: 413 });
  }

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Assinatura do webhook ausente ou não configurada' }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  let rawBody: string;
  try {
    rawBody = await readRawBody(req, MAX_BODY_BYTES);
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição excede o tamanho máximo permitido' }, { status: 413 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Assinatura inválida: ${(err as Error).message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (userId && session.customer && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const planTier = resolvePlanTier(subscription);

        const { data, error } = await supabaseAdmin.from('subscriptions').update({
          status: 'active',
          plan_tier: planTier,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId).select('user_id');

        if (error) {
          console.error(`[stripe-webhook] Falha ao ativar assinatura do usuário ${userId}:`, error);
        } else if (!data || data.length === 0) {
          console.error(`[stripe-webhook] checkout.session.completed: nenhuma linha em subscriptions para user_id=${userId} — assinante fantasma (pago no Stripe, sem acesso liberado).`);
        }
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const status = event.type === 'customer.subscription.deleted'
        ? 'canceled'
        : mapStripeStatus(subscription.status);
      const periodEndUnix = getCurrentPeriodEnd(subscription);
      const planTier = resolvePlanTier(subscription);

      const { data, error } = await supabaseAdmin.from('subscriptions').update({
        status,
        plan_tier: planTier,
        current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', subscription.id).select('user_id');

      if (error) {
        console.error(`[stripe-webhook] Falha ao atualizar assinatura stripe_subscription_id=${subscription.id}:`, error);
      } else if (!data || data.length === 0) {
        console.error(`[stripe-webhook] ${event.type}: nenhuma linha em subscriptions para stripe_subscription_id=${subscription.id} — atualização perdida.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Erro ao processar webhook do Stripe:', err);
    return NextResponse.json({ error: 'Erro ao processar evento' }, { status: 500 });
  }
}
