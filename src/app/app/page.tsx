"use client";
import React, { useState, useEffect, useCallback, useMemo, ViewTransition, Suspense } from 'react'
import { DirectionalTransition } from '../DirectionalTransition'
import { VehicleType, ViewType, VehicleInfo, Damage, DamageType } from '@/src/types'
import { useDamages } from '@/src/hooks/useDamages'
import { useTts } from '@/src/hooks/useTts'
import { useSavedReports } from '@/src/hooks/useSavedReports'
import { useAuth } from '@/src/hooks/useAuth'
import { useSubscription } from '@/src/hooks/useSubscription'
import { useSyncStatus } from '@/src/lib/sync'
import { supabaseEnabled } from '@/src/lib/supabase'
import Header from '@/src/components/Header'
import Paywall from '@/src/components/Paywall'
import VehicleSelector, { VehicleIconSvg } from '@/src/components/VehicleSelector'
import ViewSelector from '@/src/components/ViewSelector'
import { VehicleViewer } from '@/src/components/VehicleViewer'
import DamageList from '@/src/components/DamageList'
import VehicleInfoForm from '@/src/components/VehicleInfoForm'
import TtsSettings from '@/src/components/TtsSettings'
import ReportActions from '@/src/components/ReportActions'
import SavedReportsModal from '@/src/components/SavedReportsModal'
import DashboardView from '@/src/components/DashboardView'
import Login from '@/src/views/Login'
import CompanySettingsModal from '@/src/components/CompanySettingsModal'
import CompanyLogoButton from '@/src/components/CompanyLogoButton'
import TermsModal from '@/src/components/TermsModal'

function ClearAllIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.88 103.38" style={{ flexShrink: 0 }} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M27.66,93.53h32.49l9.1-9.08c1.4-1.4,1.41-3.7,0.01-5.1l-27.02-27.1c-1.4-1.4-3.7-1.41-5.1-0.01L14.3,75.03 c-1.41,1.4-1.41,3.7-0.01,5.1L27.66,93.53L27.66,93.53z M71.03,93.53h51.84v9.85H61.16H50.28h-12.8H25.7h-0.35L1.05,79.01 c-1.4-1.4-1.4-3.7,0.01-5.1L74.11,1.05c1.41-1.4,3.7-1.4,5.1,0.01l39.62,39.72c1.4,1.4,1.4,3.7-0.01,5.1L71.03,93.53L71.03,93.53z"
      />
    </svg>
  )
}

const EMPTY_INFO: VehicleInfo = {
  owner: '', phone: '', brand: '', plate: '', generalNotes: '',
  profile: '', ref: '', color: '', vehicleTypeDesc: '', city: '', state: '',
  cpf: '', cnh: '', cnhCategory: '',
  inspectorSignature: '', clientSignature: '',
  customFields: []
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div role="status" aria-live="polite" className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-primary/30 rounded-xl px-6 py-3 z-[99999] text-blue-50 font-bold text-sm shadow-2xl pointer-events-none">
      {msg}
    </div>
  )
}

