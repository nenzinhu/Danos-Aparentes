import type { PlanTierId, SelfServePlanId } from '@/src/lib/billing/plans'
import { parseSelfServePlan } from '@/src/lib/billing/plans'
import { stripe } from '@/src/lib/server/stripeClient'

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

export type StripePriceModeIssue = 'test_live_mismatch' | 'missing' | 'other'

/** Classifica erros típicos de Price ID (test×live ou inexistente). */
export function classifyStripePriceError(err: unknown): StripePriceModeIssue {
  const msg = err instanceof Error ? err.message : String(err)
  if (/test mode/i.test(msg) && /live mode/i.test(msg)) return 'test_live_mismatch'
  if (/no such price/i.test(msg)) return 'missing'
  return 'other'
}

export function stripePriceUserMessage(issue: StripePriceModeIssue, envVar: string): string {
  if (issue === 'test_live_mismatch') {
    return `Configuração Stripe inconsistente: o Price ID de ${envVar} está em modo teste, mas a chave da API é live. Crie o preço no Dashboard Live e atualize ${envVar} na Vercel.`
  }
  if (issue === 'missing') {
    return `Price ID de ${envVar} não encontrado no Stripe. Confira o ID no Dashboard (mesmo modo da chave secreta) e atualize a variável na Vercel.`
  }
  return 'Erro ao validar o plano no Stripe. Tente novamente em alguns instantes.'
}

/**
 * Confirma que o Price ID existe no mesmo modo da STRIPE_SECRET_KEY
 * (evita checkout falhar só no redirect).
 */
export async function assertStripePriceAvailable(
  priceId: string,
  envVar: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  try {
    await stripe.prices.retrieve(priceId)
    return { ok: true }
  } catch (err) {
    const issue = classifyStripePriceError(err)
    console.error('[stripe] price.retrieve failed:', issue, err)
    return {
      ok: false,
      status: issue === 'other' ? 500 : 503,
      error: stripePriceUserMessage(issue, envVar),
    }
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
