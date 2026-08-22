import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import {
  createSigner,
  uploadDocument,
  createVirtualAssignment,
  resolveVerificationMethod,
} from '@/src/lib/server/assinafy'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function base64ToUint8(base64: string): Uint8Array {
  const clean = base64.replace(/^data:application\/pdf;base64,/, '').replace(/\s/g, '')
  const bin = Buffer.from(clean, 'base64')
  return new Uint8Array(bin)
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user?.id) {
    return errorJson('Não autenticado', 401)
  }

  let body: {
    inspectionId?: string
    signer?: { fullName?: string; email?: string; whatsappPhone?: string }
    deliveryChannel?: 'whatsapp' | 'email'
    pdfBase64?: string
  }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const inspectionId = (body.inspectionId || '').trim()
  const fullName = (body.signer?.fullName || '').trim()
  if (!inspectionId || !fullName) {
    return errorJson('inspectionId e signer.fullName obrigatórios', 400)
  }

  const pdfBase64 = (body.pdfBase64 || '').trim()
  if (!pdfBase64) {
    return errorJson(
      'PDF do laudo não enviado. Gere o laudo em PDF antes de certificar a assinatura.',
      400,
    )
  }

  try {
    const signerId = await createSigner({
      fullName,
      email: body.signer?.email?.trim() || undefined,
      whatsappPhone: body.signer?.whatsappPhone?.trim() || undefined,
    })

    const pdfBytes = base64ToUint8(pdfBase64)
    const documentId = await uploadDocument(pdfBytes, `laudo-${inspectionId}.pdf`)

    const method = resolveVerificationMethod(
      { fullName, email: body.signer?.email, whatsappPhone: body.signer?.whatsappPhone },
      body.deliveryChannel,
    )

    const assignment = await createVirtualAssignment(documentId, signerId, method)
    if (!assignment.signingUrl) {
      return errorJson('Assinatura criada, mas sem URL de assinatura retornada.', 502)
    }

    return NextResponse.json({
      signingUrl: assignment.signingUrl,
      documentId,
      assignmentId: assignment.assignmentId,
      status: assignment.status,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Falha ao certificar assinatura'
    console.error('[certify-signature]', msg)
    return errorJson(msg, 500)
  }
}
