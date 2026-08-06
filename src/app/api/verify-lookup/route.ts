import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import type { PublicReportReceipt, PublicReportVersion } from '@/src/lib/verify/publicReceipt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
  )
}

function normalizeHash(raw: string): string {
  return raw.trim().replace(/[\s-]/g, '').toUpperCase()
}

function normalizeCode(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toUpperCase()
}

async function inspectionStatus(inspectionId: string | null | undefined): Promise<string | null> {
  if (!supabaseAdmin || !inspectionId) return null
  const { data } = await supabaseAdmin
    .from('vehicle_inspections')
    .select('status')
    .eq('id', inspectionId)
    .maybeSingle()
  return (data?.status as string) || null
}

function rowToReceipt(
  row: Record<string, unknown>,
  status: string | null,
): PublicReportReceipt {
  const manifest = row.integrity_manifest as { pdf_hash?: string } | null
  return {
    hash: String(row.hash || ''),
    plate: String(row.plate || ''),
    ref: String(row.ref || ''),
    issued_at: String(row.issued_at || ''),
    damages_count: Number(row.damages_count || 0),
    created_at: String(row.created_at || ''),
    geo_lat: (row.geo_lat as number | null) ?? null,
    geo_lng: (row.geo_lng as number | null) ?? null,
    geo_accuracy: (row.geo_accuracy as number | null) ?? null,
    geo_address: (row.geo_address as string | null) ?? null,
    company_name: (row.company_name as string | null) ?? null,
    company_logo: (row.company_logo as string | null) ?? null,
    report_key: (row.report_key as string | null) ?? null,
    version: (row.version as number | null) ?? null,
    public_code: (row.public_code as string | null) ?? null,
    inspection_id: (row.inspection_id as string | null) ?? null,
    disclosure_scope: (row.disclosure_scope as string | null) ?? null,
    severity_summary: (row.severity_summary as PublicReportReceipt['severity_summary']) ?? null,
    final_hash: (row.final_hash as string | null) ?? null,
    integrity_manifest: manifest,
    correction_reason: (row.correction_reason as string | null) ?? null,
    supersedes_hash: (row.supersedes_hash as string | null) ?? null,
    inspection_status: status,
  }
}

async function findByHash(hash: string): Promise<PublicReportReceipt | null> {
  if (!supabaseAdmin || hash.length < 8) return null

  // 1) match exact content hash (canonical QR)
  let { data } = await supabaseAdmin
    .from('report_hashes')
    .select('*')
    .eq('hash', hash)
    .maybeSingle()

  // 2) case-insensitive / legacy lowercase rows
  if (!data) {
    const res = await supabaseAdmin
      .from('report_hashes')
      .select('*')
      .ilike('hash', hash)
      .limit(1)
      .maybeSingle()
    data = res.data
  }

  // 3) final_hash (integrity scheme v2 — 64 hex)
  if (!data && hash.length >= 16) {
    const res = await supabaseAdmin
      .from('report_hashes')
      .select('*')
      .ilike('final_hash', hash)
      .limit(1)
      .maybeSingle()
    data = res.data
  }

  // 4) prefix: pasted full SHA when DB stores 32-char truncated hash
  if (!data && hash.length > 32) {
    const res = await supabaseAdmin
      .from('report_hashes')
      .select('*')
      .eq('hash', hash.slice(0, 32))
      .maybeSingle()
    data = res.data
  }

  if (!data?.hash) return null
  const status = await inspectionStatus(data.inspection_id as string | null)
  return rowToReceipt(data as Record<string, unknown>, status)
}

async function findByCode(code: string): Promise<PublicReportReceipt | null> {
  if (!supabaseAdmin || code.length < 4) return null
  const { data } = await supabaseAdmin
    .from('report_hashes')
    .select('*')
    .ilike('public_code', code)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data?.hash) return null
  const status = await inspectionStatus(data.inspection_id as string | null)
  return rowToReceipt(data as Record<string, unknown>, status)
}

async function findByPdfHash(pdfHash: string): Promise<PublicReportReceipt | null> {
  if (!supabaseAdmin || pdfHash.length < 8) return null
  const normalized = pdfHash.trim()

  // Prefer SECURITY DEFINER RPC (já existe) — evita filtro JSONB frágil no PostgREST.
  const { data: rpcData, error: rpcErr } = await supabaseAdmin.rpc('get_public_report_by_pdf_hash', {
    p_pdf_hash: normalized,
  })
  if (!rpcErr && rpcData && typeof rpcData === 'object' && (rpcData as { hash?: string }).hash) {
    return rpcData as PublicReportReceipt
  }

  // Fallback: varre integrity_manifest.pdf_hash via filter PostgREST
  const { data } = await supabaseAdmin
    .from('report_hashes')
    .select('*')
    .filter('integrity_manifest->>pdf_hash', 'eq', normalized)
    .limit(1)
    .maybeSingle()

  if (!data?.hash) return null
  const status = await inspectionStatus(data.inspection_id as string | null)
  return rowToReceipt(data as Record<string, unknown>, status)
}

async function listVersions(reportKey: string): Promise<PublicReportVersion[]> {
  if (!supabaseAdmin || !reportKey) return []
  const { data } = await supabaseAdmin
    .from('report_hashes')
    .select('hash, version')
    .eq('report_key', reportKey)
    .order('version', { ascending: true })
  return (data ?? [])
    .filter((r) => r?.hash)
    .map((r) => ({ hash: String(r.hash), version: Number(r.version || 1) }))
}

/**
 * GET /api/verify-lookup?hash=… | ?code=… | ?pdf_hash=… | ?report_key=…
 * Lookup público fail-closed via service role (rate-limited).
 * Substitui dependência exclusiva do RPC no browser após RLS fechar SELECT anônimo.
 */
export async function GET(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await checkRateLimit(`verify-lookup:${ip}`, 40, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas consultas. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Indisponível' }, { status: 503 })
  }

  const sp = req.nextUrl.searchParams
  const reportKey = (sp.get('report_key') || '').trim()
  if (reportKey) {
    const versions = await listVersions(reportKey)
    return NextResponse.json({ versions })
  }

  const hashRaw = sp.get('hash') || ''
  const codeRaw = sp.get('code') || ''
  const pdfRaw = sp.get('pdf_hash') || ''

  try {
    let receipt: PublicReportReceipt | null = null
    if (hashRaw.trim()) {
      receipt = await findByHash(normalizeHash(hashRaw))
    } else if (codeRaw.trim()) {
      receipt = await findByCode(normalizeCode(codeRaw))
    } else if (pdfRaw.trim()) {
      receipt = await findByPdfHash(pdfRaw.trim())
    } else {
      return NextResponse.json({ error: 'Informe hash, code ou pdf_hash' }, { status: 400 })
    }

    return NextResponse.json({ receipt })
  } catch (err) {
    console.error('verify-lookup:', err)
    return NextResponse.json({ error: 'Falha ao consultar' }, { status: 500 })
  }
}
