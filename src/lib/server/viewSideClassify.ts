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
  // Brasil: tampa/bocal de combustível identifica o lado esquerdo do veículo
  'tampa de combustivel': 'lateral-left',
  'tampa combustivel': 'lateral-left',
  'bocal de combustivel': 'lateral-left',
  'bocal combustivel': 'lateral-left',
  portinhola: 'lateral-left',
  'portinhola de combustivel': 'lateral-left',
  'fuel door': 'lateral-left',
  'fuel filler': 'lateral-left',
  'fuel cap': 'lateral-left',
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
  return `Você analisa fotos de inspeção veicular no Brasil. Há ${photoCount} foto(s) numeradas de 0 a ${photoCount - 1}.

ATENÇÃO CRÍTICA: Você tem a tendência de errar confundindo a posição da foto com o lado do veículo. Nunca use a posição da foto na tela como referência. Use apenas marcas físicas do veículo.

REGRA DE ORIENTAÇÃO VEICULAR (obrigatória — sentido de marcha, de dentro para fora):

Lado Esquerdo ("lateral-left"):
- Posto de condução / volante / porta e retrovisor do motorista.
- REFERÊNCIA ABSOLUTA NESTA PLATAFORMA: a tampa (portinhola / bocal) de combustível identifica o LADO ESQUERDO.
- Se a foto mostrar a tampa de combustível na carroceria, a resposta DEVE SER OBRIGATORIAMENTE "lateral-left".

Lado Direito ("lateral-right"):
- Lado oposto ao motorista (passageiro / carona / retrovisor direito).
- É o lado SEM a tampa de combustível (no padrão desta plataforma).
- Se a foto mostrar a lateral sem tampa de combustível e com porta do passageiro, use "lateral-right".

Frontal / Traseira (mesma orientação do veículo, sentido de marcha):
- "frontal" — frente do veículo (sentido de marcha / nariz: para-choque dianteiro, faróis, grade, placa dianteira).
- "traseira" — oposto à frente (para-choque traseiro, lanternas, porta-malas/tampa, placa traseira). Não confundir tampa do porta-malas com tampa de combustível.

PROIBIDO:
- Usar esquerda/direita da imagem na tela ou da câmera.
- Classificar pela perspectiva de quem olha o carro de fora.
- Espelhar ou inverter por causa do ângulo da foto.
- Associar tampa de combustível ao lado direito.
- Trocar frente e traseira por reflexo.

Responda SOMENTE JSON válido, sem markdown:
{"suggestions":[{"index":0,"view":"frontal"},{"index":1,"view":"lateral-left"}]}

Regras:
- Um objeto por foto (índices 0..${photoCount - 1}).
- Preferir views distintas quando houver 4 fotos.
- Em dúvida entre laterais: tampa de combustível = "lateral-left"; lado oposto = "lateral-right".
- Porta do motorista também = "lateral-left".`
}
