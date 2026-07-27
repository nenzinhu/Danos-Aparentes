import { NextRequest, NextResponse } from 'next/server';
import { supabaseEnabled } from '@/src/lib/supabase';
import { getClientIp, getUserFromRequest, userHasActiveSubscription } from '@/src/lib/server/auth';
import { callGroqVision, getGroqApiKey, GROQ_VISION_MODEL, GROQ_VISION_MODEL_VERSION } from '@/src/lib/server/groqVision';
import { parseImageDataUrl } from '@/src/lib/server/geminiVision';
import { checkRateLimit } from '@/src/lib/server/rateLimit';

/**
 * Verificação da vista por foto — o inspetor anexa UMA foto do lado inteiro do
 * veículo ao trocar de vista (ou ao sair do diagrama). A IA confere se os danos
 * visíveis na foto batem com as avarias marcadas naquela vista e devolve uma
 * descrição por peça, para o inspetor confirmar e distribuir nas avarias.
 *
 * A IA nunca cria/remove avarias sozinha — só sugere; o humano decide.
 */
const VIEW_VERIFY_LIMIT_PER_USER = 15;
const VIEW_VERIFY_LIMIT_PER_IP = 6;
const VIEW_VERIFY_WINDOW_MS = 10 * 60 * 1000;

const MAX_PHOTO_BASE64_LENGTH = 4_000_000; // ~3MB de imagem comprimida no app
const MAX_DAMAGES = 40;

const VIEW_NAME_PT: Record<string, string> = {
  'lateral-left': 'lateral esquerda',
  'lateral-right': 'lateral direita',
  frontal: 'frontal (dianteira)',
  traseira: 'traseira',
};

interface MarkedDamageInput {
  partId: string;
  partName: string;
  typeName: string;
}

interface AiPartResult {
  partId?: string;
  bateu?: boolean;
  descricao?: string;
}

interface AiResult {
  lado_confere?: boolean;
  resumo?: string;
  partes?: AiPartResult[];
  avarias_nao_marcadas?: string[];
}

