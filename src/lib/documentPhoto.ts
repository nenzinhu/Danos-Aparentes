import { supabase, supabaseEnabled } from './supabase'
import { createId } from './id'

// Bucket separado do `damage-photos`: foto de documento pessoal (CNH) é dado
// mais sensível, então mantém política de acesso/retenção isolada.
const DOCUMENT_BUCKET = 'document-photos'

/**
 * Upload best-effort da foto da CNH capturada no scanner. Nunca lança —
 * se falhar (sem sessão, sem rede, etc.), o vistoriador segue normalmente
 * com o número já extraído do código de barras; só a evidência fotográfica
 * fica de fora.
 */
export async function uploadCnhPhoto(blob: Blob): Promise<void> {
  if (!supabaseEnabled || !supabase) return
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    const path = `${session.user.id}/${createId()}.jpg`
    await supabase.storage.from(DOCUMENT_BUCKET).upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      cacheControl: '31536000',
    })
  } catch { /* best-effort — não bloqueia a vistoria */ }
}
