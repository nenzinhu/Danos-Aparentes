import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * POST /api/assinafy-webhook
 *
 * Recebe os eventos de webhook da Assinafy e atualiza o status de
 * certificação digital na inspeção (tabela vehicle_inspections),
 * usando o documentId retornado no payload para localizar o registro
 * (coluna assinafy_document_id).
 *
 * Eventos mapeados:
 *   document_ready            -> certified (+ assinafy_certified_at)
 *   signer_signed_document     -> signed
 *   signer_viewed_document     -> viewed
 *   signer_rejected_document   -> rejected
 *   user_rejected_document     -> cancelled
 *   document_processing_failed -> failed
 *   assignment_created         -> pending
 *   signature_requested        -> requested
 */

type AssinafyEvent =
  | 'document_uploaded'
  | 'document_metadata_ready'
  | 'document_prepared'
  | 'assignment_created'
  | 'signature_requested'
  | 'document_ready'
  | 'signer_created'
  | 'signer_email_verified'
  | 'signer_whatsapp_verified'
  | 'signer_data_confirmed'
  | 'signer_signed_document'
  | 'signer_viewed_document'
  | 'signer_rejected_document'
  | 'user_rejected_document'
  | 'document_processing_failed'

const EVENT_STATUS: Partial<Record<AssinafyEvent, string>> = {
  assignment_created: 'pending',
  signature_requested: 'requested',
  signer_viewed_document: 'viewed',
  signer_signed_document: 'signed',
  document_ready: 'certified',
  signer_rejected_document: 'rejected',
  user_rejected_document: 'cancelled',
  document_processing_failed: 'failed',
}

function extractDocumentId(payload: Record<string, unknown>): string | null {
  // Tenta caminhos comuns do payload da Assinafy.
  const candidates = [
    (payload.documentId as string) || '',
    (payload.document_id as string) || '',
    (payload.document as { id?: string })?.id || '',
    (payload.data as { documentId?: string })?.documentId || '',
    (payload.data as { document?: { id?: string } })?.document?.id || '',
  ]
  return candidates.find((c) => c && c.trim().length > 0)?.trim() || null
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const event = (payload.event || payload.type || payload.eventType) as AssinafyEvent
  if (!event || !(event in EVENT_STATUS)) {
    // Evento não mapeado — confirma recebimento para a Assinafy não reenviar.
    return NextResponse.json({ received: true, ignored: true })
  }

  const documentId = extractDocumentId(payload)
  if (!documentId) {
    return NextResponse.json({ received: true, ignored: true, reason: 'no documentId' })
  }

  const status = EVENT_STATUS[event] as string
  const patch: Record<string, unknown> = { assinafy_cert_status: status }
  if (status === 'certified') {
    patch.assinafy_certified_at = new Date().toISOString()
  }

  const { error } = await supabaseAdmin
    .from('vehicle_inspections')
    .update(patch)
    .eq('assinafy_document_id', documentId)

  if (error) {
    console.error('[assinafy-webhook] update falhou', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ received: true, event, status, documentId })
}
