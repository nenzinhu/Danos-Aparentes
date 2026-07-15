/**
 * Single source of truth for subscription access (client + server + RLS mirror).
 * Keep SQL `user_has_active_subscription` in sync with `hasActiveSubscriptionAccess`.
 */

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'pending_pix'
  | 'active_pix'

export interface SubscriptionAccessInput {
  status: string | null | undefined
  trialEndsAt?: string | null
  /** Required for PIX access — period end set by the PIX webhook. */
  expiresAt?: string | null
  now?: number
}

export function isPixActive(status: string | null | undefined, expiresAt?: string | null, now = Date.now()): boolean {
  if (status !== 'active_pix') return false
  if (!expiresAt) return false
  const ends = new Date(expiresAt).getTime()
  return Number.isFinite(ends) && ends > now
}

export function isTrialActive(status: string | null | undefined, trialEndsAt?: string | null, now = Date.now()): boolean {
  if (status !== 'trialing') return false
  if (!trialEndsAt) return false
  const ends = new Date(trialEndsAt).getTime()
  return Number.isFinite(ends) && ends > now
}

/** True when the user may use paid product features (IA, sync, PDF extras, etc.). */
export function hasActiveSubscriptionAccess(input: SubscriptionAccessInput): boolean {
  const now = input.now ?? Date.now()
  const status = input.status

  if (status === 'active') return true
  if (isPixActive(status, input.expiresAt, now)) return true
  if (isTrialActive(status, input.trialEndsAt, now)) return true
  return false
}

/** Next calendar date after adding N months, using floor(now, existingExpiry). */
export function extendSubscriptionExpiry(
  expiresAt: string | null | undefined,
  months: number,
  now = new Date(),
): Date {
  const safeMonths = Number.isFinite(months) && months > 0 ? Math.floor(months) : 1
  const existing = expiresAt ? new Date(expiresAt) : null
  const base =
    existing && Number.isFinite(existing.getTime()) && existing.getTime() > now.getTime()
      ? existing
      : new Date(now.getTime())
  const result = new Date(base.getTime())
  result.setUTCFullYear(result.getUTCFullYear(), result.getUTCMonth() + safeMonths, result.getUTCDate())
  return result
}
