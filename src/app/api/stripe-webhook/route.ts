import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/src/lib/server/stripeClient';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { getStripePriceId } from '@/src/lib/server/stripePlans';

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

function subscriptionPriceIds(subscription: Stripe.Subscription): string[] {
  return subscription.items.data.map((item) => item.price.id);
}

// Deriva o plan_tier a partir dos Price IDs realmente comprados, em vez de
// confiar em metadata enviada pelo client — funciona tanto para checkout
// self-serve quanto para Payment Links criados manualmente pra vendas
// Corporativo (fechadas via WhatsApp/consultivo, fora do fluxo de app).
// Precedência: corporativo > starter > pro (default).
export function resolvePlanTier(subscription: Stripe.Subscription): 'starter' | 'pro' | 'corporativo' {
  const ids = subscriptionPriceIds(subscription);
  const corporateBasePriceId = getStripePriceId('corporativo');
  const starterPriceId = getStripePriceId('starter');
  const proPriceId = getStripePriceId('pro');

  if (corporateBasePriceId && ids.includes(corporateBasePriceId)) return 'corporativo';
  if (starterPriceId && ids.includes(starterPriceId)) return 'starter';
  if (proPriceId && ids.includes(proPriceId)) return 'pro';
  return 'pro';
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const sub = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription;
  if (!sub) return null;
  return typeof sub === 'string' ? sub : sub.id;
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

  /** Fail-closed: qualquer falha de escrita no DB → 5xx para o Stripe retentar. */
  let dbWriteFailed = false;

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.user_id;
      if (userId && session.customer && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const planTier = resolvePlanTier(subscription);
        const periodEndUnix = getCurrentPeriodEnd(subscription);

        const payload = {
          user_id: userId,
          status: 'active' as const,
          plan_tier: planTier,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        };

        // Upsert evita "assinante fantasma" se a linha do trial não existir.
        const { data, error } = await supabaseAdmin
          .from('subscriptions')
          .upsert(payload, { onConflict: 'user_id' })
          .select('user_id');

        if (error) {
          console.error(`[stripe-webhook] Falha ao ativar assinatura do usuário ${userId}:`, error);
          dbWriteFailed = true;
        } else if (!data || data.length === 0) {
          console.error(`[stripe-webhook] checkout.session.completed: upsert sem retorno para user_id=${userId}`);
          dbWriteFailed = true;
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
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer?.id ?? null;
      const userIdFromMeta =
        typeof subscription.metadata?.user_id === 'string' ? subscription.metadata.user_id : null;

      const updatePayload = {
        status,
        plan_tier: planTier,
        stripe_subscription_id: subscription.id,
        current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
        ...(customerId ? { stripe_customer_id: customerId } : {}),
      };

      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update(updatePayload)
        .eq('stripe_subscription_id', subscription.id)
        .select('user_id');

      if (error) {
        console.error(`[stripe-webhook] Falha ao atualizar assinatura stripe_subscription_id=${subscription.id}:`, error);
        dbWriteFailed = true;
      } else if (!data || data.length === 0) {
        // Checkout pode ter falhado antes — tenta upsert se soubermos o user_id.
        if (userIdFromMeta) {
          const { data: upserted, error: upsertErr } = await supabaseAdmin
            .from('subscriptions')
            .upsert(
              { user_id: userIdFromMeta, ...updatePayload },
              { onConflict: 'user_id' },
            )
            .select('user_id');
          if (upsertErr || !upserted?.length) {
            console.error(
              `[stripe-webhook] ${event.type}: upsert fallback falhou sub=${subscription.id}`,
              upsertErr,
            );
            dbWriteFailed = true;
          }
        } else {
          console.error(
            `[stripe-webhook] ${event.type}: nenhuma linha para stripe_subscription_id=${subscription.id} e sem metadata.user_id`,
          );
          dbWriteFailed = true;
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = invoiceSubscriptionId(invoice);
      if (subId) {
        const { data, error } = await supabaseAdmin.from('subscriptions').update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subId).select('user_id');
        if (error) {
          console.error(`[stripe-webhook] invoice.payment_failed: falha ao marcar past_due sub=${subId}:`, error);
          dbWriteFailed = true;
        } else if (!data || data.length === 0) {
          console.error(`[stripe-webhook] invoice.payment_failed: linha ausente sub=${subId}`);
          dbWriteFailed = true;
        }
      }
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = invoiceSubscriptionId(invoice);
      if (subId) {
        const { data, error } = await supabaseAdmin.from('subscriptions').update({
          status: 'active',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subId).select('user_id');
        if (error) {
          console.error(`[stripe-webhook] invoice.paid: falha ao marcar active sub=${subId}:`, error);
          dbWriteFailed = true;
        } else if (!data || data.length === 0) {
          console.error(`[stripe-webhook] invoice.paid: linha ausente sub=${subId}`);
          dbWriteFailed = true;
        }
      }
    }

    if (dbWriteFailed) {
      return NextResponse.json(
        { error: 'Falha ao persistir assinatura — Stripe deve retentar' },
        { status: 500 },
      );
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Erro ao processar webhook do Stripe:', err);
    const { captureServerException } = await import('@/src/lib/monitoring/capture');
    await captureServerException(err, { route: 'stripe-webhook', event_type: event.type });
    return NextResponse.json({ error: 'Erro ao processar evento' }, { status: 500 });
  }
}
