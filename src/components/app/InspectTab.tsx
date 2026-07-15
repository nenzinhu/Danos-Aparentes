'use client'

import React, { Suspense, useState } from 'react'
import { VehicleType, ViewType, VehicleInfo, Damage, DamageType, Severity, TtsConfig } from '@/src/types'
import VehicleSelector, { VehicleIconSvg } from '@/src/components/VehicleSelector'
import ViewSelector from '@/src/components/ViewSelector'
import { VehicleViewer } from '@/src/components/VehicleViewer'
import DamageList from '@/src/components/DamageList'
import PhotoDamageImport from '@/src/components/PhotoDamageImport'
import VehicleInfoForm from '@/src/components/VehicleInfoForm'
import TtsSettings from '@/src/components/TtsSettings'
import ReportActions from '@/src/components/ReportActions'
import { ClearAllIcon } from './ClearAllIcon'
import { VEHICLE_NAME, VIEW_NAME } from './constants'
import type { PreviousReportSummary } from '@/src/lib/reportComparison'

type InspectPanel = 'diagram' | 'damages' | 'data'

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

const PANEL_BTN =
  'flex-1 min-w-0 px-2 sm:px-4 py-2.5 rounded-lg text-[0.75rem] sm:text-xs font-bold font-outfit transition-all cursor-pointer'

