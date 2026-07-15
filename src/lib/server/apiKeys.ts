import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from './supabaseAdmin'
import { resolveCompanyScope } from './companyScope'

export const API_KEY_PREFIX = 'da_live_'

export type ApiKeyAuthContext = {
  keyId: string
  companyId: string
  ownerId: string
  /** user_ids cujo laudos entram no escopo desta chave */
  scopeUserIds: string[]
}

export function generateApiKey(): { rawKey: string; prefix: string; hash: string } {
  const secret = randomBytes(24).toString('base64url')
  const rawKey = `${API_KEY_PREFIX}${secret}`
  return {
    rawKey,
    prefix: rawKey.slice(0, API_KEY_PREFIX.length + 8),
    hash: hashApiKey(rawKey),
  }
}

export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey, 'utf8').digest('hex')
}

export function extractApiKeyFromRequest(req: NextRequest): string | null {
  const headerKey = req.headers.get('x-api-key')?.trim()
  if (headerKey) return headerKey

  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice('Bearer '.length).trim()
  if (!token.startsWith(API_KEY_PREFIX)) return null
  return token
}

function hashesEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function authenticateApiKey(req: NextRequest): Promise<ApiKeyAuthContext | null> {
  if (!supabaseAdmin) return null

  const rawKey = extractApiKeyFromRequest(req)
  if (!rawKey || !rawKey.startsWith(API_KEY_PREFIX) || rawKey.length < API_KEY_PREFIX.length + 16) {
    return null
  }

  const hash = hashApiKey(rawKey)
  const { data: row, error } = await supabaseAdmin
    .from('company_api_keys')
    .select('id, company_id, key_hash, revoked_at')
    .eq('key_hash', hash)
    .maybeSingle()

  if (error || !row || row.revoked_at) return null
  if (!hashesEqual(String(row.key_hash), hash)) return null

  const scope = await resolveCompanyScope(row.company_id as string)
  if (!scope) return null

  // Atualiza last_used_at sem bloquear a resposta em caso de falha.
  void supabaseAdmin
    .from('company_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', row.id)

  return {
    keyId: row.id as string,
    companyId: row.company_id as string,
    ownerId: scope.ownerId,
    scopeUserIds: scope.scopeUserIds,
  }
}
