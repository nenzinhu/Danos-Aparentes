import { NextRequest, NextResponse } from 'next/server'
import { resolveFipeQuote } from '@/src/lib/server/plateLookupFipe'
import { checkRateLimit } from '@/src/lib/server/rateLimit'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Cotação FIPE REAL (tabela de preços) por marca/modelo/ano.
 * Usado pelo formulário de veículo para preencher o valor FIPE do histórico.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const brand = (url.searchParams.get('brand') || '').trim()
  const model = (url.searchParams.get('model') || '').trim()
  const year = (url.searchParams.get('year') || '').trim()
  const type = (url.searchParams.get('type') || 'car').trim()

  if (!brand || !model) {
    return errorJson('brand e model obrigatórios', 400)
  }

  const rateKey = `fipe-lookup:${req.headers.get('x-forwarded-for') || 'anon'}`
  const rate = await checkRateLimit(rateKey, 30, 10 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Muitas consultas FIPE. Tente novamente em alguns minutos.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec || 60) } },
    )
  }

  try {
    const quote = await resolveFipeQuote({ brand, model, year, vehicleType: type })
    if (!quote) {
      return NextResponse.json({ found: false })
    }
    return NextResponse.json({ found: true, ...quote })
  } catch (err) {
    console.error('[fipe-lookup]', err)
    return errorJson('Falha na consulta FIPE', 500)
  }
}
