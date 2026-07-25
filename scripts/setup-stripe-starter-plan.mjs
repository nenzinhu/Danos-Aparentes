#!/usr/bin/env node
// Cria (ou reaproveita, se já existir) o Product + Price recorrente do Plano
// Starter no Stripe, e imprime o Price ID pra colar em STRIPE_PRICE_ID_STARTER.
//
// Uso:
//   STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe-starter-plan.mjs
// ou, se você já tem STRIPE_SECRET_KEY no .env.local:
//   node -r dotenv/config scripts/setup-stripe-starter-plan.mjs dotenv_config_path=.env.local
//
// Idempotente: se rodar de novo, encontra o Product/Price existentes pelo
// nome/metadata em vez de duplicar.

import Stripe from 'stripe';

const PRODUCT_NAME = 'Plano Starter';
const PRODUCT_METADATA_KEY = 'danos_aparentes_plan';
const PRODUCT_METADATA_VALUE = 'starter';
const PRICE_BRL_CENTS = 2990; // R$ 29,90
const PRICE_INTERVAL = 'month';

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada no ambiente. Rode com a env var definida.');
  process.exit(1);
}

const mode = secretKey.startsWith('sk_live_') ? 'LIVE' : secretKey.startsWith('sk_test_') ? 'TEST' : 'DESCONHECIDO';
console.log(`🔑 Usando chave em modo: ${mode}`);
if (mode === 'DESCONHECIDO') {
  console.error('❌ A chave não começa com sk_live_ nem sk_test_. Abortando por segurança.');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

async function main() {
  // 1. Procura um Product já criado pra este plano (evita duplicar em reruns).
  const existingProducts = await stripe.products.search({
    query: `metadata['${PRODUCT_METADATA_KEY}']:'${PRODUCT_METADATA_VALUE}'`,
  });

  let product = existingProducts.data[0];
  if (product) {
    console.log(`✅ Product já existe: ${product.id} (${product.name})`);
  } else {
    product = await stripe.products.create({
      name: PRODUCT_NAME,
      description: 'Até 20 laudos em PDF por mês — Danos Aparentes',
      metadata: { [PRODUCT_METADATA_KEY]: PRODUCT_METADATA_VALUE },
    });
    console.log(`✨ Product criado: ${product.id}`);
  }

  // 2. Procura um Price recorrente mensal ativo com o valor certo, pra este Product.
  const existingPrices = await stripe.prices.list({ product: product.id, active: true, limit: 20 });
  let price = existingPrices.data.find(
    (p) =>
      p.recurring?.interval === PRICE_INTERVAL &&
      p.unit_amount === PRICE_BRL_CENTS &&
      p.currency === 'brl',
  );

  if (price) {
    console.log(`✅ Price já existe: ${price.id} (R$ ${(price.unit_amount / 100).toFixed(2)}/${PRICE_INTERVAL})`);
  } else {
    price = await stripe.prices.create({
      product: product.id,
      currency: 'brl',
      unit_amount: PRICE_BRL_CENTS,
      recurring: { interval: PRICE_INTERVAL },
      metadata: { [PRODUCT_METADATA_KEY]: PRODUCT_METADATA_VALUE },
    });
    console.log(`✨ Price criado: ${price.id}`);
  }

  console.log('\n─────────────────────────────────────────────');
  console.log('Copie e configure na Vercel (production + preview):');
  console.log(`  STRIPE_PRICE_ID_STARTER=${price.id}`);
  console.log('─────────────────────────────────────────────');
  console.log('\nComando pra já deixar configurado na Vercel:');
  console.log(`  echo ${price.id} | vercel env add STRIPE_PRICE_ID_STARTER production`);
  console.log(`  echo ${price.id} | vercel env add STRIPE_PRICE_ID_STARTER preview`);
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
