/**
 * Cliente server-side para a Assinafy API (assinatura com certificação digital
 * ICp-Brasil). A chave de API NUNCA deve ir para o cliente — fica em
 * process.env.ASSINAFY_API_KEY e só é usada aqui, no servidor.
 *
 * Fluxo de certificação de um laudo:
 *   1. uploadDocument  → sobe o PDF do laudo
 *   2. createSigner    → cria o signatário (cliente/proprietário)
 *   3. createAssignment → solicita assinatura (método virtual)
 *   4. getDocument     → consulta status (até "certificated")
 */

import { config as loadDotenv } from 'dotenv'
// Garante que o .env local seja carregado mesmo fora do pipeline automático do Next.
loadDotenv()

const ASSINAFY_BASE = process.env.ASSINAFY_BASE_URL || 'https://api.assinafy.com.br/v1'

function getApiKey(): string {
  const key =
    process.env.ASSINAFY_API_KEY?.trim() ||
    process.env.ASSINAFY_KEY?.trim() ||
    process.env.NEXT_PUBLIC_ASSINAFY_API_KEY?.trim() ||
    ''
  if (!key) {
    throw new Error(
      'ASSINAFY_API_KEY não configurada. Defina a variável de ambiente ASSINAFY_API_KEY (no .env.local ou no painel da plataforma de hospedagem).',
    )
  }
  return key
}

async function assinafyFetch<T = unknown>(
  path: string,
  opts: { method?: string; body?: BodyInit; isForm?: boolean; query?: Record<string, string> } = {},
): Promise<{ status: number; ok: boolean; data: T | null; message: string }> {
  const url = new URL(`${ASSINAFY_BASE}${path}`)
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) url.searchParams.set(k, v)
  }
  const headers: Record<string, string> = { 'X-Api-Key': getApiKey() }
  if (!opts.isForm) headers['Content-Type'] = 'application/json'

  const res = await fetch(url.toString(), {
    method: opts.method || 'GET',
    headers,
    body: opts.body,
  })

  const text = await res.text()
  let json: { status?: number; message?: string; data?: T | null } = {}
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    json = {}
  }
  return {
    status: res.status,
    ok: res.ok,
    data: (json.data ?? null) as T | null,
    message: json.message || res.statusText,
  }
}

let accountIdCache: Promise<string> | null = null

/** Retorna o ID da primeira conta do workspace (cacheado por processo). */
export function getAccountId(): Promise<string> {
  if (!accountIdCache) {
    accountIdCache = (async () => {
      const r = await assinafyFetch<{ id: string }[]>('/accounts')
      if (!r.ok || !Array.isArray(r.data) || r.data.length === 0) {
        throw new Error(`Assinafy: não foi possível obter a conta (${r.status} ${r.message})`)
      }
      return r.data[0].id
    })().catch((err) => {
      accountIdCache = null
      throw err
    })
  }
  return accountIdCache
}

export interface AssinafySignerInput {
  fullName: string
  email?: string
  whatsappPhone?: string
}

/** Cria (ou retorna) um signatário no workspace. */
export async function createSigner(input: AssinafySignerInput): Promise<string> {
  const accountId = await getAccountId()
  const body: Record<string, unknown> = { full_name: input.fullName }
  if (input.email) body.email = input.email
  if (input.whatsappPhone) body.whatsapp_phone_number = input.whatsappPhone
  const r = await assinafyFetch<{ id: string }>(
    `/accounts/${accountId}/signers`,
    { method: 'POST', body: JSON.stringify(body) },
  )
  if (!r.ok || !r.data?.id) {
    throw new Error(`Assinafy: falha ao criar signatário (${r.status} ${r.message})`)
  }
  return r.data.id
}

/** Faz upload de um PDF (Buffer/Uint8Array) e retorna o documentId. */
export async function uploadDocument(pdf: Uint8Array | Buffer, filename: string): Promise<string> {
  const accountId = await getAccountId()
  const form = new FormData()
  form.append('file', new Blob([pdf as BlobPart], { type: 'application/pdf' }), filename)
  const r = await assinafyFetch<{ id: string }>(
    `/accounts/${accountId}/documents`,
    { method: 'POST', body: form, isForm: true },
  )
  if (!r.ok || !r.data?.id) {
    throw new Error(`Assinafy: falha no upload do documento (${r.status} ${r.message})`)
  }
  return r.data.id
}

export type VerificationMethod = 'Email' | 'Whatsapp'

export interface AssignmentResult {
  documentId: string
  assignmentId: string
  signingUrl: string
  status: string
}

/** Solicita assinatura virtual (sem campos de input) para o documento. */
export async function createVirtualAssignment(
  documentId: string,
  signerId: string,
  verificationMethod: VerificationMethod,
): Promise<AssignmentResult> {
  const accountId = await getAccountId()
  const body = {
    method: 'virtual',
    signers: [{ id: signerId, verification_method: verificationMethod }],
  }
  const r = await assinafyFetch<{
    id: string
    signers: { id: string }[]
    signing_urls: { signer_id: string; url: string }[]
    status?: string
  }>(`/documents/${documentId}/assignments`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!r.ok || !r.data?.id) {
    throw new Error(`Assinafy: falha ao solicitar assinatura (${r.status} ${r.message})`)
  }
  const signingUrl = r.data.signing_urls?.[0]?.url || ''
  return {
    documentId,
    assignmentId: r.data.id,
    signingUrl,
    status: r.data.status || 'pending_signature',
  }
}

export interface AssinafyDocument {
  id: string
  status: string
  artifacts?: Record<string, string>
}

/** Consulta o status atual de um documento. */
export async function getDocument(documentId: string): Promise<AssinafyDocument> {
  const r = await assinafyFetch<AssinafyDocument>(`/documents/${documentId}`)
  if (!r.ok || !r.data) {
    throw new Error(`Assinafy: falha ao consultar documento (${r.status} ${r.message})`)
  }
  return r.data
}

/**
 * Decide o método de verificação com base nos dados disponíveis do signatário.
 *
 * `preferred` reflete o canal escolhido na UI; só é honrado se o dado
 * correspondente existir. Sem preferência, e-mail tem precedência.
 */
export function resolveVerificationMethod(
  input: AssinafySignerInput,
  preferred?: 'whatsapp' | 'email',
): VerificationMethod {
  if (preferred === 'whatsapp' && input.whatsappPhone) return 'Whatsapp'
  if (preferred === 'email' && input.email) return 'Email'
  if (input.email) return 'Email'
  if (input.whatsappPhone) return 'Whatsapp'
  return 'Email'
}

/** Baixa um artifact certificado (binary) do documento. */
export async function downloadArtifact(
  documentId: string,
  artifact: 'original' | 'certificated' | 'certificate-page' | 'bundle',
): Promise<Uint8Array> {
  const url = new URL(`${ASSINAFY_BASE}/documents/${documentId}/download/${artifact}`)
  const res = await fetch(url.toString(), { headers: { 'X-Api-Key': getApiKey() } })
  if (!res.ok) {
    throw new Error(`Assinafy: falha ao baixar artifact ${artifact} (${res.status})`)
  }
  const buf = new Uint8Array(await res.arrayBuffer())
  return buf
}
