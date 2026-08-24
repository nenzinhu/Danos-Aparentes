import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/src/lib/server/auth'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { callGroqChat, getGroqApiKey } from '@/src/lib/server/groqClient'
import {
  GENERAL_KNOWLEDGE,
  VALID_CHAT_SEGMENTS,
  getSegmentKnowledge,
  type ChatSupportSegment,
} from '@/src/content/chatSupportKnowledge'

/** Chat marketing público (sem auth) — por IP (~18 / 10 min). */
const CHAT_SUPPORT_LIMIT_PER_IP = 18
const CHAT_SUPPORT_WINDOW_MS = 10 * 60 * 1000

const MAX_MESSAGES = 12
const MAX_MESSAGE_LENGTH = 1000
const ESCALATE_MARKER = '[ESCALAR]'
const ESCALATE_SUPPORT = '[ESCALAR:SUPORTE]'
const ESCALATE_SALES = '[ESCALAR:VENDAS]'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const { allowed, retryAfterSec } = await checkRateLimit(
      `chat-support:${ip}`,
      CHAT_SUPPORT_LIMIT_PER_IP,
      CHAT_SUPPORT_WINDOW_MS,
    )
    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas mensagens em pouco tempo. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
      )
    }

    if (!getGroqApiKey()) {
      return NextResponse.json(
        { error: 'Chave GROQ_API_KEY não configurada.' },
        { status: 500 },
      )
    }

    const body = await req.json()
    const segment: ChatSupportSegment = VALID_CHAT_SEGMENTS.includes(body.segment as ChatSupportSegment)
      ? (body.segment as ChatSupportSegment)
      : 'locadoras'
    const rawHistory = Array.isArray(body.history) ? body.history : []

    type ChatTurn = { role: 'user' | 'assistant'; content: string }
    const history: ChatTurn[] = rawHistory
      .slice(-MAX_MESSAGES)
      .filter(
        (m: { role?: string; content?: string }) =>
          m &&
          typeof m.content === 'string' &&
          (m.role === 'user' || m.role === 'assistant'),
      )
      .map((m: { role: string; content: string }): ChatTurn => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content).slice(0, MAX_MESSAGE_LENGTH),
      }))

    if (history.length === 0) {
      return NextResponse.json({ error: 'Nenhuma mensagem válida enviada' }, { status: 400 })
    }

    const last = history[history.length - 1]
    if (!last || last.role !== 'user') {
      return NextResponse.json({ error: 'Nenhuma mensagem válida enviada' }, { status: 400 })
    }

    const systemPrompt = `Você é a Equipe Danos Aparentes no chat do site — assistente de suporte do "Danos Aparentes", a primeira Plataforma Brasileira de Inteligência Histórica Veicular. Você conversa com um VISITANTE do site, ainda não é cliente. Seu papel é tirar todas as dúvidas dele com clareza.

Informações que você pode usar para responder (é tudo que você sabe sobre o produto):
${GENERAL_KNOWLEDGE}

${getSegmentKnowledge(segment)}

Regras estritas:
1. Responda SOMENTE com base nas informações acima. Nunca invente preço, prazo, funcionalidade ou condição que não esteja listada.
2. Se a pessoa pedir suporte técnico de conta, bug, reembolso, ou algo que você não tenha certeza: comece EXATAMENTE com "${ESCALATE_SUPPORT}" e uma frase curta oferecendo WhatsApp de suporte.
3. Se a pessoa pedir negociação Corporativo/Enterprise, desconto, contrato custom ou quiser falar com vendas: comece EXATAMENTE com "${ESCALATE_SALES}" e uma frase curta oferecendo WhatsApp de vendas.
4. Se a dúvida estiver fora do conhecimento e não for claramente suporte nem vendas: comece EXATAMENTE com "${ESCALATE_MARKER}" e diga que pode conectar pelo WhatsApp.
5. Respostas curtas (2-4 frases), em Português, tom profissional e direto.
6. Nunca peça dados pessoais (CPF, cartão, senha).
7. Nunca se apresente com nomes pessoais — fale sempre como Equipe Danos Aparentes.
8. Quando falar de PDF/dossiê, deixe claro que o PDF é uma saída; o valor principal é a Memória Digital / Histórico Inteligente do veículo.`

    const groqRes = await callGroqChat({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({
          role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: m.content,
        })),
      ],
      temperature: 0.3,
      maxTokens: 500,
    })

    if (!groqRes.ok) {
      console.error('Erro Groq API (chat-support):', groqRes.error)
      return NextResponse.json({ error: 'Não consegui responder agora.' }, { status: 502 })
    }

    let replyText = groqRes.content.trim()
    let escalate = false
    let escalateKind: 'support' | 'sales' | 'generic' | null = null

    if (replyText.startsWith(ESCALATE_SUPPORT)) {
      escalate = true
      escalateKind = 'support'
      replyText = replyText.slice(ESCALATE_SUPPORT.length).trim()
    } else if (replyText.startsWith(ESCALATE_SALES)) {
      escalate = true
      escalateKind = 'sales'
      replyText = replyText.slice(ESCALATE_SALES.length).trim()
    } else if (replyText.startsWith(ESCALATE_MARKER)) {
      escalate = true
      escalateKind = 'generic'
      replyText = replyText.slice(ESCALATE_MARKER.length).trim()
    }

    if (!replyText) {
      escalate = true
      escalateKind = escalateKind ?? 'generic'
      replyText =
        'Não tenho certeza sobre isso, mas posso te conectar com a Equipe Danos Aparentes pelo WhatsApp.'
    }

    return NextResponse.json({ response: replyText, escalate, escalateKind })
  } catch (err) {
    console.error('Erro no endpoint de chat-support:', err)
    return NextResponse.json({ error: 'Não consegui responder agora.' }, { status: 500 })
  }
}
