/**
 * Cliente: classifica lados das fotos de vista via /api/view-side-classify.
 */

import { resolvePhotoUrl } from '@/src/lib/photoStore'
import type { ViewType } from '@/src/types'
import type { ViewSideSuggestion } from '@/src/lib/viewSideAssign'

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

export async function classifyViewSides(
  photoRefs: string[],
  accessToken?: string | null,
): Promise<ViewSideSuggestion[]> {
  if (!photoRefs.length) return []
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('Sem conexão. Escolha os lados na mão.')
  }

  const photos: string[] = []
  const keptRefs: string[] = []
  for (const ref of photoRefs.slice(0, 4)) {
    const dataUrl = await refToDataUrl(ref)
    if (!dataUrl) continue
    photos.push(dataUrl)
    keptRefs.push(ref)
  }

  if (!photos.length) {
    throw new Error('Não foi possível ler as fotos para análise.')
  }

  const res = await fetch('/api/view-side-classify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ photos }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(String(data.error || 'Não foi possível identificar os lados.'))
  }

  const suggestions = Array.isArray(data.suggestions) ? data.suggestions : []
  const out: ViewSideSuggestion[] = []
  for (const s of suggestions) {
    const index = Number(s.index)
    const view = s.view as ViewType
    if (!Number.isInteger(index) || index < 0 || index >= keptRefs.length) continue
    if (!view) continue
    out.push({ photoRef: keptRefs[index], suggestedView: view })
  }
  return out
}
