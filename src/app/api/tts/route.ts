import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, rate } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'O texto é obrigatório' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY não encontrada no ambiente');
      return NextResponse.json({ error: 'Chave ELEVENLABS_API_KEY não configurada' }, { status: 500 });
    }

    // Antoni - melhor voz PT-BR
    const selectedVoiceId = voiceId || 'ErXwobaYiN019PkySvjV';

    // ElevenLabs aceita velocidade entre 0.7 e 1.2
    const safeRate = Math.max(0.7, Math.min(1.2, rate || 1.0));

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',   // modelo mais rápido e melhor para PT-BR
        language_code: 'pt',              // força pronúncia em português do Brasil
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
          speed: safeRate
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erro ElevenLabs:', errText);
      return NextResponse.json({ error: `Erro na API da ElevenLabs: ${errText}` }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (err) {
    console.error('Erro ao processar TTS:', err);
    return NextResponse.json({ error: 'Erro ao gerar áudio com ElevenLabs.' }, { status: 500 });
  }
}
