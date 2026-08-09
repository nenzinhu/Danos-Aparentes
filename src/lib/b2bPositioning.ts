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
  'Registre inspeções, organize evidências, acompanhe a evolução dos danos, utilize Inteligência Artificial e gere laudos profissionais em poucos minutos.'

export const B2B_CTA_DEMO = 'Solicitar Demonstração'
export const B2B_CTA_PLATFORM = 'Conhecer Plataforma'
export const B2B_TRIAL_CTA = 'Começar 7 dias grátis — sem cartão'
export const B2B_TRIAL_CTA_SHORT = 'Testar 7 dias grátis'

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
