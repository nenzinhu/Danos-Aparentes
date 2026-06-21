'use client';
import React, { useState, useEffect } from 'react'

interface Props {
  onTranscript: (text: string) => void
  style?: React.CSSProperties
}

export default function SpeechButton({ onTranscript, style }: Props) {
  const [isListening, setIsListening] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setSupported(true)
      }
    }
  }, [])

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'pt-BR'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript
        if (transcript) {
          onTranscript(transcript)
        }
      }

      recognition.start()
    } catch (e) {
      console.error('Failed to start speech recognition:', e)
      setIsListening(false)
    }
  }

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? 'Parar gravação de voz' : 'Digitar por voz (Microfone)'}
      style={{
        background: isListening ? 'rgba(239,68,68,0.15)' : 'rgba(14,165,233,0.1)',
        border: isListening ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(14,165,233,0.2)',
        borderRadius: 8,
        padding: '4px 8px',
        color: isListening ? '#f87171' : '#38bdf8',
        cursor: 'pointer',
        fontSize: '0.7rem',
        fontWeight: 700,
        fontFamily: 'Outfit,sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        outline: 'none',
        transition: 'all 0.2s',
        ...style
      }}
    >
      {isListening ? (
        <>
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
          <span className="text-[0.65rem] tracking-wider uppercase">Ouvindo...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          <span className="text-[0.65rem]">Falar</span>
        </>
      )}
    </button>
  )
}
