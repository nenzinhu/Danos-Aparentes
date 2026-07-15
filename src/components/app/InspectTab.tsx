'use client';
import React, { Suspense } from 'react'
import { VehicleType, ViewType, VehicleInfo, Damage, DamageType, Severity } from '@/src/types'
import VehicleSelector, { VehicleIconSvg } from '@/src/components/VehicleSelector'
import ViewSelector from '@/src/components/ViewSelector'
import { VehicleViewer } from '@/src/components/VehicleViewer'
import DamageList from '@/src/components/DamageList'
import PhotoDamageImport from '@/src/components/PhotoDamageImport'
import VehicleInfoForm from '@/src/components/VehicleInfoForm'
import TtsSettings from '@/src/components/TtsSettings'
import ReportActions from '@/src/components/ReportActions'
import { TtsConfig } from '@/src/types'
import { ClearAllIcon } from './ClearAllIcon'
import { VEHICLE_NAME, VIEW_NAME } from './constants'
import type { PreviousReportSummary } from '@/src/lib/reportComparison'

interface InspectTabProps {
  vehicleType: VehicleType
  viewType: ViewType
  vehicleInfo: VehicleInfo
  formCollapsed: boolean
  formResetToken: number
  viewDamages: Damage[]
  allVehicleDamages: Damage[]
  visitedViews?: ViewType[]
  previousReport?: PreviousReportSummary | null
  onPlateConfirmed?: (plate: string) => void
  ttsConfig: TtsConfig
  voices: SpeechSynthesisVoice[]
  hasAccess: boolean
  onVehicleTypeChange: (type: VehicleType) => void
  onViewTypeChange: (view: ViewType) => void
  onVehicleInfoChange: (info: VehicleInfo) => void
  onToggleFormCollapse: () => void
  onWizardComplete: () => void
  onOpenSaved: () => void
  onClearAll: () => void
  onClearDamages: () => void
  onAddDamage: (partId: string, partName: string, type: DamageType, typeName: string, photoFile?: File) => void
  onAddDamageFromPhoto: (payload: {
    partId: string
    partName: string
    view: ViewType
    type: DamageType
    typeName: string
    severity: Severity
    notes: string
    photoFile: File
  }) => void
  onRemoveDamageFromPart: (partId: string) => void
  onRemoveDamage: (id: string) => void
  onUpdateDamage: (id: string, patch: Partial<Damage>) => void
  onTtsConfigChange: (config: TtsConfig) => void
  onTtsTest: () => void
  speak: (text: string) => void
  speakHover: (text: string) => void
  onToast: (msg: string) => void
  accessToken?: string
}