export default function AppMainPage() {
  const { session, loading: authLoading, signIn, signUp, signOut, resetPassword } = useAuth()
  const [vehicleType, setVehicleType] = useState<VehicleType>('car')
  const [viewType, setViewType] = useState<ViewType>('lateral-left')
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') !== 'false';
    }
    return true;
  })
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>(EMPTY_INFO)
  const [savedModal, setSavedModal] = useState(false)
  const [settingsModal, setSettingsModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [formCollapsed, setFormCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'inspect' | 'dashboard'>('inspect')
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy'>('terms')

  const { damages, addDamage, removeDamage, updateDamage, clearDamages } = useDamages()
  const { config: ttsConfig, setConfig: setTtsConfig, speak, speakHover, voices } = useTts()
  const { saved, saveReport, deleteReport } = useSavedReports(session?.user.id)
  const { status: syncStatus } = useSyncStatus(session?.user.id)
  const { info: subscription, loading: subLoading, startCheckout, openPortal } = useSubscription(session?.user.id, session?.access_token)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  const viewDamages = React.useMemo(() => 
    damages.filter(d => d.vehicle === vehicleType && d.view === viewType),
    [damages, vehicleType, viewType]
  )
  
  const allVehicleDamages = React.useMemo(() => 
    damages.filter(d => d.vehicle === vehicleType),
    [damages, vehicleType]
  )

  const showToast = useCallback((msg: string) => { setToast(msg) }, [])

  const handleAddDamage = useCallback((partId: string, partName: string, type: DamageType, typeName: string) => {
    const newDamage: Damage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      vehicle: vehicleType,
      view: viewType,
      partId, partName, type, typeName,
      severity: 'low', notes: '', photos: [], photoNotes: [],
    }
    addDamage(newDamage)
  }, [vehicleType, viewType, addDamage])

  const handleRemoveDamageFromPart = useCallback((partId: string) => {
    const dmg = viewDamages.find(d => d.partId === partId)
    if (dmg) removeDamage(dmg.id)
  }, [viewDamages, removeDamage])

  const handleSave = useCallback(async () => {
    await saveReport(vehicleInfo, damages)
    showToast('âœ… Vistoria Salva!')
  }, [vehicleInfo, damages, saveReport, showToast])

  const handleManageSubscription = useCallback(async () => {
    try {
      await openPortal()
    } catch (err) {
      showToast(err instanceof Error ? `âŒ ${err.message}` : 'âŒ Falha ao Abrir Portal de Gerenciamento')
    }
  }, [openPortal, showToast])

  const handleLoad = useCallback((r: { vehicleInfo: VehicleInfo; damages: Damage[] }) => {
    setVehicleInfo(r.vehicleInfo)
    clearDamages()
    r.damages.forEach(d => addDamage(d))
    setSavedModal(false)
    showToast('📂 Vistoria Carregada!')
  }, [clearDamages, addDamage, showToast])

  const handleClearAll = useCallback(() => {
    setVehicleInfo(EMPTY_INFO)
    clearDamages()
    showToast('🧽 Dados Limpos!')
  }, [clearDamages, showToast])

  const handleTtsTest = useCallback(() => {
    speak('Teste de voz do sistema de vistoria veicular')
  }, [speak])

  const toggleDarkMode = useCallback(() => setDarkMode(d => !d), [])
  const openSavedModal = useCallback(() => setSavedModal(true), [])

  const headerSubscription = React.useMemo(() => 
    supabaseEnabled && subscription 
      ? { status: subscription.status, trialDaysLeft: subscription.trialDaysLeft } 
      : undefined,
    [subscription]
  )

  const VEHICLE_NAME: Record<VehicleType, string> = {
    car: 'Automóvel', car2d: 'Carro (2 Portas)', moto: 'Moto', truck: 'Caminhão', van: 'Utilitário', bus: 'Ônibus', microbus: 'Micro-ônibus', custom: 'Genérico'
  }
  const VIEW_NAME: Record<ViewType, string> = {
    'lateral-left': 'Lateral Esquerda', 'lateral-right': 'Lateral Direita',
    frontal: 'Frontal', traseira: 'Traseira'
  }

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
        <div className="flex-1 flex items-center justify-center text-slate-200">
          Carregando…
        </div>
      </div>
      </DirectionalTransition>
    )
  }

  if (supabaseEnabled && !session) {
    return <Login onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />
  }

  if (supabaseEnabled && session && subscription && !subscription.hasAccess) {
    return <Paywall status={subscription.status} onSubscribe={startCheckout} onSignOut={signOut} />
  }

  return (
    <DirectionalTransition>
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
          onSubscribe={startCheckout}
        />
      </ViewTransition>

      {/* Tab Selector */}
      <div className="flex justify-center mt-2 mb-2">
        <div className="bg-slate-900/80 border border-white/5 rounded-xl p-1 flex gap-1 shadow-inner backdrop-blur-md">
          <button
            onClick={() => setActiveTab('inspect')}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer ${
              activeTab === 'inspect'
                ? 'bg-sky-500/10 border border-sky-500/25 text-sky-400 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            📝 Nova Vistoria
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-sky-500/10 border border-sky-500/25 text-sky-400 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            📊 Estatísticas
          </button>
          <CompanyLogoButton onClick={() => setSettingsModal(true)} />
        </div>
      </div>

      <main className="w-full max-w-7xl px-4 flex flex-col gap-6 mt-4">
        {activeTab === 'dashboard' ? (
          <DashboardView saved={saved} />
        ) : (
          <>
            {/* Dados da Vistoria — full width */}
            <div className="glass-card p-6">
              <VehicleInfoForm
                info={vehicleInfo}
                onChange={setVehicleInfo}
                collapsed={formCollapsed}
                onToggleCollapse={() => setFormCollapsed(c => !c)}
                onVehicleTypeDetected={(type) => setVehicleType(type)}
              />
              {!formCollapsed && (
                <div className="flex gap-4 mt-6 pt-4 border-t border-[var(--panel-border)] justify-between items-center flex-wrap">
                  <button onClick={openSavedModal} className="text-xs px-4 py-2 rounded-lg font-bold border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all">
                    📦 Vistorias Salvas
                  </button>
                  <button onClick={handleClearAll} className="text-xs px-4 py-2 rounded-lg font-bold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 inline-flex items-center gap-2 transition-all">
                    <ClearAllIcon /> Limpar Tudo
                  </button>
                </div>
              )}
            </div>

            {/* Controls: vehicle selector + view selector */}
            <div className="flex flex-col gap-4 items-center">
              <div className="w-full">
                <VehicleSelector current={vehicleType} onChange={setVehicleType} />
              </div>
              <ViewSelector current={viewType} onChange={setViewType} />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6 items-start">

              {/* Left card: Viewer */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--panel-border)]">
                  <div className="flex items-center gap-3">
                    <VehicleIconSvg type={vehicleType} size={32} />
                    <span className="font-bold text-lg">{VEHICLE_NAME[vehicleType]} — {VIEW_NAME[viewType]}</span>
                  </div>
                </div>
                <VehicleViewer.Root
                  vehicleType={vehicleType}
                  viewType={viewType}
                  damages={viewDamages}
                  onAddDamage={handleAddDamage}
                  onRemoveDamageFromPart={handleRemoveDamageFromPart}
                  speak={speak}
                  speakHover={speakHover}
                >
                  <VehicleViewer.Controls />
                  <Suspense fallback={<div className="flex-1 flex items-center justify-center text-sky-500/50 italic text-xs animate-pulse min-h-[220px]">Carregando visualizador…</div>}>
                    <VehicleViewer.Viewport />
                  </Suspense>
                  <VehicleViewer.FloatingDamage />
                  <VehicleViewer.FullscreenOverlay />
                  <div className="mt-1.5 text-[0.72rem] text-[var(--text-muted)] text-center">
                    Clique em uma peça para registrar avaria • Scroll ou pinch para zoom
                  </div>
                </VehicleViewer.Root>
                <div className="mt-8 pt-6 border-t border-[var(--panel-border)]">
                  <TtsSettings config={ttsConfig} onChange={setTtsConfig} onTest={handleTtsTest} voices={voices} />
                </div>
              </div>

              {/* Right card: Damage list */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--panel-border)]">
                  <div className="flex items-center gap-3">
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.9 122.88" width="18" height="18" className="fill-current text-primary">
                      <path fillRule="evenodd" clipRule="evenodd" d="M26.6,66.95c0.67-0.68,1.76-0.69,2.44-0.01c0.68,0.68,0.68,1.78,0.01,2.47l-2.95,2.99l2.95,2.99 c0.67,0.68,0.66,1.77-0.02,2.45c-0.68,0.68-1.77,0.67-2.43,0l-2.93-2.97l-2.94,2.98c-0.67,0.68-1.77,0.69-2.44,0.01 c-0.68-0.68-0.68-1.78-0.01-2.47l2.95-2.99l-2.95-2.99c-0.67-0.68-0.66-1.77,0.02-2.45c0.68-0.68,1.77-0.67,2.43,0l2.93,2.97 L26.6,66.95L26.6,66.95z M37.06,5.04v5c0,1.29-1.03,2.41-2.28,2.5c-0.27,0.09-0.58,0.13-0.89,0.13H24.6v10.35 c15.56,0,31.13,0,46.69,0V12.68h-9.28c-0.31,0-0.63-0.04-0.89-0.13c-1.25-0.09-2.28-1.21-2.28-2.5v-5 C51.58,5.04,44.32,5.04,37.06,5.04L37.06,5.04z M5.62,122.88c-1.52,0-2.95-0.62-3.97-1.65C0.62,120.2,0,118.82,0,117.26V19.86c0-1.56,0.62-2.95,1.65-3.97 c1.03-1.03,2.41-1.65,3.97-1.65h13.98v-2.77c0-1.03,0.4-1.96,1.12-2.68c0.67-0.67,1.61-1.12,2.68-1.12h8.66V4.2 c0-1.16,0.49-2.19,1.25-2.95C34.07,0.49,35.09,0,36.25,0c7.8,0,15.59,0,23.39,0c1.16,0,2.19,0.49,2.95,1.25 c0.76,0.76,1.25,1.79,1.25,2.95v3.48h8.66c1.07,0,2.01,0.45,2.68,1.12c0.71,0.71,1.12,1.65,1.12,2.68v2.77h13.98 c1.56,0,2.95,0.62,3.97,1.65c1.03,1.03,1.65,2.41,1.65,3.97v97.39c0,1.56-0.62,2.95-1.65,3.97c-1.03,1.03-2.46,1.65-3.97,1.65 C61.62,122.88,34.28,122.88,5.62,122.88L5.62,122.88z"/>
                    </svg>
                    <span className="font-bold text-lg">Avarias (<span className={allVehicleDamages.length > 0 ? 'text-red-500' : ''}>{allVehicleDamages.length}</span>)</span>
                  </div>
                  {allVehicleDamages.length > 0 && (
                    <button onClick={() => { clearDamages(); showToast('🧽 Avarias Limpas!') }} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-red-500/20 text-red-500 hover:bg-red-500/10 inline-flex items-center gap-2">
                      <ClearAllIcon size={12} /> Limpar
                    </button>
                  )}
                </div>

                <DamageList damages={allVehicleDamages} onRemove={removeDamage} onUpdate={updateDamage} />

                <div className="mt-6 pt-6 border-t border-[var(--panel-border)]">
                  <ReportActions 
                    vehicleType={vehicleType} 
                    vehicleInfo={vehicleInfo} 
                    damages={allVehicleDamages} 
                    onToast={showToast} 
                    hasAccess={subscription?.hasAccess ?? false}
                  />
                </div>
              </div>
            </div>
          </>
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
        onSubscribe={startCheckout}
      />

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-8 mt-12 border-t border-[var(--panel-border)]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.7rem] text-slate-400 font-outfit select-none shrink-0">
        <div>© 2026 DANOS APARENTES</div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setTermsTab('terms'); setTermsOpen(true) }} 
            className="text-slate-400 hover:text-slate-200 transition-colors bg-transparent border-0 cursor-pointer p-0 text-[0.7rem] font-bold"
          >
            Termos de Uso
          </button>
          <span>•</span>
          <button 
            onClick={() => { setTermsTab('privacy'); setTermsOpen(true) }} 
            className="text-slate-400 hover:text-slate-200 transition-colors bg-transparent border-0 cursor-pointer p-0 text-[0.7rem] font-bold"
          >
            Política de Privacidade
          </button>
        </div>
      </footer>

      <TermsModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        defaultTab={termsTab}
      />
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
    </DirectionalTransition>
  )
}

