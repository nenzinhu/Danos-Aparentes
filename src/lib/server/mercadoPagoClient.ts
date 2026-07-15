// src/lib/server/mercadoPagoClient.ts
// ------------------------------------------------------------
// Helper to make authenticated requests to the Mercado Pago REST API.
// ------------------------------------------------------------
// IMPORTANT: This module runs **only on the server** (Node). The access
// token must be stored in an environment variable without the
// `NEXT_PUBLIC_` prefix, otherwise it would be exposed to the client.
// The token name is `PIX_MERCADO_PAGO_ACCESS_TOKEN` (see .env.example).

/**
 * Perform a request to the Mercado Pago API.
 *
 * @param endpoint   API endpoint relative to the base URL, e.g. "/v1/payments".
 * @param method     HTTP method ("GET", "POST", "PUT", "DELETE").
 * @param body       Optional request body (will be JSON‑stringified).
 * @returns          Parsed JSON response from Mercado Pago.
 */
export async function mercadoPagoRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const accessToken = process.env.PIX_MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      'PIX_MERCADO_PAGO_ACCESS_TOKEN is not defined. Set it in your .env file.'
    );
  }

  const url = `https://api.mercadopago.com${endpoint}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `MercadoPago request failed (${response.status}): ${errorBody}`
    );
  }

  return response.json();
}

// ------------------------------------------------------------
// Example usage (you can remove this block in production):
// ------------------------------------------------------------
// (async () => {
//   try {
//     const result = await mercadoPagoRequest('/v1/payments', 'GET');
//     console.log('Payments list:', result);
//   } catch (e) {
//     console.error(e);
//   }
// })();
