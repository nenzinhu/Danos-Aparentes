import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const runtime = 'nodejs'

/**
 * Geração de PDF do laudo.
 *
 * Por design, o Danos Aparentes gera o PDF no CLIENTE (offline-first, leve no
 * celular do pátio) via jspdf/html2pdf. Esta rota existe para manter o contrato
 * `/api/generate-pdf` e permitir engine server-side futuro (ex.: Puppeteer/
 * microserviço) quando PDF_SERVER_ENGINE estiver configurado.
 *
 * Sem engine server: retorna 503 com { error: 'use_client' } — o clientOrchestrator
 * já faz fallback automático para geração local. Zero 404 em runtime.
 */
export async function POST(req: NextRequest) {
  const engine = process.env.PDF_SERVER_ENGINE?.trim()

  if (!engine) {
    return NextResponse.json(
      { error: 'use_client', message: 'PDF gerado no cliente (offline-first).' },
      { status: 503 },
    )
  }

  // Hook para engine server-side futuro (Puppeteer/microserviço).
  try {
    const endpoint = process.env.PDF_SERVER_ENDPOINT
    if (!endpoint) {
      return NextResponse.json({ error: 'use_client' }, { status: 503 })
    }
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await req.json().catch(() => ({}))),
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'use_client' }, { status: 503 })
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const hash = createHash('sha256').update(buf).digest('hex')
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="vistoria.pdf"',
        'X-Pdf-Hash': hash,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'use_client' }, { status: 503 })
  }
}
