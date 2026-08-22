/**
 * FASE 16 — Sugestão assistiva na comparação (nunca cria avaria sozinha).
 * Reutiliza /api/damage-classify sobre a foto "depois".
 */

import { resolvePhotoUrl } from '../photoStore'
import type { DamageType, Severity } from '../../types'

export type CompareAiSuggestion = {
  type: DamageType
  severity: Severity
  description: string
  confidence?: number | null
  model?: string
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function urlToDataUrl(url: string): Promise<string | null> {
  if (url.startsWith('data:')) return url
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return blobToDataUrl(blob)
  } catch {
    return null
  }
}

/**
 * Classifica a foto atual do item de comparação.
 * Fail-open: devolve null se offline / sem auth / sem foto.
 */
export async function suggestCompareDamageFromPhoto(input: {
  photoRef?: string | null
  partName: string
  accessToken?: string | null
}): Promise<CompareAiSuggestion | null> {
  if (!input.photoRef || !input.accessToken) return null
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null

  try {
    const resolved = await resolvePhotoUrl(input.photoRef)
    if (!resolved) return null
    const dataUrl = await urlToDataUrl(resolved)
    if (!dataUrl || !dataUrl.startsWith('data:')) return null

    const res = await fetch('/api/damage-classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.accessToken}`,
      },
      body: JSON.stringify({
        photo: dataUrl,
        partName: input.partName.slice(0, 100),
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const type = data.type as DamageType | undefined
    const severity = data.severity as Severity | undefined
    if (!type || !severity) return null
    return {
      type,
      severity,
      description: String(data.description || ''),
      confidence: typeof data.confidence === 'number' ? data.confidence : null,
      model: data.model ? String(data.model) : undefined,
    }
  } catch {
    return null
  }
}

export type ComparePhotoDeltaResult = {
  differenceDetected: boolean
  confidence: number
  suggestedCategory: 'new' | 'unchanged' | 'removedOrRepaired'
  description: string
}

/**
 * Compara a foto anterior vs foto atual com Gemini Vision.
 */
export async function suggestComparePhotoDelta(input: {
  previousPhotoRef?: string | null
  currentPhotoRef?: string | null
  partName: string
  accessToken?: string | null
}): Promise<ComparePhotoDeltaResult | null> {
  if (!input.currentPhotoRef || !input.accessToken) return null

  try {
    const currentResolved = await resolvePhotoUrl(input.currentPhotoRef)
    if (!currentResolved) return null
    const currentDataUrl = await urlToDataUrl(currentResolved)
    if (!currentDataUrl) return null

    let previousDataUrl: string | null = null
    if (input.previousPhotoRef) {
      const prevResolved = await resolvePhotoUrl(input.previousPhotoRef)
      if (prevResolved) {
        previousDataUrl = await urlToDataUrl(prevResolved)
      }
    }

    const res = await fetch('/api/damage-compare-vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.accessToken}`,
      },
      body: JSON.stringify({
        previousPhoto: previousDataUrl,
        currentPhoto: currentDataUrl,
        partName: input.partName,
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    return {
      differenceDetected: Boolean(data.differenceDetected),
      confidence: typeof data.confidence === 'number' ? data.confidence : 80,
      suggestedCategory: data.suggestedCategory || 'new',
      description: String(data.description || 'Alteração visual identificada na peça.'),
    }
  } catch {
    return null
  }
}

