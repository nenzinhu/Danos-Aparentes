'use client';
import { useState, useCallback, useMemo, useEffect } from 'react'
import { VehicleType, ViewType, VehicleInfo, Damage, DamageType, Severity, SavedReport, InspectionStatus, InspectionPurpose } from '@/src/types'
import { createId } from '@/src/lib/id'
import { storePhotoEvidence } from '@/src/lib/photoEvidence'
import { playDamageAddedFeedback } from '@/src/lib/feedback'
import { SYSTEM_MESSAGES } from '@/src/lib/b2bPositioning'
import { buildPreviousReportSummary, type PreviousReportSummary } from '@/src/lib/reportComparison'
import {
  finishPhotoUploadProgress,
  startPhotoUploadProgress,
  updatePhotoUploadProgress,
} from '@/src/lib/photoUploadProgress'
import { EMPTY_INFO } from '@/src/components/app/constants'
import { IssueBlockedWithoutReviewError } from '@/src/lib/pdf/reviewGate'
import { isIssuedLocked } from '@/src/lib/pdf/reportIssuance'
import { db } from '@/src/lib/db'
import {
  buildLiveComparePreview,
  draftReportFromState,
  findPreviousReportForPlate,
  type LiveComparePreview,
} from '@/src/lib/vehicleEvidence/liveCompare'
import { vehicleInfoForReturn, findReportForReturn, type RetornoLookupKind } from '@/src/lib/inspectionPurpose'
import type { SaveReportOptions } from '@/src/hooks/useSavedReports'

interface UseInspectionWorkflowOptions {
  damages: Damage[]
  addDamage: (d: Damage) => Promise<void>
  removeDamage: (id: string) => Promise<void>
  updateDamage: (id: string, patch: Partial<Damage>) => Promise<void>
  clearDamages: () => Promise<void>
  saveReport: (
    vehicleInfo: VehicleInfo,
    damages: Damage[],
    vehicleType: VehicleType,
    options?: SaveReportOptions,
  ) => Promise<SavedReport>
  markReportIssued?: (id: string, hash: string) => Promise<SavedReport | null>
  markReviewComplete?: (
    id: string,
    vehicleInfo: VehicleInfo,
    damages: Damage[],
    vehicleType: VehicleType,
    reviewerId: string,
    notes?: string,
  ) => Promise<SavedReport>
  clearReviewReport?: (id: string) => Promise<SavedReport | null>
  userId?: string
  accessToken?: string
  showToast: (msg: string) => void
}

