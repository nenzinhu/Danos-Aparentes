// ⚠️ Este módulo roda apenas no backend (Node). O token de acesso do Mercado Pago
// deve estar em uma variável de ambiente **sem** prefixo NEXT_PUBLIC, para que não
// seja enviado ao cliente. Veja .env.example para o nome correto.
// src/lib/server/pixClient.ts
// ------------------------------------------------------------
// Helper to create a PIX charge using the generic Mercado Pago client.
// ------------------------------------------------------------
// NOTE: This module runs only on the server. The access token must be
// stored in PIX_MERCADO_PAGO_ACCESS_TOKEN (no NEXT_PUBLIC prefix).

import { mercadoPagoRequest } from '@/src/lib/server/mercadoPagoClient';

/**
 * Create a PIX charge (payment) via Mercado Pago.
 * @param amountCents Amount in centavos (e.g., 1000 = R$ 10,00).
 * @param email Payer e‑mail.
 * @returns The full Mercado Pago payment object (contains QR code,
 *          copy‑paste string, ID, etc.).
 */
export async function createPixCharge(amountCents: number, email: string) {
  const payload = {
    transaction_amount: amountCents / 100,
    description: 'Assinatura da plataforma',
    payment_method_id: 'pix',
    payer: { email },
    // webhook called when the Pix is paid
    notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/pix-webhook`,
  };

  // POST to the Mercado Pago Payments endpoint
  const response = await mercadoPagoRequest('/v1/payments', 'POST', payload);
  return response;
}
