import crypto from 'crypto'
import { supabaseAdmin } from './supabaseAdmin'

export interface ApiKeyContext {
  keyId: string
  companyId?: string
  userId?: string
  scopes: string[]
}

/**
 * Gera uma nova chave de API formatada com prefixo seguro `da_live_...`
 */
export function generateApiKey(): { rawKey: string; keyHash: string; prefix: string } {
  const bytes = crypto.randomBytes(24).toString('hex')
  const rawKey = `da_live_${bytes}`
  const prefix = `da_live_${bytes.substring(0, 6)}...`
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  return { rawKey, keyHash, prefix }
}

/**
 * Valida Authorization: Bearer da_live_...
 * Usa service role — lookup por hash não passa por sessão de usuário.
 */
export async function validateApiKeyHeader(authHeader: string | null): Promise<ApiKeyContext | null> {
  if (!authHeader || !authHeader.startsWith('Bearer da_live_')) return null
  if (!supabaseAdmin) return null

  const rawKey = authHeader.substring(7).trim()
  if (!rawKey.startsWith('da_live_') || rawKey.length < 20) return null

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  try {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, company_id, user_id, scopes, revoked_at')
      .eq('key_hash', keyHash)
      .is('revoked_at', null)
      .maybeSingle()

    if (error || !data) return null

    void supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id)

    return {
      keyId: data.id,
      companyId: data.company_id || undefined,
      userId: data.user_id || undefined,
      scopes: data.scopes || ['read', 'write'],
    }
  } catch {
    return null
  }
}
