/**
 * Client helpers for public /verify — uses SECURITY DEFINER RPCs
 * instead of open SELECT on report_hashes.
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
  if (!data || typeof data !== 'object') return null
  const row = data as PublicReportReceipt
  if (!row.hash) return null
  return row
}

export async function fetchPublicReportByHash(
  client: RpcClient,
  hash: string,
): Promise<{ data: PublicReportReceipt | null; error: string | null }> {
  const { data, error } = await client.rpc('get_public_report_receipt', { p_hash: hash })
  if (error) return { data: null, error: error.message || 'rpc_error' }
  return { data: asReceipt(data), error: null }
}

export async function fetchPublicReportByCode(
  client: RpcClient,
  code: string,
): Promise<{ data: PublicReportReceipt | null; error: string | null }> {
  const { data, error } = await client.rpc('get_public_report_by_code', { p_code: code })
  if (error) return { data: null, error: error.message || 'rpc_error' }
  return { data: asReceipt(data), error: null }
}

export async function fetchPublicReportByPdfHash(
  client: RpcClient,
  pdfHash: string,
): Promise<{ data: PublicReportReceipt | null; error: string | null }> {
  const { data, error } = await client.rpc('get_public_report_by_pdf_hash', { p_pdf_hash: pdfHash })
  if (error) return { data: null, error: error.message || 'rpc_error' }
  return { data: asReceipt(data), error: null }
}

export async function fetchPublicReportVersions(
  client: RpcClient,
  reportKey: string,
): Promise<{ data: PublicReportVersion[]; error: string | null }> {
  const { data, error } = await client.rpc('get_public_report_versions', { p_report_key: reportKey })
  if (error) return { data: [], error: error.message || 'rpc_error' }
  if (!Array.isArray(data)) return { data: [], error: null }
  return {
    data: data.filter(
      (v): v is PublicReportVersion =>
        !!v && typeof v === 'object' && typeof (v as PublicReportVersion).hash === 'string',
    ),
    error: null,
  }
}