export default function InspectTab({
  vehicleType,
  viewType,
  vehicleInfo,
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
  const [panel, setPanel] = useState<InspectPanel>('diagram')
  const damageCount = allVehicleDamages.length
  const hasPlate = Boolean(vehicleInfo.plate?.trim())

  function handleWizardComplete() {
    onWizardComplete()
    setPanel('diagram')
  }

  function handlePhotoConfirm(
    payload: Parameters<typeof onAddDamageFromPhoto>[0],
  ) {
    onAddDamageFromPhoto(payload)
    setPanel('diagram')
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Sub-abas sempre visíveis (sticky) */}
      <div className="sticky top-0 z-30 bg-[var(--bg-main)]/95 backdrop-blur-md pt-1 pb-2 -mx-1 px-1">
        <div
          role="tablist"
          aria-label="Seções da vistoria"
          className="bg-slate-900/90 border border-white/10 rounded-xl p-1 flex gap-1 shadow-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={panel === 'diagram'}
            onClick={() => setPanel('diagram')}
            className={`${PANEL_BTN} ${
              panel === 'diagram'
                ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            🚗 Diagrama
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={panel === 'damages'}
            onClick={() => setPanel('damages')}
            className={`${PANEL_BTN} ${
              panel === 'damages'
                ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            📋 Avarias
            {damageCount > 0 && (
              <span className="ml-1 inline-flex min-w-[1.1rem] justify-center rounded-md bg-red-500/25 px-1 text-red-300">
                {damageCount}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={panel === 'data'}
            onClick={() => setPanel('data')}
            className={`${PANEL_BTN} ${
              panel === 'data'
                ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300 shadow-md'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            📝 Dados
            {!hasPlate && (
              <span className="ml-1 text-amber-400" title="Preencha a placa">•</span>
            )}
          </button>
        </div>
      </div>

      {previousReport && panel !== 'data' && (
        <div className="text-[0.72rem] px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-500">
          Vistoria anterior em{' '}
          <strong>{new Date(previousReport.updatedAt).toLocaleDateString('pt-BR')}</strong>
          {' — '}avarias novas aparecem marcadas.
        </div>
      )}

      {panel === 'diagram' && (
        <div role="tabpanel" className="glass-card p-4 sm:p-5 flex flex-col gap-3">
          <VehicleSelector current={vehicleType} onChange={onVehicleTypeChange} />
          <ViewSelector current={viewType} onChange={onViewTypeChange} visited={visitedViews} />

          <div className="flex items-center gap-2">
            <VehicleIconSvg type={vehicleType} size={28} />
            <span className="font-bold text-base truncate">
              {VEHICLE_NAME[vehicleType]} — {VIEW_NAME[viewType]}
            </span>
            {damageCount > 0 && (
              <button
                type="button"
                onClick={() => setPanel('damages')}
                className="ml-auto text-[0.68rem] font-bold px-2 py-1 rounded-md border border-red-500/25 bg-red-500/10 text-red-400"
              >
                {damageCount} avaria{damageCount !== 1 ? 's' : ''}
              </button>
            )}
          </div>

          <div className="w-full min-h-[260px] sm:min-h-[320px] rounded-2xl bg-black/20 border border-white/5">
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
              <Suspense fallback={
                <div className="flex items-center justify-center text-sky-500/50 italic text-xs animate-pulse min-h-[260px] sm:min-h-[320px]">
                  Carregando visualizador…
                </div>
              }>
                <VehicleViewer.Viewport />
              </Suspense>
              <VehicleViewer.FloatingDamage />
              <VehicleViewer.FullscreenOverlay />
            </VehicleViewer.Root>
          </div>

          <p className="text-[0.72rem] text-[var(--text-muted)] text-center">
            Toque na peça para marcar avaria • aba Avarias para foto → IA
          </p>

          <details className="rounded-lg border border-[var(--panel-border)] bg-black/10 px-3 py-2">
            <summary className="cursor-pointer text-[0.75rem] font-bold text-[var(--text-muted)] select-none">
              🗣️ Voz / TTS
            </summary>
            <div className="pt-2 pb-1">
              <TtsSettings config={ttsConfig} onChange={onTtsConfigChange} onTest={onTtsTest} voices={voices} />
            </div>
          </details>
        </div>
      )}

      {panel === 'damages' && (
        <div role="tabpanel" className="glass-card p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-lg">Avarias ({damageCount})</span>
            {damageCount > 0 && (
              <button
                type="button"
                onClick={onClearDamages}
                className="text-xs px-2.5 py-1.5 rounded-lg font-bold border border-red-500/20 text-red-500 hover:bg-red-500/10 inline-flex items-center gap-1.5"
              >
                <ClearAllIcon size={12} /> Limpar
              </button>
            )}
          </div>

          <PhotoDamageImport
            vehicleType={vehicleType}
            accessToken={accessToken}
            disabled={!hasAccess && !!accessToken}
            onToast={onToast}
            onConfirm={handlePhotoConfirm}
            onViewChange={onViewTypeChange}
          />

          <DamageList
            damages={allVehicleDamages}
            onRemove={onRemoveDamage}
            onUpdate={onUpdateDamage}
            previousReport={previousReport}
            accessToken={accessToken}
          />

          <div className="pt-3 border-t border-[var(--panel-border)]">
            <ReportActions
              vehicleType={vehicleType}
              vehicleInfo={vehicleInfo}
              damages={allVehicleDamages}
              onToast={onToast}
              hasAccess={hasAccess}
            />
          </div>
        </div>
      )}

      {panel === 'data' && (
        <div role="tabpanel" className="glass-card p-4 sm:p-5 flex flex-col gap-4">
          <VehicleInfoForm
            info={vehicleInfo}
            onChange={onVehicleInfoChange}
            collapsed={false}
            onToggleCollapse={() => {}}
            onVehicleTypeDetected={onVehicleTypeChange}
            resetToken={formResetToken}
            onWizardComplete={handleWizardComplete}
            onPlateConfirmed={onPlateConfirmed}
          />

          {previousReport && (
            <div className="text-[0.8rem] px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-500">
              Encontramos uma vistoria anterior deste veículo, de{' '}
              <strong>{new Date(previousReport.updatedAt).toLocaleDateString('pt-BR')}</strong>.
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-[var(--panel-border)] justify-between items-center flex-wrap">
            <button
              type="button"
              onClick={onOpenSaved}
              className="text-xs px-4 py-2 rounded-lg font-bold border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all"
            >
              📦 Vistorias Salvas
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs px-4 py-2 rounded-lg font-bold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 inline-flex items-center gap-2 transition-all"
            >
              <ClearAllIcon /> Limpar Tudo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
