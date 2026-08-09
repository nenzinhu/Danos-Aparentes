import { parsePixPlan, planDisplayName, type PlanTierId } from '@/src/lib/billing/plans'
import { createAsaasPixCharge } from '@/src/lib/server/asaasPix'
import { assertAsaasSafeForProduction, getAsaasApiKey } from '@/src/lib/server/asaasClient'
import { createPixCharge as createMercadoPagoPixCharge } from '@/src/lib/server/pixClient'

export type PixProviderId = 'asaas' | 'mercadopago'

export type UnifiedPixCharge = {
  id: string
  qrCodeBase64?: string
  copyPaste?: string
  provider: PixProviderId
}

export type CreatePixChargeInput = {
  amountCents: number
  email: string
  plan: PlanTierId
  durationMonths: number
  externalReference?: string
  customerName?: string
  /** Override explícito; senão usa PIX_PROVIDER (default asaas). */
  provider?: PixProviderId
}

type MpPixChargeResponse = {
  id?: string | number
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
    }
  }
}

export function resolvePixProvider(explicit?: string | null): PixProviderId {
  const fromExplicit = (explicit || '').toLowerCase()
  if (fromExplicit === 'asaas' || fromExplicit === 'mercadopago') return fromExplicit
  const fromEnv = (process.env.PIX_PROVIDER || 'asaas').toLowerCase()
  if (fromEnv === 'mercadopago') return 'mercadopago'
  return 'asaas'
}

export function assertPixProviderConfigured(provider: PixProviderId): string | null {
  if (provider === 'asaas') {
    if (!getAsaasApiKey()) return 'PIX Asaas não configurado (ASAAS_API_KEY).'
    const prodBlock = assertAsaasSafeForProduction()
    if (prodBlock) return prodBlock
  }
  if (provider === 'mercadopago' && !process.env.PIX_MERCADO_PAGO_ACCESS_TOKEN) {
    return 'PIX Mercado Pago não configurado.'
  }
  return null
}

/**
 * Cria cobrança no provider escolhido e normaliza o contrato da UI.
 */
export async function createUnifiedPixCharge(input: CreatePixChargeInput): Promise<UnifiedPixCharge> {
  const provider = resolvePixProvider(input.provider)
  const plan = parsePixPlan(input.plan)
  const description = `Assinatura Danos Aparentes · Plano ${planDisplayName(plan)} (${input.durationMonths} mês${input.durationMonths > 1 ? 'es' : ''})`

  if (provider === 'asaas') {
    const charge = await createAsaasPixCharge(input.amountCents, input.email, {
      customerName: input.customerName || input.email.split('@')[0],
      description,
      externalReference: input.externalReference,
    })
    return {
      id: charge.id,
      qrCodeBase64: charge.qrCodeBase64,
      copyPaste: charge.copyPaste,
      provider,
    }
  }

  const charge = (await createMercadoPagoPixCharge(input.amountCents, input.email)) as MpPixChargeResponse
  const tx = charge.point_of_interaction?.transaction_data
  return {
    id: String(charge.id ?? ''),
    qrCodeBase64: tx?.qr_code_base64,
    copyPaste: tx?.qr_code,
    provider,
  }
}
