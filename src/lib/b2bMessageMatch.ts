import type { UtmParams } from './analytics/utm'
import type { B2bVertical } from './b2bPositioning'

export type MessageMatchVariant = {
  id: string
  /** Tokens em utm_content / utm_campaign / utm_term (match parcial, case-insensitive). */
  tokens: string[]
  headline: string
  sub: string
  kicker?: string
}

/**
 * Message match Ads → landing.
 *
 * UTMs sugeridas (Meta/Google):
 * `?utm_source=meta&utm_medium=paid_social&utm_campaign=locadoras_trial&utm_content=ja-estava-assim`
 *
 * Prioridade: utm_content → utm_term → utm_campaign (primeiro token que casar).
 */
const LOCADORAS: MessageMatchVariant[] = [
  {
    id: 'ja-estava-assim',
    tokens: ['ja-estava-assim', 'já-estava-assim', 'conceito-01', 'conceito-1', 'sick', 'balcao'],
    headline: 'Cansado do “já estava assim” na devolução?',
    sub: 'Pare de discutir no balcão. Compare retirada × devolução no mesmo padrão — diagrama, GPS, assinatura e PDF com hash + QR.',
    kicker: 'Locadoras · prova na devolução',
  },
  {
    id: 'whatsapp-vs-laudo',
    tokens: ['whatsapp', 'old-vs-new', 'conceito-03', 'conceito-3', 'prancheta'],
    headline: 'WhatsApp e prancheta não comparam. O histórico compara.',
    sub: 'Foto solta não é par entrega×devolução. Histórico e Sistema de Evidência Veicular no mesmo diagrama.',
    kicker: 'Locadoras · histórico verificável',
  },
  {
    id: 'cobranca-sem-prova',
    tokens: ['cobranca', 'cobrança', 'juridico', 'conceito-04', 'conceito-4', 'conjur'],
    headline: 'Sem vistoria de entrada, a cobrança vira discussão.',
    sub: 'Registre o par retirada×devolução com evidência verificável — hash SHA-256 e QR público.',
    kicker: 'Locadoras · evidência documental',
  },
  {
    id: 'historico-placa',
    tokens: ['historico', 'histórico', 'evidencia', 'evidência', 'placa', 'comparar'],
    headline: 'Histórico por placa: retirada × devolução no mesmo padrão',
    sub: 'Sistema de evidência veicular — compare estados, não opiniões no balcão.',
    kicker: 'Histórico e evidência veicular',
  },
  {
    id: 'trial-offer',
    tokens: ['trial', 'offer', 'conceito-09', 'conceito-9', '7-dias', 'gratis', 'grátis'],
    headline: '7 dias grátis para testar a prova na devolução',
    sub: 'Sem cartão. Faça o par retirada×devolução no app e veja o laudo com hash + QR.',
    kicker: 'Locadoras · trial sem cartão',
  },
  {
    id: 'preco-starter',
    tokens: ['preco', 'preço', 'starter', 'conceito-10', 'conceito-10', '29'],
    headline: 'Prova na devolução a partir de R$ 29,90/mês',
    sub: 'Starter para testar o fluxo. Pro com white-label. Corporativo sob conversa.',
    kicker: 'Locadoras · planos SME',
  },
]

const OFICINAS: MessageMatchVariant[] = [
  {
    id: 'ja-estava-assim',
    tokens: ['ja-estava-assim', 'entrada', 'entrega', 'discussao', 'discussão'],
    headline: '“Já estava assim” na entrega? Prove com histórico de entrada.',
    sub: 'Registre avarias na entrada, compare na saída — laudo com hash + QR e a marca da sua oficina.',
    kicker: 'Oficinas · histórico entrada × saída',
  },
  {
    id: 'papel',
    tokens: ['papel', 'prancheta', 'ilegivel', 'ilegível'],
    headline: 'Chega de laudo em papel que some ou fica ilegível',
    sub: 'Histórico digital por placa, offline na oficina, PDF white-label em minutos.',
    kicker: 'Oficinas · evidência digital',
  },
  {
    id: 'historico-placa',
    tokens: ['historico', 'histórico', 'evidencia', 'evidência'],
    headline: 'Histórico de evidência na entrada e na saída do veículo',
    sub: 'Sistema de evidência veicular para oficina — compare estados no mesmo padrão.',
    kicker: 'Histórico e evidência veicular',
  },
  {
    id: 'trial-offer',
    tokens: ['trial', 'offer', '7-dias', 'gratis', 'grátis'],
    headline: '7 dias grátis para digitalizar o laudo da oficina',
    sub: 'Sem cartão. Teste o histórico entrada × saída no celular.',
    kicker: 'Oficinas · trial sem cartão',
  },
]