export async function POST(req: NextRequest) {
  try {
    if (supabaseEnabled) {
      const user = await getUserFromRequest(req);
      if (!user) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
      }
      const hasAccess = await userHasActiveSubscription(user.id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Assinatura inativa' }, { status: 403 });
      }
      const { allowed, retryAfterSec } = await checkRateLimit(
        `view-photo-verify:${user.id}`,
        VIEW_VERIFY_LIMIT_PER_USER,
        VIEW_VERIFY_WINDOW_MS,
      );
      if (!allowed) {
        return NextResponse.json(
          { error: 'Muitas análises em pouco tempo. Tente novamente em instantes.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
        );
      }
    } else {
      const ip = getClientIp(req);
      const { allowed, retryAfterSec } = await checkRateLimit(
        `view-photo-verify-ip:${ip}`,
        VIEW_VERIFY_LIMIT_PER_IP,
        VIEW_VERIFY_WINDOW_MS,
      );
      if (!allowed) {
        return NextResponse.json(
          { error: 'Muitas análises em pouco tempo. Tente novamente em instantes.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
        );
      }
    }

    const body = await req.json();
    const photo = String(body.photo || '');
    const view = String(body.view || '');
    const vehicleName = String(body.vehicleName || 'veículo').slice(0, 60);
    const rawDamages: unknown = body.damages;

    const viewName = VIEW_NAME_PT[view];
    if (!viewName) {
      return NextResponse.json({ error: 'Vista inválida' }, { status: 400 });
    }

    if (!Array.isArray(rawDamages) || rawDamages.length === 0) {
      return NextResponse.json({ error: 'Nenhuma avaria marcada nesta vista' }, { status: 400 });
    }
    const damages: MarkedDamageInput[] = rawDamages.slice(0, MAX_DAMAGES).map((d) => ({
      partId: String((d as MarkedDamageInput).partId || '').slice(0, 80),
      partName: String((d as MarkedDamageInput).partName || 'peça').slice(0, 100),
      typeName: String((d as MarkedDamageInput).typeName || 'avaria').slice(0, 60),
    })).filter(d => d.partId);

    if (damages.length === 0) {
      return NextResponse.json({ error: 'Avarias inválidas' }, { status: 400 });
    }

    if (photo.length > MAX_PHOTO_BASE64_LENGTH) {
      return NextResponse.json({ error: 'Foto muito grande' }, { status: 400 });
    }

    const parsed = parseImageDataUrl(photo);
    if (!parsed) {
      return NextResponse.json({ error: 'Formato de foto inválido' }, { status: 400 });
    }

    if (!getGroqApiKey()) {
      return NextResponse.json({ error: 'Chave GROQ_API_KEY não configurada' }, { status: 500 });
    }

    const markedList = damages
      .map(d => `- partId "${d.partId}": ${d.partName} (marcada como ${d.typeName})`)
      .join('\n');

    const systemPrompt = `Você é um perito técnico de apoio a vistoriadores de veículos. O inspetor marcou avarias na vista "${viewName}" de um ${vehicleName} e anexou UMA foto mostrando esse lado inteiro do veículo.

Peças marcadas com avaria nesta vista:
${markedList}

Tarefas:
1. "lado_confere": diga se a foto realmente mostra a vista "${viewName}" de um veículo (true/false).
2. "partes": para CADA peça marcada acima, devolva um item com o MESMO partId informado, "bateu" true se a foto mostra dano compatível naquela peça (false se não dá para ver dano nela), e "descricao" com uma descrição técnica curta do dano visível naquela peça (até 30 palavras, em Português; "" quando bateu=false).
3. "avarias_nao_marcadas": danos claramente visíveis na foto em peças deste lado que NÃO estão na lista acima (nomes das peças em Português; [] se nenhum).
4. "resumo": frase única (até 30 palavras) dizendo se a foto confere com as avarias marcadas.

Responda SOMENTE em JSON, sem markdown, no formato exato:
{"lado_confere": true, "resumo": "...", "partes": [{"partId": "...", "bateu": true, "descricao": "..."}], "avarias_nao_marcadas": ["..."]}

Regras: NUNCA invente medida em cm/mm — descreva só proporção relativa à peça. NUNCA mencione preço, valor ou custo. Ignore pessoas, chão, fundo e reflexos. Se a foto estiver ilegível ou não mostrar um veículo, responda lado_confere=false, todas as partes com bateu=false e descricao "".`;

    const imageDataUrl = `data:${parsed.mimeType};base64,${parsed.base64}`;
    const groq = await callGroqVision(systemPrompt, imageDataUrl, 'view-photo-verify', { maxTokens: 1024 });
    if (!groq.ok) {
      return NextResponse.json({ error: groq.error }, { status: groq.status });
    }

    const cleaned = groq.text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

    let ai: AiResult;
    try {
      ai = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Não foi possível interpretar a análise.' }, { status: 502 });
    }

    const knownIds = new Set(damages.map(d => d.partId));
    const byPartId = new Map<string, { matched: boolean; description: string }>();
    for (const p of Array.isArray(ai.partes) ? ai.partes : []) {
      const id = String(p?.partId || '');
      if (!knownIds.has(id) || byPartId.has(id)) continue;
      byPartId.set(id, {
        matched: Boolean(p?.bateu),
        description: String(p?.descricao || '').slice(0, 300),
      });
    }
    // Toda peça marcada aparece na resposta, mesmo que a IA a tenha omitido.
    const parts = damages.map(d => {
      const r = byPartId.get(d.partId);
      return {
        partId: d.partId,
        partName: d.partName,
        matched: r?.matched ?? false,
        description: r?.matched ? r.description : '',
      };
    });

    const unmarkedFindings = (Array.isArray(ai.avarias_nao_marcadas) ? ai.avarias_nao_marcadas : [])
      .map(x => String(x).slice(0, 120))
      .filter(Boolean)
      .slice(0, 12);

    return NextResponse.json({
      sideMatches: Boolean(ai.lado_confere),
      summary: String(ai.resumo || '').slice(0, 300),
      parts,
      unmarkedFindings,
      model: GROQ_VISION_MODEL,
      modelVersion: GROQ_VISION_MODEL_VERSION,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Erro no endpoint de view-photo-verify:', err);
    return NextResponse.json({ error: 'Não foi possível analisar a foto agora.' }, { status: 500 });
  }
}
