/** Ativação pós-signup — primeira vistoria em minutos. */

export const JUST_SIGNED_UP_KEY = 'da_just_signed_up'
export const ONBOARDING_STARTED_KEY = 'da_onboarding_started'
/** Soft dismiss: só nesta sessão do browser. */
export const ONBOARDING_SNOOZED_KEY = 'da_onboarding_snoozed'
/** Legado — não bloqueia mais o checklist (só complete/first_inspection). */
export const ONBOARDING_DISMISSED_KEY = 'da_onboarding_dismissed'
export const ONBOARDING_COMPLETE_KEY = 'da_onboarding_complete'
/** Reutilizado com trackFirstInspection */
export const FIRST_INSPECTION_KEY = 'da_first_inspection_tracked'

export function markJustSignedUp(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(JUST_SIGNED_UP_KEY, '1')
    sessionStorage.setItem(ONBOARDING_STARTED_KEY, '1')
    sessionStorage.removeItem(ONBOARDING_SNOOZED_KEY)
  } catch {
    /* private mode */
  }
}

/** Consome o flag de signup desta sessão (1×). */
export function consumeJustSignedUp(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const v = sessionStorage.getItem(JUST_SIGNED_UP_KEY) === '1'
    if (v) sessionStorage.removeItem(JUST_SIGNED_UP_KEY)
    return v
  } catch {
    return false
  }
}

export function isOnboardingStarted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(ONBOARDING_STARTED_KEY) === '1'
  } catch {
    return false
  }
}

export function startOnboardingSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(ONBOARDING_STARTED_KEY, '1')
    sessionStorage.removeItem(ONBOARDING_SNOOZED_KEY)
  } catch {
    /* private mode */
  }
}

/** “Depois” — some só nesta sessão; volta no próximo login até a 1ª vistoria. */
export function dismissOnboarding(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(ONBOARDING_SNOOZED_KEY, '1')
    sessionStorage.removeItem(ONBOARDING_STARTED_KEY)
  } catch {
    /* private mode */
  }
}

export function completeOnboarding(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, '1')
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1')
    sessionStorage.removeItem(ONBOARDING_STARTED_KEY)
    sessionStorage.removeItem(ONBOARDING_SNOOZED_KEY)
  } catch {
    /* private mode */
  }
}

/**
 * Mostra checklist até existir 1ª vistoria salva.
 * Snooze de sessão não é permanente.
 */
export function shouldShowFirstInspectionOnboarding(hasSavedReports: boolean): boolean {
  if (typeof window === 'undefined') return false
  if (hasSavedReports) return false
  try {
    if (localStorage.getItem(ONBOARDING_COMPLETE_KEY) === '1') return false
    if (localStorage.getItem(FIRST_INSPECTION_KEY) === '1') return false
    if (sessionStorage.getItem(ONBOARDING_SNOOZED_KEY) === '1') return false
    return true
  } catch {
    return false
  }
}
