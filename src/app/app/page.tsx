'use client';
import React, { Suspense, useState, useEffect, useCallback, ViewTransition } from 'react'
import { DirectionalTransition } from '../DirectionalTransition'
import { VehicleType, ViewType, VehicleInfo, Damage, DamageType, Severity } from '@/src/types'
import { useDamages } from '@/src/hooks/useDamages'
import { useTts } from '@/src/hooks/useTts'
import { useSavedReports } from '@/src/hooks/useSavedReports'
import { useAuth } from '@/src/hooks/useAuth'
import { useSubscription } from '@/src/hooks/useSubscription'
import { useSyncStatus } from '@/src/lib/sync'
import { supabaseEnabled } from '@/src/lib/supabase'
import { createId } from '@/src/lib/id'
import { compressImage, LOCAL_PHOTO_MAX_WIDTH, LOCAL_PHOTO_QUALITY } from '@/src/lib/imageUtils'
import { storePhoto } from '@/src/lib/photoStore'
import { playDamageAddedFeedback } from '@/src/lib/feedback'
import { buildPreviousReportSummary, type PreviousReportSummary } from '@/src/lib/reportComparison'
import {
  finishPhotoUploadProgress,
  startPhotoUploadProgress,
  updatePhotoUploadProgress,
} from '@/src/lib/photoUploadProgress'
import { useRouter } from 'next/navigation'
import Header from '@/src/components/Header'
import ManageSubscriptionModal from '@/src/components/ManageSubscriptionModal'
import Paywall from '@/src/components/Paywall'
import SavedReportsModal from '@/src/components/SavedReportsModal'
import DashboardView from '@/src/components/DashboardView'
import Login from '@/src/views/Login'
import CompanySettingsModal from '@/src/components/CompanySettingsModal'
import TermsModal from '@/src/components/TermsModal'
import FeaturesSlidesModal from '@/src/components/FeaturesSlidesModal'
import InspectionCoachMarks from '@/src/components/app/InspectionCoachMarks'
import AppToast from '@/src/components/app/AppToast'
import AppFooter from '@/src/components/app/AppFooter'
import AppTabBar from '@/src/components/app/AppTabBar'
import InspectTab from '@/src/components/app/InspectTab'
import TeamTab from '@/src/components/app/TeamTab'
import PhotoUploadProgressBar from '@/src/components/PhotoUploadProgressBar'
import TorchButton from '@/src/components/TorchButton'
import { EMPTY_INFO } from '@/src/components/app/constants'

