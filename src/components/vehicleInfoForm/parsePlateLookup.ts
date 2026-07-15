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
  const especieRaw = [data.especie, data.ESPECIE].filter(Boolean).join(' ')
  const tipoRaw = [
    data.tipo,
    data.TIPO,
    data.carroceria,
    data.CARROCERIA,
    data.especie,
    data.ESPECIE,
    data.categoria,
    data.CATEGORIA,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  let vtypeVal = 'Passeio (Carro)'
  let svgType: FoundData['svgType'] = 'car'

  if (
    tipoRaw.includes('motoneta') ||
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
    tipoRaw.includes('ônibus') ||
    tipoRaw.includes('onibus') ||
    tipoRaw.includes('micro') ||
    tipoRaw.includes('microônibus')
  ) {
    vtypeVal = 'Ônibus / Micro-ônibus'
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
  } else if (tipoRaw.includes('suv') || tipoRaw.includes('crossover')) {
    vtypeVal = 'SUV / Crossover'
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
