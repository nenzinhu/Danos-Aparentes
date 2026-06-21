'use client';
import { useState, useEffect, useRef } from 'react'
import { TtsConfig } from '../types'

const DEFAULT_CONFIG: TtsConfig = {
  active: true,
  hoverActive: false,
  engine: 'elevenlabs',
  gender: 'male',
  rate: 0.9,
  pitch: 0.75,
  volume: 1,
  voiceId: 'ErXwobaYiN019PkySvjV', // Antoni - melhor voz PT-BR
}

const VALID_VOICES = [
  'ErXwobaYiN019PkySvjV', // Antoni (melhor PT-BR)
]

export function useTts() {
  const [config, setConfig] = useState<TtsConfig>(() => {
    try {
      const saved = localStorage.getItem('tts-config')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Sempre força ElevenLabs + Antoni em todos os veículos,
        // ignorando configuração antiga que possa ter engine nativo salvo
        parsed.engine = 'elevenlabs'
        parsed.voiceId = 'ErXwobaYiN019PkySvjV' // Antoni
        return { ...DEFAULT_CONFIG, ...parsed }
      }
      return DEFAULT_CONFIG
    } catch { return DEFAULT_CONFIG }
  })

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const load = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setVoices(speechSynthesis.getVoices().filter(v => v.lang.startsWith('pt')))
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

    // Parar áudios anteriores
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }

    if (config.engine === 'elevenlabs') {
      try {
        const voiceId = config.voiceId || 'ErXwobaYiN019PkySvjV'

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text, 
            voiceId,
            rate: config.rate 
          }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || 'Falha ao obter áudio da ElevenLabs')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.volume = config.volume
        audioRef.current = audio
        audio.play().catch(err => console.error('Erro ao reproduzir áudio:', err))
      } catch (err) {
        console.error('Erro no ElevenLabs TTS, usando fallback nativo:', err)
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
    const ptVoices = voices.filter(v => v.lang.startsWith('pt'))
    if (ptVoices.length > 0) {
      const gendered = ptVoices.find(v =>
        config.gender === 'female' ? /female|f\b/i.test(v.name) : !/female|f\b/i.test(v.name)
      )
      u.voice = gendered || ptVoices[0]
    }
    utterRef.current = u
    speechSynthesis.speak(u)
  }

  function speakHover(text: string) {
    if (config.hoverActive) speak(text)
  }

  return { config, setConfig, speak, speakHover, voices }
}
