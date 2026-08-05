import type { ChatSupportSegment } from './chatSupportKnowledge'

export type ChatIntentId =
  | 'planos'
  | 'historico'
  | 'vistoria'
  | 'pdf_hash'
  | 'offline'
  | 'ia'
  | 'white_label'
  | 'trial'
  | 'suporte'
  | 'vendas'

export type ChatIntent = {
  id: ChatIntentId
  label: string
  /** Texto enviado como mensagem do usuário (ou ação direta se escalateKind). */
  prompt: string
  /** Se definido, abre CTAs de WhatsApp sem chamar o LLM. */
  escalateKind?: 'support' | 'sales'
}

const HOME_INTENTS: ChatIntent[] = [
  {
    id: 'planos',
    label: 'Planos e preços',
    prompt: 'Quanto custa? Quais planos existem e o que inclui cada um?',
  },
  {
    id: 'historico',
    label: 'Histórico Inteligente',
    prompt: 'O que é a Memória Digital / Inteligência Histórica Veicular e por que isso importa?',
  },
  {
    id: 'vistoria',
    label: 'Como funciona',
    prompt: 'Como funciona a inspeção inteligente no Danos Aparentes, passo a passo?',
  },
  {
    id: 'pdf_hash',
    label: 'Dossiê, hash e QR',
    prompt: 'O dossiê técnico em PDF está incluso? O que é o hash SHA-256 e o QR Code?',
  },
  {
    id: 'offline',
    label: 'Funciona offline?',
    prompt: 'Preciso de internet para registrar inspeções? Funciona offline?',
  },
  {
    id: 'ia',
    label: 'IA nos danos',
    prompt: 'Como a IA analisa imagens e descreve danos? Ela substitui o profissional?',
  },
  {
    id: 'white_label',
    label: 'Marca no dossiê',
    prompt: 'Consigo personalizar o dossiê técnico com o logo da minha empresa?',
  },
  {
    id: 'trial',
    label: 'Teste grátis',
    prompt: 'Existe período de teste gratuito? Preciso de cartão?',
  },
  {
    id: 'suporte',
    label: 'Falar com suporte',
    prompt: 'Quero falar com o suporte humano',
    escalateKind: 'support',
  },
  {
    id: 'vendas',
    label: 'Falar com vendas',
    prompt: 'Quero falar com a equipe de vendas / plano Corporativo',
    escalateKind: 'sales',
  },
]

/** Chips enxutos para landings de segmento. */
const SEGMENT_INTENTS: ChatIntent[] = [
  {
    id: 'vistoria',
    label: 'Como funciona',
    prompt: 'Como funciona a inspeção inteligente e o dossiê técnico?',
  },
  {
    id: 'planos',
    label: 'Planos e preços',
    prompt: 'Quais são os planos e preços?',
  },
  {
    id: 'trial',
    label: 'Teste grátis',
    prompt: 'Posso testar grátis? Preciso de cartão?',
  },
  {
    id: 'suporte',
    label: 'Suporte',
    prompt: 'Quero falar com o suporte',
    escalateKind: 'support',
  },
  {
    id: 'vendas',
    label: 'Vendas',
    prompt: 'Quero falar com vendas',
    escalateKind: 'sales',
  },
]

export function getChatIntents(segment: ChatSupportSegment): ChatIntent[] {
  return segment === 'home' ? HOME_INTENTS : SEGMENT_INTENTS
}

export const HOME_WELCOME =
  'Olá! Sou a Equipe Danos Aparentes. Posso explicar a Inteligência Histórica Veicular, inspeções, dossiês, planos, IA e o teste grátis — ou te conectar com suporte ou vendas no WhatsApp.'
