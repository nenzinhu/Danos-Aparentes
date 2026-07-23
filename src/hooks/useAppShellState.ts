'use client';
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { trackPixCtaClick } from '../lib/analytics/events'

export type AppTab = 'inspect' | 'dashboard' | 'team'

interface UseAppShellStateOptions {
  openPortal: () => Promise<void>
}

export function useAppShellState({ openPortal }: UseAppShellStateOptions) {
  const router = useRouter()

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      if (saved !== null) return saved !== 'false'
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
    }
    return true
  })

  const [savedModal, setSavedModal] = useState(false)
  const [settingsModal, setSettingsModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AppTab>('inspect')
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy'>('terms')
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [coachMarksOpen, setCoachMarksOpen] = useState(false)
  const [managePaymentModalOpen, setManagePaymentModalOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('app_tour_seen') !== 'true') {
      setTimeout(() => setTutorialOpen(true), 0);
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      setTimeout(() => document.documentElement.classList.remove('light'), 0)
    } else {
      setTimeout(() => document.documentElement.classList.add('light'), 0)
    }
  }, [darkMode])

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
      const next = !d
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
    showToast('✅ Dados da vistoria prontos')
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
  }
}