export function useInspectionWorkflow({
  damages,
  addDamage,
  removeDamage,
  updateDamage,
  clearDamages,
  saveReport,
  markReportIssued,
  markReviewComplete,
  clearReviewReport,
  userId,
  accessToken,
  showToast,
}: UseInspectionWorkflowOptions) {
  const [vehicleType, setVehicleType] = useState<VehicleType>('car')
  const [viewType, setViewType] = useState<ViewType>('lateral-left')
  const [visitedViews, setVisitedViews] = useState<ViewType[]>(['lateral-left'])
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>(EMPTY_INFO)
  const [formCollapsed, setFormCollapsed] = useState(true)
  const [formResetToken, setFormResetToken] = useState(0)
  const [previousReport, setPreviousReport] = useState<PreviousReportSummary | null>(null)
  const [previousSavedReport, setPreviousSavedReport] = useState<SavedReport | null>(null)
  const [liveCompare, setLiveCompare] = useState<LiveComparePreview | null>(null)
  /** Id da prévia/vistoria ativa — permite atualizar a mesma entrada no sync PC → celular. */
  const [activeReportId, setActiveReportId] = useState<string | null>(null)
  const [inspectionPurpose, setInspectionPurpose] = useState<InspectionPurpose>('entrada')
  const [baselineInspectionId, setBaselineInspectionId] = useState<string | null>(null)

  const purposeSaveOpts = useCallback((): Pick<SaveReportOptions, 'inspectionPurpose' | 'baselineInspectionId'> => ({
    inspectionPurpose,
    baselineInspectionId: baselineInspectionId || undefined,
  }), [inspectionPurpose, baselineInspectionId])

  const getCurrentEvidenceIds = useCallback(async () => {
    const savedReport = activeReportId
      ? (await db.getAllSaved()).find((report) => report.id === activeReportId)
      : null
    return {
      inspectionId: activeReportId ?? null,
      vehicleId: savedReport?.vehicleId ?? previousSavedReport?.vehicleId ?? null,
    }
  }, [activeReportId, previousSavedReport])

  const viewDamages = useMemo(
    () => damages.filter(d => d.vehicle === vehicleType && d.view === viewType),
    [damages, vehicleType, viewType],
  )

  const allVehicleDamages = useMemo(
    () => damages.filter(d => d.vehicle === vehicleType),
    [damages, vehicleType],
  )

  const handlePlateConfirmed = useCallback(async (plate: string) => {
    // Retorno já carrega a base via busca (placa/CPF/código PDF) — não sobrescrever.
    if (inspectionPurpose === 'retorno' && baselineInspectionId) return

    setPreviousReport(null)
    setPreviousSavedReport(null)
    setLiveCompare(null)

    let hadLocal = false
    // Offline-first: histórico local
    try {
      const local = await db.getAllSaved()
      const prevLocal = findPreviousReportForPlate(local, plate, activeReportId)
      if (prevLocal) {
        hadLocal = true
        setPreviousSavedReport(prevLocal)
        setPreviousReport(
          buildPreviousReportSummary(
            new Date(prevLocal.savedAt).toISOString(),
            prevLocal.damages.map((d) => ({ partId: d.partId, type: d.type })),
          ),
        )
      }
    } catch {
      /* ignore */
    }

    if (!accessToken) return
    try {
      const res = await fetch(`/api/report-by-plate?plate=${encodeURIComponent(plate)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) return
      const data = await res.json()
      // API só traz chaves partId::type — preferir laudo local completo quando existir
      if (data.found && !hadLocal) {
        setPreviousReport(buildPreviousReportSummary(data.updatedAt, data.damages ?? []))
      }
    } catch {
      // Busca de laudo anterior é um recurso de apoio — falha silenciosa não deve travar a vistoria.
    }
  }, [accessToken, activeReportId, inspectionPurpose, baselineInspectionId])

  // FASE 10 — comparação ao vivo conforme avarias mudam
  useEffect(() => {
    // Adia um tick para não chamar setState sincronamente dentro do effect.
    const t = setTimeout(() => {
      if (!previousSavedReport) {
        setLiveCompare(null)
        return
      }
      const current = draftReportFromState({
        vehicleInfo,
        damages: damages.filter((d) => d.vehicle === vehicleType),
        vehicleType,
        activeReportId,
        vehicleId: previousSavedReport.vehicleId,
      })
      const preview = buildLiveComparePreview({
        previous: previousSavedReport,
        current,
        userId: userId || 'local',
      })
      setLiveCompare(preview)
    }, 0)
    return () => clearTimeout(t)
  }, [previousSavedReport, vehicleInfo, damages, vehicleType, activeReportId, userId])

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
        updatePhotoUploadProgress({ phase: 'compressing', label: 'Preservando original e otimizando…' })
        const { optimizedRef } = await storePhotoEvidence(photoFile, {
          damageId: id,
          ...(await getCurrentEvidenceIds()),
        })
        updatePhotoUploadProgress({ phase: 'uploading', current: 0, label: 'Salvando foto localmente…' })
        updatePhotoUploadProgress({ current: 1 })
        updateDamage(id, { photos: [optimizedRef], photoNotes: [''] })
      } catch (error) {
        console.error('Error compressing image:', error)
      } finally {
        finishPhotoUploadProgress()
      }
    })()
  }, [vehicleType, viewType, addDamage, updateDamage, getCurrentEvidenceIds])

  const handleAddDamageDetailed = useCallback((
    partId: string,
    partName: string,
    type: DamageType,
    typeName: string,
    severity: Severity,
    notes: string,
    photoFile?: File,
    evidence?: Pick<Damage, 'evidenceStatus' | 'evidenceDecidedBy' | 'evidenceDecidedAt' | 'aiDecisionId'>,
  ) => {
    playDamageAddedFeedback()
    const id = createId() as Damage['id']
    addDamage({
      id,
      vehicle: vehicleType,
      view: viewType,
      partId, partName, type, typeName, severity, notes,
      photos: [], photoNotes: [],
      ...evidence,
    })

    if (!photoFile) return

    ;(async () => {
      startPhotoUploadProgress(1, 'Preparando foto da avaria…')
      try {
        updatePhotoUploadProgress({ phase: 'compressing', label: 'Preservando original e otimizando…' })
        const { optimizedRef } = await storePhotoEvidence(photoFile, {
          damageId: id,
          ...(await getCurrentEvidenceIds()),
        })
        updatePhotoUploadProgress({ phase: 'uploading', current: 0, label: 'Salvando foto localmente…' })
        updatePhotoUploadProgress({ current: 1 })
        updateDamage(id, { photos: [optimizedRef], photoNotes: [''] })
      } catch (error) {
        console.error('Error compressing image:', error)
      } finally {
        finishPhotoUploadProgress()
      }
    })()
  }, [vehicleType, viewType, addDamage, updateDamage, getCurrentEvidenceIds])

  /** Avaria completa já montada (ex.: sugestão IA nas fotos dos 4 lados). */
  const handleAddDamageRecord = useCallback((damage: Damage) => {
    playDamageAddedFeedback()
    void addDamage(damage)
  }, [addDamage])

  const handleRemoveDamageFromPart = useCallback((partId: string) => {
    const dmg = viewDamages.find(d => d.partId === partId)
    if (dmg) removeDamage(dmg.id)
  }, [viewDamages, removeDamage])

  const handleSave = useCallback(async () => {
    if (activeReportId) {
      // Guard: never overwrite an issued snapshot in place
      // (createCorrection creates a new id for edits).
    }
    try {
      const report = await saveReport(vehicleInfo, damages, vehicleType, {
        id: activeReportId ?? undefined,
        status: 'complete',
        ...purposeSaveOpts(),
      })
      setActiveReportId(report.id)
      showToast(`✅ ${SYSTEM_MESSAGES.historyVersionCreated}`)
    } catch (e) {
      showToast(e instanceof Error ? `❌ ${e.message}` : '❌ Não foi possível salvar')
    }
  }, [vehicleInfo, damages, vehicleType, activeReportId, saveReport, showToast, purposeSaveOpts])

  const handleSaveDraft = useCallback(async () => {
    if (!vehicleInfo.owner && !vehicleInfo.plate) {
      showToast('❌ Informe ao menos o cliente ou a placa para salvar a prévia')
      return
    }
    try {
      const report = await saveReport(vehicleInfo, damages, vehicleType, {
        id: activeReportId ?? undefined,
        status: 'draft',
        ...purposeSaveOpts(),
      })
      setActiveReportId(report.id)
      showToast('✅ Prévia salva — sincroniza com o celular')
    } catch (e) {
      showToast(e instanceof Error ? `❌ ${e.message}` : '❌ Não foi possível salvar a prévia')
    }
  }, [vehicleInfo, damages, vehicleType, activeReportId, saveReport, showToast, purposeSaveOpts])

  const handleLoad = useCallback((r: SavedReport) => {
    if (isIssuedLocked(r.status)) {
      showToast(`🔒 ${SYSTEM_MESSAGES.issuedImmutable}`)
      return
    }
    setVehicleInfo(r.vehicleInfo)
    if (r.vehicleType) setVehicleType(r.vehicleType)
    setActiveReportId(r.id)
    setInspectionPurpose(r.inspectionPurpose || 'entrada')
    setBaselineInspectionId(r.baselineInspectionId || null)
    clearDamages()
    r.damages.forEach(d => addDamage(d))
    setPreviousReport(null)
    setPreviousSavedReport(null)
    setLiveCompare(null)
    showToast(r.status === 'draft' ? '📂 Prévia carregada — continue a inspeção' : `📂 ${SYSTEM_MESSAGES.inspectionLoaded}`)
  }, [clearDamages, addDamage, showToast])

  /** Load a correction draft created from an issued laudo. */
  const handleLoadCorrection = useCallback((r: SavedReport) => {
    setVehicleInfo(r.vehicleInfo)
    if (r.vehicleType) setVehicleType(r.vehicleType)
    setActiveReportId(r.id)
    setInspectionPurpose(r.inspectionPurpose || 'entrada')
    setBaselineInspectionId(r.baselineInspectionId || null)
    clearDamages()
    r.damages.forEach(d => addDamage(d))
    setPreviousReport(null)
    setPreviousSavedReport(null)
    setLiveCompare(null)
    showToast('📝 Correção carregada — edite e emita uma nova versão do dossiê')
  }, [clearDamages, addDamage, showToast])

  const startEntrada = useCallback(() => {
    setVehicleInfo(EMPTY_INFO)
    clearDamages()
    setFormResetToken(t => t + 1)
    setPreviousReport(null)
    setPreviousSavedReport(null)
    setLiveCompare(null)
    setActiveReportId(null)
    setInspectionPurpose('entrada')
    setBaselineInspectionId(null)
    showToast('📥 Nova Inspeção — preencha a Identidade do Veículo')
  }, [clearDamages, showToast])

  /**
   * Retorno: reaproveita cliente/veículo da vistoria base, zera diagrama/avarias
   * e assinaturas. PDF continua disponível no passo Laudo.
   */
  const startRetorno = useCallback((from: SavedReport) => {
    const info = vehicleInfoForReturn(from.vehicleInfo)
    setVehicleInfo(info)
    if (from.vehicleType) setVehicleType(from.vehicleType)
    clearDamages()
    setFormResetToken(t => t + 1)
    setActiveReportId(null)
    setInspectionPurpose('retorno')
    setBaselineInspectionId(from.id)
    setPreviousSavedReport(from)
    setPreviousReport(
      buildPreviousReportSummary(
        new Date(from.savedAt).toISOString(),
        from.damages.map((d) => ({ partId: d.partId, type: d.type })),
      ),
    )
    if (userId) {
      const draft = draftReportFromState({
        vehicleInfo: info,
        damages: [],
        vehicleType: from.vehicleType || 'car',
        vehicleId: from.vehicleId,
      })
      setLiveCompare(buildLiveComparePreview({ previous: from, current: draft, userId }))
    } else {
      setLiveCompare(null)
    }
    showToast('📤 Dados importados — confirme e vá ao diagrama para marcar o retorno')
  }, [clearDamages, showToast, userId])

  const clearRetornoBaseline = useCallback(() => {
    setVehicleInfo(EMPTY_INFO)
    clearDamages()
    setFormResetToken(t => t + 1)
    setActiveReportId(null)
    setBaselineInspectionId(null)
    setPreviousSavedReport(null)
    setPreviousReport(null)
    setLiveCompare(null)
    setInspectionPurpose('retorno')
  }, [clearDamages])

  const lookupRetorno = useCallback(async (kind: RetornoLookupKind, value: string) => {
    try {
      const local = await db.getAllSaved()
      const found = findReportForReturn(local, kind, value, activeReportId)
      if (!found) {
        const label =
          kind === 'plate' ? 'placa' : kind === 'cpf' ? 'CPF' : 'código do PDF'
        showToast(`Nenhuma inspeção encontrada com essa ${label}`)
        return
      }
      startRetorno(found)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível buscar a inspeção')
    }
  }, [activeReportId, startRetorno, showToast])

  const selectPurpose = useCallback((purpose: InspectionPurpose) => {
    if (purpose === 'entrada') {
      startEntrada()
      return
    }
    // Retorno: só busca por placa, CPF ou código do PDF — não preenche formulário completo.
    clearRetornoBaseline()
    showToast('Informe placa, CPF ou código do PDF para carregar a inspeção anterior')
  }, [startEntrada, clearRetornoBaseline, showToast])

  const handleReviewComplete = useCallback(async (notes: string) => {
    if (!markReviewComplete || !userId) {
      showToast('Faça login para concluir a revisão')
      return
    }
    try {
      let id = activeReportId
      if (!id) {
        const report = await saveReport(vehicleInfo, damages, vehicleType, { status: 'complete', ...purposeSaveOpts() })
        id = report.id
        setActiveReportId(id)
      } else {
        await saveReport(vehicleInfo, damages, vehicleType, { id, status: 'complete', ...purposeSaveOpts() })
      }
      await markReviewComplete(id, vehicleInfo, damages, vehicleType, userId, notes)
      showToast('Revisão humana concluída — pode emitir o dossiê técnico')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível concluir a revisão')
    }
  }, [activeReportId, markReviewComplete, userId, saveReport, vehicleInfo, damages, vehicleType, showToast, purposeSaveOpts])

  const handleReopenReview = useCallback(async () => {
    if (!clearReviewReport || !activeReportId) {
      showToast('Nenhuma inspeção ativa para reabrir revisão')
      return
    }
    try {
      await clearReviewReport(activeReportId)
      showToast('Revisão reaberta — você pode editar a inspeção')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível reabrir a revisão')
    }
  }, [activeReportId, clearReviewReport, showToast])

  const handleIssued = useCallback(async (hash: string) => {
    if (!markReportIssued || !hash || hash === 'N/D') return
    try {
      let id = activeReportId
      if (!id) {
        const report = await saveReport(vehicleInfo, damages, vehicleType, { status: 'complete', ...purposeSaveOpts() })
        id = report.id
        setActiveReportId(id)
      } else {
        await saveReport(vehicleInfo, damages, vehicleType, { id, status: 'complete', ...purposeSaveOpts() })
      }
      await markReportIssued(id, hash)
      showToast(`✅ ${SYSTEM_MESSAGES.dossierComplete}`)
    } catch (e) {
      if (e instanceof IssueBlockedWithoutReviewError) {
        showToast('Conclua a revisão humana antes de emitir o dossiê')
        return
      }
      showToast(e instanceof Error ? e.message : 'Não foi possível travar o dossiê emitido')
    }
  }, [activeReportId, markReportIssued, saveReport, vehicleInfo, damages, vehicleType, showToast, purposeSaveOpts])

  const handleClearAll = useCallback(() => {
    setVehicleInfo(EMPTY_INFO)
    clearDamages()
    setFormResetToken(t => t + 1)
    setPreviousReport(null)
    setPreviousSavedReport(null)
    setLiveCompare(null)
    setActiveReportId(null)
    setInspectionPurpose('entrada')
    setBaselineInspectionId(null)
    showToast(`🧽 ${SYSTEM_MESSAGES.dataCleared}`)
  }, [clearDamages, showToast])

  const handleClearDamages = useCallback(() => {
    clearDamages()
    showToast(`🧽 ${SYSTEM_MESSAGES.damagesCleared}`)
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

  return {
    vehicleType,
    viewType,
    visitedViews,
    vehicleInfo,
    setVehicleInfo,
    formCollapsed,
    formResetToken,
    previousReport,
    liveCompare,
    activeReportId,
    setActiveReportId,
    viewDamages,
    allVehicleDamages,
    handlePlateConfirmed,
    handleAddDamage,
    handleAddDamageDetailed,
    handleAddDamageRecord,
    handleRemoveDamageFromPart,
    handleSave,
    handleSaveDraft,
    handleLoad,
    handleLoadCorrection,
    handleReviewComplete,
    handleReopenReview,
    handleIssued,
    handleClearAll,
    handleClearDamages,
    handleViewTypeChange,
    handleVehicleTypeChange,
    toggleFormCollapse: () => setFormCollapsed(c => !c),
    inspectionPurpose,
    baselineInspectionId,
    previousSavedReport,
    startEntrada,
    startRetorno,
    selectPurpose,
    lookupRetorno,
    clearRetornoBaseline,
  }
}
