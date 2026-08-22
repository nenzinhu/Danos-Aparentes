import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { callGroqChat } from '@/src/lib/server/groqClient'
import type { VehicleInfo, Damage, VehicleType } from '@/src/types'

export const runtime = 'nodejs'

const RATE_LIMIT = 30
const RATE_WINDOW_MS = 10 * 60 * 1000

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

const SYSTEM_PROMPT = `Você é o Assistente IA da Danos Aparentes, especialista em laudos de inspeção veicular (vistorias de entrada/saída, funilaria, avarias, hidro, quilometragem).
Responda em português do Brasil, de forma técnica porém acessível. Use markdown simples (**negrito**, listas com -). Seja conciso e prático. Não invente dados do veículo — use apenas o que foi fornecido.`

export async function POST(req: NextRequest) {
  let body: {
    messages?: { role: 'user' | 'assistant' | 'system'; content: string }[]
    vehicleInfo?: VehicleInfo
    damages?: Damage[]
    vehicleType?: VehicleType
  }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const history = Array.isArray(body.messages) ? body.messages : []
  if (history.length === 0) {
    return errorJson('Histórico de mensagens vazio', 400)
  }

  const rateKey = `ia:${req.headers.get('x-forwarded-for') || 'anon'}`
  const rate = await checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Limite de uso da IA atingido. Tente novamente em alguns minutos.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec || 60) } },
    )
  }

  const vi = body.vehicleInfo
  const vehicleContext = vi
    ? `\n\nContexto do veículo em vistoria:\n- Marca/modelo: ${vi.brand || 'n/i'}\n- Placa: ${vi.plate || 'n/i'}\n- Tipo: ${body.vehicleType || vi.vehicleTypeDesc || 'n/i'}\n- Cor: ${vi.color || 'n/i'}\n- Ano: ${vi.ano || 'n/i'}\n- Avarias registradas: ${(body.damages || []).map((d) => `${d.partName} (${d.type}/${d.severity})`).join(', ') || 'nenhuma'}`
    : ''

  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT + vehicleContext },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ]

  const res = await callGroqChat({ messages, temperature: 0.6, maxTokens: 1200 })
  if (!res.ok) {
    return errorJson(res.error, res.status)
  }

  return NextResponse.json({ response: res.content })
}
