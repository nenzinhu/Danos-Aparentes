import type { ViewType } from '@/src/types'

export const VIEW_SIDE_VALUES: ViewType[] = [
  'frontal',
  'traseira',
  'lateral-left',
  'lateral-right',
]

const VIEW_FROM_TOKEN: Record<string, ViewType> = {
  frontal: 'frontal',
  frente: 'frontal',
  dianteira: 'frontal',
  front: 'frontal',
  nariz: 'frontal',
  traseira: 'traseira',
  tras: 'traseira',
  trás: 'traseira',
  rear: 'traseira',
  'porta-malas': 'traseira',
  'porta malas': 'traseira',
  'lateral-left': 'lateral-left',
  'lateral_left': 'lateral-left',
  esquerda: 'lateral-left',
  'lado-esquerdo': 'lateral-left',
  'lado esquerdo': 'lateral-left',
  'lat. esquerda': 'lateral-left',
  'lado do motorista': 'lateral-left',
  motorista: 'lateral-left',
  left: 'lateral-left',
  'lateral-right': 'lateral-right',
  'lateral_right': 'lateral-right',
  direita: 'lateral-right',
  'lado-direito': 'lateral-right',
  'lado direito': 'lateral-right',
  'lat. direita': 'lateral-right',
  'lado do passageiro': 'lateral-right',
  passageiro: 'lateral-right',
  right: 'lateral-right',
}

export function normalizeViewSideToken(raw: string | null | undefined): ViewType | null {
  if (!raw) return null
  const key = raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
  return VIEW_FROM_TOKEN[key] || VIEW_FROM_TOKEN[key.replace(/ /g, '-')] || null
}

export type ParsedViewSideSuggestion = { index: number; view: ViewType }

/**
 * Aceita JSON do modelo (array ou { suggestions: [...] }).
 * Índices inválidos ou views desconhecidas são ignorados.
 */
export function parseViewSideResponse(
  text: string,
  photoCount: number,
): ParsedViewSideSuggestion[] {
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  let data: unknown
  try {
    data = JSON.parse(cleaned)
  } catch {
    return []
  }

  const rows: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray((data as { suggestions?: unknown })?.suggestions)
      ? ((data as { suggestions: unknown[] }).suggestions)
      : []

  const out: ParsedViewSideSuggestion[] = []
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const r = row as { index?: unknown; view?: unknown; lado?: unknown }
    const index = Number(r.index)
    if (!Number.isInteger(index) || index < 0 || index >= photoCount) continue
    const view = normalizeViewSideToken(String(r.view ?? r.lado ?? ''))
    if (!view) continue
    out.push({ index, view })
  }
  return out
}

export function buildViewSideClassifyPrompt(photoCount: number): string {
  return `Você analisa fotos de vistoria veicular no Brasil. Há ${photoCount} foto(s) numeradas de 0 a ${photoCount - 1}.

ATENÇÃO CRÍTICA: Você tem a tendência de errar confundindo a posição da foto com o lado do veículo. Para evitar erros, siga estritamente esta regra física absoluta: Procure o volante e o retrovisor do motorista na imagem. Se o posto do motorista estiver visível na foto, a resposta DEVE SER OBRIGATORIAMENTE Esquerda ("lateral-left"). Se for o lado do carona/passageiro, DEVE SER Direita ("lateral-right"). Nunca use a posição da foto na tela como referência.

REGRA DE ORIENTAÇÃO VEICULAR (obrigatória):
Para a classificação da lateral do veículo, adote sempre o padrão de referência do sentido de marcha (de dentro para fora):

Lado Esquerdo: É o lado onde fica o posto de condução (motorista / retrovisor esquerdo). Use o token JSON "lateral-left".

Lado Direito: É o lado oposto ao condutor (passageiro / retrovisor direito / bocal de combustível, dependendo do modelo). Use o token JSON "lateral-right".

Atenção: Não utilize a perspectiva de quem está olhando de fora para o carro. Se a foto mostrar a porta do motorista, classifique obrigatoriamente como Esquerda ("lateral-left").

Frontal / Traseira (mesma orientação do veículo, sentido de marcha):
- "frontal" — frente do veículo (sentido de marcha / nariz: para-choque dianteiro, faróis, grade, placa dianteira).
- "traseira" — oposto à frente (para-choque traseiro, lanternas, porta-malas/tampa, placa traseira).

PROIBIDO:
- Usar esquerda/direita da imagem na tela ou da câmera.
- Classificar pela perspectiva de quem olha o carro de fora.
- Espelhar ou inverter por causa do ângulo da foto.
- Trocar frente e traseira por reflexo.

Responda SOMENTE JSON válido, sem markdown:
{"suggestions":[{"index":0,"view":"frontal"},{"index":1,"view":"lateral-left"}]}

Regras:
- Um objeto por foto (índices 0..${photoCount - 1}).
- Preferir views distintas quando houver 4 fotos.
- Em dúvida, aplique a regra do sentido de marcha (de dentro para fora); porta do motorista = "lateral-left".`
}
