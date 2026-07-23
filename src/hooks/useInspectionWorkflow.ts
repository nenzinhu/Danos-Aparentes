'use client';
import { useState, useCallback, useMemo } from 'react'
import { VehicleType, ViewType, VehicleInfo, Damage, DamageType, Severity, SavedReport, InspectionStatus } from '@/src/types'
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
import { EMPTY_INFO } from '@/src/components/app/constants'

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
    options?: { id?: string; status?: InspectionStatus },
  ) => Promise<SavedReport>
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
  accessToken,
  showToast,
}: UseInspectionWorkflowOptions) {
  const [vehicleType, setVehicleType] = useState<VehicleType>('car')
  const [viewType, setViewType] = useState<ViewType>('lateral-left')
  const [visitedViews, setVisitedViews] = useState<ViewType[]>(['lateral-left'])
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>(EMPTY_INFO)
  const [formCollapsed, setFormCollapsed] = useState(false)
  const [formResetToken, setFormResetToken] = useState(0)
  const [previousReport, setPreviousReport] = useState<PreviousReportSummary | null>(null)
  /** Id da prévia/vistoria ativa — permite atualizar a mesma entrada no sync PC → celular. */
  const [activeReportId, setActiveReportId] = useState<string | null>(null)

  const viewDamages = useMemo(
    () => damages.filter(d => d.vehicle === vehicleType && d.view === viewType),
    [damages, vehicleType, viewType],
  )

  const allVehicleDamages = useMemo(
    () => damages.filter(d => d.vehicle === vehicleType),
    [damages, vehicleType],
  )

  const handlePlateConfirmed = useCallback(async (plate: string) => {
    setPreviousReport(null)
    if (!accessToken) return
    try {
      const res = await fetch(`/api/report-by-plate?plate=${encodeURIComponent(plate)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.found) {
        setPreviousReport(buildPreviousReportSummary(data.updatedAt, data.damages ?? []))
      }
    } catch {
      // Busca de laudo anterior é um recurso de apoio — falha silenciosa não deve travar a vistoria.
    }
  }, [accessToken])

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

  const handleAddDamageDetailed = useCallback((partId: string, partName: string, type: DamageType, typeName: string, severity: Severity, notes: string, photoFile?: File) => {
    playDamageAddedFeedback()
    const id = createId() as Damage['id']
    addDamage({
      id,
      vehicle: vehicleType,
      view: viewType,
      partId, partName, type, typeName, severity, notes,
      photos: [], photoNotes: [],
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

  const handleRemoveDamageFromPart = useCallback((partId: string) => {
    const dmg = viewDamages.find(d => d.partId === partId)
    if (dmg) removeDamage(dmg.id)
  }, [viewDamages, removeDamage])

  const handleSave = useCallback(async () => {
    const report = await saveReport(vehicleInfo, damages, vehicleType, {
      id: activeReportId ?? undefined,
      status: 'complete',
    })
    setActiveReportId(report.id)
    showToast('✅ Vistoria Salva!')
  }, [vehicleInfo, damages, vehicleType, activeReportId, saveReport, showToast])

  const handleSaveDraft = useCallback(async () => {
    if (!vehicleInfo.owner && !vehicleInfo.plate) {
      showToast('❌ Informe ao menos o cliente ou a placa para salvar a prévia')
      return
    }
    const report = await saveReport(vehicleInfo, damages, vehicleType, {
      id: activeReportId ?? undefined,
      status: 'draft',
    })
    setActiveReportId(report.id)
    showToast('✅ Prévia salva — sincroniza com o celular')
  }, [vehicleInfo, damages, vehicleType, activeReportId, saveReport, showToast])

  const handleLoad = useCallback((r: SavedReport) => {
    setVehicleInfo(r.vehicleInfo)
    if (r.vehicleType) setVehicleType(r.vehicleType)
    setActiveReportId(r.id)
    clearDamages()
    r.damages.forEach(d => addDamage(d))
    setPreviousReport(null)
    showToast(r.status === 'draft' ? '📂 Prévia carregada — continue a vistoria' : '📂 Vistoria Carregada!')
  }, [clearDamages, addDamage, showToast])

  const handleClearAll = useCallback(() => {
    setVehicleInfo(EMPTY_INFO)
    clearDamages()
    setFormResetToken(t => t + 1)
    setPreviousReport(null)
    setActiveReportId(null)
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

  return {
    vehicleType,
    viewType,
    visitedViews,
    vehicleInfo,
    setVehicleInfo,
    formCollapsed,
    formResetToken,
    previousReport,
    viewDamages,
    allVehicleDamages,
    handlePlateConfirmed,
    handleAddDamage,
    handleAddDamageDetailed,
    handleRemoveDamageFromPart,
    handleSave,
    handleSaveDraft,
    handleLoad,
    handleClearAll,
    handleClearDamages,
    handleViewTypeChange,
    handleVehicleTypeChange,
    toggleFormCollapse: () => setFormCollapsed(c => !c),
  }
}
