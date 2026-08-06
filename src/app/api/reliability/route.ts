import { NextRequest, NextResponse } from 'next/server'
import { verifyEventChain, type AuditLogRow } from '@/src/lib/audit/auditLog'
import { verifyAnchorsAgainstChain, type AuditAnchorRow } from '@/src/lib/audit/anchor'
import { computeReliability } from '@/src/lib/audit/reliability'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

/**
 * FASE 19 — Selo de confiabilidade público.
 * Dado o hash de um laudo emitido, resume a trilha de auditoria em critérios
 * legíveis (cadeia íntegra, fotos, revisão humana, GPS, assinatura, âncoras).
 * Retorna apenas agregados — nenhum dado pessoal.
 */

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
  )
}

export async function GET(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await checkRateLimit(`reliability:${ip}`, 30, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas consultas. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Indisponível' }, { status: 503 })
  }

  const hash = (req.nextUrl.searchParams.get('hash') || '').trim().toUpperCase()
  if (!hash || hash.length < 8 || hash.length > 64) {
    return NextResponse.json({ error: 'Hash inválido' }, { status: 400 })
  }

  try {
    const { data: rec } = await supabaseAdmin
      .from('report_hashes')
      .select('inspection_id, geo_lat, geo_lng')
      .eq('hash', hash)
      .maybeSingle()

    const inspectionId = (rec?.inspection_id as string | null) || null
    if (!inspectionId) {
      return NextResponse.json({ found: false })
    }

    const [{ data: eventsData }, { data: anchorsData }] = await Promise.all([
      supabaseAdmin
        .from('audit_log')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('timestamp', { ascending: true })
        .order('event_id', { ascending: true }),
      supabaseAdmin
        .from('audit_anchors')
        .select('chain_tip_hash, status, created_at')
        .eq('inspection_id', inspectionId)
        .order('created_at', { ascending: true }),
    ])

    const events = (eventsData as AuditLogRow[] | null) ?? []
    const anchors = (anchorsData as Pick<AuditAnchorRow, 'chain_tip_hash' | 'status' | 'created_at'>[] | null) ?? []

    const chain = await verifyEventChain(events)
    const anchorCheck = verifyAnchorsAgainstChain(events, anchors)

    const summary = computeReliability({
      eventTypes: events.map((e) => e.event_type),
      eventsCount: events.length,
      chainOk: chain.ok,
      anchoredCount: anchorCheck.anchoredCount,
      anchorsOk: anchorCheck.ok,
      hasGeo: rec?.geo_lat != null && rec?.geo_lng != null,
    })

    const lastAnchor = anchors.length > 0 ? anchors[anchors.length - 1] : null

    return NextResponse.json({
      found: true,
      score: summary.score,
      level: summary.level,
      levelLabel: summary.levelLabel,
      criteria: summary.criteria.map(({ id, label, met }) => ({ id, label, met })),
      eventsCount: summary.eventsCount,
      anchoredCount: summary.anchoredCount,
      photoAlertCount: summary.photoAlertCount,
      chainOk: chain.ok,
      anchorsOk: anchorCheck.ok,
      lastAnchorAt: lastAnchor?.created_at ?? null,
    })
  } catch (err) {
    console.error('reliability:', err)
    return NextResponse.json({ error: 'Falha ao consultar' }, { status: 500 })
  }
}
