import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { normalizePublicCode, isPublicCodeQuery } from '@/src/lib/verify/publicVerify'
import type { PublicReportReceipt, PublicReportVersion } from '@/src/lib/verify/publicReceipt'

export const runtime = 'nodejs'

const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 1000

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const hash = url.searchParams.get('hash')?.trim() || ''
  const code = url.searchParams.get('code')?.trim() || ''
  const pdfHash = url.searchParams.get('pdf_hash')?.trim() || ''
  const reportKey = url.searchParams.get('report_key')?.trim() || ''

  const query = hash || code || pdfHash || reportKey
  if (!query) {
    return errorJson('Informe hash, code, pdf_hash ou report_key', 400)
  }

  const rateKey = `verify-lookup:${req.headers.get('x-forwarded-for') || 'anon'}`
  const rate = await checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Muitas consultas. Tente novamente em alguns instantes.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec || 30) } },
    )
  }

  if (!supabaseAdmin) {
    return errorJson('Serviço de verificação indisponível', 503)
  }

  try {
    type RpcName = 'get_public_report_receipt' | 'get_public_report_by_code' | 'get_public_report_by_pdf_hash' | 'get_public_report_versions'
    let rpc: RpcName
    let paramKey: string
    let arg: string
    if (hash) {
      rpc = 'get_public_report_receipt'
      paramKey = 'p_hash'
      arg = hash
    } else if (code || isPublicCodeQuery(code)) {
      rpc = 'get_public_report_by_code'
      paramKey = 'p_code'
      arg = normalizePublicCode(code || query)
    } else if (pdfHash) {
      rpc = 'get_public_report_by_pdf_hash'
      paramKey = 'p_pdf_hash'
      arg = pdfHash
    } else {
      rpc = 'get_public_report_versions'
      paramKey = 'p_report_key'
      arg = reportKey
    }

    const { data, error } = await supabaseAdmin.rpc(rpc, { [paramKey]: arg })

    if (error) {
      console.error('[verify-lookup] rpc error:', error)
      return errorJson('Falha na consulta de verificação', 500)
    }

    if (rpc === 'get_public_report_versions') {
      const versions = Array.isArray(data) ? (data as PublicReportVersion[]) : []
      return NextResponse.json({ versions })
    }

    const receipt = (data as PublicReportReceipt | null) || null
    if (!receipt || !receipt.hash) {
      return NextResponse.json({ receipt: null, error: 'not_found' })
    }
    return NextResponse.json({ receipt })
  } catch (err) {
    console.error('[verify-lookup] unexpected:', err)
    return errorJson('Falha na consulta de verificação', 500)
  }
}
