// Leitura do código de barras PDF417 do verso da CNH brasileira.
//
// O layout de campos é público (padrão DENATRAN/SENATRAN): os campos vêm
// separados por quebra de linha, e o número de registro da CNH é o 4º campo
// (nome, cpf, identidade, **registro CNH**, validade, ...). Isso é bem mais
// confiável que OCR de texto solto, que sofre com fonte/reflexo/foto tremida.
export function extractCnhNumberFromBarcode(rawText: string): string | null {
  const fields = rawText.split(/\r?\n/).map(f => f.trim()).filter(Boolean)
  const registro = fields[3]
  if (!registro) return null
  const digits = registro.replace(/\D/g, '')
  // Registro de CNH tem 11 dígitos.
  return digits.length === 11 ? digits : null
}