export default function InspectTab({
  vehicleType,
  viewType,
  vehicleInfo,
  formCollapsed,
  formResetToken,
  viewDamages,
  allVehicleDamages,
  visitedViews,
  previousReport,
  onPlateConfirmed,
  ttsConfig,
  voices,
  hasAccess,
  onVehicleTypeChange,
  onViewTypeChange,
  onVehicleInfoChange,
  onToggleFormCollapse,
  onWizardComplete,
  onOpenSaved,
  onClearAll,
  onClearDamages,
  onAddDamage,
  onAddDamageFromPhoto,
  onRemoveDamageFromPart,
  onRemoveDamage,
  onUpdateDamage,
  onTtsConfigChange,
  onTtsTest,
  speak,
  speakHover,
  onToast,
  accessToken,
}: InspectTabProps) {
  return (
    <>
      <div className="glass-card p-6">
        <VehicleInfoForm
          info={vehicleInfo}
          onChange={onVehicleInfoChange}
          collapsed={formCollapsed}
          onToggleCollapse={onToggleFormCollapse}
          onVehicleTypeDetected={onVehicleTypeChange}
          resetToken={formResetToken}
          onWizardComplete={onWizardComplete}
          onPlateConfirmed={onPlateConfirmed}
        />
        {previousReport && (
          <div className="mt-4 text-[0.8rem] px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-500">
            Encontramos uma vistoria anterior deste veículo, de{' '}
            <strong>{new Date(previousReport.updatedAt).toLocaleDateString('pt-BR')}</strong>.
            Avarias que não existiam nela aparecem marcadas como <strong>Nova</strong> na lista abaixo.
          </div>
        )}
        {!formCollapsed && (
          <div className="flex gap-4 mt-6 pt-4 border-t border-[var(--panel-border)] justify-between items-center flex-wrap">
            <button onClick={onOpenSaved} className="text-xs px-4 py-2 rounded-lg font-bold border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all">
              📦 Vistorias Salvas
            </button>
            <button onClick={onClearAll} className="text-xs px-4 py-2 rounded-lg font-bold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 inline-flex items-center gap-2 transition-all">
              <ClearAllIcon /> Limpar Tudo
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 items-center">
        <div className="w-full">
          <VehicleSelector current={vehicleType} onChange={onVehicleTypeChange} />
        </div>
        <ViewSelector current={viewType} onChange={onViewTypeChange} visited={visitedViews} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6 items-start">
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
            onAddDamage={onAddDamage}
            onRemoveDamageFromPart={onRemoveDamageFromPart}
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
              Clique em uma peça ou use Foto → diagrama • Scroll/pinch para zoom
            </div>
          </VehicleViewer.Root>
          <div className="mt-8 pt-6 border-t border-[var(--panel-border)]">
            <TtsSettings config={ttsConfig} onChange={onTtsConfigChange} onTest={onTtsTest} voices={voices} />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--panel-border)]">
            <div className="flex items-center gap-3">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.9 122.88" width="18" height="18" className="fill-current text-primary">
                <path fillRule="evenodd" clipRule="evenodd" d="M26.6,66.95c0.67-0.68,1.76-0.69,2.44-0.01c0.68,0.68,0.68,1.78,0.01,2.47l-2.95,2.99l2.95,2.99 c0.67,0.68,0.66,1.77-0.02,2.45c-0.68,0.68-1.77,0.67-2.43,0l-2.93-2.97l-2.94,2.98c-0.67,0.68-1.77,0.69-2.44,0.01 c-0.68-0.68-0.68-1.78-0.01-2.47l2.95-2.99l-2.95-2.99c-0.67-0.68-0.66-1.77,0.02-2.45c0.68-0.68,1.77-0.67,2.43,0l2.93,2.97 L26.6,66.95L26.6,66.95z M37.06,5.04v5c0,1.29-1.03,2.41-2.28,2.5c-0.27,0.09-0.58,0.13-0.89,0.13H24.6v10.35 c15.56,0,31.13,0,46.69,0V12.68h-9.28c-0.31,0-0.63-0.04-0.89-0.13c-1.25-0.09-2.28-1.21-2.28-2.5v-5 C51.58,5.04,44.32,5.04,37.06,5.04L37.06,5.04z M5.62,122.88c-1.52,0-2.95-0.62-3.97-1.65C0.62,120.2,0,118.82,0,117.26V19.86c0-1.56,0.62-2.95,1.65-3.97 c1.03-1.03,2.41-1.65,3.97-1.65h13.98v-2.77c0-1.03,0.4-1.96,1.12-2.68c0.67-0.67,1.61-1.12,2.68-1.12h8.66V4.2 c0-1.16,0.49-2.19,1.25-2.95C34.07,0.49,35.09,0,36.25,0c7.8,0,15.59,0,23.39,0c1.16,0,2.19,0.49,2.95,1.25 c0.76,0.76,1.25,1.79,1.25,2.95v3.48h8.66c1.07,0,2.01,0.45,2.68,1.12c0.71,0.71,1.12,1.65,1.12,2.68v2.77h13.98 c1.56,0,2.95,0.62,3.97,1.65c1.03,1.03,1.65,2.41,1.65,3.97v97.39c0,1.56-0.62,2.95-1.65,3.97c-1.03,1.03-2.46,1.65-3.97,1.65 C61.62,122.88,34.28,122.88,5.62,122.88L5.62,122.88z"/>
              </svg>
              <span className="font-bold text-lg">Avarias (<span className={allVehicleDamages.length > 0 ? 'text-red-500' : ''}>{allVehicleDamages.length}</span>)</span>
            </div>
            {allVehicleDamages.length > 0 && (
              <button onClick={onClearDamages} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-red-500/20 text-red-500 hover:bg-red-500/10 inline-flex items-center gap-2">
                <ClearAllIcon size={12} /> Limpar
              </button>
            )}
          </div>

          <PhotoDamageImport
            vehicleType={vehicleType}
            accessToken={accessToken}
            disabled={!hasAccess && !!accessToken}
            onToast={onToast}
            onConfirm={onAddDamageFromPhoto}
            onViewChange={onViewTypeChange}
          />

          <DamageList damages={allVehicleDamages} onRemove={onRemoveDamage} onUpdate={onUpdateDamage} previousReport={previousReport} accessToken={accessToken} />

          <div className="mt-6 pt-6 border-t border-[var(--panel-border)]">
            <ReportActions
              vehicleType={vehicleType}
              vehicleInfo={vehicleInfo}
              damages={allVehicleDamages}
              onToast={onToast}
              hasAccess={hasAccess}
            />
          </div>
        </div>
      </div>
    </>
  )
}
