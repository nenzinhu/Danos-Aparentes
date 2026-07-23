import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { DEFAULT_GOOGLE_VOICE_ID, getGoogleVoice, isGoogleVoiceId } from '@/src/lib/googleTtsVoices';
import { getUserFromRequest, userHasActiveSubscription, getClientIp } from '@/src/lib/server/auth';
import { checkRateLimit } from '@/src/lib/server/rateLimit';

const MAX_TEXT_LENGTH_AUTH = 2000;
const MAX_TEXT_LENGTH_ANON = 400;

let googleAuthClient: GoogleAuth | null = null;

function getGoogleAuth(): GoogleAuth | null {
  const raw = process.env.GOOGLE_TTS_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  if (!googleAuthClient) {
    const credentials = JSON.parse(raw);
    googleAuthClient = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }
  return googleAuthClient;
}

async function synthesizeGoogle(
  text: string,
  voiceName: string,
  rate: number,
  pitch: number,
  volume: number,
  apiKey?: string,
): Promise<ArrayBuffer> {
  const auth = getGoogleAuth();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let url = 'https://texttospeech.googleapis.com/v1/text:synthesize';

  if (auth) {
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    headers.Authorization = `Bearer ${token.token}`;
  } else if (apiKey) {
    url += `?key=${apiKey}`;
  } else {
    throw new Error('Google TTS: nenhuma credencial configurada');
  }

  const supportsPitch = !voiceName.includes('Chirp3');

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'pt-BR', name: voiceName },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: rate,
        ...(supportsPitch ? { pitch: (pitch - 1) * 10 } : {}),
        volumeGainDb: volume >= 1 ? 0 : 20 * Math.log10(Math.max(volume, 0.01)),
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google TTS: ${errText}`);
  }

  const data = (await response.json()) as { audioContent?: string };
  if (!data.audioContent) {
    throw new Error('Google TTS: resposta sem áudio');
  }

  const binary = Buffer.from(data.audioContent, 'base64');
  return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
}

async function synthesizeElevenLabs(
  text: string,
  voiceId: string,
  rate: number,
  apiKey: string,
): Promise<ArrayBuffer> {
  const safeRate = Math.max(0.7, Math.min(1.2, rate || 1.0));

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_flash_v2_5',
      language_code: 'pt',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true,
        speed: safeRate,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs: ${errText}`);
  }

  return response.arrayBuffer();
}

export async function POST(req: NextRequest) {
  try {
    // Narração TTS é usada tanto no app autenticado (assinantes) quanto na
    // página pública /demo. Por isso a autenticação aqui é opcional: usuários
    // com assinatura ativa ganham um limite mais alto; o restante (anônimo,
    // ou logado sem assinatura) cai no limite restrito por IP, e o texto
    // aceito é mais curto para conter o custo de abuso.
    const user = await getUserFromRequest(req);
    const hasAccess = user ? await userHasActiveSubscription(user.id) : false;

    if (hasAccess && user) {
      const { allowed, retryAfterSec } = await checkRateLimit(`tts:${user.id}`, 60, 10 * 60 * 1000);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Muitas requisições. Tente novamente em instantes.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
        );
      }
    } else {
      const ip = getClientIp(req);
      const { allowed, retryAfterSec } = await checkRateLimit(`tts-ip:${ip}`, 8, 10 * 60 * 1000);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Muitas requisições. Tente novamente em instantes.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
        );
      }
    }

    const { text, voiceId, rate, pitch, volume, engine } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'O texto é obrigatório' }, { status: 400 });
    }

    const maxLength = hasAccess ? MAX_TEXT_LENGTH_AUTH : MAX_TEXT_LENGTH_ANON;
    if (text.length > maxLength) {
      return NextResponse.json({ error: `Texto excede o limite de ${maxLength} caracteres` }, { status: 400 });
    }

    const safeRate = Math.max(0.7, Math.min(1.2, rate ?? 0.9));
    const safePitch = typeof pitch === 'number' ? pitch : 0.75;
    const safeVolume = Math.max(0, Math.min(1, volume ?? 1));

    const useGoogle =
      engine === 'google-tts' ||
      (engine !== 'elevenlabs' && (isGoogleVoiceId(voiceId) || !voiceId));

    if (useGoogle) {
      const googleKey = process.env.GOOGLE_TTS_API_KEY;
      const hasServiceAccount = Boolean(process.env.GOOGLE_TTS_SERVICE_ACCOUNT_KEY);
      if (!googleKey && !hasServiceAccount) {
        return NextResponse.json({ error: 'Credencial do Google TTS não configurada' }, { status: 500 });
      }

      const voice = getGoogleVoice(voiceId || DEFAULT_GOOGLE_VOICE_ID);
      const audioBuffer = await synthesizeGoogle(text, voice.name, safeRate, safePitch, safeVolume, googleKey);

      return new NextResponse(audioBuffer, {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    }

    const elevenKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenKey) {
      return NextResponse.json({ error: 'Chave ELEVENLABS_API_KEY não configurada' }, { status: 500 });
    }

    const audioBuffer = await synthesizeElevenLabs(
      text,
      voiceId || 'ErXwobaYiN019PkySvjV',
      safeRate,
      elevenKey,
    );

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (err) {
    console.error('Erro ao processar TTS:', err);
    const message = err instanceof Error ? err.message : 'Erro ao gerar áudio';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
