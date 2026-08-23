'use client';
import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react'
import { VehicleInfo, CustomField, VehicleType } from '../types'
import Button from './ui/Button'
import { WIZARD_STEPS } from './WizardStepper'
import type { WizardStep } from './wizardTypes'
import { IconDocument } from './ui/AnimatedIcons'
import { storePhotoEvidence } from '../lib/photoEvidence'
import { deletePhotoRef } from '../lib/photoStore'
import {
  finishPhotoUploadProgress,
  startPhotoUploadProgress,
  updatePhotoUploadProgress,
} from '../lib/photoUploadProgress'
import { supabase } from '../lib/supabase'
import {
  FIELD_LABELS,
  type CustomFieldDef,
  type FoundData,
} from './vehicleInfoForm/constants'
import {
  loadCustomFieldDefs,
  loadFieldFilter,
  loadFieldOrder,
  saveCustomFieldDefs,
  saveFieldFilter,
  saveFieldOrder,
} from './vehicleInfoForm/fieldPrefs'
import { InspectionDataIcon } from './vehicleInfoForm/icons'
import { mapPlateApiToFound } from './vehicleInfoForm/parsePlateLookup'
import FieldVisibilityPanel from './vehicleInfoForm/FieldVisibilityPanel'
import WizardStepVehicle from './vehicleInfoForm/WizardStepVehicle'
import WizardStepOwner from './vehicleInfoForm/WizardStepOwner'
import WizardStepExtras from './vehicleInfoForm/WizardStepExtras'

interface Props {
  info: VehicleInfo
  onChange: (info: VehicleInfo) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  onVehicleTypeDetected?: (type: VehicleType) => void
  resetToken?: number
  onWizardComplete?: () => void
  /** Disparado quando a placa atinge o formato completo (7 caracteres), independente do resultado da busca de marca/modelo. */
  onPlateConfirmed?: (plate: string) => void
  /** Cadastro rápido de clientes (Supabase). Quando ausente, o botão some. */
  userId?: string
  onToast?: (msg: string) => void
  onSaveClient?: () => void
}

