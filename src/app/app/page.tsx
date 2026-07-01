'use client';
import React, { Suspense, useState, useEffect, useCallback, ViewTransition } from 'react'
import { DirectionalTransition } from '../DirectionalTransition'
import { VehicleType, ViewType, VehicleInfo, Damage, DamageType } from '@/src/types'
import { useDamages } from '@/src/hooks/useDamages'
import { useTts } from '@/src/hooks/useTts'
import { useSavedReports } from '@/src/hooks/useSavedReports'
import { useAuth } from '@/src/hooks/useAuth'
import { useSubscription } from '@/src/hooks/useSubscription'
import { useSyncStatus } from '@/src/lib/sync'
import { supabaseEnabled } from '@/src/lib/supabase'
import { createId } from '@/src/lib/id'
import Header from '@/src/components/Header'
import Paywall from '@/src/components/Paywall'
import SavedReportsModal from '@/src/components/SavedReportsModal'
import DashboardView from '@/src/components/DashboardView'
import Login from '@/src/views/Login'
import CompanySettingsModal from '@/src/components/CompanySettingsModal'
import TermsModal from '@/src/components/TermsModal'
import FeaturesSlidesModal from '@/src/components/FeaturesSlidesModal'
import AppToast from '@/src/components/app/AppToast'
import AppFooter from '@/src/components/app/AppFooter'
import AppTabBar from '@/src/components/app/AppTabBar'
import InspectTab from '@/src/components/app/InspectTab'
import IaTab from '@/src/components/app/IaTab'
import PhotoUploadProgressBar from '@/src/components/PhotoUploadProgressBar'
import TorchButton from '@/src/components/TorchButton'
import { EMPTY_INFO } from '@/src/components/app/constants'

export default function AppMainPage() {
  const { session, loading: authLoading, signIn, signUp, signOut, resetPassword } = useAuth()
  const [vehicleType, setVehicleType] = useState<VehicleType>('car')
  const [viewType, setViewType] = useState<ViewType>('lateral-left')
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') !== 'false'
    }
    return true
  })
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>(EMPTY_INFO)
  const [savedModal, setSavedModal] = useState(false)
  const [settingsModal, setSettingsModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [formCollapsed, setFormCollapsed] = useState(false)
  const [formResetToken, setFormResetToken] = useState(0)
  const [activeTab, setActiveTab] = useState<'inspect' | 'dashboard' | 'ia'>('inspect')
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy'>('terms')
  const [tutorialOpen, setTutorialOpen] = useState(false)

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
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  const viewDamages = React.useMemo(
    () => damages.filter(d => d.vehicle === vehicleType && d.view === viewType),
    [damages, vehicleType, viewType],
  )

  const allVehicleDamages = React.useMemo(
    () => damages.filter(d => d.vehicle === vehicleType),
    [damages, vehicleType],
  )

  const showToast = useCallback((msg: string) => { setToast(msg) }, [])

  const handleAddDamage = useCallback((partId: string, partName: string, type: DamageType, typeName: string) => {
    addDamage({
      id: createId() as Damage['id'],
      vehicle: vehicleType,
      view: viewType,
      partId, partName, type, typeName,
      severity: 'low', notes: '', photos: [], photoNotes: [],
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

  const handleManageSubscription = useCallback(async () => {
    try {
      await openPortal()
    } catch (err) {
      showToast(err instanceof Error ? `❌ ${err.message}` : '❌ Falha ao Abrir Portal de Gerenciamento')
    }
  }, [openPortal, showToast])

  const handleLoad = useCallback((r: { vehicleInfo: VehicleInfo; damages: Damage[]; vehicleType?: VehicleType }) => {
    setVehicleInfo(r.vehicleInfo)
    if (r.vehicleType) setVehicleType(r.vehicleType)
    clearDamages()
    r.damages.forEach(d => addDamage(d))
    setSavedModal(false)
    showToast('📂 Vistoria Carregada!')
  }, [clearDamages, addDamage, showToast])

  const handleClearAll = useCallback(() => {
    setVehicleInfo(EMPTY_INFO)
    clearDamages()
    setFormResetToken(t => t + 1)
    showToast('🧽 Dados Limpos!')
  }, [clearDamages, showToast])

  const handleClearDamages = useCallback(() => {
    clearDamages()
    showToast('🧽 Avarias Limpas!')
  }, [clearDamages, showToast])

  const toggleDarkMode = useCallback(() => setDarkMode(d => !d), [])
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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center pb-12">
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
          <div className="flex-1 flex items-center justify-center text-slate-200">Carregando…</div>
        </div>
      </DirectionalTransition>
    )
  }

  if (supabaseEnabled && !session) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">Carregando…</div>}>
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center pb-12">
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
        />

        <main className="w-full max-w-7xl px-4 flex flex-col gap-6 mt-4">
          {activeTab === 'dashboard' ? (
            <DashboardView saved={saved} />
          ) : activeTab === 'ia' ? (
            <IaTab
              vehicleInfo={vehicleInfo}
              damages={damages}
              vehicleType={vehicleType}
              onToast={showToast}
              accessToken={session?.access_token}
            />
          ) : (
            <InspectTab
              vehicleType={vehicleType}
              viewType={viewType}
              vehicleInfo={vehicleInfo}
              formCollapsed={formCollapsed}
              formResetToken={formResetToken}
              viewDamages={viewDamages}
              allVehicleDamages={allVehicleDamages}
              ttsConfig={ttsConfig}
              voices={voices}
              hasAccess={subscription?.hasAccess ?? false}
              onVehicleTypeChange={setVehicleType}
              onViewTypeChange={setViewType}
              onVehicleInfoChange={setVehicleInfo}
              onToggleFormCollapse={() => setFormCollapsed(c => !c)}
              onWizardComplete={() => showToast('✅ Dados da vistoria prontos')}
              onOpenSaved={openSavedModal}
              onClearAll={handleClearAll}
              onClearDamages={handleClearDamages}
              onAddDamage={handleAddDamage}
              onRemoveDamageFromPart={handleRemoveDamageFromPart}
              onRemoveDamage={removeDamage}
              onUpdateDamage={updateDamage}
              onTtsConfigChange={setTtsConfig}
              onTtsTest={() => speak('Teste de voz do sistema de vistoria veicular')}
              speak={speak}
              speakHover={speakHover}
              onToast={showToast}
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
        <TorchButton onToast={showToast} />
        {toast && <AppToast msg={toast} onDone={() => setToast(null)} />}
      </div>
    </DirectionalTransition>
  )
}
