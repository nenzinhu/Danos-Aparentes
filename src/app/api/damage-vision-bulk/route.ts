import { NextRequest, NextResponse } from 'next/server';
import { supabaseEnabled } from '@/src/lib/supabase';
import { getClientIp, getUserFromRequest, userHasActiveSubscription } from '@/src/lib/server/auth';
import { callGeminiVision, getGeminiApiKey, parseImageDataUrl } from '@/src/lib/server/geminiVision';
import { checkRateLimit } from '@/src/lib/server/rateLimit';

/** Varredura Gemini de vista inteira — mais cara que foto única (~8 / 10 min). */
const DAMAGE_VISION_BULK_LIMIT_PER_USER = 8;
/** Demo/local sem Supabase: limite básico por IP. */
const DAMAGE_VISION_BULK_LIMIT_PER_IP = 4;
const DAMAGE_VISION_BULK_WINDOW_MS = 10 * 60 * 1000;

const MAX_PHOTO_BASE64_LENGTH = 4_000_000; // ~3MB de imagem, suficiente para foto comprimida no app
const MAX_PARTS = 60;
const VALID_TYPES = ['scratch', 'dent', 'broken'];
const VALID_SEVERITIES = ['low', 'medium', 'high'];

interface PartRef {
  id: string;
  name: string;
}

/**
 * Analisa uma foto do veículo inteiro (uma vista) e sugere quais peças, dentre
 * a lista de peças válidas daquela vista, aparentam ter avarias. Diferente de
 * /api/damage-vision (que analisa a foto de UMA avaria já marcada), este
 * endpoint faz a varredura inicial que gera sugestões para o vistoriador revisar.
 */
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
        `damage-vision-bulk:${user.id}`,
        DAMAGE_VISION_BULK_LIMIT_PER_USER,
        DAMAGE_VISION_BULK_WINDOW_MS,
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
        `damage-vision-bulk-ip:${ip}`,
        DAMAGE_VISION_BULK_LIMIT_PER_IP,
        DAMAGE_VISION_BULK_WINDOW_MS,
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
    const availableParts: PartRef[] = Array.isArray(body.availableParts)
      ? body.availableParts
          .filter((p: unknown): p is PartRef => !!p && typeof (p as PartRef).id === 'string' && typeof (p as PartRef).name === 'string')
          .slice(0, MAX_PARTS)
      : [];

    if (photo.length > MAX_PHOTO_BASE64_LENGTH) {
      return NextResponse.json({ error: 'Foto muito grande' }, { status: 400 });
    }
    if (availableParts.length === 0) {
      return NextResponse.json({ error: 'Nenhuma peça válida informada para esta vista' }, { status: 400 });
    }

    const parsed = parseImageDataUrl(photo);
    if (!parsed) {
      return NextResponse.json({ error: 'Formato de foto inválido' }, { status: 400 });
    }

    if (!getGeminiApiKey()) {
      return NextResponse.json({ error: 'Chave GEMINI_API_KEY não configurada' }, { status: 500 });
    }

    const partsList = availableParts.map(p => `- ${p.id}: ${p.name}`).join('\n');

    const systemPrompt = `Você é um perito técnico de apoio a vistoriadores de veículos, especialista em identificar avarias de lataria a partir de fotos. Analise a foto de UMA VISTA COMPLETA do veículo (não uma peça isolada) e identifique quais peças, dentre a lista abaixo, aparentam ter avarias visíveis.

Peças válidas nesta vista (use exatamente o "id" listado, nunca invente um id fora desta lista):
${partsList}

Regras estritas:
1. Responda SOMENTE em JSON, sem markdown, no formato exato: {"detections": [{"partId": "...", "type": "scratch"|"dent"|"broken", "severity": "low"|"medium"|"high", "description": "..."}]}
2. "partId" deve ser exatamente um dos ids listados acima. Nunca invente um id.
3. Só inclua uma detecção se houver indício visual razoavelmente claro de avaria na peça — na dúvida, não inclua (evite falsos positivos).
4. "type": scratch = risco/arranhão; dent = amassado/deformação; broken = quebra/trinca/fratura.
5. "severity": low = leve/superficial; medium = visível, sem comprometimento estrutural; high = estrutural, quebra, exposição de metal com corrosão.
6. "description": até 25 palavras, em Português, técnica e objetiva, sem preço/valor/custo em nenhuma hipótese.
7. Se nenhuma avaria for identificada com confiança, responda {"detections": []}.
8. Retorne no máximo 8 detecções, priorizando as mais evidentes.`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: parsed.mimeType, data: parsed.base64 } },
            { text: 'Analise esta foto conforme as instruções e retorne as detecções.' },
          ],
        },
      ],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
        thinkingConfig: { thinkingBudget: 0 },
      },
    };

    const gemini = await callGeminiVision(requestBody, 'damage-vision-bulk');
    if (!gemini.ok) {
      return NextResponse.json({ error: gemini.error }, { status: gemini.status });
    }

    const cleaned = gemini.text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

    let parsedResult: { detections?: unknown[] };
    try {
      parsedResult = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Não foi possível interpretar a análise.' }, { status: 502 });
    }

    const validPartIds = new Set(availableParts.map(p => p.id));
    const detections = (Array.isArray(parsedResult.detections) ? parsedResult.detections : [])
      .map((d): { partId: string; type: string; severity: string; description: string } | null => {
        if (!d || typeof d !== 'object') return null
        const rec = d as Record<string, unknown>
        const partId = String(rec.partId || '')
        const type = String(rec.type || '')
        const severity = String(rec.severity || '')
        const description = String(rec.description || '').slice(0, 300)
        if (!validPartIds.has(partId) || !VALID_TYPES.includes(type) || !VALID_SEVERITIES.includes(severity)) return null
        return { partId, type, severity, description }
      })
      .filter((d): d is { partId: string; type: string; severity: string; description: string } => d !== null)
      .slice(0, 8);

    return NextResponse.json({ detections });
  } catch (err) {
    console.error('Erro no endpoint de damage-vision-bulk:', err);
    return NextResponse.json({ error: 'Não foi possível analisar a foto agora.' }, { status: 500 });
  }
}
