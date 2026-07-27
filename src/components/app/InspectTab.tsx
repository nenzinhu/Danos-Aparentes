'use client';
import React, { Suspense, useState, useCallback } from 'react'
import { VehicleType, ViewType, VehicleInfo, Damage, DamageType, Severity } from '@/src/types'
import VehicleSelector, { VehicleIconSvg } from '@/src/components/VehicleSelector'
import ViewSelector from '@/src/components/ViewSelector'
import { VehicleViewer } from '@/src/components/VehicleViewer'
import ErrorBoundary from '@/src/components/ErrorBoundary'
import DamageList from '@/src/components/DamageList'
import VehicleInfoForm from '@/src/components/VehicleInfoForm'
import FinalizePanel from '@/src/components/FinalizePanel'
import TtsSettings from '@/src/components/TtsSettings'
import ReportActions from '@/src/components/ReportActions'
import InspectionReviewPanel from '@/src/components/InspectionReviewPanel'
import { TtsConfig } from '@/src/types'
import { ClearAllIcon } from './ClearAllIcon'
import { VEHICLE_NAME, VIEW_NAME } from './constants'
import type { PreviousReportSummary } from '@/src/lib/reportComparison'

import { IconDocument, IconCar, IconSignature, IconFolder } from '@/src/components/ui/AnimatedIcons'

type InspectSection = 'dados' | 'diagrama' | 'finalizar'

const INSPECT_SECTIONS: { id: InspectSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dados', label: '1. Dados', icon: <IconDocument size={14} /> },
  { id: 'diagrama', label: '2. Diagrama', icon: <IconCar size={14} /> },
  { id: 'finalizar', label: '3. Laudo', icon: <IconSignature size={14} /> },
]

