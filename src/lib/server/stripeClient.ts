import Stripe from 'stripe'

let stripeSingleton: Stripe | null = null

/** Cliente Stripe lazy — evita quebrar o `next build` se a env ainda não estiver disponível. */
export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurada nas variáveis de ambiente')
  }
  // API version alinhada à stripe-best-practices (Billing + Checkout Sessions).
  stripeSingleton = new Stripe(secretKey, {
    apiVersion: '2026-07-29.dahlia',
    typescript: true,
  })
  return stripeSingleton
}

/** Compat: `import { stripe }` continua válido, mas só instancia no primeiro acesso. */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripe() as unknown as Record<PropertyKey, unknown>
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
