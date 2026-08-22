#!/usr/bin/env node
/**
 * Copia STRIPE_PRICE_ID → STRIPE_PRICE_ID_PRO na Vercel.
 * Uso: npx vercel env run -e production -- node scripts/sync-stripe-price-pro-env.mjs
 */
import { spawnSync } from 'node:child_process'

const priceId = (process.env.STRIPE_PRICE_ID || '').trim()
if (!priceId || !priceId.startsWith('price_')) {
  console.error('❌ STRIPE_PRICE_ID ausente ou inválido no ambiente carregado.')
  process.exit(1)
}

for (const environment of ['production', 'preview']) {
  const result = spawnSync(
    'npx',
    [
      'vercel',
      'env',
      'add',
      'STRIPE_PRICE_ID_PRO',
      environment,
      '--value',
      priceId,
      '--yes',
      '--force',
      '--sensitive',
    ],
    { encoding: 'utf8', shell: true },
  )
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout)
    process.exit(result.status || 1)
  }
  console.log(`✅ STRIPE_PRICE_ID_PRO configurado em ${environment}`)
}

console.log(`Price: ${priceId.slice(0, 14)}…`)
console.log('Faça redeploy para a app carregar a nova env.')
