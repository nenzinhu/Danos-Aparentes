'use client';
import React, { Suspense, useState, useCallback, useMemo, useEffect } from 'react'
import { VehicleType, ViewType, VehicleInfo, Damage, DamageType, Severity, InspectionPurpose, SavedReport } from '@/src/types'
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
import InspectionAuditTimeline from '@/src/components/InspectionAuditTimeline'
import { useTenantContext } from '@/src/hooks/useTenantContext'
import { canReviewReport } from '@/src/lib/auth/rbac'
import { TtsConfig } from '@/src/types'
import { ClearAllIcon } from './ClearAllIcon'
import RetornoLookupPanel from './RetornoLookupPanel'
import NewDamagesAlert from './NewDamagesAlert'
import NewDamagesInspectorConfirm from './NewDamagesInspectorConfirm'
import ViewPhotosCapture from './ViewPhotosCapture'
import { VEHICLE_NAME, VIEW_NAME } from './constants'
import { isNewDamage, type PreviousReportSummary } from '@/src/lib/reportComparison'
import { useClients } from '@/src/hooks/useClients'
import { hasAllViewPhotos } from '@/src/lib/viewPhotos'
import type { LiveComparePreview } from '@/src/lib/vehicleEvidence/liveCompare'
import { buildCompareHref } from '@/src/lib/vehicleEvidence/compareDeepLink'
import type { RetornoLookupKind } from '@/src/lib/inspectionPurpose'
import Link from 'next/link'
import FirstInspectionOnboarding from './FirstInspectionOnboarding'

import { EntradaIcon, SaidaIcon } from '@/src/components/OperationTypeIcons'
import { IconDocument, IconCar, IconSignature, IconFolder, IconCamera, IconSync } from '@/src/components/ui/AnimatedIcons'
import Button, { ButtonGroup } from '@/src/components/ui/Button'
import { buttonVariants } from '@/src/components/ui/buttonVariants'
import DamageTextGenerator from './DamageTextGenerator'

type InspectSection = 'dados' | 'diagrama' | 'analise' | 'historico' | 'finalizar'

const INSPECT_SECTIONS: {
  id: InspectSection
  label: string
  short: string
  icon: React.ReactNode
}[] = [
  { id: 'dados', label: 'Identificação', short: 'ID', icon: <IconDocument size={14} /> },
  { id: 'diagrama', label: 'Evidências', short: 'Evid.', icon: <IconCar size={14} /> },
  { id: 'analise', label: 'Análise', short: 'Análise', icon: <IconCamera size={14} /> },
  { id: 'historico', label: 'Histórico', short: 'Hist.', icon: <IconSync size={14} /> },
  { id: 'finalizar', label: 'Dossiê', short: 'Dossiê', icon: <IconSignature size={14} /> },
]

const SECTION_ORDER: InspectSection[] = ['dados', 'diagrama', 'analise', 'historico', 'finalizar']

function sectionHint(purpose: InspectionPurpose | undefined, section: InspectSection): string {
  if (section === 'dados') {
    return purpose === 'retorno'
      ? 'Identifique a inspeção, o veículo e o responsável.'
      : 'Identificação da vistoria, do veículo e do responsável.'
  }
  if (section === 'diagrama') {
    return 'Localize o dano no veículo, anexe a evidência (foto + descrição) e registre o contexto.'
  }
  if (section === 'analise') {
    return 'Gere o laudo textual das avarias a partir das 4 fotos.'
  }
  if (section === 'historico') {
    return 'Veja inspeções anteriores, evolução e comparação de registros.'
  }
  return 'Resumo consolidado, assinaturas, revisão e dossiê técnico.'
}

