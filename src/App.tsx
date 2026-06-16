import { useState, useEffect, useCallback } from 'react'
import { VehicleType, ViewType, VehicleInfo, Damage, DamageType } from './types'
import { useDamages } from './hooks/useDamages'
import { useTts } from './hooks/useTts'
import { useSavedReports } from './hooks/useSavedReports'
import { useAuth } from './hooks/useAuth'
import { useSubscription } from './hooks/useSubscription'
import { useSyncStatus } from './lib/sync'
import { supabaseEnabled } from './lib/supabase'
import Header from './components/Header'
import Paywall from './components/Paywall'
import VehicleSelector, { VehicleIconSvg } from './components/VehicleSelector'
import ViewSelector from './components/ViewSelector'
import VehicleViewer from './components/VehicleViewer'
import DamageList from './components/DamageList'
import VehicleInfoForm from './components/VehicleInfoForm'
import TtsSettings from './components/TtsSettings'
import ReportActions from './components/ReportActions'
import SavedReportsModal from './components/SavedReportsModal'
import Login from './pages/Login'

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
  profile: '', ref: '', color: '', vehicleTypeDesc: '', city: '', state: '', customFields: []
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(0,170,255,0.3)',
      borderRadius: 12, padding: '12px 24px', zIndex: 99999,
      color: '#e8f4ff', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.9rem',
      boxShadow: '0 0 30px rgba(0,170,255,0.2)', pointerEvents: 'none',
    }}>{msg}</div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: 24,
  padding: '24px',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  boxShadow: 'var(--glass-shadow)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
}

const cardTopLine: React.CSSProperties = {
  position: 'absolute',
  top: 0, left: 0, right: 0,
  height: 1,
  background: 'linear-gradient(90deg, transparent, rgba(0,170,255,0.4), transparent)',
  pointerEvents: 'none',
}

