import type { DamageType, Severity } from '../types'
import { IconScratchDamageBadge, IconDentDamageBadge, IconBrokenGlassSphere } from './ui/DamageTypeIcons'
import { supabase, supabaseEnabled } from '../lib/supabase'

export const EXIT_DURATION_MS = 200

export const SEV: { value: Severity; label: string; color: string; bg: string; border: string }[] = [
  { value: 'low',    label: 'Leve',  color: 'text-slate-600',  bg: 'bg-slate-500/15',  border: 'border-slate-500/45' },
  { value: 'medium', label: 'Média', color: 'text-orange-600', bg: 'bg-orange-500/15', border: 'border-orange-500/45' },
  { value: 'high',   label: 'Grave', color: 'text-red-600',    bg: 'bg-red-500/15',    border: 'border-red-500/45' },
]

export const TYPES = [
  { type: 'scratch' as const, label: 'Risco / Arranhado',    Badge: IconScratchDamageBadge, img: '/damage/porta-riscada.svg',  color: 'text-[var(--success)]', bg: 'bg-[var(--success)]/15', border: 'border-[var(--success)]/40' },
  { type: 'dent' as const,    label: 'Amassado / Deformado', Badge: IconDentDamageBadge,    img: '/damage/porta-amassada.svg', color: 'text-amber-500',   bg: 'bg-[var(--signal)]/15',   border: 'border-amber-500/40' },
  { type: 'broken' as const,  label: 'Quebrado / Trincado',  Badge: IconBrokenGlassSphere,  img: '/damage/porta-trincada.svg', color: 'text-red-500',     bg: 'bg-red-500/15',     border: 'border-red-500/40' },
]

export type AiClassifyState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; type: DamageType; severity: Severity; description: string }
  | { status: 'error' }
  | { status: 'auth-required' }

export type ClassifyApiResponse = {
  type: DamageType
  severity: Severity
  description: string
  confidence?: number | null
  model?: string
  modelVersion?: string
  analyzedAt?: string
}

/**
 * `id` alimenta a trilha de auditoria (ai_decisions.decided_by, FK para
 * auth.users); `label` é o que aparece no badge "Confirmado por …" e no PDF,
 * por isso prefere nome/e-mail ao UUID.
 */
export async function currentUserIdentity(): Promise<{ id: string; label: string }> {
  const fallback = { id: 'anonymous', label: 'anonymous' }
  if (!supabaseEnabled || !supabase) return fallback
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user?.id) return fallback
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>
    const name = [meta.full_name, meta.name, user.email]
      .find(v => typeof v === 'string' && v.trim()) as string | undefined
    return { id: user.id, label: name?.trim() || user.id }
  } catch {
    return fallback
  }
}
