'use client';
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { trackPixCtaClick, trackOnboardingStart } from '../lib/analytics/events'
import {
  consumeJustSignedUp,
  shouldShowFirstInspectionOnboarding,
  startOnboardingSession,
} from '../lib/onboarding'

export type AppTab = 'inspect' | 'dashboard' | 'team' | 'vehicles'

interface UseAppShellStateOptions {
  openPortal: () => Promise<void>
}

export function useAppShellState({ openPortal }: UseAppShellStateOptions) {
  const router = useRouter()

  // Começa null (indeterminado) para evitar hydration mismatch: o servidor e o
  // primeiro render do cliente usam o estado neutro; o tema real é aplicado no
  // useEffect abaixo após ler localStorage / prefers-color-scheme.
  const [darkMode, setDarkMode] = useState<boolean | null>(null)

  const [savedModal, setSavedModal] = useState(false)
  const [settingsModal, setSettingsModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AppTab>('inspect')
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy'>('terms')
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [coachMarksOpen, setCoachMarksOpen] = useState(false)
  const [managePaymentModalOpen, setManagePaymentModalOpen] = useState(false)
  const [showActivationOnboarding, setShowActivationOnboarding] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Adia um tick para não chamar setState sincronamente dentro do effect.
    const t = setTimeout(() => {
      const justSignedUp = consumeJustSignedUp()
      if (justSignedUp) {
        // Produto primeiro: pula o tour longo e vai para a 1ª vistoria.
        localStorage.setItem('app_tour_seen', 'true')
        startOnboardingSession()
        setShowActivationOnboarding(true)
        return
      }

      if (localStorage.getItem('app_tour_seen') !== 'true') {
        // Conta nova sem flag de signup (ex.: confirmou email depois): ativação > tour.
        startOnboardingSession()
        trackOnboardingStart({ source: 'first_app_open' })
        localStorage.setItem('app_tour_seen', 'true')
        setShowActivationOnboarding(true)
        return
      }

      // Usuário que ainda não salvou a 1ª vistoria (snooze só vale nesta sessão).
      if (shouldShowFirstInspectionOnboarding(false)) {
        startOnboardingSession()
        setShowActivationOnboarding(true)
      }
    }, 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (darkMode) {
      setTimeout(() => document.documentElement.classList.remove('light'), 0)
    } else {
      setTimeout(() => document.documentElement.classList.add('light'), 0)
    }
  }, [darkMode])

  useEffect(() => {
    // Adia um tick para não chamar setState sincronamente dentro do effect.
    const t = setTimeout(() => {
      const saved = localStorage.getItem('darkMode')
      const isDark = saved !== null ? saved !== 'false' : true
      setDarkMode(isDark)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  // Enquanto o usuário nunca escolheu manualmente (sem 'darkMode' salvo),
  // acompanha mudanças ao vivo na preferência de tema do sistema.
  useEffect(() => {
    if (localStorage.getItem('darkMode') !== null) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setTimeout(() => setDarkMode(e.matches), 0)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const showToast = useCallback((msg: string) => { setToast(msg) }, [])

  const toggleDarkMode = useCallback(() => {
    setDarkMode(d => {
      const next = !(d ?? true)
      localStorage.setItem('darkMode', String(next))
      return next
    })
  }, [])

  const openSavedModal = useCallback(() => setSavedModal(true), [])

  const handleManageSubscription = useCallback(() => {
    setManagePaymentModalOpen(true)
  }, [])

  const handleChooseCartaoPayment = useCallback(async () => {
    setManagePaymentModalOpen(false)
    try {
      await openPortal()
    } catch (err) {
      showToast(err instanceof Error ? `❌ ${err.message}` : '❌ Falha ao Abrir Portal de Gerenciamento')
    }
  }, [openPortal, showToast])

  const handleChoosePixPayment = useCallback(() => {
    trackPixCtaClick({ source: 'paywall' })
    setManagePaymentModalOpen(false)
    router.push('/pagamento-pix')
  }, [router])

  const closeCoachMarks = useCallback(() => {
    setCoachMarksOpen(false)
    localStorage.setItem('inspection_coachmarks_seen', 'true')
  }, [])

  const onWizardComplete = useCallback(() => {
    showToast('✅ Evidências adicionadas ao histórico.')
    if (localStorage.getItem('inspection_coachmarks_seen') !== 'true') {
      setCoachMarksOpen(true)
    }
  }, [showToast])

  return {
    darkMode,
    toggleDarkMode,
    savedModal,
    setSavedModal,
    openSavedModal,
    settingsModal,
    setSettingsModal,
    toast,
    setToast,
    showToast,
    activeTab,
    setActiveTab,
    termsOpen,
    setTermsOpen,
    termsTab,
    setTermsTab,
    tutorialOpen,
    setTutorialOpen,
    coachMarksOpen,
    closeCoachMarks,
    managePaymentModalOpen,
    setManagePaymentModalOpen,
    handleManageSubscription,
    handleChooseCartaoPayment,
    handleChoosePixPayment,
    onWizardComplete,
    showActivationOnboarding,
    setShowActivationOnboarding,
  }
}
