'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { TtsConfig } from '@/src/types'

/** Sessão/UI compartilhada da vistoria — evita prop-drilling no InspectTab. */
export type InspectionSessionValue = {
  ttsConfig: TtsConfig
  voices: SpeechSynthesisVoice[]
  onTtsConfigChange: (config: TtsConfig) => void
  onTtsTest: () => void
  speak: (text: string) => void
  speakHover: (text: string) => void
  hasAccess: boolean
  accessToken?: string
  userId?: string
  decidedByName?: string
  onToast: (msg: string) => void
}

const InspectionSessionContext = createContext<InspectionSessionValue | null>(null)

export function InspectionSessionProvider({
  value,
  children,
}: {
  value: InspectionSessionValue
  children: ReactNode
}) {
  return (
    <InspectionSessionContext.Provider value={value}>
      {children}
    </InspectionSessionContext.Provider>
  )
}

export function useInspectionSession(): InspectionSessionValue {
  const ctx = useContext(InspectionSessionContext)
  if (!ctx) {
    throw new Error('useInspectionSession deve ser usado dentro de InspectionSessionProvider')
  }
  return ctx
}
