/**
 * Consulta FIPE real (tabela de preços) via Parallelum API pública (sem chave).
 * Resolve marca/modelo/ano a partir de texto livre (normalização + match aproximado).
 * Cache em memória (processo) para respeitar o rate limit do provedor.
 */

type FipeSegment = 'carros' | 'motos' | 'caminhoes'

const SEGMENT_BY_VEHICLE: Record<string, FipeSegment> = {
  car: 'carros', car2d: 'carros', 'motoneta': 'motos', moto: 'motos',
  truck: 'caminhoes', van: 'caminhoes', bus: 'caminhoes', microbus: 'caminhoes',
  custom: 'carros',
}

interface CacheEntry { ts: number; data: unknown }
const CACHE = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fipeGet<T>(path: string): Promise<T | null> {
  const cached = CACHE.get(path)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data as T
  }
  try {
    const res = await fetch(`https://fipe.parallelum.com.br/api/v1${path}`, {
      headers: { Accept: 'application/json' },
      // Next.js edge/node fetch: sem cache de CDN para evitar stale.
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as T
    CACHE.set(path, { ts: Date.now(), data })
    return data
  } catch {
    return null
  }
}

interface FipeCodeName { codigo: number | string; nome: string }

function bestMatch(options: FipeCodeName[], query: string): FipeCodeName | null {
  const q = normalize(query)
  if (!q) return null
  // Correspondência exata normalizada.
  let exact = options.find((o) => normalize(o.nome) === q)
  if (exact) return exact
  // Contém / contido.
  let partial = options.find(
    (o) => normalize(o.nome).includes(q) || q.includes(normalize(o.nome)),
  )
  if (partial) return partial
  // Distância de palavras (primeira palavra).
  const qFirst = q.split(' ')[0]
  let firstWord = options.find((o) => normalize(o.nome).split(' ')[0] === qFirst)
  if (firstWord) return firstWord
  return null
}

export interface FipeQuote {
  valor: string
  mesReferencia: string
  marca: string
  modelo: string
  anoModelo: string
  combustivel: string
}

export interface FipeLookupInput {
  brand: string
  model: string
  year?: string | number
  vehicleType?: string
}

/**
 * Resolve a cotação FIPE. Retorna null se não encontrar (sem quebrar o fluxo).
 */
export async function resolveFipeQuote(input: FipeLookupInput): Promise<FipeQuote | null> {
  const segment: FipeSegment = SEGMENT_BY_VEHICLE[input.vehicleType || 'car'] || 'carros'
  if (!input.brand || !input.model) return null

  const marcas = await fipeGet<FipeCodeName[]>(`/${segment}/marcas`)
  if (!marcas?.length) return null
  const marca = bestMatch(marcas, input.brand)
  if (!marca) return null

  const modelos = await fipeGet<{ modelos: FipeCodeName[] }>(
    `/${segment}/marcas/${marca.codigo}/modelos`,
  )
  const modelo = bestMatch(modelos?.modelos || [], input.model)
  if (!modelo) return null

  const anos = await fipeGet<FipeCodeName[]>(
    `/${segment}/marcas/${marca.codigo}/modelos/${modelo.codigo}/anos`,
  )
  if (!anos?.length) return null

  // Seleciona o ano: prefere ano exato; senão o mais recente.
  let anoSel = anos.find((a) => String(a.nome).startsWith(String(input.year || '')))
  if (!anoSel) anoSel = anos[anos.length - 1]
  if (!anoSel) return null

  const quote = await fipeGet<{
    Valor: string
    Marca: string
    Modelo: string
    AnoModelo: string
    Combustivel: string
    MesReferencia: string
  }>(`/${segment}/marcas/${marca.codigo}/modelos/${modelo.codigo}/anos/${encodeURIComponent(String(anoSel.codigo))}`)

  if (!quote) return null
  return {
    valor: quote.Valor,
    mesReferencia: quote.MesReferencia,
    marca: quote.Marca,
    modelo: quote.Modelo,
    anoModelo: String(quote.AnoModelo),
    combustivel: quote.Combustivel,
  }
}
