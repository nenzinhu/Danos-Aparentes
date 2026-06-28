'use client';
import { useState, useEffect, useRef } from 'react'
import { TtsConfig } from '../types'
import { DEFAULT_GOOGLE_VOICE_ID, getGoogleVoice, GOOGLE_TTS_VOICES } from '../lib/googleTtsVoices'

const DEFAULT_CONFIG: TtsConfig = {
  active: true,
  hoverActive: false,
  engine: 'google-tts',
  gender: 'male',
  rate: 0.9,
  pitch: 0.75,
  volume: 1,
  voiceId: DEFAULT_GOOGLE_VOICE_ID,
}

function normalizeConfig(parsed: Partial<TtsConfig>): TtsConfig {
  const merged = { ...DEFAULT_CONFIG, ...parsed }

  if (merged.engine === 'google-tts' || !merged.engine || merged.engine === 'native') {
    merged.engine = 'google-tts'
    if (!merged.voiceId || !GOOGLE_TTS_VOICES.some((v) => v.id === merged.voiceId)) {
      merged.voiceId =
        merged.gender === 'female'
          ? GOOGLE_TTS_VOICES.find((v) => v.gender === 'female')!.id
          : DEFAULT_GOOGLE_VOICE_ID
    }
    const voice = getGoogleVoice(merged.voiceId)
    merged.gender = voice.gender
  }

  return merged
}

export function useTts() {
  const [config, setConfig] = useState<TtsConfig>(() => {
    try {
      const saved = localStorage.getItem('tts-config')
      if (saved) return normalizeConfig(JSON.parse(saved))
      return DEFAULT_CONFIG
    } catch {
      return DEFAULT_CONFIG
    }
  })

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const load = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setVoices(speechSynthesis.getVoices().filter((v) => v.lang.startsWith('pt')))
      }
    }
    load()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.addEventListener('voiceschanged', load)
      return () => speechSynthesis.removeEventListener('voiceschanged', load)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tts-config', JSON.stringify(config))
  }, [config])

  async function speak(text: string) {
    if (!config.active) return

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }

    if (config.engine === 'google-tts' || config.engine === 'elevenlabs') {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            engine: config.engine,
            voiceId: config.voiceId,
            rate: config.rate,
            pitch: config.pitch,
            volume: config.volume,
          }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || 'Falha ao obter áudio')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.volume = config.volume
        audioRef.current = audio
        audio.onended = () => URL.revokeObjectURL(url)
        await audio.play()
      } catch (err) {
        console.error('Erro no TTS em nuvem, usando fallback nativo:', err)
        speakNativeFallback(text)
      }
    } else {
      speakNativeFallback(text)
    }
  }

  function speakNativeFallback(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pt-BR'
    u.rate = config.rate
    u.pitch = config.pitch
    u.volume = config.volume
    const ptVoices = voices.filter((v) => v.lang.startsWith('pt'))
    if (ptVoices.length > 0) {
      const gendered = ptVoices.find((v) =>
        config.gender === 'female' ? /female|f\b/i.test(v.name) : !/female|f\b/i.test(v.name),
      )
      u.voice = gendered || ptVoices[0]
    }
    speechSynthesis.speak(u)
  }

  function speakHover(text: string) {
    if (config.hoverActive) speak(text)
  }

  return { config, setConfig, speak, speakHover, voices }
}
