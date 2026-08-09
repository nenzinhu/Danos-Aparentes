/**
 * FASE 19 — Ancoragem da cadeia de auditoria.
 *
 * A cada sync bem-sucedido, a ponta da cadeia (último event_hash) da vistoria
 * é registrada em audit_anchors com carimbo de tempo do servidor e, quando o
 * serviço estiver alcançável, provas de calendários OpenTimestamps.
 *
 * Isso prova que os eventos existiam antes da data da âncora — a única prova
 * de anterioridade possível para um histórico que nasce offline.
 */

import { sha256Hex } from '../pdf/integrityManifest'
import { supabase, supabaseEnabled } from '../supabase'
import {
  canonicalAuditJson,
  listAuditEventsByInspection,
  verifyEventChain,
  type AuditLogRow,
} from './auditLog'

export type OtsProof = {
  calendar: string
  proof_base64: string
}

export type AuditAnchorRow = {
  id?: string
  user_id: string
  tenant_id: string | null
  inspection_id: string
  chain_tip_hash: string
  events_count: number
  anchor_digest: string
  ots_proofs: OtsProof[]
  status: 'recorded' | 'pending_attestation' | 'attested'
  created_at?: string
}

/** Digest canônico da âncora — o que é carimbado nos calendários OTS. */
export async function computeAnchorDigest(args: {
  inspection_id: string
  chain_tip_hash: string
  events_count: number
}): Promise<string> {
  return sha256Hex(canonicalAuditJson(args))
}

/**
 * Toda âncora deve apontar para um event_hash que ainda existe na cadeia.
 * Uma âncora "órfã" indica que o histórico foi reescrito após a ancoragem.
 */
export function verifyAnchorsAgainstChain(
  events: Pick<AuditLogRow, 'event_hash'>[],
  anchors: Pick<AuditAnchorRow, 'chain_tip_hash'>[],
): { ok: boolean; anchoredCount: number; orphanTips: string[] } {
  const hashes = new Set(events.map((e) => e.event_hash))
  const orphanTips: string[] = []
  for (const a of anchors) {
    if (!hashes.has(a.chain_tip_hash)) orphanTips.push(a.chain_tip_hash)
  }
  return {
    ok: orphanTips.length === 0,
    anchoredCount: anchors.length - orphanTips.length,
    orphanTips,
  }
}

export async function listAnchorsByInspection(
  inspectionId: string,
): Promise<AuditAnchorRow[]> {
  if (!supabaseEnabled || !supabase || !inspectionId) return []
  try {
    const { data, error } = await supabase
      .from('audit_anchors')
      .select('*')
      .eq('inspection_id', inspectionId)
      .order('created_at', { ascending: true })
    if (error || !data) return []
    return data as AuditAnchorRow[]
  } catch {
    return []
  }
}

/** Best-effort: pede provas OTS ao servidor. Falha silenciosa = sem provas. */
async function requestOtsProofs(digest: string): Promise<OtsProof[]> {
  try {
    const res = await fetch('/api/audit-anchor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ digest }),
    })
    if (!res.ok) return []
    const body = (await res.json()) as { proofs?: OtsProof[] }
    return Array.isArray(body.proofs) ? body.proofs : []
  } catch {
    return []
  }
}

/**
 * Ancora a ponta atual da cadeia da vistoria. Idempotente por (inspeção, tip):
 * se a ponta atual já foi ancorada, não cria nova âncora.
 * Nunca lança — offline / sem sessão / cadeia quebrada = null.
 */
export async function anchorInspectionChain(
  inspectionId: string,
): Promise<AuditAnchorRow | null> {
  if (!supabaseEnabled || !supabase || !inspectionId) return null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const events = await listAuditEventsByInspection(inspectionId)
    if (events.length === 0) return null

    // Não ancorar uma cadeia adulterada — a âncora atestaria lixo.
    const chain = await verifyEventChain(events)
    if (!chain.ok) return null

    const tip = events[events.length - 1].event_hash
    const { data: existing } = await supabase
      .from('audit_anchors')
      .select('id')
      .eq('inspection_id', inspectionId)
      .eq('chain_tip_hash', tip)
      .limit(1)
      .maybeSingle()
    if (existing?.id) return null

    const anchor_digest = await computeAnchorDigest({
      inspection_id: inspectionId,
      chain_tip_hash: tip,
      events_count: events.length,
    })
    const ots_proofs = await requestOtsProofs(anchor_digest)

    const row: AuditAnchorRow = {
      user_id: session.user.id,
      tenant_id: events[events.length - 1].tenant_id ?? null,
      inspection_id: inspectionId,
      chain_tip_hash: tip,
      events_count: events.length,
      anchor_digest,
      ots_proofs,
      status: ots_proofs.length > 0 ? 'pending_attestation' : 'recorded',
    }
    const { error } = await supabase.from('audit_anchors').insert(row)
    if (error) return null
    return row
  } catch {
    return null
  }
}
