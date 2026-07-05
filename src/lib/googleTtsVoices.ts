export interface GoogleTtsVoice {
  id: string
  name: string
  gender: 'female' | 'male'
  label: string
}

/** Vozes Google Cloud TTS — pt-BR Neural2 e Chirp3-HD (brasileiras, naturais) */
export const GOOGLE_TTS_VOICES: GoogleTtsVoice[] = [
  { id: 'pt-BR-Neural2-A', name: 'pt-BR-Neural2-A', gender: 'female', label: 'Camila — feminina' },
  { id: 'pt-BR-Neural2-C', name: 'pt-BR-Neural2-C', gender: 'female', label: 'Vitória — feminina' },
  { id: 'pt-BR-Chirp3-HD-Aoede', name: 'pt-BR-Chirp3-HD-Aoede', gender: 'female', label: 'Aoede — feminina' },
  { id: 'pt-BR-Chirp3-HD-Kore', name: 'pt-BR-Chirp3-HD-Kore', gender: 'female', label: 'Kore — feminina' },
  { id: 'pt-BR-Neural2-B', name: 'pt-BR-Neural2-B', gender: 'male', label: 'Ricardo — masculina' },
  { id: 'pt-BR-Chirp3-HD-Charon', name: 'pt-BR-Chirp3-HD-Charon', gender: 'male', label: 'Thiago — masculina' },
  { id: 'pt-BR-Chirp3-HD-Puck', name: 'pt-BR-Chirp3-HD-Puck', gender: 'male', label: 'Puck — masculina' },
  { id: 'pt-BR-Chirp3-HD-Orus', name: 'pt-BR-Chirp3-HD-Orus', gender: 'male', label: 'Orus — masculina' },
]

export const DEFAULT_GOOGLE_VOICE_ID = 'pt-BR-Neural2-B'

export function isGoogleVoiceId(id?: string): boolean {
  return Boolean(id?.startsWith('pt-BR-'))
}

export function getGoogleVoice(id?: string): GoogleTtsVoice {
  return GOOGLE_TTS_VOICES.find((v) => v.id === id) ?? GOOGLE_TTS_VOICES.find((v) => v.id === DEFAULT_GOOGLE_VOICE_ID)!
}
