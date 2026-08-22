/** Catálogo canônico dos planos — UI, PIX, Stripe Products e quotas. */
export type SelfServePlanId = 'starter' | 'pro'
export type PlanTierId = SelfServePlanId | 'corporativo'

export type PlanDefinition = {
  id: PlanTierId
  name: string
  description: string
  /** Preço mensal em centavos BRL (ex.: 2990 = R$ 29,90). */
  amountBrlCents: number
  /** Preço mensal em reais (exibição). */
  amountBrl: number
  /** Limite de laudos/mês; null = ilimitado. */
  laudosPerMonth: number | null
  interval: 'month'
  /** Metadata gravada no Product/Price do Stripe. */
  stripeMetadataValue: string
  /** Ilustração do card em /planos (public/plans). */
  imageSrc: string
  imageAlt: string
}

export const PLANS: Record<PlanTierId, PlanDefinition> = {
  starter: {
    id: 'starter',
    name: 'Plano Starter',
    description: 'Até 20 vistorias por mês — histórico digital do veículo',
    amountBrlCents: 2990,
    amountBrl: 29.9,
    laudosPerMonth: 20,
    interval: 'month',
    stripeMetadataValue: 'starter',
    imageSrc: '/plans/starter.webp',
    imageAlt: 'Vistoria rápida de um carro com celular — plano Starter',
  },
  pro: {
    id: 'pro',
    name: 'Plano Pro',
    description: 'Até 80 vistorias por mês com marca própria — Danos Aparentes',
    amountBrlCents: 7990,
    amountBrl: 79.9,
    laudosPerMonth: 80,
    interval: 'month',
    stripeMetadataValue: 'pro',
    imageSrc: '/plans/pro.webp',
    imageAlt: 'Laudo digital com evidência de dano — plano Pro',
  },
  corporativo: {
    id: 'corporativo',
    name: 'Corporativo Start',
    description: 'Até 5 usuários · vistorias ilimitadas — Danos Aparentes',
    amountBrlCents: 29900,
    amountBrl: 299,
    laudosPerMonth: null,
    interval: 'month',
    stripeMetadataValue: 'corporativo',
    imageSrc: '/plans/corporativo.webp',
    imageAlt: 'Equipe vistoriando frota de veículos — plano Corporativo',
  },
}

export const STRIPE_PLAN_METADATA_KEY = 'danos_aparentes_plan'

export const SELF_SERVE_PLANS: SelfServePlanId[] = ['starter', 'pro']

/** Planos que podem ser comprados via PIX (inclui Corporativo Start). */
export const PIX_PURCHASABLE_PLANS: PlanTierId[] = ['starter', 'pro', 'corporativo']

export function parseSelfServePlan(raw: string | null | undefined): SelfServePlanId {
  return raw === 'starter' ? 'starter' : 'pro'
}

/** Resolve plano PIX; default pro se inválido/ausente. */
export function parsePixPlan(raw: string | null | undefined): PlanTierId {
  if (raw === 'starter' || raw === 'pro' || raw === 'corporativo') return raw
  return 'pro'
}

export function planDisplayName(plan: PlanTierId): string {
  if (plan === 'starter') return 'Starter'
  if (plan === 'corporativo') return 'Corporativo Start'
  return 'Pro'
}
