#!/usr/bin/env node
/**
 * Configura catálogo Stripe (1 Product por plano) + grava Price IDs na Vercel.
 *
 * Uso (automático — puxa STRIPE_SECRET_KEY da Vercel se faltar):
 *   npm run configure:stripe:vercel
 *   node scripts/configure-stripe-billing.mjs
 *
 * Flags:
 *   --dry-run     só lista o que faria
 *   --skip-vercel não grava envs na Vercel
 *   --redeploy    dispara vercel deploy --prod ao final
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, unlinkSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import Stripe from 'stripe'

const METADATA_KEY = 'danos_aparentes_plan'
const PUSH_VERCEL = !process.argv.includes('--skip-vercel')
const DRY_RUN = process.argv.includes('--dry-run')
const REDEPLOY = process.argv.includes('--redeploy')

const PLANS = [
  {
    tier: 'starter',
    name: 'Plano Starter',
    description: 'Até 20 laudos em PDF por mês — Danos Aparentes',
    amountBrlCents: 2990,
    envVars: ['STRIPE_PRICE_ID_STARTER'],
  },
  {
    tier: 'pro',
    name: 'Plano Pro',
    description: 'Até 80 laudos em PDF por mês com marca própria — Danos Aparentes',
    amountBrlCents: 4990,
    envVars: ['STRIPE_PRICE_ID_PRO', 'STRIPE_PRICE_ID'],
  },
  {
    tier: 'corporativo',
    name: 'Corporativo Start',
    description: 'Até 5 usuários · laudos ilimitados — Danos Aparentes',
    amountBrlCents: 29900,
    envVars: ['STRIPE_PRICE_ID_CORPORATE'],
  },
]

/** Parse KEY=VALUE (.env), ignora comentários; não loga valores. */
function parseEnvFile(contents) {
  const out = {}
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

function isPlaceholderSecret(value) {
  const v = (value || '').trim()
  return !v || v.length < 12 || /SENSITIVE|REDACTED|@encrypted|^\[.*\]$/i.test(v)
}

function isUsableStripeSecret(value) {
  const v = (value || '').trim()
  if (isPlaceholderSecret(v)) return false
  // sk_/rk_ oficiais; aceita outros prefixos se o usuário exportou explicitamente.
  return v.startsWith('sk_') || v.startsWith('rk_') || process.env.STRIPE_SECRET_KEY === v
}

/**
 * Tenta puxar de production. Vars Sensitive na Vercel vêm como placeholder
 * (`@encrypted`) — aí é preciso exportar a chave localmente uma vez.
 */
function loadSecretKeyFromVercel() {
  const tmp = join(tmpdir(), `danos-stripe-env-${process.pid}.env`)
  try {
    console.log('⬇️  Tentando puxar STRIPE_SECRET_KEY da Vercel (production)…')
    const pull = spawnSync(
      'npx',
      ['vercel', 'env', 'pull', tmp, '--environment', 'production', '--yes'],
      { encoding: 'utf8', shell: true },
    )
    if (pull.status !== 0) {
      console.error(pull.stderr || pull.stdout)
      throw new Error('Falha no vercel env pull')
    }
    if (!existsSync(tmp)) throw new Error('Arquivo temporário do env pull não foi criado')
    const parsed = parseEnvFile(readFileSync(tmp, 'utf8'))
    const key = (parsed.STRIPE_SECRET_KEY || '').trim()
    if (!isUsableStripeSecret(key)) {
      throw new Error(
        [
          'STRIPE_SECRET_KEY está Sensitive na Vercel — o CLI não devolve o valor real.',
          '',
          'No PowerShell (cole a chave uma vez):',
          '  $env:STRIPE_SECRET_KEY="sk_live_…"; npm run configure:stripe:vercel',
          '',
          'Ou grave em .env.local (gitignored) e rode o mesmo comando.',
        ].join('\n'),
      )
    }
    return key
  } finally {
    try {
      if (existsSync(tmp)) unlinkSync(tmp)
    } catch {
      /* ignore */
    }
  }
}

function resolveSecretKey() {
  const fromEnv = (process.env.STRIPE_SECRET_KEY || '').trim()
  if (isUsableStripeSecret(fromEnv)) return fromEnv
  return loadSecretKeyFromVercel()
}

const secretKey = resolveSecretKey()

const mode =
  secretKey.startsWith('sk_live_') || secretKey.startsWith('rk_live_')
    ? 'LIVE'
    : secretKey.startsWith('sk_test_') || secretKey.startsWith('rk_test_')
      ? 'TEST'
      : 'DESCONHECIDO'

if (mode === 'DESCONHECIDO') {
  console.warn(
    '⚠️  Prefixo da chave não é sk_/rk_. Stripe normalmente exige sk_live_/sk_test_ ou rk_*. Tentando mesmo assim…',
  )
}

console.log(`🔑 Stripe mode: ${mode}`)
const stripe = new Stripe(secretKey, { apiVersion: '2026-07-29.dahlia' })

async function ensurePlan(plan) {
  const existingProducts = await stripe.products.search({
    query: `metadata['${METADATA_KEY}']:'${plan.tier}'`,
  })

  let product = existingProducts.data[0]
  if (!product) {
    if (DRY_RUN) {
      console.log(`[dry-run] criaria Product ${plan.tier}`)
      return { plan, price: { id: `price_dry_${plan.tier}` } }
    }
    product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { [METADATA_KEY]: plan.tier },
    })
    console.log(`✨ Product ${plan.tier}: ${product.id}`)
  } else {
    console.log(`✅ Product ${plan.tier}: ${product.id}`)
  }

  const existingPrices = await stripe.prices.list({ product: product.id, active: true, limit: 20 })
  let price = existingPrices.data.find(
    (p) =>
      p.recurring?.interval === 'month' &&
      p.unit_amount === plan.amountBrlCents &&
      p.currency === 'brl',
  )

  if (!price) {
    if (DRY_RUN) {
      console.log(`[dry-run] criaria Price ${plan.tier} R$ ${(plan.amountBrlCents / 100).toFixed(2)}`)
      return { plan, price: { id: `price_dry_${plan.tier}` } }
    }
    price = await stripe.prices.create({
      product: product.id,
      currency: 'brl',
      unit_amount: plan.amountBrlCents,
      recurring: { interval: 'month' },
      metadata: { [METADATA_KEY]: plan.tier },
    })
    console.log(`✨ Price ${plan.tier}: ${price.id}`)
  } else {
    console.log(`✅ Price ${plan.tier}: ${price.id} (R$ ${(price.unit_amount / 100).toFixed(2)}/mês)`)
  }

  return { plan, price }
}

