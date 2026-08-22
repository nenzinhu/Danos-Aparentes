'use client';
import React, { useState, useEffect, useRef } from 'react'

interface SpeechRecognitionResultItem {
  transcript: string
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: ArrayLike<ArrayLike<SpeechRecognitionResultItem> & { isFinal: boolean }>
}

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  start(): void
  stop(): void
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as SpeechRecognitionCtor | undefined
}

interface Props {
  onTranscript: (text: string) => void
  style?: React.CSSProperties
}

export default function SpeechButton({ onTranscript, style }: Props) {
  const [isListening, setIsListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    if (getSpeechRecognitionCtor()) {
      setSupported(true)
    }
  }, [])

  const toggleListening = () => {
    const SpeechRecognition = getSpeechRecognitionCtor()
    if (!SpeechRecognition) return

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.lang = 'pt-BR'
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      recognition.continuous = true

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onresult = (event) => {
        let newTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            newTranscript += event.results[i][0].transcript
          }
        }
        if (newTranscript) {
          onTranscript(newTranscript.trim())
        }
      }

      recognition.start()
    } catch (e) {
      console.error('Failed to start speech recognition:', e)
      setIsListening(false)
    }
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? 'Parar gravação de voz' : 'Digitar por voz (Microfone)'}
      style={{
        background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(14, 165, 233, 0.15)',
        border: isListening ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1.5px solid rgba(14, 165, 233, 0.3)',
        borderRadius: 12,
        padding: '8px 16px',
        color: isListening ? '#ef4444' : '#0ea5e9',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: 800,
        fontFamily: 'Outfit, sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 44,
        outline: 'none',
        transition: 'all 0.2s ease',
        boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.3)' : 'none',
        ...style
      }}
      className={isListening ? 'animate-pulse' : ''}
    >
      {isListening ? (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <span className="text-[0.7rem] sm:text-xs tracking-wider uppercase font-black">Gravando...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          <span className="text-[0.7rem] sm:text-xs font-extrabold">Falar observações</span>
        </>
      )}
    </button>
  )
}