function StepProgress({
  current,
  onSelect,
}: {
  current: InspectSection
  onSelect: (id: InspectSection) => void
}) {
  const idx = SECTION_ORDER.indexOf(current)
  return (
    <div className="ds-step-rail mb-1" aria-hidden="true">
      {SECTION_ORDER.map((id, i) => (
        <React.Fragment key={id}>
          {i > 0 && (
            <div className={`ds-step-line ${i <= idx ? 'ds-step-line-done' : ''}`} />
          )}
          <button
            type="button"
            onClick={() => onSelect(id)}
            title={INSPECT_SECTIONS[i].label}
            className={`ds-step-dot ${i < idx ? 'ds-step-dot-done' : i === idx ? 'ds-step-dot-active' : 'ds-step-dot-idle'}`}
          >
            {i < idx ? '✓' : i + 1}
          </button>
        </React.Fragment>
      ))}
    </div>
  )
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
  liveCompare?: LiveComparePreview | null
  onPlateConfirmed?: (plate: string) => void
  ttsConfig: TtsConfig
  voices: SpeechSynthesisVoice[]
  hasAccess: boolean
  accessToken?: string
  userId?: string
  /** Nome/e-mail para auditoria de confirmação (não use UUID). */
  decidedByName?: string
  onVehicleTypeChange: (type: VehicleType) => void
  onViewTypeChange: (view: ViewType) => void
  onVehicleInfoChange: (info: VehicleInfo) => void
  onToggleFormCollapse: () => void
  onWizardComplete: () => void
  onSaveDraft?: () => void
  onOpenSaved: () => void
  onClearAll: () => void
  onClearDamages: () => void
  inspectionPurpose?: InspectionPurpose
  previousSavedReport?: SavedReport | null
  onSelectPurpose?: (purpose: InspectionPurpose) => void
  onLookupRetorno?: (kind: RetornoLookupKind, value: string) => void | Promise<void>
  onClearRetornoBaseline?: () => void
  onAddDamage: (partId: string, partName: string, type: DamageType, typeName: string, photoFile?: File) => void
  onAddDamageDetailed?: (
    partId: string,
    partName: string,
    type: DamageType,
    typeName: string,
    severity: Severity,
    notes: string,
    photoFile?: File,
    evidence?: Pick<Damage, 'evidenceStatus' | 'evidenceDecidedBy' | 'evidenceDecidedAt' | 'aiDecisionId'>,
  ) => void
  onAddDamageRecord?: (damage: Damage) => void
  onRemoveDamageFromPart: (partId: string) => void
  onRemoveDamage: (id: string) => void
  onUpdateDamage: (id: string, patch: Partial<Damage>) => void
  onTtsConfigChange: (config: TtsConfig) => void
  onTtsTest: () => void
  speak: (text: string) => void
  speakHover: (text: string) => void
  onToast: (msg: string) => void
  inspectionId?: string | null
  vehicleId?: string | null
  publicCode?: string
  /** Garante que a inspeção existe no banco (salva a prévia) e retorna o id. */
  onEnsureInspectionId?: () => Promise<string | null>
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
  /** Guia de ativação (1ª inspeção). */
  showActivationOnboarding?: boolean
  savedReportCount?: number
  onHideActivationOnboarding?: () => void
  /** Volta para o Início (Dashboard) após emitir o PDF com sucesso. */
  onReturnHome?: () => void
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
  liveCompare,
  onPlateConfirmed,
  ttsConfig,
  voices,
  hasAccess,
  accessToken,
  userId,
  decidedByName,
  onVehicleTypeChange,
  onViewTypeChange,
  onVehicleInfoChange,
  onToggleFormCollapse,
  onWizardComplete,
  onSaveDraft,
  onOpenSaved,
  onClearAll,
  onClearDamages,
  inspectionPurpose = 'entrada',
  previousSavedReport = null,
  onSelectPurpose,
  onLookupRetorno,
  onClearRetornoBaseline,
  onAddDamage,
  onAddDamageDetailed,
  onAddDamageRecord,
  onRemoveDamageFromPart,
  onRemoveDamage,
  onUpdateDamage,
  onTtsConfigChange,
  onTtsTest,
  speak,
  speakHover,
  onToast,
  inspectionId,
  vehicleId,
  publicCode,
  onEnsureInspectionId,
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
  showActivationOnboarding = false,
  savedReportCount = 0,
  onHideActivationOnboarding,
  onReturnHome,
}: InspectTabProps) {
  const [section, setSection] = useState<InspectSection>('dados')
  const { role } = useTenantContext(userId)
  // Solo revisa o próprio laudo; owner revisa qualquer (rbac). Sem ownerId no SavedReport local.
  const mayReview = userId ? canReviewReport(role, userId, userId) : true
  const evidenceActorLabel = decidedByName || vehicleInfo.owner || undefined

  const clients = useClients(userId)
  const handleSaveClient = useCallback(async () => {
    const rec = await clients.createOrUpdate(clients.fromVehicleInfo(vehicleInfo))
    if (rec) onToast?.(`${rec.owner || rec.plate} salvo nos clientes`)
    else onToast?.('Não foi possível salvar (sem conexão)')
  }, [clients, vehicleInfo, onToast])
  const handleWizardComplete = useCallback(() => {
    onWizardComplete()
    setSection('diagrama')
  }, [onWizardComplete])

  const handleGoToDossier = useCallback(() => {
    const el = document.getElementById('dossier-section')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const plateOk = Boolean(String(vehicleInfo.plate || '').trim())
  const retornoNeedsLookup = inspectionPurpose === 'retorno' && !previousSavedReport

  const newDamages = useMemo(
    () =>
      previousReport
        ? allVehicleDamages.filter((d) => isNewDamage(d, previousReport))
        : [],
    [allVehicleDamages, previousReport],
  )

  const [confirmedNewIdsRaw, setConfirmedNewIds] = useState<Set<string>>(() => new Set())

  // Poda durante o render: mantém apenas confirmações de danos que ainda
  // existem (padrão "adjust state on prop change"), sem setState em effect.
  const confirmedNewIds = useMemo(() => {
    const ids = new Set(newDamages.map((d) => d.id))
    const next = new Set([...confirmedNewIdsRaw].filter((id) => ids.has(id)))
    if (next.size === confirmedNewIdsRaw.size && [...confirmedNewIdsRaw].every((id) => next.has(id))) {
      return confirmedNewIdsRaw
    }
    return next
  }, [confirmedNewIdsRaw, newDamages])

  const allNewConfirmed =
    newDamages.length === 0 || newDamages.every((d) => confirmedNewIds.has(d.id))

  const blockExportReason = !hasAllViewPhotos(vehicleInfo)
    ? 'Anexe as fotos dos 4 lados do veículo (≈90°) antes de gerar o PDF'
    : newDamages.length > 0 && !allNewConfirmed
      ? 'Confirme os danos novos como responsável antes de gerar o dossiê'
      : null

  const toggleNewConfirm = useCallback((id: string) => {
    setConfirmedNewIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const confirmAllNew = useCallback(() => {
    setConfirmedNewIds(new Set(newDamages.map((d) => d.id)))
    onToast('Confirmado como responsável. O dossiê é liberado após a revisão')
  }, [newDamages, onToast])

  const goToSection = useCallback(
    (id: InspectSection) => {
      if (retornoNeedsLookup && id !== 'dados') {
        onToast('Busque e confirme a inspeção anterior (placa, CPF ou código do PDF)')
        setSection('dados')
        return
      }
      setSection(id)
    },
    [retornoNeedsLookup, onToast],
  )

  return (
    <>
      {showActivationOnboarding && onHideActivationOnboarding && onSaveDraft && (
        <FirstInspectionOnboarding
          hasPlate={plateOk}
          hasDamages={allVehicleDamages.length > 0}
          hasSavedReport={savedReportCount > 0}
          currentSection={section}
          onGoToSection={goToSection}
          onSaveFirst={onSaveDraft}
          onHide={onHideActivationOnboarding}
        />
      )}

      <div className="flex flex-col items-center gap-2">
        <div className="w-full max-w-2xl">
          <StepProgress current={section} onSelect={goToSection} />
          {/* Stepper horizontal com rótulos (scrollável no mobile) */}
          <div
            role="tablist"
            aria-label="Etapas da inspeção"
            className="mt-1 flex gap-1 overflow-x-auto no-scrollbar pb-1"
          >
            {INSPECT_SECTIONS.map(({ id, label, short, icon }) => {
              const active = section === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => goToSection(id)}
                  className={`shrink-0 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.72rem] font-bold font-outfit whitespace-nowrap transition-all cursor-pointer border ${
                    active
                      ? 'bg-[var(--btn-secondary-bg)] border-[var(--primary)]/35 text-[var(--primary)] shadow-sm'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{short}</span>
                </button>
              )
            })}
          </div>
        </div>
        <p className="ds-caption text-center px-2 -mt-0.5">
          Etapa {SECTION_ORDER.indexOf(section) + 1} de {SECTION_ORDER.length} · {sectionHint(inspectionPurpose, section)}
        </p>
      </div>

      {section === 'dados' && (
        <div className="glass-card p-5 sm:p-7 space-y-6">
          {onSelectPurpose && (
            <div>
              <p className="ds-label mb-2">Momento da Inspeção</p>
              <div
                className="relative flex p-1 rounded-xl bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)]"
                role="group"
                aria-label="Momento da inspeção"
              >
                <span
                  aria-hidden
                  className={`absolute top-1 bottom-1 rounded-lg bg-[var(--primary)] transition-all duration-300 ease-out ${
                    inspectionPurpose === 'entrada' ? 'left-1 right-1/2' : 'left-1/2 right-1'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => onSelectPurpose('entrada')}
                  aria-pressed={inspectionPurpose === 'entrada'}
                  title="Veículo chegando: entrada, recebimento ou retirada"
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-[0.8rem] transition-colors ${
                    inspectionPurpose === 'entrada'
                      ? 'bg-[var(--primary)] text-[var(--bg-main)] shadow-[var(--primary-glow)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <EntradaIcon size={18} />
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPurpose('retorno')}
                  aria-pressed={inspectionPurpose === 'retorno'}
                  title="Veículo saindo: saída, entrega ou devolução"
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-[0.8rem] transition-colors ${
                    inspectionPurpose === 'retorno'
                      ? 'bg-[var(--primary)] text-[var(--bg-main)] shadow-[var(--primary-glow)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <SaidaIcon size={18} />
                  Saída
                </button>
              </div>
              <p className="ds-caption mt-2">
                {inspectionPurpose === 'entrada'
                  ? 'Registro de chegada do veículo (entrada, recebimento ou retirada).'
                  : 'Compara o estado de saída com a inspeção de entrada.'}
              </p>
            </div>
          )}
          {inspectionPurpose === 'retorno' && onLookupRetorno ? (
            <RetornoLookupPanel
              onLookup={onLookupRetorno}
              onClearBaseline={onClearRetornoBaseline}
              baselineReport={previousSavedReport}
              onConfirmToDiagram={() => {
                onToast('Pode marcar as avarias do retorno')
                setSection('diagrama')
              }}
            />
          ) : (
            <>
              <div>
                <p className="ds-label mb-1 mt-3">Veículo</p>
                <VehicleInfoForm
                  info={vehicleInfo}
                  onChange={onVehicleInfoChange}
                  collapsed={formCollapsed}
                  onToggleCollapse={onToggleFormCollapse}
                  onVehicleTypeDetected={onVehicleTypeChange}
                  resetToken={formResetToken}
                  onWizardComplete={handleWizardComplete}
                  onPlateConfirmed={onPlateConfirmed}
                  userId={userId}
                  onToast={onToast}
                  onSaveClient={handleSaveClient}
                />
              </div>
              {!formCollapsed && (
                <div className="flex justify-end pt-1">
                  <Button type="button" variant="primary" size="md" onClick={() => goToSection('diagrama')}>
                    Continuar →
                  </Button>
                </div>
              )}
            </>
          )}
          <div className="flex gap-2 pt-2 justify-between items-center flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={onOpenSaved}
                className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'inline-flex items-center gap-1.5' })}
                >
                  <IconFolder size={14} /> Salvas
                </button>
                {onSaveDraft && (
                  <button
                    type="button"
                    onClick={onSaveDraft}
                    className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'inline-flex items-center gap-1.5 text-emerald-400' })}
                    title="Salva prévia para abrir no celular"
                  >
                    <IconDocument size={14} /> Salvar prévia
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={onClearAll}
                className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'inline-flex items-center gap-1.5 text-red-400' })}
              >
                <ClearAllIcon /> Limpar
                </button>
                </div>
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

          {newDamages.length > 0 && (
            <div className="w-full max-w-3xl mx-auto">
              <NewDamagesAlert newCount={newDamages.length} />
            </div>
          )}

          <div className="glass-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <VehicleIconSvg type={vehicleType} size={28} />
                <div className="min-w-0">
                  <p className="ds-label">Evidências</p>
                  <p className="ds-h3 truncate">{VEHICLE_NAME[vehicleType]} · {VIEW_NAME[viewType]}</p>
                </div>
              </div>
              <Button type="button" variant="primary" size="sm" onClick={() => goToSection('analise')}>
                Ir para análise →
              </Button>
            </div>

            {/* Fotos dos 4 lados — evidência visual associada à inspeção */}
            <div className="mb-5">
              <ViewPhotosCapture
                info={vehicleInfo}
                onChange={onVehicleInfoChange}
                vehicleType={vehicleType}
                damages={allVehicleDamages}
                onAddDamageRecord={onAddDamageRecord}
                onUpdateDamage={onUpdateDamage}
                onRemoveDamage={onRemoveDamage}
                accessToken={accessToken}
                decidedByName={evidenceActorLabel}
                onToast={onToast}
                inspectionId={inspectionId}
                vehicleId={vehicleId}
              />
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
              onGoToDossier={handleGoToDossier}
              accessToken={accessToken}
              previousReport={previousReport}
              onToast={onToast}
            >
              <VehicleViewer.Controls />
              <ErrorBoundary>
                <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[var(--text-muted)] italic text-xs animate-pulse min-h-[220px]">Carregando…</div>}>
                  <VehicleViewer.Viewport />
                </Suspense>
              </ErrorBoundary>
              <VehicleViewer.FloatingDamage />
              <VehicleViewer.FullscreenOverlay />
              <p className="ds-caption text-center mt-2">
                Toque na peça · Arraste para girar · Pinça para zoom
              </p>
            </VehicleViewer.Root>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="ds-caption max-w-md">
                Evidências dos 4 lados em <strong className="text-[var(--text-main)]">Evidências</strong>
                {hasAllViewPhotos(vehicleInfo)
                  ? ' · completas.'
                  : ` · faltam ${4 - Object.values(vehicleInfo.viewPhotos || {}).filter(Boolean).length}.`}
              </p>
              <button
                type="button"
                onClick={() => goToSection('dados')}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                Ajustar fotos →
              </button>
            </div>
            <div className="mt-5 pt-4 border-t border-[var(--panel-border)]">
              <TtsSettings config={ttsConfig} onChange={onTtsConfigChange} onTest={onTtsTest} voices={voices} />
            </div>
          </div>

          <ButtonGroup align="between" className="pt-1">
            <Button type="button" variant="ghost" size="md" onClick={() => goToSection('dados')}>
              ← Voltar
            </Button>
            <Button type="button" variant="primary" size="md" onClick={() => goToSection('analise')}>
              Continuar →
            </Button>
          </ButtonGroup>
        </>
      )}

      {section === 'analise' && (
        <>
          <DamageTextGenerator
            info={vehicleInfo}
            damages={allVehicleDamages}
            accessToken={accessToken}
            onChange={onVehicleInfoChange}
            inspectionId={inspectionId}
            vehicleId={vehicleId}
            onToast={onToast}
          />
          <ButtonGroup align="between" className="pt-1">
            <Button type="button" variant="ghost" size="md" onClick={() => goToSection('diagrama')}>
              ← Voltar
            </Button>
            <Button type="button" variant="primary" size="md" onClick={() => goToSection('historico')}>
              Continuar →
            </Button>
          </ButtonGroup>
        </>
      )}

      {section === 'historico' && (
        <div className="glass-card p-5 sm:p-7 space-y-5">
          <div>
            <p className="ds-label">Histórico do Veículo</p>
            <p className="ds-h3 mt-0.5">Evolução e comparação de registros</p>
            <p className="ds-caption mt-1">
              Inspeções anteriores, entrada/saída, avarias e evidências — preparado para receber os dados.
            </p>
          </div>

          {previousReport ? (
            <div className="text-[0.8rem] px-3.5 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-400">
              Inspeção anterior em{' '}
              <strong>{new Date(previousReport.updatedAt).toLocaleDateString('pt-BR')}</strong>
              Avarias novas aparecem no laudo.
              {liveCompare && (
                <p className="mt-2 text-amber-200/90 ds-caption">
                  Ao vivo: {liveCompare.result.summary.newDamages} novo(s),{' '}
                  {liveCompare.result.summary.severityChanged} alterado(s).{' '}
                  <Link
                    href={buildCompareHref(liveCompare.vehicleId, {
                      prevId: liveCompare.previousReportId,
                    })}
                    className="font-bold underline hover:text-amber-100"
                  >
                    Comparar →
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <div className="text-[0.8rem] px-3.5 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)]">
              Sem inspeções anteriores para este veículo ainda. O histórico será construído conforme novas vistorias forem registradas.
            </div>
          )}

          {allVehicleDamages.length > 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
              <p className="ds-label mb-2">Avarias desta inspeção</p>
              <DamageList
                damages={allVehicleDamages}
                onRemove={onRemoveDamage}
                onUpdate={onUpdateDamage}
                previousReport={previousReport}
                inspectionId={inspectionId}
                vehicleId={vehicleId}
                onToast={onToast}
              />
            </div>
          )}

          <InspectionAuditTimeline inspectionId={inspectionId} issued={Boolean(publicCode)} />

          <ButtonGroup align="between" className="pt-1">
            <Button type="button" variant="ghost" size="md" onClick={() => goToSection('analise')}>
              ← Voltar
            </Button>
            <Button type="button" variant="primary" size="md" onClick={() => goToSection('finalizar')}>
              Continuar →
            </Button>
          </ButtonGroup>
        </div>
      )}

      {section === 'finalizar' && (
        <>
          <ButtonGroup align="start" className="pt-1">
            <Button type="button" variant="ghost" size="md" onClick={() => goToSection('historico')}>
              ← Voltar
            </Button>
          </ButtonGroup>
          <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-5 items-start">
          {/* COLUNA ESQUERDA — Captura de Dados (65%) */}
          <div className="space-y-4 min-w-0">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="ds-label">Revisão</p>
                  <p className="ds-h2">
                    Avarias{' '}
                    <span className={allVehicleDamages.length > 0 ? 'text-red-400' : 'text-[var(--text-muted)]'}>
                      ({allVehicleDamages.length})
                    </span>
                  </p>
                </div>
                {allVehicleDamages.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearDamages}
                    className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-red-400 inline-flex items-center gap-1.5' })}
                  >
                    <ClearAllIcon size={12} /> Limpar
                  </button>
                )}
              </div>

              {allVehicleDamages.length === 0 ? (
                <p className="ds-caption px-3.5 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
                  Nenhuma avaria. O PDF inclui diagrama e fotos dos 4 lados.
                </p>
              ) : (
                <DamageList
                  damages={allVehicleDamages}
                  onRemove={onRemoveDamage}
                  onUpdate={onUpdateDamage}
                  previousReport={previousReport}
                  inspectionId={inspectionId}
                  vehicleId={vehicleId}
                  onToast={onToast}
                />
              )}

              <div className="mt-4">
                <ViewPhotosCapture
                  info={vehicleInfo}
                  onChange={onVehicleInfoChange}
                  compact
                  vehicleType={vehicleType}
                  damages={allVehicleDamages}
                  onAddDamageRecord={onAddDamageRecord}
                  onUpdateDamage={onUpdateDamage}
                  onRemoveDamage={onRemoveDamage}
                  accessToken={accessToken}
                  decidedByName={evidenceActorLabel}
                  onToast={onToast}
                  inspectionId={inspectionId}
                  vehicleId={vehicleId}
                />
              </div>

              {newDamages.length > 0 && (
                <div className="space-y-3 mt-4">
                  <NewDamagesAlert newCount={newDamages.length} compact />
                  <NewDamagesInspectorConfirm
                    newDamages={newDamages}
                    confirmedIds={confirmedNewIds}
                    onToggle={toggleNewConfirm}
                    onConfirmAll={confirmAllNew}
                  />
                </div>
              )}
            </div>

            <div id="dossier-section">
            <FinalizePanel info={vehicleInfo} onChange={onVehicleInfoChange} inspectionId={inspectionId} accessToken={accessToken} />
            </div>

            {mayReview && onCompleteReview && onReopenReview && (
              <InspectionReviewPanel
                reviewedAt={reviewedAt}
                reviewNotes={reviewNotes}
                reviewerName={decidedByName}
                contentStale={reviewContentStale}
                busy={reviewBusy}
                onCompleteReview={onCompleteReview}
                onReopenReview={onReopenReview}
              />
            )}
          </div>

          {/* COLUNA DIREITA — Exportação e Ações Finais (35%, Sticky) */}
          <div className="lg:sticky lg:top-4 space-y-4 min-w-0">
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
              inspectionPurpose={inspectionPurpose}
              onIssued={onIssued}
              reviewedAt={reviewedAt}
              isReviewed={isReviewed}
              onConfirmReview={onConfirmReview}
              onClearReview={onClearReview}
              userId={userId}
              blockExportReason={blockExportReason}
              photosReady={hasAllViewPhotos(vehicleInfo)}
              onReturnHome={onReturnHome}
              onEnsureInspectionId={onEnsureInspectionId}
            />
            <InspectionAuditTimeline
              inspectionId={inspectionId}
              issued={Boolean(publicCode)}
            />
          </div>
          </div>
        </>
      )}
    </>
  )
}
