#!/usr/bin/env node
/**
 * Cria (ou reaproveita) Products + Prices mensais no Stripe para Starter, Pro e Corporativo Start.
 *
 * Uso:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe-plans.mjs
 *   node --env-file=.env.local scripts/setup-stripe-plans.mjs
 *
 * Idempotente via metadata danos_aparentes_plan.
 */
import Stripe from 'stripe'

const METADATA_KEY = 'danos_aparentes_plan'

const PLANS = [
  {
    tier: 'starter',
    name: 'Plano Starter',
    description: 'Até 20 laudos em PDF por mês — Danos Aparentes',
    amountBrlCents: 2990,
    envVar: 'STRIPE_PRICE_ID_STARTER',
  },
  {
    tier: 'pro',
    name: 'Plano Pro',
    description: 'Até 80 laudos em PDF por mês com marca própria — Danos Aparentes',
    amountBrlCents: 4990,
    envVar: 'STRIPE_PRICE_ID_PRO',
    legacyEnvVar: 'STRIPE_PRICE_ID',
  },
  {
    tier: 'corporativo',
    name: 'Corporativo Start',
    description: 'Até 5 usuários · laudos ilimitados — Danos Aparentes',
    amountBrlCents: 29900,
    envVar: 'STRIPE_PRICE_ID_CORPORATE',
  },
]

const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada. Rode com a env var ou --env-file=.env.local')
  process.exit(1)
}

const mode = secretKey.startsWith('sk_live_') || secretKey.startsWith('rk_live_')
  ? 'LIVE'
  : secretKey.startsWith('sk_test_') || secretKey.startsWith('rk_test_')
    ? 'TEST'
    : 'DESCONHECIDO'
console.log(`🔑 Modo Stripe: ${mode}`)
if (mode === 'DESCONHECIDO') {
  console.error('❌ Chave inválida (esperado sk_/rk_ live ou test).')
  process.exit(1)
}

const stripe = new Stripe(secretKey)

async function ensurePlan(plan) {
  const existingProducts = await stripe.products.search({
    query: `metadata['${METADATA_KEY}']:'${plan.tier}'`,
  })

  let product = existingProducts.data[0]
  if (product) {
    console.log(`✅ Product ${plan.tier}: ${product.id} (${product.name})`)
  } else {
    product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { [METADATA_KEY]: plan.tier },
    })
    console.log(`✨ Product ${plan.tier} criado: ${product.id}`)
  }

  const existingPrices = await stripe.prices.list({ product: product.id, active: true, limit: 20 })
  let price = existingPrices.data.find(
    (p) =>
      p.recurring?.interval === 'month' &&
      p.unit_amount === plan.amountBrlCents &&
      p.currency === 'brl',
  )

  if (price) {
    console.log(
      `✅ Price ${plan.tier}: ${price.id} (R$ ${(price.unit_amount / 100).toFixed(2)}/mês)`,
    )
  } else {
    price = await stripe.prices.create({
      product: product.id,
      currency: 'brl',
      unit_amount: plan.amountBrlCents,
      recurring: { interval: 'month' },
      metadata: { [METADATA_KEY]: plan.tier },
    })
    console.log(`✨ Price ${plan.tier} criado: ${price.id}`)
  }

  return { plan, price }
}

async function main() {
  const results = []
  for (const plan of PLANS) {
    results.push(await ensurePlan(plan))
  }

  console.log('\n─────────────────────────────────────────────')
  console.log('Configure na Vercel (production + preview):')
  for (const { plan, price } of results) {
    console.log(`  ${plan.envVar}=${price.id}`)
    if (plan.legacyEnvVar) {
      console.log(`  ${plan.legacyEnvVar}=${price.id}  # alias legado (Pro)`)
    }
  }
  console.log('─────────────────────────────────────────────')
  console.log('\nExemplo (production):')
  for (const { plan, price } of results) {
    console.log(`  printf %s ${price.id} | npx vercel env add ${plan.envVar} production --force`)
  }
}

main().catch((err) => {
  console.error('❌ Erro:', err.message)
  process.exit(1)
})