function sectionTabClass(active: boolean) {
  return `px-3 sm:px-5 py-2 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer border ${
    active
      ? 'theme-tab-active bg-sky-500/10 border-sky-500/25 text-sky-400 shadow-md'
      : 'theme-tab-idle text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent'
  }`
}

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
  accessToken?: string
  onVehicleTypeChange: (type: VehicleType) => void
  onViewTypeChange: (view: ViewType) => void
  onVehicleInfoChange: (info: VehicleInfo) => void
  onToggleFormCollapse: () => void
  onWizardComplete: () => void
  onSaveDraft?: () => void
  onOpenSaved: () => void
  onClearAll: () => void
  onClearDamages: () => void
  onAddDamage: (partId: string, partName: string, type: DamageType, typeName: string, photoFile?: File) => void
  onAddDamageDetailed?: (partId: string, partName: string, type: DamageType, typeName: string, severity: Severity, notes: string, photoFile?: File) => void
  onRemoveDamageFromPart: (partId: string) => void
  onRemoveDamage: (id: string) => void
  onUpdateDamage: (id: string, patch: Partial<Damage>) => void
  onTtsConfigChange: (config: TtsConfig) => void
  onTtsTest: () => void
  speak: (text: string) => void
  speakHover: (text: string) => void
  onToast: (msg: string) => void
  inspectionId?: string | null
  publicCode?: string
  laudoVersion?: number
  correctionReason?: string
  supersedesHash?: string
  onIssued?: (hash: string) => void
  reviewedAt?: number
  reviewNotes?: string
  reviewContentStale?: boolean
  reviewBusy?: boolean
  onCompleteReview?: (notes: string) => void | Promise<void>
  onReopenReview?: () => void | Promise<void>
  isReviewed?: boolean
  onConfirmReview?: () => void | Promise<void>
  onClearReview?: () => void | Promise<void>
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
  accessToken,
  onVehicleTypeChange,
  onViewTypeChange,
  onVehicleInfoChange,
  onToggleFormCollapse,
  onWizardComplete,
  onSaveDraft,
  onOpenSaved,
  onClearAll,
  onClearDamages,
  onAddDamage,
  onAddDamageDetailed,
  onRemoveDamageFromPart,
  onRemoveDamage,
  onUpdateDamage,
  onTtsConfigChange,
  onTtsTest,
  speak,
  speakHover,
  onToast,
  inspectionId,
  publicCode,
  laudoVersion,
  correctionReason,
  supersedesHash,
  onIssued,
  reviewedAt,
  reviewNotes,
  reviewContentStale,
  reviewBusy,
  onCompleteReview,
  onReopenReview,
  isReviewed,
  onConfirmReview,
  onClearReview,
}: InspectTabProps) {
  const [section, setSection] = useState<InspectSection>('dados')

  const handleWizardComplete = useCallback(() => {
    onWizardComplete()
    setSection('diagrama')
  }, [onWizardComplete])

  return (
    <>
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Seções da vistoria"
          className="theme-tabs bg-[var(--card-bg-solid)] border border-[var(--card-border)] rounded-xl p-1 flex flex-wrap gap-1 justify-center shadow-inner backdrop-blur-md w-full max-w-2xl"
        >
          {INSPECT_SECTIONS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={section === id}
              onClick={() => setSection(id)}
              className={sectionTabClass(section === id)}
            >
              <span className="inline-flex items-center gap-1.5">{icon} {label}</span>
              {id === 'finalizar' && allVehicleDamages.length > 0 && (
                <span className="ml-1 text-red-400">({allVehicleDamages.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-[0.72rem] text-[var(--text-muted)] -mt-2">
        Cliente → Placa → Diagrama SVG → Avarias → Assinatura + GPS → PDF
      </p>

      {section === 'dados' && (
        <div className="glass-card p-6">
          <VehicleInfoForm
            info={vehicleInfo}
            onChange={onVehicleInfoChange}
            collapsed={formCollapsed}
            onToggleCollapse={onToggleFormCollapse}
            onVehicleTypeDetected={onVehicleTypeChange}
            resetToken={formResetToken}
            onWizardComplete={handleWizardComplete}
            onPlateConfirmed={onPlateConfirmed}
          />
          {previousReport && (
            <div className="mt-4 text-[0.8rem] px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-500">
              Encontramos uma vistoria anterior deste veículo, de{' '}
              <strong>{new Date(previousReport.updatedAt).toLocaleDateString('pt-BR')}</strong>.
              Avarias que não existiam nela aparecem marcadas como <strong>Nova</strong> na lista do laudo.
            </div>
          )}
          {!formCollapsed && (
            <div className="flex gap-4 mt-6 pt-4 border-t border-[var(--panel-border)] justify-between items-center flex-wrap">
              <div className="flex gap-2 flex-wrap">
                <button onClick={onOpenSaved} className="text-xs px-4 py-2 rounded-lg font-bold border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all inline-flex items-center gap-1.5">
                  <IconFolder size={14} className="text-sky-400" /> Vistorias Salvas
                </button>
                {onSaveDraft && (
                  <button
                    onClick={onSaveDraft}
                    className="text-xs px-4 py-2 rounded-lg font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all inline-flex items-center gap-1.5"
                    title="Salva cliente e veículo na nuvem para abrir no celular na hora da vistoria"
                  >
                    <IconDocument size={14} className="text-emerald-400" /> Salvar prévia
                  </button>
                )}
              </div>
              <button onClick={onClearAll} className="text-xs px-4 py-2 rounded-lg font-bold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 inline-flex items-center gap-2 transition-all">
                <ClearAllIcon /> Limpar Tudo
              </button>
            </div>
          )}
          {onSaveDraft && !formCollapsed && (
            <p className="mt-3 text-[0.72rem] text-[var(--text-muted)] leading-relaxed">
              A prévia (dados do cliente e do veículo) costuma ser feita no computador. Salve aqui e abra no celular na hora de marcar as avarias no diagrama.
            </p>
          )}
        </div>
      )}

      {section === 'diagrama' && (
        <>
          <div className="flex flex-col gap-4 items-center">
            <div className="w-full">
              <VehicleSelector current={vehicleType} onChange={onVehicleTypeChange} />
            </div>
            <ViewSelector current={viewType} onChange={onViewTypeChange} visited={visitedViews} />
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--panel-border)]">
              <div className="flex items-center gap-3">
                <VehicleIconSvg type={vehicleType} size={32} />
                <span className="font-bold text-lg">{VEHICLE_NAME[vehicleType]} — {VIEW_NAME[viewType]}</span>
              </div>
              <button
                type="button"
                onClick={() => setSection('finalizar')}
                className="text-xs px-3 py-1.5 rounded-lg font-bold border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all"
              >
                Revisar laudo →
              </button>
            </div>
            <VehicleViewer.Root
              vehicleType={vehicleType}
              viewType={viewType}
              damages={viewDamages}
              onAddDamage={onAddDamage}
              onAddDamageDetailed={onAddDamageDetailed}
              onRemoveDamageFromPart={onRemoveDamageFromPart}
              speak={speak}
              speakHover={speakHover}
              onViewTypeChange={onViewTypeChange}
              accessToken={accessToken}
            >
              <VehicleViewer.Controls />
              <ErrorBoundary>
                <Suspense fallback={<div className="flex-1 flex items-center justify-center text-sky-500/50 italic text-xs animate-pulse min-h-[220px]">Carregando visualizador…</div>}>
                  <VehicleViewer.Viewport />
                </Suspense>
              </ErrorBoundary>
              <VehicleViewer.FloatingDamage />
              <VehicleViewer.FullscreenOverlay />
              <div className="mt-1.5 text-[0.72rem] text-[var(--text-muted)] text-center">
                Clique em uma peça para registrar avaria • Arraste para girar • Scroll ou pinch para zoom
              </div>
            </VehicleViewer.Root>
            <div className="mt-8 pt-6 border-t border-[var(--panel-border)]">
              <TtsSettings config={ttsConfig} onChange={onTtsConfigChange} onTest={onTtsTest} voices={voices} />
            </div>
          </div>
        </>
      )}

      {section === 'finalizar' && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--panel-border)]">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">
                Avarias (<span className={allVehicleDamages.length > 0 ? 'text-red-500' : ''}>{allVehicleDamages.length}</span>)
              </span>
            </div>
            {allVehicleDamages.length > 0 && (
              <button onClick={onClearDamages} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-red-500/20 text-red-500 hover:bg-red-500/10 inline-flex items-center gap-2">
                <ClearAllIcon size={12} /> Limpar
              </button>
            )}
          </div>

          {allVehicleDamages.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] mb-6 px-3 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
              Nenhuma avaria registrada. Você pode assinar e gerar o PDF mesmo assim (veículo sem danos aparentes).
            </p>
          ) : (
            <DamageList damages={allVehicleDamages} onRemove={onRemoveDamage} onUpdate={onUpdateDamage} previousReport={previousReport} onToast={onToast} />
          )}

          <div className="mt-6 pt-6 border-t border-[var(--panel-border)]">
            <h3 className="font-extrabold text-[0.95rem] mb-3">Assinaturas e GPS</h3>
            <p className="text-[0.75rem] text-[var(--text-muted)] mb-4 leading-relaxed">
              Depois de revisar as avarias (ou a ausência delas), capture o GPS do local e colete as assinaturas. Em seguida gere o PDF.
            </p>
            <FinalizePanel info={vehicleInfo} onChange={onVehicleInfoChange} />
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--panel-border)]">
            {onCompleteReview && onReopenReview && (
              <InspectionReviewPanel
                reviewedAt={reviewedAt}
                reviewNotes={reviewNotes}
                contentStale={reviewContentStale}
                busy={reviewBusy}
                onCompleteReview={onCompleteReview}
                onReopenReview={onReopenReview}
              />
            )}
            <ReportActions
              vehicleType={vehicleType}
              vehicleInfo={vehicleInfo}
              damages={allVehicleDamages}
              onToast={onToast}
              hasAccess={hasAccess}
              accessToken={accessToken}
              inspectionId={inspectionId}
              publicCode={publicCode}
              laudoVersion={laudoVersion}
              correctionReason={correctionReason}
              supersedesHash={supersedesHash}
              onIssued={onIssued}
              reviewedAt={reviewedAt}
              isReviewed={isReviewed}
              onConfirmReview={onConfirmReview}
              onClearReview={onClearReview}
            />
          </div>
        </div>
      )}
    </>
  )
}
