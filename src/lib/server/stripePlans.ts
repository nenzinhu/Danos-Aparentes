import type { PlanTierId, SelfServePlanId } from '@/src/lib/billing/plans'
import { parseSelfServePlan } from '@/src/lib/billing/plans'

/** Resolve Price ID do Stripe a partir do env (Pro aceita alias legado STRIPE_PRICE_ID). */
export function getStripePriceId(plan: PlanTierId): string | undefined {
  if (plan === 'starter') return process.env.STRIPE_PRICE_ID_STARTER || undefined
  if (plan === 'corporativo') return process.env.STRIPE_PRICE_ID_CORPORATE || undefined
  return process.env.STRIPE_PRICE_ID_PRO || process.env.STRIPE_PRICE_ID || undefined
}

export function getStripePriceEnvVarName(plan: SelfServePlanId): string {
  if (plan === 'starter') return 'STRIPE_PRICE_ID_STARTER'
  return 'STRIPE_PRICE_ID_PRO (ou STRIPE_PRICE_ID legado)'
}

export function resolveCheckoutPlan(raw: string | null): {
  plan: SelfServePlanId
  priceId: string | undefined
  envVar: string
} {
  const plan = parseSelfServePlan(raw)
  return {
    plan,
    priceId: getStripePriceId(plan),
    envVar: getStripePriceEnvVarName(plan),
  }
}

/** Sufixo aleatório de 8 letras para integration_identifier (Stripe best practice). */
export function checkoutIntegrationId(plan: SelfServePlanId): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  let suffix = ''
  for (let i = 0; i < 8; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `danos-checkout-${plan}-${suffix}`
}