export default function AppMainPage() {
  const router = useRouter()
  const { session, loading: authLoading, signIn, signUp, signOut, resetPassword } = useAuth()
  const [vehicleType, setVehicleType] = useState<VehicleType>('car')
  const [viewType, setViewType] = useState<ViewType>('lateral-left')
  const [visitedViews, setVisitedViews] = useState<ViewType[]>(['lateral-left'])
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      if (saved !== null) return saved !== 'false'
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
    }
    return true
  })
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>(EMPTY_INFO)
  const [savedModal, setSavedModal] = useState(false)
  const [settingsModal, setSettingsModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [formCollapsed, setFormCollapsed] = useState(false)
  const [formResetToken, setFormResetToken] = useState(0)
  const [activeTab, setActiveTab] = useState<'inspect' | 'dashboard' | 'team'>('inspect')
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy'>('terms')
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [coachMarksOpen, setCoachMarksOpen] = useState(false)
  const [previousReport, setPreviousReport] = useState<PreviousReportSummary | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('app_tour_seen') !== 'true') {
      setTutorialOpen(true)
    }
  }, [])

  const { damages, addDamage, removeDamage, updateDamage, clearDamages } = useDamages()
  const { config: ttsConfig, setConfig: setTtsConfig, speak, speakHover, voices } = useTts(session?.access_token)
  const { saved, saveReport, deleteReport } = useSavedReports(session?.user.id)
  const { status: syncStatus } = useSyncStatus(session?.user.id)
  const { info: subscription, loading: subLoading, openPortal } = useSubscription(session?.user.id, session?.access_token)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
  }, [darkMode])

  // Enquanto o usuário nunca escolheu manualmente (sem 'darkMode' salvo),
  // acompanha mudanças ao vivo na preferência de tema do sistema.
  useEffect(() => {
    if (localStorage.getItem('darkMode') !== null) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setDarkMode(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const viewDamages = React.useMemo(
    () => damages.filter(d => d.vehicle === vehicleType && d.view === viewType),
    [damages, vehicleType, viewType],
  )

  const allVehicleDamages = React.useMemo(
    () => damages.filter(d => d.vehicle === vehicleType),
    [damages, vehicleType],
  )

  const showToast = useCallback((msg: string) => { setToast(msg) }, [])

  const handlePlateConfirmed = useCallback(async (plate: string) => {
    setPreviousReport(null)
    if (!session?.access_token) return
    try {
      const res = await fetch(`/api/report-by-plate?plate=${encodeURIComponent(plate)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.found) {
        setPreviousReport(buildPreviousReportSummary(data.updatedAt, data.damages ?? []))
      }
    } catch {
      // Busca de laudo anterior é um recurso de apoio — falha silenciosa não deve travar a vistoria.
    }
  }, [session])

  const handleAddDamage = useCallback((partId: string, partName: string, type: DamageType, typeName: string, photoFile?: File) => {
    playDamageAddedFeedback()
    const id = createId() as Damage['id']
    addDamage({
      id,
      vehicle: vehicleType,
      view: viewType,
      partId, partName, type, typeName,
      severity: 'low', notes: '', photos: [], photoNotes: [],
    })

    if (!photoFile) return

    ;(async () => {
      startPhotoUploadProgress(1, 'Preparando foto da avaria…')
      try {
        updatePhotoUploadProgress({ phase: 'compressing', label: 'Comprimindo imagem…' })
        const compressedBlob = await compressImage(photoFile, LOCAL_PHOTO_MAX_WIDTH, LOCAL_PHOTO_QUALITY)
        updatePhotoUploadProgress({ phase: 'uploading', current: 0, label: 'Salvando foto localmente…' })
        const photoRef = await storePhoto(compressedBlob)
        updatePhotoUploadProgress({ current: 1 })
        updateDamage(id, { photos: [photoRef], photoNotes: [''] })
      } catch (error) {
        console.error('Error compressing image:', error)
      } finally {
        finishPhotoUploadProgress()
      }
    })()
  }, [vehicleType, viewType, addDamage, updateDamage])

  const handleAddDamageDetailed = useCallback((partId: string, partName: string, type: DamageType, typeName: string, severity: Severity, notes: string) => {
    playDamageAddedFeedback()
    addDamage({
      id: createId() as Damage['id'],
      vehicle: vehicleType,
      view: viewType,
      partId, partName, type, typeName, severity, notes,
      photos: [], photoNotes: [],
    })
  }, [vehicleType, viewType, addDamage])

  const handleRemoveDamageFromPart = useCallback((partId: string) => {
    const dmg = viewDamages.find(d => d.partId === partId)
    if (dmg) removeDamage(dmg.id)
  }, [viewDamages, removeDamage])

  const handleSave = useCallback(async () => {
    await saveReport(vehicleInfo, damages, vehicleType)
    showToast('✅ Vistoria Salva!')
  }, [vehicleInfo, damages, vehicleType, saveReport, showToast])

  const [managePaymentModalOpen, setManagePaymentModalOpen] = useState(false)

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
    setManagePaymentModalOpen(false)
    router.push('/pagamento-pix')
  }, [router])

  const handleLoad = useCallback((r: { vehicleInfo: VehicleInfo; damages: Damage[]; vehicleType?: VehicleType }) => {
    setVehicleInfo(r.vehicleInfo)
    if (r.vehicleType) setVehicleType(r.vehicleType)
    clearDamages()
    r.damages.forEach(d => addDamage(d))
    setSavedModal(false)
    setPreviousReport(null)
    showToast('📂 Vistoria Carregada!')
  }, [clearDamages, addDamage, showToast])

  const handleClearAll = useCallback(() => {
    setVehicleInfo(EMPTY_INFO)
    clearDamages()
    setFormResetToken(t => t + 1)
    setPreviousReport(null)
    showToast('🧽 Dados Limpos!')
  }, [clearDamages, showToast])

  const handleClearDamages = useCallback(() => {
    clearDamages()
    showToast('🧽 Avarias Limpas!')
  }, [clearDamages, showToast])

  const handleViewTypeChange = useCallback((view: ViewType) => {
    setViewType(view)
    setVisitedViews(prev => (prev.includes(view) ? prev : [...prev, view]))
  }, [])

  const handleVehicleTypeChange = useCallback((type: VehicleType) => {
    setVehicleType(type)
    setViewType('lateral-left')
    setVisitedViews(['lateral-left'])
  }, [])

  const toggleDarkMode = useCallback(() => {
    setDarkMode(d => {
      const next = !d
      localStorage.setItem('darkMode', String(next))
      return next
    })
  }, [])
  const openSavedModal = useCallback(() => setSavedModal(true), [])

  const headerSubscription = React.useMemo(
    () => supabaseEnabled && subscription
      ? { status: subscription.status, trialDaysLeft: subscription.trialDaysLeft }
      : undefined,
    [subscription],
  )

  if (supabaseEnabled && (authLoading || (session && subLoading))) {
    return (
      <DirectionalTransition>
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center pb-12">
          <ViewTransition name="persistent-nav" default="none">
            <Header
              darkMode={darkMode}
              onToggleDark={toggleDarkMode}
              onOpenSaved={openSavedModal}
              onOpenSettings={() => setSettingsModal(true)}
              onSignOut={supabaseEnabled && session ? signOut : undefined}
              syncStatus={supabaseEnabled && session ? syncStatus : undefined}
              subscription={undefined}
              onManageSubscription={handleManageSubscription}
            />
          </ViewTransition>
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">Carregando…</div>
        </div>
      </DirectionalTransition>
    )
  }

  if (supabaseEnabled && !session) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center">Carregando…</div>}>
        <Login onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />
      </Suspense>
    )
  }

  if (supabaseEnabled && session && subscription && !subscription.hasAccess) {
    return <Paywall status={subscription.status} onSignOut={signOut} />
  }

  return (
    <DirectionalTransition>
      <PhotoUploadProgressBar />
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center pb-12">
        <ViewTransition name="persistent-nav" default="none">
          <Header
            darkMode={darkMode}
            onToggleDark={toggleDarkMode}
            onOpenSaved={openSavedModal}
            onOpenSettings={() => setSettingsModal(true)}
            onSignOut={supabaseEnabled ? signOut : undefined}
            syncStatus={supabaseEnabled ? syncStatus : undefined}
            subscription={headerSubscription}
            onManageSubscription={handleManageSubscription}
          />
        </ViewTransition>

        <AppTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSettings={() => setSettingsModal(true)}
          onOpenTutorial={() => setTutorialOpen(true)}
          showTeamTab={subscription?.isCorporate ?? false}
        />

        <main className="w-full max-w-7xl px-4 flex flex-col gap-6 mt-4">
          {activeTab === 'dashboard' ? (
            <DashboardView saved={saved} />
          ) : activeTab === 'team' ? (
            <TeamTab accessToken={session?.access_token} onToast={showToast} />
          ) : (
            <InspectTab
              vehicleType={vehicleType}
              viewType={viewType}
              vehicleInfo={vehicleInfo}
              formCollapsed={formCollapsed}
              formResetToken={formResetToken}
              viewDamages={viewDamages}
              allVehicleDamages={allVehicleDamages}
              visitedViews={visitedViews}
              previousReport={previousReport}
              onPlateConfirmed={handlePlateConfirmed}
              ttsConfig={ttsConfig}
              voices={voices}
              hasAccess={subscription?.hasAccess ?? false}
              onVehicleTypeChange={handleVehicleTypeChange}
              onViewTypeChange={handleViewTypeChange}
              onVehicleInfoChange={setVehicleInfo}
              onToggleFormCollapse={() => setFormCollapsed(c => !c)}
              onWizardComplete={() => {
                showToast('✅ Dados da vistoria prontos')
                if (localStorage.getItem('inspection_coachmarks_seen') !== 'true') {
                  setCoachMarksOpen(true)
                }
              }}
              onOpenSaved={openSavedModal}
              onClearAll={handleClearAll}
              onClearDamages={handleClearDamages}
              onAddDamage={handleAddDamage}
              onAddDamageDetailed={handleAddDamageDetailed}
              onRemoveDamageFromPart={handleRemoveDamageFromPart}
              onRemoveDamage={removeDamage}
              onUpdateDamage={updateDamage}
              onTtsConfigChange={setTtsConfig}
              onTtsTest={() => speak('Teste de voz do sistema de vistoria veicular')}
              speak={speak}
              speakHover={speakHover}
              onToast={showToast}
              accessToken={session?.access_token}
            />
          )}
        </main>

        <SavedReportsModal
          isOpen={savedModal}
          saved={saved}
          onClose={() => setSavedModal(false)}
          onSave={handleSave}
          onLoad={handleLoad}
          onDelete={deleteReport}
          hasAccess={subscription?.hasAccess ?? false}
          accessToken={session?.access_token}
        />

        <CompanySettingsModal
          isOpen={settingsModal}
          onClose={() => setSettingsModal(false)}
          hasAccess={subscription?.hasAccess ?? false}
        />

        <AppFooter
          onOpenTerms={() => { setTermsTab('terms'); setTermsOpen(true) }}
          onOpenPrivacy={() => { setTermsTab('privacy'); setTermsOpen(true) }}
        />

        <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} defaultTab={termsTab} />
        <FeaturesSlidesModal isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
        <InspectionCoachMarks
          isOpen={coachMarksOpen}
          onClose={() => {
            setCoachMarksOpen(false)
            localStorage.setItem('inspection_coachmarks_seen', 'true')
          }}
        />
        <TorchButton onToast={showToast} />
        {toast && <AppToast msg={toast} onDone={() => setToast(null)} />}
        <ManageSubscriptionModal
          open={managePaymentModalOpen}
          onClose={() => setManagePaymentModalOpen(false)}
          onChooseCartao={handleChooseCartaoPayment}
          onChoosePix={handleChoosePixPayment}
        />
      </div>
    </DirectionalTransition>
  )
}
