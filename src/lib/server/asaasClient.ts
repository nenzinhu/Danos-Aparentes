/**
 * Cliente HTTP Asaas (sandbox/produção).
 * Auth: header `access_token` (não Bearer).
 * Sandbox: https://api-sandbox.asaas.com
 * Produção: https://api.asaas.com
 */

export function getAsaasBaseUrl(): string {
  const raw = (process.env.ASAAS_API_URL || 'https://api.asaas.com').replace(/\/$/, '')
  return raw
}

export function getAsaasApiKey(): string | undefined {
  return process.env.ASAAS_API_KEY || undefined
}

export async function asaasRequest<T = unknown>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown,
): Promise<T> {
  const apiKey = getAsaasApiKey()
  if (!apiKey) {
    throw new Error('ASAAS_API_KEY não configurada')
  }

  const url = `${getAsaasBaseUrl()}/v3${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      access_token: apiKey,
      'User-Agent': 'DanosAparentes/1.0',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }

  if (!res.ok) {
    const errMsg =
      data && typeof data === 'object' && data !== null && 'errors' in data
        ? JSON.stringify((data as { errors: unknown }).errors)
        : text.slice(0, 300)
    throw new Error(`Asaas request failed (${res.status}): ${errMsg}`)
  }

  return data as T
}