export default function App() {
  const { session, loading: authLoading, signIn, signUp, signOut, resetPassword } = useAuth()
  const [vehicleType, setVehicleType] = useState<VehicleType>('car')
  const [viewType, setViewType] = useState<ViewType>('lateral-left')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') !== 'false')
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>(EMPTY_INFO)
  const [savedModal, setSavedModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [formCollapsed, setFormCollapsed] = useState(false)

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

  const viewDamages = damages.filter(d => d.vehicle === vehicleType && d.view === viewType)
  const allVehicleDamages = damages.filter(d => d.vehicle === vehicleType)

  function showToast(msg: string) { setToast(msg) }

  function handleAddDamage(partId: string, partName: string, type: DamageType, typeName: string) {
    const newDamage: Damage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      vehicle: vehicleType,
      view: viewType,
      partId, partName, type, typeName,
      severity: 'low', notes: '', photos: [], photoNotes: [],
    }
    addDamage(newDamage)
  }

  function handleRemoveDamageFromPart(partId: string) {
    const dmg = viewDamages.find(d => d.partId === partId)
    if (dmg) removeDamage(dmg.id)
  }

  const handleSave = useCallback(async () => {
    await saveReport(vehicleInfo, damages)
    showToast('✅ Vistoria salva!')
  }, [vehicleInfo, damages, saveReport])

  const handleManageSubscription = useCallback(async () => {
    try {
      await openPortal()
    } catch (err) {
      showToast(err instanceof Error ? `❌ ${err.message}` : '❌ Não foi possível abrir o portal de gerenciamento')
    }
  }, [openPortal])

  function handleLoad(r: { vehicleInfo: VehicleInfo; damages: Damage[] }) {
    setVehicleInfo(r.vehicleInfo)
    clearDamages()
    r.damages.forEach(d => addDamage(d))
    setSavedModal(false)
    showToast('📂 Vistoria carregada!')
  }

  function handleClearAll() {
    setVehicleInfo(EMPTY_INFO)
    clearDamages()
    showToast('🧽 Dados limpos!')
  }

  function handleTtsTest() {
    speak('Teste de voz do sistema de vistoria veicular')
  }

  const VEHICLE_NAME: Record<VehicleType, string> = {
    car: 'Automóvel', moto: 'Moto', truck: 'Caminhão', van: 'Utilitário', bus: 'Ônibus', custom: 'Genérico'
  }
  const VIEW_NAME: Record<ViewType, string> = {
    'lateral-left': 'Lateral Esquerda', 'lateral-right': 'Lateral Direita',
    frontal: 'Frontal', traseira: 'Traseira'
  }

  if (supabaseEnabled && authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
        Carregando...
      </div>
    )
  }

  if (supabaseEnabled && !session) {
    return <Login onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />
  }

  if (supabaseEnabled && session && subLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
        Carregando...
      </div>
    )
  }

  if (supabaseEnabled && session && subscription && !subscription.hasAccess) {
    return <Paywall status={subscription.status} onSubscribe={startCheckout} onSignOut={signOut} />
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Outfit,sans-serif',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: 48,
    }}>
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onOpenSaved={() => setSavedModal(true)}
        onSignOut={supabaseEnabled ? signOut : undefined}
        syncStatus={supabaseEnabled ? syncStatus : undefined}
        subscription={supabaseEnabled && subscription ? { status: subscription.status, trialDaysLeft: subscription.trialDaysLeft } : undefined}
        onManageSubscription={handleManageSubscription}
      />

      <main style={{ width: '100%', maxWidth: 1250, padding: '0 15px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Dados da Vistoria — full width */}
        <div style={{ ...cardStyle }}>
          <div style={cardTopLine} />
          <VehicleInfoForm
            info={vehicleInfo}
            onChange={setVehicleInfo}
            collapsed={formCollapsed}
            onToggleCollapse={() => setFormCollapsed(c => !c)}
            onVehicleTypeDetected={(type) => setVehicleType(type)}
          />
          {/* Footer actions - only visible when not collapsed */}
          {!formCollapsed && (
            <div style={{
              display: 'flex', gap: 10, marginTop: 14, paddingTop: 12,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setSavedModal(true)} style={{
                  fontSize: '0.82rem', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                  border: '1px solid rgba(234,179,8,0.35)', background: 'rgba(234,179,8,0.12)', color: '#eab308',
                  fontFamily: 'Outfit,sans-serif'
                }}>📦 Vistorias Salvas</button>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleClearAll} style={{
                  fontSize: '0.82rem', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                  border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                  fontFamily: 'Outfit,sans-serif', display: 'inline-flex', alignItems: 'center', gap: 7
                }}><ClearAllIcon /> Limpar Tudo</button>
              </div>
            </div>
          )}
        </div>

        {/* Controls: vehicle selector + view selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '100%' }}>
            <VehicleSelector current={vehicleType} onChange={setVehicleType} />
          </div>
          <ViewSelector current={viewType} onChange={setViewType} />
        </div>

        {/* Main grid: 1.45fr | 1fr */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.45fr) minmax(0,1fr)',
          gap: 24,
          alignItems: 'start',
        }} className="main-grid">

          {/* Left card: SVG Viewer + TTS */}
          <div style={{ ...cardStyle }}>
            <div style={cardTopLine} />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 18, paddingBottom: 14,
              borderBottom: '1px solid rgba(0,170,255,0.1)',
              fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <VehicleIconSvg type={vehicleType} size={34} />
                <span>{VEHICLE_NAME[vehicleType]} — {VIEW_NAME[viewType]}</span>
              </div>
            </div>
            <VehicleViewer
              vehicleType={vehicleType}
              viewType={viewType}
              damages={viewDamages}
              onAddDamage={handleAddDamage}
              onRemoveDamageFromPart={handleRemoveDamageFromPart}
              speak={speak}
              speakHover={speakHover}
            />
            {/* TTS Settings */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <TtsSettings config={ttsConfig} onChange={setTtsConfig} onTest={handleTtsTest} voices={voices} />
            </div>
          </div>

          {/* Right card: Damage list + Export */}
          <div style={{ ...cardStyle }}>
            <div style={cardTopLine} />
            {/* Damage list title */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 14, paddingBottom: 14,
              borderBottom: '1px solid rgba(0,170,255,0.1)',
              fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.9 122.88" width="20" height="20" style={{ flexShrink: 0, fill: 'currentColor' }}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M26.6,66.95c0.67-0.68,1.76-0.69,2.44-0.01c0.68,0.68,0.68,1.78,0.01,2.47l-2.95,2.99l2.95,2.99 c0.67,0.68,0.66,1.77-0.02,2.45c-0.68,0.68-1.77,0.67-2.43,0l-2.93-2.97l-2.94,2.98c-0.67,0.68-1.77,0.69-2.44,0.01 c-0.68-0.68-0.68-1.78-0.01-2.47l2.95-2.99l-2.95-2.99c-0.67-0.68-0.66-1.77,0.02-2.45c0.68-0.68,1.77-0.67,2.43,0l2.93,2.97 L26.6,66.95L26.6,66.95z M37.06,5.04v5c0,1.29-1.03,2.41-2.28,2.5c-0.27,0.09-0.58,0.13-0.89,0.13H24.6v10.35 c15.56,0,31.13,0,46.69,0V12.68h-9.28c-0.31,0-0.63-0.04-0.89-0.13c-1.25-0.09-2.28-1.21-2.28-2.5v-5 C51.58,5.04,44.32,5.04,37.06,5.04L37.06,5.04z M5.62,122.88c-1.52,0-2.95-0.62-3.97-1.65C0.62,120.2,0,118.82,0,117.26V19.86c0-1.56,0.62-2.95,1.65-3.97 c1.03-1.03,2.41-1.65,3.97-1.65h13.98v-2.77c0-1.03,0.4-1.96,1.12-2.68c0.67-0.67,1.61-1.12,2.68-1.12h8.66V4.2 c0-1.16,0.49-2.19,1.25-2.95C34.07,0.49,35.09,0,36.25,0c7.8,0,15.59,0,23.39,0c1.16,0,2.19,0.49,2.95,1.25 c0.76,0.76,1.25,1.79,1.25,2.95v3.48h8.66c1.07,0,2.01,0.45,2.68,1.12c0.71,0.71,1.12,1.65,1.12,2.68v2.77h13.98 c1.56,0,2.95,0.62,3.97,1.65c1.03,1.03,1.65,2.41,1.65,3.97v97.39c0,1.56-0.62,2.95-1.65,3.97c-1.03,1.03-2.46,1.65-3.97,1.65 C61.62,122.88,34.28,122.88,5.62,122.88L5.62,122.88z"/>
                </svg>
                <span>Avarias Registradas (<span style={{ color: allVehicleDamages.length > 0 ? '#ef4444' : 'inherit' }}>{allVehicleDamages.length}</span>)</span>
              </div>
              {allVehicleDamages.length > 0 && (
                <button onClick={() => { clearDamages(); showToast('🧽 Avarias limpas!') }} style={{
                  background: 'none', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                  padding: '4px 10px', color: '#ef4444', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Outfit,sans-serif',
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}><ClearAllIcon size={12} /> Limpar tudo</button>
              )}
            </div>

            <DamageList damages={allVehicleDamages} onRemove={removeDamage} onUpdate={updateDamage} />

            {/* Report Actions */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <ReportActions vehicleType={vehicleType} vehicleInfo={vehicleInfo} damages={allVehicleDamages} onToast={showToast} />
            </div>
          </div>
        </div>
      </main>

      <SavedReportsModal
        isOpen={savedModal}
        saved={saved}
        onClose={() => setSavedModal(false)}
        onSave={handleSave}
        onLoad={handleLoad}
        onDelete={deleteReport}
      />

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
