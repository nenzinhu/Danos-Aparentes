import type { VehicleType } from '../../types'
import type { FoundData } from './constants'

function pickStr(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  }
  return ''
}

function titleCaseWord(s: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function extraFields(data: Record<string, unknown>): Record<string, unknown> {
  const extra = data.extra
  return typeof extra === 'object' && extra !== null ? (extra as Record<string, unknown>) : {}
}

function collectTipoRaw(data: Record<string, unknown>): string {
  const extra = extraFields(data)
  return [
    data.tipo,
    data.TIPO,
    data.especie,
    data.ESPECIE,
    data.carroceria,
    data.CARROCERIA,
    data.categoria,
    data.CATEGORIA,
    data.segmento,
    data.SEGMENTO,
    data.sub_segmento,
    data.subSegmento,
    data.SUB_SEGMENTO,
    extra.tipo,
    extra.especie,
    extra.carroceria,
    extra.segmento,
    extra.sub_segmento,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function collectPortasHint(data: Record<string, unknown>, tipoRaw: string): string {
  const extra = extraFields(data)
  const modelo = pickStr(data.MODELO, data.modelo, data.SUBMODELO).toLowerCase()
  return [
    pickStr(
      data.portas,
      data.PORTAS,
      data.numero_portas,
      data.numeroPortas,
      data.quantidade_portas,
      extra.portas,
      extra.numero_portas,
    ),
    tipoRaw,
    modelo,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function inferCarDiagram(portasHint: string): 'car' | 'car2d' {
  const leading = portasHint.match(/^(\d+)\b/)
  if (leading) {
    const n = Number(leading[1])
    if (n === 2 || n === 3) return 'car2d'
    if (n >= 4) return 'car'
  }

  const portasMatch = portasHint.match(/\b(\d+)\s*portas?\b/)
  if (portasMatch) {
    const n = Number(portasMatch[1])
    if (n === 2 || n === 3) return 'car2d'
    if (n >= 4) return 'car'
  }
  if (
    /\b(2|3)\s*portas?\b/.test(portasHint) ||
    /\b(duas?|tr[eê]s)\s*portas?\b/.test(portasHint) ||
    /\b(2|3)p\b/.test(portasHint) ||
    /hatch|coupe|coup[eé]|esportivo|utilit[aá]rio\s*esportivo/.test(portasHint)
  ) {
    return 'car2d'
  }
  return 'car'
}

/** Mapeia resposta WDAPI → FoundData. Retorna null se a API sinalizar erro. */
export function mapPlateApiToFound(data: Record<string, unknown>): FoundData | null {
  const msg = typeof data.message === 'string' ? data.message.toLowerCase() : ''
  if (data.erro || data.error || msg.includes('not found')) return null

  const marca = pickStr(data.MARCA, data.marca)
  const modelo = pickStr(data.MODELO, data.modelo, data.SUBMODELO)
  const anoVal = pickStr(data.anoModelo, data.ano, data.ANO)
  const cor = pickStr(data.cor, data.COR)
  const cidade = pickStr(data.municipio, data.MUNICIPIO, data.cidade)
  const uf = pickStr(data.uf, data.UF, data.estado).toUpperCase()
  const tipoRaw = collectTipoRaw(data)
  const portasHint = collectPortasHint(data, tipoRaw)
  const especieRaw = [data.especie, data.ESPECIE, extraFields(data).especie].filter(Boolean).join(' ')

  let vtypeVal = 'Passeio (Carro)'
  let svgType: VehicleType = 'car'

  if (tipoRaw.includes('motoneta')) {
    vtypeVal = 'Motoneta'
    svgType = 'motoneta'
  } else if (
    tipoRaw.includes('motociclet') ||
    tipoRaw.includes('moto') ||
    tipoRaw.includes('ciclomotor') ||
    tipoRaw.includes('triciclo')
  ) {
    vtypeVal = 'Motocicleta'
    svgType = 'moto'
  } else if (
    tipoRaw.includes('caminh') ||
    tipoRaw.includes('trator') ||
    tipoRaw.includes('reboque') ||
    tipoRaw.includes('semi-reboque')
  ) {
    vtypeVal = 'Caminhão'
    svgType = 'truck'
  } else if (
    tipoRaw.includes('micro') ||
    tipoRaw.includes('microônibus') ||
    tipoRaw.includes('micro-onibus')
  ) {
    vtypeVal = 'Micro-ônibus'
    svgType = 'microbus'
  } else if (tipoRaw.includes('ônibus') || tipoRaw.includes('onibus')) {
    vtypeVal = 'Ônibus'
    svgType = 'bus'
  } else if (
    tipoRaw.includes('van') ||
    tipoRaw.includes('utilitário') ||
    tipoRaw.includes('utilitario') ||
    tipoRaw.includes('furgão') ||
    tipoRaw.includes('furgao')
  ) {
    vtypeVal = 'Van / Utilitário'
    svgType = 'van'
  } else if (tipoRaw.includes('caminhonete') || tipoRaw.includes('pickup')) {
    vtypeVal = 'Pickup / Caminhonete'
    svgType = inferCarDiagram(portasHint)
  } else if (tipoRaw.includes('suv') || tipoRaw.includes('crossover')) {
    vtypeVal = 'SUV / Crossover'
    svgType = inferCarDiagram(portasHint)
  } else if (
    tipoRaw.includes('automo') ||
    tipoRaw.includes('automóvel') ||
    tipoRaw.includes('passeio') ||
    tipoRaw.includes('sedan') ||
    tipoRaw.includes('hatch') ||
    tipoRaw.includes('carro')
  ) {
    svgType = inferCarDiagram(portasHint)
    vtypeVal = svgType === 'car2d' ? 'Passeio (Carro 2/3 Portas)' : 'Passeio (Carro)'
  }

  if (svgType === 'car') {
    const inferred = inferCarDiagram(portasHint)
    if (inferred === 'car2d') {
      svgType = 'car2d'
      if (vtypeVal === 'Passeio (Carro)') vtypeVal = 'Passeio (Carro 2/3 Portas)'
    }
  }

  const brandText = [marca, modelo, anoVal].filter(Boolean).join(' ')

  return {
    brand: brandText,
    color: titleCaseWord(cor),
    city: titleCaseWord(cidade),
    state: uf,
    vehicleTypeDesc: vtypeVal,
    svgType,
    ano: anoVal,
    especie: especieRaw || vtypeVal,
  }
}
