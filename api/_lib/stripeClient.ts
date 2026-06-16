import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY

if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY não configurada nas variáveis de ambiente')
}

export const stripe = new Stripe(secretKey)
