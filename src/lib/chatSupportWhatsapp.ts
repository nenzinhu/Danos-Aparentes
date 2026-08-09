import { whatsappLink } from '../lib/whatsapp'
import { SEGMENT_LABELS, type ChatSupportSegment } from '../content/chatSupportKnowledge'

export type ChatEscalateKind = 'support' | 'sales' | 'error' | 'generic'

export function chatSupportWhatsappLink(
  segment: ChatSupportSegment,
  kind: ChatEscalateKind = 'generic',
): string {
  const label = SEGMENT_LABELS[segment]
  const messages: Record<ChatEscalateKind, string> = {
    support: `Olá! Estava no chat do site (${label}) e preciso de suporte.`,
    sales: `Olá! Estava no chat do site (${label}) e quero falar com a equipe de vendas / plano Corporativo.`,
    error: `Olá! O chat do site falhou e gostaria de continuar por aqui (${label}).`,
    generic: `Olá! Estava no chat do site perguntando sobre ${label} e gostaria de continuar por aqui.`,
  }
  return whatsappLink(messages[kind])
}

/** Evento para abrir o widget a partir de outros CTAs (ex.: Corporativo na home). */
export const OPEN_CHAT_SUPPORT_EVENT = 'danos:open-chat-support'

export type OpenChatSupportDetail = {
  intent?: 'suporte' | 'vendas' | 'planos'
  segment?: ChatSupportSegment
}

export function openChatSupport(detail: OpenChatSupportDetail = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_SUPPORT_EVENT, { detail }))
}
