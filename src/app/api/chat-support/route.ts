import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/src/lib/server/auth';
import { checkRateLimit } from '@/src/lib/server/rateLimit';
import { GENERAL_KNOWLEDGE, getSegmentKnowledge, type ChatSupportSegment } from '@/src/content/chatSupportKnowledge';

/** Chat marketing público (sem auth) — por IP (~18 / 10 min). */
const CHAT_SUPPORT_LIMIT_PER_IP = 18;
const CHAT_SUPPORT_WINDOW_MS = 10 * 60 * 1000;

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1000;
const ESCALATE_MARKER = '[ESCALAR]';

const VALID_SEGMENTS: ChatSupportSegment[] = ['locadoras', 'oficinas', 'seguradoras', 'frotas'];

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, retryAfterSec } = await checkRateLimit(
      `chat-support:${ip}`,
      CHAT_SUPPORT_LIMIT_PER_IP,
      CHAT_SUPPORT_WINDOW_MS,
    );
    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas mensagens em pouco tempo. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
      );
    }

    const body = await req.json();
    const segment: ChatSupportSegment = VALID_SEGMENTS.includes(body.segment) ? body.segment : 'locadoras';
    const rawHistory = Array.isArray(body.history) ? body.history : [];

    const history = rawHistory
      .slice(-MAX_MESSAGES)
      .filter((m: any) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
      .map((m: any) => ({ ...m, content: String(m.content).slice(0, MAX_MESSAGE_LENGTH) }));

    if (history.length === 0 || history[history.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Nenhuma mensagem válida enviada' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave GEMINI_API_KEY não configurada no arquivo .env' },
        { status: 500 }
      );
    }

    const systemPrompt = `Você é o assistente de suporte no site do "Danos Aparentes", um app de vistoria e laudo veicular digital. Você conversa com um VISITANTE do site, ainda não é cliente.

Informações que você pode usar para responder (é tudo que você sabe sobre o produto):
${GENERAL_KNOWLEDGE}

${getSegmentKnowledge(segment)}

Regras estritas:
1. Responda SOMENTE com base nas informações acima. Nunca invente preço, prazo, funcionalidade ou condição que não esteja listada.
2. Se a pergunta estiver fora dessas informações (ex: negociação de contrato Corporativo, suporte técnico de conta que já é cliente, qualquer dúvida que você não tenha certeza de responder com o que foi dado acima), comece a resposta EXATAMENTE com o texto "${ESCALATE_MARKER}" seguido de uma frase curta e honesta dizendo que não tem certeza e que pode conectar a pessoa com o Jeferson pelo WhatsApp.
3. Respostas curtas (2-4 frases), em Português, tom profissional e direto.
4. Nunca peça dados pessoais (CPF, cartão, senha).`;

    const requestBody = {
      contents: history.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 500,
        thinkingConfig: { thinkingBudget: 0 },
      },
    };

    const modelName = 'gemini-2.5-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erro Gemini API (chat-support):', errText);
      return NextResponse.json(
        { error: 'Não consegui responder agora.' },
        { status: 502 }
      );
    }

    const responseData = await response.json();
    let replyText: string = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    replyText = replyText.trim();

    let escalate = false;
    if (replyText.startsWith(ESCALATE_MARKER)) {
      escalate = true;
      replyText = replyText.slice(ESCALATE_MARKER.length).trim();
    }

    if (!replyText) {
      escalate = true;
      replyText = 'Não tenho certeza sobre isso, mas posso te conectar com o Jeferson pelo WhatsApp.';
    }

    return NextResponse.json({ response: replyText, escalate });
  } catch (err) {
    console.error('Erro no endpoint de chat-support:', err);
    return NextResponse.json(
      { error: 'Não consegui responder agora.' },
      { status: 500 }
    );
  }
}
