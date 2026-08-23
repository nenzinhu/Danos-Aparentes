/**
 * Sugestão de avaria a partir da foto de uma vista já confirmada.
 */

import { resolvePhotoUrl } from '@/src/lib/photoStore'
import type { DamageType, Severity } from '@/src/types'

export type ViewDamageSuggestion = {
  type: DamageType
  severity: Severity
  description: string
  noDamage?: boolean
}

export class ViewDamageSuggestError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ViewDamageSuggestError'
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function refToDataUrl(ref: string): Promise<string | null> {
  if (ref.startsWith('data:')) return ref
  try {
    const resolved = await resolvePhotoUrl(ref)
    if (!resolved) return null
    if (resolved.startsWith('data:')) return resolved
    const res = await fetch(resolved)
    if (!res.ok) return null
    return blobToDataUrl(await res.blob())
  } catch {
    return null
  }
}

export async function suggestViewDamageFromPhoto(input: {
  photoRef: string
  partName: string
  accessToken?: string | null
}): Promise<ViewDamageSuggestion | null> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null
  const photo = await refToDataUrl(input.photoRef)
  if (!photo) return null

  const res = await fetch('/api/damage-classify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ai-model': (typeof localStorage !== 'undefined' && localStorage.getItem('da_ai_model')) || 'groq',
      ...(input.accessToken ? { Authorization: `Bearer ${input.accessToken}` } : {}),
    },
    body: JSON.stringify({
      photo,
      partName: input.partName,
      allowNoDamage: true,
    }),
  })

  if (!res.ok) {
    let msg = 'Falha na análise de avarias.'
    try {
      const err = await res.json()
      if (err?.error) msg = String(err.error)
    } catch { /* ignore */ }
    throw new ViewDamageSuggestError(msg, res.status)
  }
  const data = await res.json().catch(() => null)
  if (!data) return null
  if (data.noDamage === true || data.type == null) {
    return { type: 'scratch', severity: 'low', description: '', noDamage: true }
  }
  return {
    type: data.type as DamageType,
    severity: (data.severity || 'low') as Severity,
    description: String(data.description || ''),
  }
}
