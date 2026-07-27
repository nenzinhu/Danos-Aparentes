import { NextRequest, NextResponse } from 'next/server';
import { supabaseEnabled } from '@/src/lib/supabase';
import { getClientIp, getUserFromRequest, userHasActiveSubscription } from '@/src/lib/server/auth';
import { callGroqVision, getGroqApiKey, GROQ_VISION_MODEL, GROQ_VISION_MODEL_VERSION } from '@/src/lib/server/groqVision';
import { parseImageDataUrl } from '@/src/lib/server/geminiVision';
import { checkRateLimit } from '@/src/lib/server/rateLimit';

/** Classificação de dano por foto via IA — assinante autenticado (~25 / 10 min). */
const DAMAGE_CLASSIFY_LIMIT_PER_USER = 25;
/** Demo/local sem Supabase: limite básico por IP. */
const DAMAGE_CLASSIFY_LIMIT_PER_IP = 10;
const DAMAGE_CLASSIFY_WINDOW_MS = 10 * 60 * 1000;

const MAX_PHOTO_BASE64_LENGTH = 4_000_000; // ~3MB de imagem, suficiente para foto comprimida no app

const VALID_TYPES = ['scratch', 'dent', 'broken'] as const;
const VALID_SEVERITIES = ['low', 'medium', 'high'] as const;

// A peça já foi apontada pelo inspetor no diagrama — a IA só classifica o
// dano da foto, nunca tenta identificar/reposicionar a peça em si.
const TYPE_FROM_PT: Record<string, (typeof VALID_TYPES)[number]> = {
  arranhado: 'scratch',
  amassado: 'dent',
  quebrado: 'broken',
};

const SEVERITY_FROM_PT: Record<string, (typeof VALID_SEVERITIES)[number]> = {
  leve: 'low',
  moderado: 'medium',
  grave: 'high',
};

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
        `damage-classify:${user.id}`,
        DAMAGE_CLASSIFY_LIMIT_PER_USER,
        DAMAGE_CLASSIFY_WINDOW_MS,
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
        `damage-classify-ip:${ip}`,
        DAMAGE_CLASSIFY_LIMIT_PER_IP,
        DAMAGE_CLASSIFY_WINDOW_MS,
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
    const partName = String(body.partName || 'peça do veículo').slice(0, 100);

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

    const systemPrompt = `Você é um perito técnico de apoio a vistoriadores de veículos. O inspetor já apontou que esta foto é da peça "${partName}" — não tente identificar outra peça, ignore capacete, pessoas, chão ou qualquer objeto ao fundo que não faça parte da peça.

Classifique o dano visível na foto em UMA destas categorias fixas: "arranhado" (risco superficial ou profundo), "amassado" (deformação na chapa) ou "quebrado" (trinca, fratura, fragmento solto ou ausente).

Responda SOMENTE em JSON, sem markdown, no formato exato:
{"tipo_dano": "arranhado" | "amassado" | "quebrado", "severidade": "leve" | "moderado" | "grave", "descricao": "..."}

Regras para "severidade":
- "leve": arranhão superficial, sem exposição de metal, sem deformação
- "moderado": amassado ou risco profundo, sem comprometimento estrutural aparente, ou trinca parcial
- "grave": dano estrutural, quebra, fragmento solto/ausente, exposição de metal com corrosão, ou trinca propagada por toda a peça

"descricao": até 40 palavras, em Português, técnica e objetiva (tipo específico + extensão relativa à peça + profundidade/exposição aparente). NUNCA invente uma medida em cm/mm — descreva só proporção relativa à peça. NUNCA mencione preço, valor, custo ou qualquer cifra monetária.

Se a imagem não mostrar claramente um dano nesta peça, responda {"tipo_dano": "arranhado", "severidade": "leve", "descricao": "Não foi possível identificar claramente a avaria na foto."}`;

    const imageDataUrl = `data:${parsed.mimeType};base64,${parsed.base64}`;
    const groq = await callGroqVision(systemPrompt, imageDataUrl, 'damage-classify');
    if (!groq.ok) {
      return NextResponse.json({ error: groq.error }, { status: groq.status });
    }

    const cleaned = groq.text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

    let parsedResult: { tipo_dano?: string; severidade?: string; descricao?: string };
    try {
      parsedResult = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Não foi possível interpretar a análise.' }, { status: 502 });
    }

    const type = TYPE_FROM_PT[parsedResult.tipo_dano || ''] ?? 'scratch';
    const severity = SEVERITY_FROM_PT[parsedResult.severidade || ''] ?? 'low';
    const description = String(parsedResult.descricao || '').slice(0, 500);
    const analyzedAt = new Date().toISOString();

    return NextResponse.json({
      type,
      severity,
      description,
      confidence: null,
      model: GROQ_VISION_MODEL,
      modelVersion: GROQ_VISION_MODEL_VERSION,
      analyzedAt,
    });
  } catch (err) {
    console.error('Erro no endpoint de damage-classify:', err);
    return NextResponse.json({ error: 'Não foi possível analisar a foto agora.' }, { status: 500 });
  }
}
