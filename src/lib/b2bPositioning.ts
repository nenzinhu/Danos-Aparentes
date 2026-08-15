/**
 * Posicionamento oficial — Danos Aparentes
 * Categoria: Plataforma Brasileira de Inteligência Histórica Veicular
 *
 * Não vender como "sistema/app de vistoria".
 * Reforçar: memória digital, evidências, linha do tempo, dossiê, IA.
 */
export const B2B_BRAND = 'Danos Aparentes'

/** Headline canônica (hero / OG / pitch). */
export const B2B_PRODUCT_LINE =
  'A primeira Plataforma Brasileira de Inteligência Histórica Veicular.'

export const B2B_CATEGORY_SHORT = 'Inteligência Histórica Veicular'

export const B2B_TAGLINE =
  'Muito mais que uma vistoria. Centralize todo o histórico do veículo em uma plataforma inteligente.'

export const B2B_VALUE_PROPS = [
  'Transformamos inspeções em inteligência.',
  'Transformamos fotos em evidências.',
  'Transformamos danos em histórico.',
  'Transformamos veículos em ativos digitais documentados.',
] as const

export const B2B_HERO_SUBTITLE =
  'Registre inspeções, organize evidências, acompanhe a evolução dos danos e compare cada momento do veículo com a ajuda da Inteligência Artificial.'

export const B2B_CTA_DEMO = 'Solicitar Demonstração'
export const B2B_CTA_PLATFORM = 'Conhecer Plataforma'
export const B2B_CTA_CREATE_HISTORY = 'Criar meu primeiro histórico'
export const B2B_TRIAL_CTA = 'Começar teste grátis'
export const B2B_TRIAL_CTA_SHORT = 'Testar 7 dias grátis'
export const B2B_CTA_TRIAL_SHORT = 'Começar grátis'

/** Copy de conversão (brief de redesign SaaS B2B). */
export const B2B_HERO_HEADLINE_CONVERSION = 'Saiba exatamente quando um dano aconteceu.'
export const B2B_HERO_SUB_CONVERSION =
  'Registre cada inspeção com fotos, evidências, localização e data/hora. Compare o histórico do veículo e tenha provas organizadas para evitar disputas e prejuízos.'
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

/** Status de IA (protagonista). */
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
