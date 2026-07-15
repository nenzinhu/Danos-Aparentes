import { NextRequest, NextResponse } from 'next/server';
import { supabaseEnabled } from '@/src/lib/supabase';
import { getUserFromRequest, userHasActiveSubscription, getClientIp } from '@/src/lib/server/auth';
import { checkRateLimit } from '@/src/lib/server/rateLimit';

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_DAMAGES = 200;

export async function POST(req: NextRequest) {
  try {
    // O Assistente IA só fica acessível no app depois de login + assinatura
    // ativa (ver src/app/app/page.tsx). Reforçamos a mesma regra aqui para
    // que a rota não possa ser chamada diretamente sem essas condições.
    if (supabaseEnabled) {
      const user = await getUserFromRequest(req);
      if (!user) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }

      const hasAccess = await userHasActiveSubscription(user.id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Assinatura inativa' }, { status: 403 });
      }

      const { allowed, retryAfterSec } = await checkRateLimit(`ia:${user.id}`, 30, 10 * 60 * 1000);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Muitas requisições. Tente novamente em instantes.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
        );
      }
    } else {
      // Modo sem Supabase configurado (ex: instância local/demo sem contas):
      // não há como autenticar, então aplicamos limite básico por IP.
      const ip = getClientIp(req);
      const { allowed, retryAfterSec } = await checkRateLimit(`ia-ip:${ip}`, 10, 10 * 60 * 1000);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Muitas requisições. Tente novamente em instantes.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
        );
      }
    }

    const body = await req.json();
    const { vehicleInfo, vehicleType } = body;
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const rawDamages = Array.isArray(body.damages) ? body.damages : [];

    const messages = rawMessages
      .slice(-MAX_MESSAGES)
      .filter((m: any) => m && typeof m.content === 'string')
      .map((m: any) => ({ ...m, content: String(m.content).slice(0, MAX_MESSAGE_LENGTH) }));

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Nenhuma mensagem válida enviada' }, { status: 400 });
    }

    const damages = rawDamages.slice(0, MAX_DAMAGES);

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_TTS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave GEMINI_API_KEY não configurada no arquivo .env' },
        { status: 500 }
      );
    }

    // Contexto sobre o estado atual da vistoria para guiar a IA
    const damagesSummary = damages && damages.length > 0
      ? damages.map((d: any) => `- Peça: ${d.partName}, Tipo: ${d.typeName} (${d.severity === 'low' ? 'Leve' : d.severity === 'medium' ? 'Médio' : 'Grave'}), Obs: ${d.notes || 'Sem observações'}`).join('\n')
      : 'Nenhuma avaria registrada até o momento.';

    const vehicleSummary = vehicleInfo
      ? `Placa: ${vehicleInfo.plate || 'Não informada'}, Marca/Modelo: ${vehicleInfo.brand || ''} ${vehicleInfo.model || ''}, Cor: ${vehicleInfo.color || 'Não informada'}, Ano: ${vehicleInfo.year || ''}`
      : 'Informações do veículo não preenchidas.';

    const systemPrompt = `Você é o Assistente IA Interativo do "Danos Aparentes", um aplicativo premium de vistoria e laudo veicular digital.
Sua missão é ajudar o vistoriador a analisar avarias, sugerir textos profissionais para o laudo, tirar dúvidas técnicas e dar recomendações.

Dados da Vistoria Atual:
- Tipo de Veículo: ${vehicleType || 'Não especificado'}
- Dados do Veículo: ${vehicleSummary}
- Avarias Detectadas:\n${damagesSummary}

Diretrizes de resposta:
1. Responda em Português de forma profissional, clara e amigável.
2. Quando solicitado uma análise do laudo, faça um resumo executivo dos danos, classifique a gravidade geral e sugira se o veículo necessita de reparos imediatos (funilaria, pintura, martelinho de ouro, etc.).
3. Ajude o vistoriador a redigir observações formais e técnicas para colocar no laudo.
4. Mantenha as respostas concisas e bem estruturadas em Markdown.
5. Se não houver avarias, parabenize pela conservação do veículo.`;

    // Preparar o payload para a API do Gemini (formato generateContent v1beta)
    const geminiContents = [];
    
    // Adicionar o prompt do sistema no início ou como systemInstruction
    // Para simplificar e garantir compatibilidade, colocamos como a primeira mensagem ou usamos a propriedade systemInstruction.
    // Vamos usar a propriedade systemInstruction se suportada, ou injetar no contexto.
    const requestBody = {
      contents: [
        ...messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    };

    // Chamada à API oficial do Gemini
    const modelName = 'gemini-1.5-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erro Gemini API:', errText);
      return NextResponse.json(
        { error: `Erro na API do Gemini: ${errText}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    const replyText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui processar a resposta.';

    return NextResponse.json({ response: replyText });
  } catch (err) {
    console.error('Erro no endpoint de IA:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
