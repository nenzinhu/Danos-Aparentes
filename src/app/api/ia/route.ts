import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/src/lib/server/auth'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { callGroqChat, getGroqApiKey } from '@/src/lib/server/groqClient'

/** Assistente IA do app (vistoria ativa) — por IP (~25 / 10 min). */
const IA_LIMIT_PER_IP = 25
const IA_WINDOW_MS = 10 * 60 * 1000

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 2000

interface VehicleInfoLite {
  plate?: string
  brand?: string
  model?: string
  color?: string
}
interface DamageLite {
  part?: string
  type?: string
  severity?: string
}
interface HistoryTurn {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const { allowed, retryAfterSec } = await checkRateLimit(`ia:${ip}`, IA_LIMIT_PER_IP, IA_WINDOW_MS)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas mensagens em pouco tempo. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
      )
    }

    if (!getGroqApiKey()) {
      return NextResponse.json({ error: 'Chave GROQ_API_KEY não configurada.' }, { status: 500 })
    }

    const body = await req.json()
    const rawHistory: HistoryTurn[] = Array.isArray(body.messages) ? body.messages : []
    const vehicle: VehicleInfoLite = body.vehicleInfo ?? {}
    const damages: DamageLite[] = Array.isArray(body.damages) ? body.damages : []

    const history: HistoryTurn[] = rawHistory
      .slice(-MAX_MESSAGES)
      .filter(
        (m) =>
          m &&
          typeof m.content === 'string' &&
          (m.role === 'user' || m.role === 'assistant'),
      )
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, MAX_MESSAGE_LENGTH) }))

    if (history.length === 0 || history[history.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Nenhuma mensagem válida enviada' }, { status: 400 })
    }

    const vehicleLine = [
      vehicle.brand ? `Marca: ${vehicle.brand}` : null,
      vehicle.model ? `Modelo: ${vehicle.model}` : null,
      vehicle.plate ? `Placa: ${vehicle.plate}` : null,
      vehicle.color ? `Cor: ${vehicle.color}` : null,
    ]
      .filter(Boolean)
      .join(' · ')

    const damagesLine = damages.length
      ? damages
          .map((d, i) => {
            const part = d.part || 'parte não informada'
            const type = d.type || 'avaria'
            const sev = d.severity || ''
            return `  ${i + 1}. ${part} — ${type}${sev ? ` (${sev})` : ''}`
          })
          .join('\n')
      : '  (nenhuma avaria registrada ainda)'

    const systemPrompt = `Você é o Assistente IA do Danos Aparentes, integrado à tela de vistoria do aplicativo. Você ajuda o profissional (vistoriador, perito, gestor de frota) a produzir e revisar o laudo técnico de avarias veiculares.

Contexto da vistoria ativa:
- Veículo: ${vehicleLine || 'não informado'}
- Avarias registradas (${damages.length}):
${damagesLine}

Regras:
1. Responda em Português, tom técnico e direto, 3-6 frases.
2. Ajude com: diagnóstico executivo da vistoria, sugestões de texto formal para observações do laudo, tipos de reparo indicados (funilaria, martelinho, retoque, substituição, pintura), e dúvidas sobre o processo de inspeção.
3. Baseie-se nas avarias e no veículo informados. Não invente dados que não estejam no contexto.
4. Nunca peça ou exiba dados pessoais (CPF, cartão, senha).
5. Se pedirem algo fora do escopo de vistoria/laudo, oriente a usar o suporte no app.
6. Use **negrito** para destaques e liste itens com "- ".`

    const groqRes = await callGroqChat({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.4,
      maxTokens: 1024,
    })

    if (!groqRes.ok) {
      console.error('Erro Groq API (ia):', groqRes.error)
      return NextResponse.json({ error: 'Não consegui responder agora.' }, { status: 502 })
    }

    return NextResponse.json({ response: groqRes.content.trim() })
  } catch (err) {
    console.error('Erro no endpoint de ia:', err)
    return NextResponse.json({ error: 'Não consegui responder agora.' }, { status: 500 })
  }
}
