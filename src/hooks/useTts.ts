import { useState, useEffect, useRef } from 'react'
import { TtsConfig } from '../types'

const DEFAULT_CONFIG: TtsConfig = {
  active: true,
  hoverActive: false,
  engine: 'native',
  gender: 'male',
  rate: 0.9,
  pitch: 0.75,
  volume: 1,
}

export function useTts() {
  const [config, setConfig] = useState<TtsConfig>(() => {
    try {
      const saved = localStorage.getItem('tts-config')
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG
    } catch { return DEFAULT_CONFIG }
  })

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const load = () => setVoices(speechSynthesis.getVoices().filter(v => v.lang.startsWith('pt')))
    load()
    speechSynthesis.addEventListener('voiceschanged', load)
    return () => speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  useEffect(() => {
    localStorage.setItem('tts-config', JSON.stringify(config))
  }, [config])

  function speak(text: string) {
    if (!config.active || !('speechSynthesis' in window)) return
    speechSynthesis.cancel()
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
