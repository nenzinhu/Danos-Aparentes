import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { createSignatureToken } from '@/src/lib/server/signatureLink'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://danosaparentes.com.br'

export async function POST(req: NextRequest) {
  const ctx = await getUserFromRequest(req)
  if (!ctx?.id) {
    return errorJson('Não autenticado', 401)
  }

  let body: { inspectionId?: string }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const inspectionId = (body.inspectionId || '').trim()
  if (!inspectionId) {
    return errorJson('inspectionId obrigatório', 400)
  }

  try {
    const { token } = createSignatureToken(inspectionId)
    const url = `${APP_URL.replace(/\/$/, '')}/assinar?token=${encodeURIComponent(token)}`
    return NextResponse.json({ token, url })
  } catch (err) {
    return errorJson(err instanceof Error ? err.message : 'Falha ao gerar link', 500)
  }
}
