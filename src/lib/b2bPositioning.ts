/**
 * Posicionamento oficial — Danos Aparentes
 * Categoria: Plataforma de histórico e evidência veicular
 *
 * Não vender como "sistema/app de vistoria".
 * Reforçar: memória digital, evidências, linha do tempo, comparação, prova.
 */
export const B2B_BRAND = 'Danos Aparentes'

/** Headline canônica (hero / OG / pitch). */
export const B2B_PRODUCT_LINE =
  'Plataforma de histórico e evidência veicular.'

export const B2B_CATEGORY_SHORT = 'Inteligência Histórica Veicular'

export const B2B_TAGLINE =
  'Saiba exatamente o que mudou em cada veículo.'

export const B2B_VALUE_PROPS = [
  'Cada inspeção vira um evento no histórico do veículo.',
  'Fotos, data, local e assinatura viram evidência.',
  'Compare versões e identifique mudanças com precisão.',
  'Comprove o estado do veículo com documento verificável.',
] as const

export const B2B_HERO_SUBTITLE =
  'Registre inspeções, compare o estado do veículo ao longo do tempo e tenha evidências organizadas para comprovar o que mudou.'

export const B2B_CTA_DEMO = 'Ver como funciona'
export const B2B_CTA_PLATFORM = 'Conhecer a plataforma'
export const B2B_CTA_CREATE_HISTORY = 'Criar meu primeiro histórico'
export const B2B_TRIAL_CTA = 'Começar grátis'
export const B2B_TRIAL_CTA_SHORT = 'Começar grátis'
export const B2B_CTA_TRIAL_SHORT = 'Começar grátis'

/** Copy de conversão (brief de redesign HOME SaaS B2B). */
export const B2B_HERO_HEADLINE_A = 'Saiba exatamente o que mudou em cada veículo.'
export const B2B_HERO_HEADLINE_B = 'Pare de discutir sobre quando o dano aconteceu.'
export const B2B_HERO_SUB =
  'Registre, compare e comprove o estado de cada veículo com fotos, evidências, localização, data, hora e histórico completo.'
export const B2B_HERO_EYEBROW = 'HISTÓRICO DIGITAL DO VEÍCULO'
export const B2B_HERO_MICRO = [
  'Você sabe o que mudou.',
  'Você sabe quando mudou.',
  'Você tem a evidência.',
]
export const B2B_TRIAL_BADGE = '7 dias grátis • Sem cartão de crédito'
export const B2B_HERO_HEADLINE_CONVERSION = 'Saiba exatamente quando um dano aconteceu.'
export const B2B_HERO_SUB_CONVERSION =
  'Cada inspeção vira um evento no histórico do veículo, com fotos, localização e data/hora. Compare e comprove o que mudou.'
export const B2B_PROBLEM_TITLE = 'Quem causou o dano?'
export const B2B_FINAL_HEADLINE = 'Pare de discutir sobre quando o dano aconteceu.'
export const B2B_FINAL_SUB =
  'Comece a criar hoje o histórico digital dos seus veículos. Teste grátis, sem cartão.'
export const B2B_CTA_TRIAL = B2B_TRIAL_CTA

/** Vocabulário interno da UI (labels). */
export const UI_LABELS = {
  history: 'Histórico',
  dossiers: 'Dossiês',
  evidences: 'Evidências',
  newInspection: 'Nova Inspeção',
  timeline: 'Linha do Tempo',
  vehicleIdentity: 'Identidade do Veículo',
  technicalDossier: 'Dossiê Técnico',
  fleet: 'Gestão de Frota',
  audit: 'Auditoria',
  intelligentHistory: 'Histórico Inteligente',
  digitalMemory: 'Memória Digital do Veículo',
  digitalHeritage: 'Patrimônio Digital do Veículo',
} as const

/** Mensagens de sistema (toasts / status). */
export const SYSTEM_MESSAGES = {
  historyVersionCreated: 'Nova versão do histórico criada.',
  evidencesAdded: 'Evidências adicionadas ao histórico.',
  dossierComplete: 'Dossiê técnico concluído.',
  inspectionLoaded: 'Inspeção carregada no histórico.',
  dataCleared: 'Histórico da inspeção limpo.',
  damagesCleared: 'Danos removidos desta inspeção.',
  issuedImmutable: 'Dossiê emitido é imutável — use "Criar correção (nova versão)"',
  dossierIssued: 'Dossiê técnico emitido — alterações exigem nova versão.',
} as const

/** Status de IA (apoio, não protagonista). */
export const AI_STATUS = {
  analyzing: 'IA analisando imagens...',
  detecting: 'Detectando danos...',
  describing: 'Gerando descrição...',
  confidence: 'Calculando nível de confiança...',
  creatingEvidence: 'Criando evidências...',
  updatingHistory: 'Atualizando histórico...',
} as const

export type B2bVertical = 'locadoras' | 'oficinas' | 'frotas' | 'seguradoras'

/**
 * Hierarquia de termos para SEO (missão: Histórico Digital do Veículo).
 * PRIMÁRIO domina título/descrição; SECUNDÁRIOS e TERCIÁRIOS entram em
 * keywords e reforçam a relação semântica sem keyword stuffing.
 * Termos de vistoria/laudo ficam como portas de entrada (item 3).
 */
export const SEO_PRIMARY = 'Histórico Digital do Veículo'

export const SEO_SECONDARY = [
  'Histórico Veicular',
  'Inteligência Histórica Veicular',
  'Histórico de Avarias',
  'Histórico de Danos',
] as const

export const SEO_TERTIARY = [
  'Comparação de Vistorias',
  'Registro de Avarias',
  'Evidências Fotográficas',
  'Rastreabilidade Veicular',
  'Gestão de Danos Veiculares',
  'Gestão de Frotas',
] as const

/** Termos de entrada — pesquisas reais, não dominam a identidade (item 3). */
export const SEO_ENTRY_TERMS = [
  'Vistoria Veicular',
  'Vistoria Digital',
  'Laudo de Vistoria',
  'Danos em Veículos',
  'Avarias em Veículos',
  'Checklist Veicular',
] as const

export const SEO_KEYWORDS = [
  SEO_PRIMARY,
  ...SEO_SECONDARY,
  ...SEO_TERTIARY,
  ...SEO_ENTRY_TERMS,
  'Danos Aparentes',
] as const

/** Títulos por página — padrão "[Tema] | Danos Aparentes" (item 7). */
export const SEO_PAGE_TITLES = {
  home: 'Danos Aparentes | Histórico Digital do Veículo',
  historico: 'Histórico Digital do Veículo | Danos Aparentes',
  comparacao: 'Comparação de Vistorias | Danos Aparentes',
  historicoAvarias: 'Histórico de Avarias | Danos Aparentes',
  frotas: 'Gestão de Danos em Frotas | Danos Aparentes',
} as const

/** Categorias do blog reestruturadas (item 5) — mantém slug curto. */
export const BLOG_CATEGORIES: { name: string; slug: string }[] = [
  { name: 'Histórico Veicular', slug: 'historico-veicular' },
  { name: 'Avarias e Danos', slug: 'avarias-e-danos' },
  { name: 'Vistoria', slug: 'vistoria' },
  { name: 'Comparação', slug: 'comparacao' },
  { name: 'Inteligência', slug: 'inteligencia' },
  { name: 'Gestão', slug: 'gestao' },
]