const FROTAS: MessageMatchVariant[] = [
  {
    id: 'offline',
    tokens: ['offline', 'patio', 'pátio', 'sinal'],
    headline: 'Vistoria da frota no pátio — mesmo sem sinal',
    sub: 'Histórico por veículo offline + sync quando voltar a conexão. Mesmo diagrama para toda a equipe.',
    kicker: 'Frotas · offline + histórico',
  },
  {
    id: 'historico-placa',
    tokens: ['historico', 'histórico', 'evidencia', 'evidência', 'planilha'],
    headline: 'Histórico de evidência da frota — sem planilha solta',
    sub: 'Cada placa acumula estados comparáveis. Sistema de evidência veicular para frota.',
    kicker: 'Histórico e evidência veicular',
  },
  {
    id: 'trial-offer',
    tokens: ['trial', 'offer', '7-dias', 'gratis', 'grátis'],
    headline: '7 dias grátis para padronizar a vistoria da frota',
    sub: 'Sem cartão. Teste offline no pátio e veja o histórico por placa.',
    kicker: 'Frotas · trial sem cartão',
  },
]

const SEGURADORAS: MessageMatchVariant[] = [
  {
    id: 'anti-fraude',
    tokens: ['fraude', 'anti-fraude', 'qr', 'hash', 'adulter'],
    headline: 'Laudo com QR anti-fraude — evidência que se verifica',
    sub: 'Hash SHA-256 + verificação pública. Reduza disputa por avaria pré-existente.',
    kicker: 'Seguradoras · evidência verificável',
  },
  {
    id: 'pre-existente',
    tokens: ['pre-existente', 'pré-existente', 'sinistro', 'previa', 'prévia'],
    headline: 'Avaria pré-existente? Precisa de evidência no tempo.',
    sub: 'Histórico de estados + laudo verificável — cadeia de evidência do prévio ao sinistro.',
    kicker: 'Seguradoras · cadeia de evidência',
  },
  {
    id: 'historico-placa',
    tokens: ['historico', 'histórico', 'evidencia', 'evidência'],
    headline: 'Sistema de evidência veicular com QR anti-fraude',
    sub: 'Histórico e laudo que comprova a si mesmo — sem PDF editável sem rastro.',
    kicker: 'Histórico e evidência veicular',
  },
  {
    id: 'trial-offer',
    tokens: ['trial', 'offer', '7-dias', 'gratis', 'grátis'],
    headline: '7 dias grátis para testar o laudo verificável',
    sub: 'Sem cartão. Gere um laudo com hash + QR e confira na página de verificação.',
    kicker: 'Seguradoras · trial sem cartão',
  },
]

const BY_VERTICAL: Record<B2bVertical, MessageMatchVariant[]> = {
  locadoras: LOCADORAS,
  oficinas: OFICINAS,
  frotas: FROTAS,
  seguradoras: SEGURADORAS,
}

function haystack(utms: UtmParams & { term?: string }): string {
  return [utms.content, utms.term, utms.campaign].filter(Boolean).join(' ').toLowerCase()
}

function normalizeToken(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

/** Resolve variante de copy a partir dos UTMs. Retorna null = manter headline padrão da página. */
export function resolveB2bMessageMatch(
  vertical: B2bVertical,
  utms: UtmParams & { term?: string },
): MessageMatchVariant | null {
  const raw = haystack(utms)
  if (!raw.trim()) return null
  const hay = normalizeToken(raw)

  for (const variant of BY_VERTICAL[vertical]) {
    for (const token of variant.tokens) {
      if (hay.includes(normalizeToken(token))) return variant
    }
  }
  return null
}

/** Lista de utm_content recomendados por vertical (ops de ads). */
export function listMessageMatchIds(vertical: B2bVertical): string[] {
  return BY_VERTICAL[vertical].map(v => v.id)
}
