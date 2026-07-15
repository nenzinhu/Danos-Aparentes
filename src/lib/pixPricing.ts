/** Preço unitário padrão do plano Pro (1 mês), em reais. */
export const DEFAULT_PIX_UNIT_BRL = 49.9

/** Limites razoáveis para evitar valores absurdos no PIX. */
export const PIX_UNITS_MIN = 1
export const PIX_UNITS_MAX = 12
export const PIX_SURCHARGE_MAX_BRL = 500

export interface PixAmountInput {
  /** Quantidade de unidades (meses do Pro). */
  units: number
  /** Acréscimo em R$ somado em cima do (unidade × preço). */
  surchargeBrl?: number
  /** Override do preço unitário (env em produção). */
  unitPriceBrl?: number
}

export interface PixAmountBreakdown {
  units: number
  unitPriceBrl: number
  unitsSubtotalBrl: number
  surchargeBrl: number
  totalBrl: number
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Calcula o total do PIX: (preço da unidade × qtd) + acréscimo.
 * O acréscimo vai sempre em cima do subtotal das unidades.
 */
export function calculatePixAmount(input: PixAmountInput): PixAmountBreakdown {
  const unitPriceBrl = roundMoney(input.unitPriceBrl ?? DEFAULT_PIX_UNIT_BRL)
  const units = Math.min(
    PIX_UNITS_MAX,
    Math.max(PIX_UNITS_MIN, Math.floor(Number(input.units) || PIX_UNITS_MIN)),
  )
  const rawSurcharge = Number(input.surchargeBrl) || 0
  const surchargeBrl = roundMoney(
    Math.min(PIX_SURCHARGE_MAX_BRL, Math.max(0, rawSurcharge)),
  )
  const unitsSubtotalBrl = roundMoney(unitPriceBrl * units)
  const totalBrl = roundMoney(unitsSubtotalBrl + surchargeBrl)

  return { units, unitPriceBrl, unitsSubtotalBrl, surchargeBrl, totalBrl }
}

export function getPixUnitPriceFromEnv(): number {
  const raw = process.env.PIX_PRO_UNIT_AMOUNT
  if (!raw) return DEFAULT_PIX_UNIT_BRL
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PIX_UNIT_BRL
  return roundMoney(parsed)
}