function upsertVercelEnv(name, value) {
  if (DRY_RUN) {
    console.log(`[dry-run] vercel env add ${name}=${value}`)
    return
  }
  // stdin evita echo do valor em alguns shells; --value também funciona no CLI atual
  const result = spawnSync(
    'npx',
    [
      'vercel',
      'env',
      'add',
      name,
      'production,preview',
      '--value',
      value,
      '--yes',
      '--force',
      '--sensitive',
    ],
    { encoding: 'utf8', shell: true },
  )
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout)
    throw new Error(`Falha ao gravar ${name} na Vercel`)
  }
  console.log(`✅ Vercel ${name}`)
}

async function main() {
  const results = []
  for (const plan of PLANS) {
    results.push(await ensurePlan(plan))
  }

  if (PUSH_VERCEL) {
    console.log('\n── Gravando Price IDs na Vercel (production + preview) ──')
    for (const { plan, price } of results) {
      for (const envVar of plan.envVars) {
        upsertVercelEnv(envVar, price.id)
      }
    }
  }

  console.log('\n── Resumo ──')
  for (const { plan, price } of results) {
    console.log(`${plan.tier.padEnd(12)} ${price.id} → ${plan.envVars.join(', ')}`)
  }

  if (REDEPLOY && !DRY_RUN) {
    console.log('\n🚀 Redeploy production…')
    const deploy = spawnSync('npx', ['vercel', 'deploy', '--prod', '--yes'], {
      encoding: 'utf8',
      shell: true,
      stdio: 'inherit',
    })
    if (deploy.status !== 0) throw new Error('Redeploy falhou')
  } else if (PUSH_VERCEL) {
    console.log('\nPróximo: redeploy production (ou rode com --redeploy) para a app ler as envs.')
  }
}

main().catch((err) => {
  console.error('❌', err.message || err)
  process.exit(1)
})
