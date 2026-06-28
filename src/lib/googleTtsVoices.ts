export interface GoogleTtsVoice {
  id: string
  name: string
  gender: 'female' | 'male'
  label: string
}

/** Vozes Google Cloud TTS — pt-BR Neural2 (brasileiras) */
export const GOOGLE_TTS_VOICES: GoogleTtsVoice[] = [
  { id: 'pt-BR-Neural2-A', name: 'pt-BR-Neural2-A', gender: 'female', label: 'Camila — feminina' },
  { id: 'pt-BR-Neural2-C', name: 'pt-BR-Neural2-C', gender: 'female', label: 'Vitória — feminina' },
  { id: 'pt-BR-Neural2-B', name: 'pt-BR-Neural2-B', gender: 'male', label: 'Ricardo — masculina' },
  { id: 'pt-BR-Neural2-D', name: 'pt-BR-Neural2-D', gender: 'male', label: 'Thiago — masculina' },
]

export const DEFAULT_GOOGLE_VOICE_ID = 'pt-BR-Neural2-B'

export function isGoogleVoiceId(id?: string): boolean {
  return Boolean(id?.startsWith('pt-BR-'))
}

export function getGoogleVoice(id?: string): GoogleTtsVoice {
  return GOOGLE_TTS_VOICES.find((v) => v.id === id) ?? GOOGLE_TTS_VOICES.find((v) => v.id === DEFAULT_GOOGLE_VOICE_ID)!
}
