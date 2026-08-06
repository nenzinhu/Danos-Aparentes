/**
 * Client helpers for public /verify.
 * Prefer server `/api/verify-lookup` (service role + rate limit).
 * RPC SECURITY DEFINER permanece como fallback.
 */

import type { SeveritySummary } from './disclosureScope'

export type PublicReportReceipt = {
  hash: string
  plate: string
  ref: string
  issued_at: string
  damages_count: number
  created_at: string
  geo_lat?: number | null
  geo_lng?: number | null
  geo_accuracy?: number | null
  geo_address?: string | null
  company_name?: string | null
  company_logo?: string | null
  report_key?: string | null
  version?: number | null
  public_code?: string | null
  inspection_id?: string | null
  disclosure_scope?: string | null
  severity_summary?: SeveritySummary | null
  final_hash?: string | null
  integrity_manifest?: { pdf_hash?: string } | null
  correction_reason?: string | null
  supersedes_hash?: string | null
  inspection_status?: string | null
}

export type PublicReportVersion = { hash: string; version: number }

type RpcClient = {
  rpc: (
    fn: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>
}

function asReceipt(data: unknown): PublicReportReceipt | null {
  if (!data) return null
  // PostgREST às vezes devolve array de 1 linha
  if (Array.isArray(data)) {
    return asReceipt(data[0])
  }
  if (typeof data !== 'object') return null
  const row = data as PublicReportReceipt
  if (!row.hash) return null
  return row
}

async function lookupViaApi(params: Record<string, string>): Promise<{
  data: PublicReportReceipt | null
  error: string | null
}> {
  try {
    const qs = new URLSearchParams(params)
    const res = await fetch(`/api/verify-lookup?${qs.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (res.status === 429) {
      return { data: null, error: 'rate_limited' }
    }
    if (!res.ok) {
      return { data: null, error: `http_${res.status}` }
    }
    const body = (await res.json()) as { receipt?: PublicReportReceipt | null; error?: string }
    if (body.error && !body.receipt) return { data: null, error: body.error }
    return { data: asReceipt(body.receipt ?? null), error: null }
  } catch {
    return { data: null, error: 'network' }
  }
}

async function versionsViaApi(reportKey: string): Promise<{
  data: PublicReportVersion[]
  error: string | null
}> {
  try {
    const res = await fetch(`/api/verify-lookup?report_key=${encodeURIComponent(reportKey)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return { data: [], error: `http_${res.status}` }
    const body = (await res.json()) as { versions?: PublicReportVersion[] }
    const list = Array.isArray(body.versions) ? body.versions : []
    return {
      data: list.filter((v) => v && typeof v.hash === 'string'),
      error: null,
    }
  } catch {
    return { data: [], error: 'network' }
  }
}

export async function fetchPublicReportByHash(
  client: RpcClient,
  hash: string,
): Promise<{ data: PublicReportReceipt | null; error: string | null }> {
  const viaApi = await lookupViaApi({ hash })
  if (!viaApi.error || viaApi.data) return viaApi

  const { data, error } = await client.rpc('get_public_report_receipt', { p_hash: hash })
  if (error) return { data: null, error: error.message || 'rpc_error' }
  return { data: asReceipt(data), error: null }
}

export async function fetchPublicReportByCode(
  client: RpcClient,
  code: string,
): Promise<{ data: PublicReportReceipt | null; error: string | null }> {
  const viaApi = await lookupViaApi({ code })
  if (!viaApi.error || viaApi.data) return viaApi

  const { data, error } = await client.rpc('get_public_report_by_code', { p_code: code })
  if (error) return { data: null, error: error.message || 'rpc_error' }
  return { data: asReceipt(data), error: null }
}

export async function fetchPublicReportByPdfHash(
  client: RpcClient,
  pdfHash: string,
): Promise<{ data: PublicReportReceipt | null; error: string | null }> {
  const viaApi = await lookupViaApi({ pdf_hash: pdfHash })
  if (!viaApi.error || viaApi.data) return viaApi

  const { data, error } = await client.rpc('get_public_report_by_pdf_hash', { p_pdf_hash: pdfHash })
  if (error) return { data: null, error: error.message || 'rpc_error' }
  return { data: asReceipt(data), error: null }
}

export async function fetchPublicReportVersions(
  client: RpcClient,
  reportKey: string,
): Promise<{ data: PublicReportVersion[]; error: string | null }> {
  const viaApi = await versionsViaApi(reportKey)
  if (!viaApi.error || viaApi.data.length > 0) return viaApi

  const { data, error } = await client.rpc('get_public_report_versions', { p_report_key: reportKey })
  if (error) return { data: [], error: error.message || 'rpc_error' }
  if (!Array.isArray(data)) {
    // jsonb array may arrive already parsed
    if (data && typeof data === 'object') return { data: [], error: null }
    return { data: [], error: null }
  }
  return {
    data: data.filter(
      (v): v is PublicReportVersion =>
        !!v && typeof v === 'object' && typeof (v as PublicReportVersion).hash === 'string',
    ),
    error: null,
  }
}
