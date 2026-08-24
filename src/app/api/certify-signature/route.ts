import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, userHasActiveSubscription } from '@/src/lib/server/auth'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { loadInspectionReport } from '@/src/lib/server/loadInspection'
import { buildFullHtml } from '@/src/lib/pdf/html'
import { renderHtmlToPdfBuffer } from '@/src/lib/pdf/serverRender'
import type { PdfSettings, SvgPdfData } from '@/src/lib/pdf/types'
import {
  createSigner,
  resolveVerificationMethod,
  uploadDocument,
  createVirtualAssignment,
  type AssinafySignerInput,
} from '@/src/lib/server/assinafy'

export const runtime = 'nodejs'
export const maxDuration = 60

const LIMIT_PER_USER = 10
const WINDOW_MS = 10 * 60 * 1000

/**
 * POST /api/certify-signature
 * Corpo: { inspectionId, signer: { fullName, email?, whatsappPhone? } }
 *
 * Gera o laudo PDF no servidor, envia para a Assinafy (certificação digital
 * ICp-Brasil) e retorna o link de assinatura do signatário. O documento Assinafy
 * ID e o link são persistidos na inspeção para auditoria.
 */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const { allowed, retryAfterSec } = await checkRateLimit(
    `certify-sig:${user.id}`,
    LIMIT_PER_USER,
    WINDOW_MS,
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitas solicitações de certificação. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    )
  }

  let body: {
    inspectionId?: string
    signer?: AssinafySignerInput
    deliveryChannel?: 'whatsapp' | 'email'
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const inspectionId = String(body.inspectionId || '').trim()
  const signer = body.signer
  if (!inspectionId || !signer || !signer.fullName?.trim()) {
    return NextResponse.json(
      { error: 'inspectionId e signer.fullName são obrigatórios' },
      { status: 400 },
    )
  }

  const hasSub = await userHasActiveSubscription(user.id)
  if (!hasSub) {
    return NextResponse.json({ error: 'Assinatura inativa' }, { status: 403 })
  }

  // 1. Carrega a inspeção (deve pertencer ao usuário)
  const { data: ownership, error: ownErr } = await supabaseAdmin
    .from('vehicle_inspections')
    .select('user_id')
    .eq('id', inspectionId)
    .maybeSingle()
  if (ownErr || !ownership || ownership.user_id !== user.id) {
    return NextResponse.json({ error: 'Vistoria não encontrada' }, { status: 404 })
  }

  const report = await loadInspectionReport(supabaseAdmin, inspectionId)
  if (!report) {
    return NextResponse.json({ error: 'Vistoria não encontrada' }, { status: 404 })
  }

  try {
    const info = report.vehicleInfo
    const damages = report.damages

    // 2. Gera o PDF do laudo no servidor
    const settings: PdfSettings = {
      inspectionId,
      ...(report.publicCode ? { publicCode: report.publicCode } : {}),
      ...(typeof report.laudoVersion === 'number' ? { laudoVersion: report.laudoVersion } : {}),
    }
    const svgData: SvgPdfData = { svgCaptures: {} }
    const { html } = await buildFullHtml(info, damages, svgData, settings)
    const { pdf } = await renderHtmlToPdfBuffer(html, { preferMultiPage: true })

    // 3. Sobe para a Assinafy
    const filename = `vistoria-${info.plate || 'sem-placa'}.pdf`
    const documentId = await uploadDocument(pdf, filename)

    // 4. Cria signatário + solicita assinatura
    const signerId = await createSigner(signer)
    const verificationMethod = resolveVerificationMethod(signer, body.deliveryChannel)
    const assignment = await createVirtualAssignment(documentId, signerId, verificationMethod)

    // 5. Persiste vínculo para auditoria
    await supabaseAdmin
      .from('vehicle_inspections')
      .update({
        // colunas extras (ver migration) — ignoradas se não existirem
        assinafy_document_id: documentId,
        assinafy_assignment_id: assignment.assignmentId,
        assinafy_signing_url: assignment.signingUrl,
        assinafy_cert_status: assignment.status,
        assinafy_signer_name: signer.fullName,
      })
      .eq('id', inspectionId)
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      documentId,
      assignmentId: assignment.assignmentId,
      signingUrl: assignment.signingUrl,
      status: assignment.status,
      signerName: signer.fullName,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha na certificação digital'
    console.error('[certify-signature]', message)
    const { captureServerException } = await import('@/src/lib/monitoring/capture')
    await captureServerException(err, { route: 'certify-signature' })
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
