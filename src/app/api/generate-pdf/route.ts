import { NextRequest, NextResponse } from 'next/server'
import type { Damage, VehicleInfo } from '@/src/types'
import { getUserFromRequest, userHasActiveSubscription } from '@/src/lib/server/auth'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { buildFullHtml } from '@/src/lib/pdf/html'
import { registerIntegrityPdfHash } from '@/src/lib/pdf/hash'
import { renderHtmlToPdfBuffer } from '@/src/lib/pdf/serverRender'
import type { PdfSettings, SvgPdfData } from '@/src/lib/pdf/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const LIMIT_PER_USER = 20
const WINDOW_MS = 10 * 60 * 1000

type Body = {
  info: VehicleInfo
  damages: Damage[]
  svgData?: SvgPdfData
  settings?: PdfSettings
}

/**
 * Gera o laudo PDF no servidor (Chromium) para aliviar mobile.
 * Se o runtime não tiver Chromium, responde 503 → client usa fallback local.
 */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { allowed, retryAfterSec } = await checkRateLimit(
    `generate-pdf:${user.id}`,
    LIMIT_PER_USER,
    WINDOW_MS,
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitas gerações de PDF. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    )
  }

  const hasSub = await userHasActiveSubscription(user.id)
  if (!hasSub) {
    return NextResponse.json({ error: 'Assinatura inativa' }, { status: 403 })
  }

  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!body?.info || !Array.isArray(body.damages)) {
    return NextResponse.json({ error: 'Payload incompleto (info, damages)' }, { status: 400 })
  }

  try {
    const { html, hash, ts, issuedAt, effectiveLayoutMode } = await buildFullHtml(
      body.info,
      body.damages,
      body.svgData,
      body.settings,
    )

    const { pdf, engine } = await renderHtmlToPdfBuffer(html, {
      preferMultiPage: effectiveLayoutMode === 'multi-page',
    })

    try {
      await registerIntegrityPdfHash(hash, pdf, {
        info: body.info,
        damages: body.damages,
        ts,
        issuedAt,
        inspectionId: body.settings?.inspectionId,
      })
    } catch {
      /* best-effort */
    }

    const filename = `vistoria-${body.info.plate || 'sem-placa'}.pdf`
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Pdf-Engine': engine,
        'X-Pdf-Hash': hash,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao gerar PDF'
    const unavailable = /Chromium indisponível|Could not find|executable/i.test(message)
    console.error('[generate-pdf]', message)
    const { captureServerException } = await import('@/src/lib/monitoring/capture')
    await captureServerException(err, { route: 'generate-pdf', unavailable })
    return NextResponse.json(
      { error: unavailable ? 'PDF server-side indisponível' : 'Erro ao gerar PDF', detail: message },
      { status: unavailable ? 503 : 500 },
    )
  }
}
