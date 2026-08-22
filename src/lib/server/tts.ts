import type { GoogleTtsVoice } from '@/src/lib/googleTtsVoices'

export interface TtsRequest {
  text: string
  engine?: 'google-tts' | 'elevenlabs'
  voiceId?: string
  rate?: number
  pitch?: number
  volume?: number
}

export type TtsResult =
  | { ok: true; audio: Uint8Array; contentType: string }
  | { ok: false; status: number; error: string }

const MAX_CHARS = 4000

/** Google Cloud TTS via REST (sem SDK). Exige GOOGLE_TTS_API_KEY (cartesiana ou key JSON). */
async function synthGoogle(req: TtsRequest, voice: GoogleTtsVoice): Promise<TtsResult> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY?.trim()
  if (!apiKey) {
    return { ok: false, status: 503, error: 'GOOGLE_TTS_API_KEY não configurada' }
  }
  const audioEncoding = 'MP3'
  const payload = {
    input: { text: req.text.slice(0, MAX_CHARS) },
    voice: { languageCode: 'pt-BR', name: voice.id },
    audioConfig: {
      audioEncoding,
      speakingRate: typeof req.rate === 'number' && req.rate > 0 ? req.rate : 1,
      pitch: typeof req.pitch === 'number' ? req.pitch : 0,
      volumeGainDb: typeof req.volume === 'number' ? (req.volume - 1) * 10 : 0,
    },
  }
  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      return { ok: false, status: res.status, error: `Google TTS: ${txt.slice(0, 200)}` }
    }
    const data = (await res.json()) as { audioContent?: string }
    if (!data.audioContent) {
      return { ok: false, status: 502, error: 'Google TTS: sem áudio na resposta' }
    }
    return { ok: true, audio: Buffer.from(data.audioContent, 'base64'), contentType: 'audio/mpeg' }
  } catch (err) {
    return { ok: false, status: 500, error: err instanceof Error ? err.message : 'Google TTS falhou' }
  }
}

/** ElevenLabs via REST. Exige ELEVENLABS_API_KEY. */
async function synthElevenLabs(req: TtsRequest): Promise<TtsResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim()
  if (!apiKey) {
    return { ok: false, status: 503, error: 'ELEVENLABS_API_KEY não configurada' }
  }
  const voiceId = req.voiceId || 'EXAVITQu4vr4xnSDxMaL'
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text: req.text.slice(0, MAX_CHARS),
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.4, similarity_boost: 0.7 },
      }),
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      return { ok: false, status: res.status, error: `ElevenLabs: ${txt.slice(0, 200)}` }
    }
    const buf = new Uint8Array(await res.arrayBuffer())
    return { ok: true, audio: buf, contentType: 'audio/mpeg' }
  } catch (err) {
    return { ok: false, status: 500, error: err instanceof Error ? err.message : 'ElevenLabs falhou' }
  }
}

export async function synthTts(req: TtsRequest): Promise<TtsResult> {
  const { getGoogleVoice } = await import('@/src/lib/googleTtsVoices')
  const engine = req.engine || 'google-tts'
  if (engine === 'elevenlabs') return synthElevenLabs(req)
  const voice = getGoogleVoice(req.voiceId)
  return synthGoogle(req, voice)
}
