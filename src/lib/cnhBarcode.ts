// Leitura do código de barras PDF417 do verso da CNH brasileira.
//
// O layout de campos é público (padrão DENATRAN/SENATRAN): os campos vêm
// separados por quebra de linha — nome, cpf, identidade, registro CNH,
// validade, ... — isso é bem mais confiável que OCR de texto solto, que
// sofre com fonte/reflexo/foto tremida.

export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map(word => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

// Validação padrão de dígito verificador de CPF (dois dígitos calculados
// a partir dos 9 primeiros). Usada só para decidir se o CPF lido do
// barcode é confiável o suficiente para preencher o formulário — não bloqueia
// digitação manual em nenhum outro lugar do app.
function isValidCpfChecksum(digits: string): boolean {
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false

  const calcDigit = (base: string, weightStart: number): number => {
    let sum = 0
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * (weightStart - i)
    }
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  const d1 = calcDigit(digits.slice(0, 9), 10)
  const d2 = calcDigit(digits.slice(0, 9) + d1, 11)
  return digits === digits.slice(0, 9) + String(d1) + String(d2)
}

export function extractCnhFieldsFromBarcode(rawText: string): {
  nome: string | null
  cpf: string | null
  cnhNumber: string | null
} {
  const fields = rawText.split(/\r?\n/).map(f => f.trim()).filter(Boolean)

  const nomeRaw = fields[0] || ''
  const nome = nomeRaw.length > 0 ? toTitleCase(nomeRaw) : null

  const cpfDigits = (fields[1] || '').replace(/\D/g, '')
  const cpf = isValidCpfChecksum(cpfDigits) ? cpfDigits : null

  const registro = fields[3] || ''
  const cnhDigits = registro.replace(/\D/g, '')
  // Registro de CNH tem 11 dígitos.
  const cnhNumber = cnhDigits.length === 11 ? cnhDigits : null

  return { nome, cpf, cnhNumber }
}
