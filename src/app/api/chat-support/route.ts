import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { callGroqChat } from '@/src/lib/server/groqClient'

export const runtime = 'nodejs'

const RATE_LIMIT = 30
const RATE_WINDOW_MS = 10 * 60 * 1000

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

const SYSTEM_PROMPT = `Você é o suporte da Danos Aparentes, plataforma de laudos de inspeção veicular ("Inteligência Histórica Veicular") para locadoras, frotistas, despachantes, oficinas e seguradoras.
Ajude com dúvidas sobre: como fazer vistoria nas 4 vistas, fotos com GPS+hash, laudo com QR e verificação, planos (Starter/Pro/Corporativo), certificação digital ICP-Brasil, histórico do veículo e comparação de avarias.
Seja cordial, direto e em português do Brasil. Se a dúvida for claramente comercial (preço/contratação), sinalize para escalar para vendas. Se for técnica/urgente e você não souber, sinalize para o suporte humano. Responda em markdown simples.`

const SEGMENTS: Record<string, string> = {
  locadoras: 'O usuário é de locadora de veículos (gestão de frota, check-in/check-out, devolução com avarias).',
  frotistas: 'O usuário gere frotas corporativas.',
  despachantes: 'O usuário é despachante (vistoria para transferência/licenciamento).',
  oficinas: 'O usuário é oficina (orçamento, laudo para seguradora).',
  seguradoras: 'O usuário é de seguradora (sinistro, laudo de avarias).',
}

export async function POST(req: NextRequest) {
  let body: {
    segment?: string
    history?: { role: 'user' | 'assistant'; content: string }[]
  }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const history = Array.isArray(body.history) ? body.history : []
  if (history.length === 0) {
    return errorJson('Histórico vazio', 400)
  }

  const rateKey = `chat-support:${req.headers.get('x-forwarded-for') || 'anon'}`
  const rate = await checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Limite de uso do suporte atingido. Tente novamente em alguns minutos.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec || 60) } },
    )
  }

  const segmentHint = body.segment ? (SEGMENTS[body.segment] || '') : ''
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT + (segmentHint ? `\n\n${segmentHint}` : '') },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ]

  const res = await callGroqChat({ messages, temperature: 0.4, maxTokens: 800 })
  if (!res.ok) {
    return errorJson(res.error, res.status)
  }

  const content = res.content.toLowerCase()
  const escalate = /(falar com humano|atendente|vendas|contratar|preço|preco|orçamento|orçamento comercial|urgente)/.test(content) ||
    /(escalar|suporte humano|não sei|nao sei|encaminh)/.test(content)

  return NextResponse.json({
    response: res.content,
    escalate: Boolean(escalate),
    escalateKind: escalate ? (/preço|preco|contratar|vendas|orçamento|orcamento/.test(content) ? 'sales' : 'support') : undefined,
  })
}
