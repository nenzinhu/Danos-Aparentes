import type { FipePublicSummary } from '../../types'

type FipeRawRow = {
  ano_modelo?: unknown
  texto_marca?: unknown
  texto_modelo?: unknown
  texto_valor?: unknown
  mes_referencia?: unknown
  combustivel?: unknown
  score?: unknown
}

function asTrimmedString(v: unknown): string {
  if (typeof v === 'string' && v.trim()) return v.trim()
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return ''
}

/** Procura o mês de referência FIPE em todas as variantes conhecidas da resposta. */
function pickMesReferencia(...candidates: unknown[]): string {
  for (const c of candidates) {
    const v = asTrimmedString(c)
    if (v) return v
  }
  return ''
}

function scoreOf(row: FipeRawRow): number {
  const n = typeof row.score === 'number' ? row.score : Number(row.score)
  return Number.isFinite(n) ? n : 0
}

function toSummary(parts: {
  mesReferencia: string
  valor: string
  anoModelo: string
  textoMarca: string
  textoModelo: string
  combustivel?: string
}): FipePublicSummary | null {
  if (!parts.textoMarca && !parts.textoModelo && !parts.valor) return null
  return {
    mesReferencia: parts.mesReferencia,
    valor: parts.valor,
    anoModelo: parts.anoModelo,
    textoMarca: parts.textoMarca,
    textoModelo: parts.textoModelo,
    ...(parts.combustivel ? { combustivel: parts.combustivel } : {}),
  }
}

/** Lê `fipe.dados` ou `fipePublic` já sanitizado. */
export function extractFipePublic(data: Record<string, unknown>): FipePublicSummary | null {
  const already = data.fipePublic
  if (already && typeof already === 'object' && already !== null) {
    const o = already as Record<string, unknown>
    return toSummary({
      mesReferencia: pickMesReferencia(
        o.mesReferencia,
        o.mes_referencia,
        o.referencia_fipe,
        o.mes,
        o.referencia,
        data.mes_referencia,
        data.mesReferencia,
      ),
      valor: asTrimmedString(o.valor ?? o.texto_valor),
      anoModelo: asTrimmedString(o.anoModelo ?? o.ano_modelo),
      textoMarca: asTrimmedString(o.textoMarca ?? o.texto_marca),
      textoModelo: asTrimmedString(o.textoModelo ?? o.texto_modelo),
      combustivel: asTrimmedString(o.combustivel) || undefined,
    })
  }

  const fipe = data.fipe
  if (!fipe || typeof fipe !== 'object') return null
  const fipeObj = fipe as Record<string, unknown>
  const dados = (fipeObj.dados ?? fipeObj.data) as unknown
  if (!Array.isArray(dados) || dados.length === 0) {
    // fipe sem array de dados: tenta ler mês/valor direto de fipe ou do topo.
    const directMes = pickMesReferencia(
      fipeObj.mes_referencia,
      fipeObj.mesReferencia,
      fipeObj.referencia_fipe,
      data.mes_referencia,
      data.mesReferencia,
    )
    if (!directMes && !fipeObj.texto_marca && !fipeObj.texto_valor) return null
    return toSummary({
      mesReferencia: directMes,
      valor: asTrimmedString(fipeObj.valor ?? fipeObj.texto_valor),
      anoModelo: asTrimmedString(fipeObj.anoModelo ?? fipeObj.ano_modelo),
      textoMarca: asTrimmedString(fipeObj.textoMarca ?? fipeObj.texto_marca),
      textoModelo: asTrimmedString(fipeObj.textoModelo ?? fipeObj.texto_modelo),
      combustivel: asTrimmedString(fipeObj.combustivel) || undefined,
    })
  }

  const rows = dados.filter((r): r is FipeRawRow => !!r && typeof r === 'object')
  if (rows.length === 0) return null

  const best = [...rows].sort((a, b) => scoreOf(b) - scoreOf(a))[0]
  return toSummary({
    mesReferencia: pickMesReferencia(
      best.mes_referencia,
      fipeObj.mes_referencia,
      fipeObj.mesReferencia,
      data.mes_referencia,
      data.mesReferencia,
    ),
    valor: asTrimmedString(best.texto_valor),
    anoModelo: asTrimmedString(best.ano_modelo),
    textoMarca: asTrimmedString(best.texto_marca),
    textoModelo: asTrimmedString(best.texto_modelo),
    combustivel: asTrimmedString(best.combustivel) || undefined,
  })
}

/** Remove payload FIPE bruto da resposta da API — só o resumo público. */
export function sanitizePlateLookupPayload(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const fipePublic = extractFipePublic(data)
  const { fipe: _fipe, fipePublic: _old, ...rest } = data
  void _fipe
  void _old
  if (fipePublic) return { ...rest, fipePublic }
  return rest
}
