/**
 * Cobrança PIX via Asaas (sandbox/produção).
 * Retorno alinhado ao contrato da UI: qrCode (base64) + copyPaste + id.
 */

import { asaasRequest } from '@/src/lib/server/asaasClient'

export type AsaasPixChargeResult = {
  /** Prefixo asaas: para distinguir do id numérico do Mercado Pago. */
  id: string
  qrCodeBase64: string
  copyPaste: string
}

type AsaasCustomer = { id: string }
type AsaasCustomerList = { data?: AsaasCustomer[] }
type AsaasPayment = { id: string }
type AsaasPixQr = {
  encodedImage?: string
  payload?: string
}
type AsaasPixKeyList = { data?: Array<{ id?: string; status?: string }> }

/** CPF só para sandbox quando o usuário não tem documento cadastrado. */
const SANDBOX_FALLBACK_CPF = '24971563792'

function todayPlusDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

async function findOrCreateCustomer(email: string, name: string): Promise<string> {
  const listed = await asaasRequest<AsaasCustomerList>(
    `/customers?email=${encodeURIComponent(email)}&limit=1`,
    'GET',
  )
  const existing = listed.data?.[0]?.id
  if (existing) return existing

  const cpfCnpj = process.env.ASAAS_DEFAULT_CPF || SANDBOX_FALLBACK_CPF
  const created = await asaasRequest<AsaasCustomer>('/customers', 'POST', {
    name: name || email.split('@')[0] || 'Cliente',
    email,
    cpfCnpj,
    notificationDisabled: true,
  })
  if (!created.id) throw new Error('Asaas: cliente criado sem id')
  return created.id
}

/** Garante chave PIX (EVP) — sem ela o Asaas rejeita billingType PIX. */
async function ensurePixAddressKey(): Promise<void> {
  try {
    const listed = await asaasRequest<AsaasPixKeyList>('/pix/addressKeys?limit=10', 'GET')
    const hasActive = (listed.data || []).some(k => (k.status || '').toUpperCase() === 'ACTIVE')
    if (hasActive) return
  } catch (err) {
    console.warn('[asaas] falha ao listar chaves PIX, tentando criar EVP:', err)
  }

  await asaasRequest('/pix/addressKeys', 'POST', { type: 'EVP' })
}

function isMissingPixKeyError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /chave Pix cadastrada/i.test(msg) || /invalid_action/i.test(msg)
}

/**
 * Cria cobrança PIX no Asaas e busca QR Code / copia-e-cola.
 * @param amountCents valor em centavos
 */
export async function createAsaasPixCharge(
  amountCents: number,
  email: string,
  opts?: { customerName?: string; description?: string; externalReference?: string },
): Promise<AsaasPixChargeResult> {
  await ensurePixAddressKey()

  const customerId = await findOrCreateCustomer(email, opts?.customerName || email)
  const value = Math.round(amountCents) / 100

  const paymentBody = {
    customer: customerId,
    billingType: 'PIX' as const,
    value,
    dueDate: todayPlusDays(1),
    description: opts?.description || 'Assinatura Danos Aparentes',
    externalReference: opts?.externalReference,
  }

  let payment: AsaasPayment
  try {
    payment = await asaasRequest<AsaasPayment>('/payments', 'POST', paymentBody)
  } catch (err) {
    if (isMissingPixKeyError(err)) {
      await asaasRequest('/pix/addressKeys', 'POST', { type: 'EVP' })
      payment = await asaasRequest<AsaasPayment>('/payments', 'POST', paymentBody)
    } else {
      throw err
    }
  }

  if (!payment.id) throw new Error('Asaas: cobrança criada sem id')

  const qr = await asaasRequest<AsaasPixQr>(`/payments/${payment.id}/pixQrCode`, 'GET')
  const encoded = (qr.encodedImage || '').replace(/^data:image\/\w+;base64,/, '')
  const payload = qr.payload || ''

  if (!encoded || !payload) {
    throw new Error('Asaas: QR Code PIX incompleto na resposta')
  }

  return {
    id: `asaas:${payment.id}`,
    qrCodeBase64: encoded,
    copyPaste: payload,
  }
}