function VehicleInfoFormComponent({ info, onChange, collapsed, onToggleCollapse, onVehicleTypeDetected, resetToken, onWizardComplete, onPlateConfirmed, userId, onToast, onSaveClient }: Props) {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(loadFieldFilter)
  const [fieldOrder, setFieldOrder] = useState<string[]>(loadFieldOrder)
  const [filterOpen, setFilterOpen] = useState(false)
  const [plateStatus, setPlateStatus] = useState<'idle' | 'loading' | 'found' | 'error'>('idle')
  const [foundData, setFoundData] = useState<FoundData | null>(null)
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDef[]>(loadCustomFieldDefs)
  const [newFieldName, setNewFieldName] = useState('')
  const [wizardStep, setWizardStep] = useState<WizardStep>(1)
  const [maxVisited, setMaxVisited] = useState<WizardStep>(1)
  // Passo realmente renderizado — atrasa a troca de conteúdo até a saída
  // do passo atual terminar de animar (o número/stepper já muda na hora).
  const [renderedStep, setRenderedStep] = useState<WizardStep>(1)
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward')
  const [isStepLeaving, setIsStepLeaving] = useState(false)
  const pendingStepRef = useRef<WizardStep>(1)
  const [showCnhScanner, setShowCnhScanner] = useState(false)
  const [interiorCompressing, setInteriorCompressing] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset do wizard quando o token muda — ajuste durante o render (sem effect).
  const [appliedResetToken, setAppliedResetToken] = useState(resetToken)
  if (appliedResetToken !== resetToken) {
    setAppliedResetToken(resetToken)
    setWizardStep(1)
    setMaxVisited(1)
    setRenderedStep(1)
    setIsStepLeaving(false)
  }

  // Duração da saída de um passo do wizard — mais rápida que a entrada
  // (200ms), como o resto do app.
  const STEP_EXIT_MS = 160

  const transitionToStep = useCallback((next: WizardStep) => {
    if (next === renderedStep || isStepLeaving) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setStepDirection(next > renderedStep ? 'forward' : 'backward')
    if (prefersReducedMotion) { setRenderedStep(next); return }
    setIsStepLeaving(true)
    pendingStepRef.current = next
    setTimeout(() => {
      setRenderedStep(pendingStepRef.current)
      setIsStepLeaving(false)
    }, STEP_EXIT_MS)
  }, [renderedStep, isStepLeaving])

  const anyHidden = Object.values(visibleFields).some(v => !v)

  const addCustomField = useCallback(() => {
    const label = newFieldName.trim()
    if (!label) return
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const next = [...customFieldDefs, { id, label }]
    setCustomFieldDefs(next); saveCustomFieldDefs(next)
    const fields: CustomField[] = [...(info.customFields || []), { id, label, value: '' }]
    onChange({ ...info, customFields: fields })
    setNewFieldName('')
  }, [newFieldName, customFieldDefs, info, onChange])

  const removeCustomField = useCallback((id: string) => {
    const next = customFieldDefs.filter(d => d.id !== id)
    setCustomFieldDefs(next); saveCustomFieldDefs(next)
    const fields = (info.customFields || []).filter(f => f.id !== id)
    onChange({ ...info, customFields: fields })
  }, [customFieldDefs, info, onChange])

  // Reordena um campo personalizado (dir = -1 sobe, +1 desce). Aplica a nova
  // ordem tanto na definição salva quanto nos valores da vistoria atual, para
  // que formulário e PDF sigam exatamente a mesma sequência.
  const moveCustomField = useCallback((id: string, dir: -1 | 1) => {
    const idx = customFieldDefs.findIndex(d => d.id === id)
    if (idx < 0) return
    const target = idx + dir
    if (target < 0 || target >= customFieldDefs.length) return
    const next = [...customFieldDefs]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setCustomFieldDefs(next); saveCustomFieldDefs(next)
    const existing = info.customFields || []
    if (existing.length) {
      const ordered = next
        .map(d => existing.find(f => f.id === d.id))
        .filter((f): f is CustomField => Boolean(f))
      const orphans = existing.filter(f => !next.some(d => d.id === f.id))
      onChange({ ...info, customFields: [...ordered, ...orphans] })
    }
  }, [customFieldDefs, info, onChange])

  const renameCustomField = useCallback((id: string, newLabel: string) => {
    const label = newLabel.trim()
    if (!label) return
    const next = customFieldDefs.map(d => d.id === id ? { ...d, label } : d)
    setCustomFieldDefs(next); saveCustomFieldDefs(next)
    const fields = (info.customFields || []).map(f =>
      f.id === id ? { ...f, label } : f,
    )
    onChange({ ...info, customFields: fields })
  }, [customFieldDefs, info, onChange])

  const setCustomFieldValue = useCallback((id: string, label: string, value: string) => {
    const existing = info.customFields || []
    const has = existing.some(f => f.id === id)
    const fields = has
      ? existing.map(f => f.id === id ? { ...f, value } : f)
      : [...existing, { id, label, value }]
    onChange({ ...info, customFields: fields })
  }, [info, onChange])

  const customFieldValue = useCallback((id: string): string => {
    return (info.customFields || []).find(f => f.id === id)?.value || ''
  }, [info])

  // Auto‑close on outside click was removed to keep the filter dropdown open until the user explicitly toggles it.
  // If you prefer to close it manually, uncomment the code below.
  // useEffect(() => {
  //   if (!filterOpen) return
  //   function onDown(e: MouseEvent) {
  //     if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
  //   }
  //   document.addEventListener('mousedown', onDown)
  //   return () => document.removeEventListener('mousedown', onDown)
  // }, [filterOpen])

  const set = useCallback((field: keyof VehicleInfo, value: string) => {
    onChange({ ...info, [field]: value })
  }, [info, onChange])

  const handleInteriorPhoto = useCallback(async (file: File) => {
    setInteriorCompressing(true)
    startPhotoUploadProgress(1, 'Preparando foto do interior…')
    try {
      updatePhotoUploadProgress({ phase: 'compressing', label: 'Preservando original e otimizando…' })
      const { optimizedRef } = await storePhotoEvidence(file)
      updatePhotoUploadProgress({ phase: 'uploading', current: 0, label: 'Salvando foto localmente…' })
      updatePhotoUploadProgress({ current: 1 })
      onChange({
        ...info,
        interiorPhotos: [...info.interiorPhotos, optimizedRef],
        interiorPhotoNotes: [...(info.interiorPhotoNotes ?? []), ''],
      })
    } catch (error) {
      console.error('Error compressing interior photo:', error)
    } finally {
      finishPhotoUploadProgress()
      setInteriorCompressing(false)
    }
  }, [info, onChange])

  const updateInteriorPhotoNote = useCallback((idx: number, note: string) => {
    const notes = [...(info.interiorPhotoNotes ?? info.interiorPhotos.map(() => ''))]
    notes[idx] = note
    onChange({ ...info, interiorPhotoNotes: notes })
  }, [info, onChange])

  const removeInteriorPhoto = useCallback((idx: number) => {
    const removed = info.interiorPhotos[idx]
    if (removed) void deletePhotoRef(removed)
    onChange({
      ...info,
      interiorPhotos: info.interiorPhotos.filter((_, i) => i !== idx),
      interiorPhotoNotes: (info.interiorPhotoNotes ?? []).filter((_, i) => i !== idx),
    })
  }, [info, onChange])

  const toggleField = useCallback((key: string) => {
    setVisibleFields(prev => {
      const next = { ...prev, [key]: !prev[key] }
      saveFieldFilter(next)
      return next
    })
  }, [])

  const filterAll = useCallback((show: boolean) => {
    const next = Object.fromEntries(Object.keys(FIELD_LABELS).map(k => [k, show]))
    setVisibleFields(next); saveFieldFilter(next)
  }, [])

  const show = useCallback((key: string) => visibleFields[key] !== false, [visibleFields])

  // Reordena os campos padrão do formulário (dir = -1 sobe, +1 desce), permitindo
  // que o cliente organize a ordem de exibição do jeito que preferir.
  const moveField = useCallback((key: string, dir: -1 | 1) => {
    setFieldOrder(prev => {
      const idx = prev.indexOf(key)
      const target = idx + dir
      if (idx < 0 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      saveFieldOrder(next)
      return next
    })
  }, [])

  const orderedKeysIn = useCallback((keys: string[]) => fieldOrder.filter(k => keys.includes(k)), [fieldOrder])

  // Arrastar para reordenar (além das setas ↑ ↓, que continuam funcionando
  // como alternativa acessível/no toque).
  const [draggedFieldKey, setDraggedFieldKey] = useState<string | null>(null)
  const [dragOverFieldKey, setDragOverFieldKey] = useState<string | null>(null)

  const reorderFieldTo = useCallback((draggedKey: string, targetKey: string) => {
    if (draggedKey === targetKey) return
    setFieldOrder(prev => {
      const from = prev.indexOf(draggedKey)
      const to = prev.indexOf(targetKey)
      if (from < 0 || to < 0) return prev
      const next = [...prev]
      next.splice(from, 1)
      next.splice(to, 0, draggedKey)
      saveFieldOrder(next)
      return next
    })
  }, [])

  const [draggedCustomId, setDraggedCustomId] = useState<string | null>(null)
  const [dragOverCustomId, setDragOverCustomId] = useState<string | null>(null)

  const reorderCustomFieldTo = useCallback((draggedId: string, targetId: string) => {
    if (draggedId === targetId) return
    setCustomFieldDefs(prev => {
      const from = prev.findIndex(d => d.id === draggedId)
      const to = prev.findIndex(d => d.id === targetId)
      if (from < 0 || to < 0) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      saveCustomFieldDefs(next)
      const existing = info.customFields || []
      if (existing.length) {
        const ordered = next
          .map(d => existing.find(f => f.id === d.id))
          .filter((f): f is CustomField => Boolean(f))
        const orphans = existing.filter(f => !next.some(d => d.id === f.id))
        onChange({ ...info, customFields: [...ordered, ...orphans] })
      }
      return next
    })
  }, [info, onChange])

  const goToStep = useCallback((step: WizardStep) => {
    setWizardStep(step)
    setMaxVisited(prev => (step > prev ? step : prev))
    transitionToStep(step)
  }, [transitionToStep])

  const goNext = useCallback(() => {
    if (wizardStep < 3) goToStep((wizardStep + 1) as WizardStep)
  }, [wizardStep, goToStep])

  const goBack = useCallback(() => {
    if (wizardStep > 1) {
      const prev = (wizardStep - 1) as WizardStep
      setWizardStep(prev)
      transitionToStep(prev)
    }
  }, [wizardStep, transitionToStep])

  const handleComplete = useCallback(() => {
    onWizardComplete?.()
    onToggleCollapse?.()
  }, [onWizardComplete, onToggleCollapse])

  const lookupPlate = useCallback(async (plate: string) => {
    setPlateStatus('loading')
    try {
      const { data: { session } } = await supabase?.auth.getSession() ?? { data: { session: null } }
      if (!session?.access_token) throw new Error('Não autenticado')

      const res = await fetch(`/api/plate-lookup?plate=${encodeURIComponent(plate)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const fd = mapPlateApiToFound(data)
      if (!fd) throw new Error('not found')

      setFoundData(fd)

      const updates: Partial<VehicleInfo> = {}
      if (fd.brand && !info.brand) updates.brand = fd.brand
      if (fd.color && !info.color) updates.color = fd.color
      if (fd.city && !info.city) updates.city = fd.city
      if (fd.state && !info.state) updates.state = fd.state
      if (!info.vehicleTypeDesc) updates.vehicleTypeDesc = fd.vehicleTypeDesc
      if (fd.fipe) updates.fipe = fd.fipe

      onChange({ ...info, ...updates, plate })
      if (onVehicleTypeDetected) onVehicleTypeDetected(fd.svgType)

      setPlateStatus('found')
    } catch {
      setPlateStatus('error')
      setFoundData(null)
    }
  }, [info, onChange, onVehicleTypeDetected])

  const onPlateChange = useCallback((value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
    set('plate', clean)
    setPlateStatus('idle')
    setFoundData(null)
    if (lookupTimer.current) clearTimeout(lookupTimer.current)
    if (clean.length === 7) {
      lookupTimer.current = setTimeout(() => lookupPlate(clean), 600)
      onPlateConfirmed?.(clean)
    }
  }, [set, lookupPlate, onPlateConfirmed])

  const summary = useMemo(() => [info.owner, info.plate, info.brand].filter(Boolean).join(' • '), [info.owner, info.plate, info.brand])

  if (collapsed && summary) {
    return (
      <div className="flex items-center justify-between font-outfit">
        <div>
          <div className="font-extrabold text-[0.95rem] inline-flex items-center gap-1.5"><InspectionDataIcon /> Dados da Vistoria</div>
          {summary && <div className="text-[0.8rem] text-slate-400 mt-0.5">{summary}</div>}
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="bg-sky-500/10 border border-[var(--primary)]/20 rounded-lg px-3.5 py-1.5 cursor-pointer text-[var(--primary)] font-bold text-[0.75rem] hover:bg-sky-500/20 transition-colors inline-flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l4 4 4-4"/></svg>
            Expandir
          </button>
        )}
      </div>
    )
  }

  const plateBorderClass =
    plateStatus === 'found' ? 'border-green-500/60 shadow-[0_0_18px_rgba(34,197,94,0.25)]' :
    plateStatus === 'error' ? 'border-red-500/50 shadow-[0_0_18px_rgba(239,68,68,0.2)]' :
    plateStatus === 'loading' ? 'border-yellow-500/50 shadow-[0_0_18px_rgba(234,179,8,0.2)]' :
    'border-sky-500/35 shadow-[0_0_18px_rgba(0,170,255,0.15)]'

  const stepTitle =
    renderedStep === 1 ? 'Dados do Cliente' : renderedStep === 2 ? 'Dados do Veículo' : 'Evidências do Veículo'
  const visibleCount = Object.values(visibleFields).filter(Boolean).length

  return (
    <div className="font-outfit">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <div className="font-extrabold text-[0.95rem] flex items-center gap-2 min-w-0">
          <IconDocument size={18} className="text-sky-400 shrink-0" />
          <span className="truncate">{stepTitle}</span>
          <span className="hidden sm:inline-flex items-center rounded-full bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] px-2 py-0.5 text-[0.62rem] font-bold text-[var(--text-muted)]">
            {visibleCount} campos
          </span>
        </div>
        <div className="flex gap-2 items-center relative flex-wrap min-w-0">
          {onSaveClient && (
            <button
              type="button"
              onClick={onSaveClient}
              title="Salva cliente + veículo para reutilizar nas próximas inspeções"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-1.5 text-[0.72rem] font-bold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors backdrop-blur-sm"
            >
              <IconDocument size={13} /> Salvar nos clientes
            </button>
          )}
          <FieldVisibilityPanel
            filterRef={filterRef}
            anyHidden={anyHidden}
            filterOpen={filterOpen}
            onToggleOpen={() => setFilterOpen((o) => !o)}
            fieldOrder={fieldOrder}
            visibleFields={visibleFields}
            onToggleField={toggleField}
            onMoveField={moveField}
            onFilterAll={filterAll}
            draggedFieldKey={draggedFieldKey}
            dragOverFieldKey={dragOverFieldKey}
            onDragFieldStart={setDraggedFieldKey}
            onDragFieldOver={setDragOverFieldKey}
            onDragFieldLeave={(key) => setDragOverFieldKey((prev) => (prev === key ? null : prev))}
            onDropField={(key) => {
              if (draggedFieldKey) reorderFieldTo(draggedFieldKey, key)
              setDraggedFieldKey(null)
              setDragOverFieldKey(null)
            }}
            onDragFieldEnd={() => {
              setDraggedFieldKey(null)
              setDragOverFieldKey(null)
            }}
            customFieldDefs={customFieldDefs}
            newFieldName={newFieldName}
            onNewFieldNameChange={setNewFieldName}
            onAddCustomField={addCustomField}
            onRemoveCustomField={removeCustomField}
            onMoveCustomField={moveCustomField}
            onRenameCustomField={renameCustomField}
            draggedCustomId={draggedCustomId}
            dragOverCustomId={dragOverCustomId}
            onDragCustomStart={setDraggedCustomId}
            onDragCustomOver={setDragOverCustomId}
            onDragCustomLeave={(id) => setDragOverCustomId((prev) => (prev === id ? null : prev))}
            onDropCustom={(id) => {
              if (draggedCustomId) reorderCustomFieldTo(draggedCustomId, id)
              setDraggedCustomId(null)
              setDragOverCustomId(null)
            }}
            onDragCustomEnd={() => {
              setDraggedCustomId(null)
              setDragOverCustomId(null)
            }}
          />
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="bg-sky-500/10 border border-[var(--primary)]/20 rounded-lg px-3 py-1.5 cursor-pointer text-slate-400 font-bold text-[0.75rem] hover:bg-sky-500/20 transition-colors backdrop-blur-sm inline-flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8l4-4 4 4"/></svg>
              Minimizar
            </button>
          )}
        </div>
      </div>

      <p className="text-[0.72rem] font-bold text-slate-500 mb-3">
        Passo {wizardStep} de 3
        {WIZARD_STEPS.find(s => s.step === wizardStep)?.label && (
          <span className="text-[var(--text-muted)] font-semibold"> · {WIZARD_STEPS.find(s => s.step === wizardStep)?.label}</span>
        )}
      </p>

      <div
        key={renderedStep}
        className={`pb-20 motion-reduce:animate-none ${
          isStepLeaving
            ? `animate-out fade-out duration-150 ${stepDirection === 'forward' ? 'slide-out-to-left-2' : 'slide-out-to-right-2'}`
            : `animate-in fade-in duration-200 ${stepDirection === 'forward' ? 'slide-in-from-right-2' : 'slide-in-from-left-2'}`
        }`}
      >
      {renderedStep === 1 && (
        <WizardStepOwner
          info={info}
          set={set}
          show={show}
          orderedKeysIn={orderedKeysIn}
          showCnhScanner={showCnhScanner}
          setShowCnhScanner={setShowCnhScanner}
        />
      )}

      {renderedStep === 2 && (
        <WizardStepVehicle
          info={info}
          set={set}
          show={show}
          orderedKeysIn={orderedKeysIn}
          plateStatus={plateStatus}
          foundData={foundData}
          plateBorderClass={plateBorderClass}
          onPlateChange={onPlateChange}
          onPlateSearch={() => lookupPlate(info.plate)}
        />
      )}

      {renderedStep === 3 && (
        <WizardStepExtras
          info={info}
          onChange={onChange}
          set={set}
          customFieldDefs={customFieldDefs}
          customFieldValue={customFieldValue}
          setCustomFieldValue={setCustomFieldValue}
          removeCustomField={removeCustomField}
          interiorCompressing={interiorCompressing}
          handleInteriorPhoto={handleInteriorPhoto}
          updateInteriorPhotoNote={updateInteriorPhotoNote}
          removeInteriorPhoto={removeInteriorPhoto}
        />
      )}

      </div>

      <div className="mt-4 pt-3 flex items-center justify-end gap-2 border-t border-[var(--card-border)]">
        {wizardStep > 1 && (
          <Button variant="ghost" size="sm" onClick={goBack}>
            ← Voltar
          </Button>
        )}
        {wizardStep < 3 ? (
          <Button variant="primary" size="sm" onClick={goNext}>
            Continuar →
          </Button>
        ) : (
          <Button variant="success" size="sm" onClick={handleComplete}>
            Ir ao diagrama →
          </Button>
        )}
      </div>
    </div>
  )
}

const VehicleInfoForm = memo(VehicleInfoFormComponent)
export default VehicleInfoForm

