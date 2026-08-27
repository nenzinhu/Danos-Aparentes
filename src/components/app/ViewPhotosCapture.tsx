'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { Damage, DamageType, VehicleInfo, VehicleType, ViewType } from '@/src/types'
import { VIEW_NAME, VIEW_TAB_SHORT } from '@/src/components/app/constants'
import { VIEW_PHOTO_ORDER, countFilledViewPhotos } from '@/src/lib/viewPhotos'
import {
  VIEW_FACE_PART_ID,
  buildViewPhotosFromAssignments,
  filterDamagesToInvalidateOnViewChange,
  reassignViewPhoto,
  type ViewSideAssignment,
} from '@/src/lib/viewSideAssign'
import { storePhotoEvidence } from '@/src/lib/photoEvidence'
import { deletePhotoRef } from '@/src/lib/photoStore'
import {
  finishPhotoUploadProgress,
  startPhotoUploadProgress,
  updatePhotoUploadProgress,
} from '@/src/lib/photoUploadProgress'
import { suggestViewDamageFromPhoto } from '@/src/lib/viewDamageSuggestClient'
import { classifyViewSides } from '@/src/lib/viewSideClassifyClient'
import { ResolvedPhoto } from '@/src/components/ResolvedPhoto'
import ViewSideConfirmPanel, { type ConfirmItem } from '@/src/components/app/ViewSideConfirmPanel'
import Button from '@/src/components/ui/Button'
import { ButtonGroup } from '@/src/components/ui/ButtonGroup'
import PhotoFab from '@/src/components/PhotoFab'
import ViewPhotoCard from '@/src/components/app/ViewPhotoCard'
import {
  TYPE_LABEL,
  createDamageId,
  computePhase,
  groupFaceDamagesByView,
  dedupeAssignmentsByView,
  type Phase,
} from '@/src/components/app/viewPhotosCaptureLogic'

type Props = {
  info: VehicleInfo
  onChange: (info: VehicleInfo) => void
  highlightView?: ViewType
  compact?: boolean
  vehicleType?: VehicleType
  damages?: Damage[]
  onAddDamageRecord?: (damage: Damage) => void
  onUpdateDamage?: (id: string, patch: Partial<Damage>) => void
  onRemoveDamage?: (id: string) => void
  accessToken?: string
  decidedByName?: string
  onToast?: (msg: string) => void
  inspectionId?: string | null
  vehicleId?: string | null
}


/**
 * Captura das fotos dos 4 lados (~90°).
 * Fluxo: lote (4 fotos) → humano assinala cada lado → confirma → IA analisa avarias para o humano confirmar.
 */
export default function ViewPhotosCapture({
  info,
  onChange,
  highlightView,
  compact,
  vehicleType = 'car',
  damages = [],
  onAddDamageRecord,
  onUpdateDamage,
  onRemoveDamage,
  accessToken,
  decidedByName,
  onToast,
  inspectionId,
  vehicleId,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [analyzingView, setAnalyzingView] = useState<ViewType | null>(null)
  const [replaceView, setReplaceView] = useState<ViewType | null>(null)
  const [busyView, setBusyView] = useState<ViewType | null>(null)
  const [autoClassifying, setAutoClassifying] = useState(false)
  const [localAssignments, setLocalAssignments] = useState<ConfirmItem[]>([])
  const damageRunForConfirmAt = useRef<string | null>(null)

  const filled = countFilledViewPhotos(info)
  const complete = filled === 4
  const pending = info.pendingViewPhotoRefs || []

  const phase: Phase = useMemo(
    () => computePhase(info, pending.length, localAssignments.length, filled),
    [info, pending.length, localAssignments.length, filled],
  )

  const faceDamagesByView = useMemo(() => groupFaceDamagesByView(damages), [damages])

  const persistPending = useCallback(
    (refs: string[], extra?: Partial<VehicleInfo>) => {
      onChange({
        ...info,
        pendingViewPhotoRefs: refs,
        ...extra,
      })
    },
    [info, onChange],
  )

  async function addFiles(files: File[]) {
    const room = Math.max(0, 4 - pending.length)
    const slice = files.slice(0, room)
    if (!slice.length) {
      onToast?.('Já há 4 fotos no lote.')
      return
    }
    setBusy(true)
    startPhotoUploadProgress(slice.length, 'Evidências dos 4 lados…')
    try {
      const next = [...pending]
      for (let i = 0; i < slice.length; i += 1) {
        updatePhotoUploadProgress({
          phase: 'compressing',
          current: i,
          label: `Salvando foto ${i + 1}/${slice.length}…`,
        })
        const { optimizedRef } = await storePhotoEvidence(slice[i], {
          inspectionId: inspectionId || undefined,
          vehicleId: vehicleId || undefined,
        })
        next.push(optimizedRef)
        updatePhotoUploadProgress({ current: i + 1 })
      }
      persistPending(next, {
        viewSideSuggestions: undefined,
        viewSidesConfirmedAt: undefined,
        viewSidesConfirmedBy: undefined,
      })
      if (next.length === 4) {
        // Humano assinala o lado de cada foto (sem IA nesta etapa).
        setLocalAssignments(
          next.map((photoRef) => ({
            photoRef,
            view: '' as const,
            fromAi: false,
          })),
        )
        onToast?.('Assinale o lado correto de cada foto e confirme.')
      } else {
        setLocalAssignments([])
      }
    } catch (e) {
      console.error(e)
      onToast?.('Não foi possível salvar a foto.')
    } finally {
      finishPhotoUploadProgress()
      setBusy(false)
    }
  }

  function openSideAssignment() {
    if (pending.length !== 4) {
      onToast?.('Tire as 4 fotos (frente, traseira, esquerda e direita) antes de assinalar.')
      return
    }
    setLocalAssignments(
      pending.map((photoRef) => ({
        photoRef,
        view: '' as const,
        fromAi: false,
      })),
    )
  }

  function removePending(ref: string) {
    void deletePhotoRef(ref)
    persistPending(
      pending.filter((r) => r !== ref),
      { viewSideSuggestions: undefined },
    )
    setLocalAssignments((prev) => prev.filter((a) => a.photoRef !== ref))
  }

  function onChangeView(photoRef: string, view: ViewType) {
    setLocalAssignments((prev) =>
      prev.map((item) => (item.photoRef === photoRef ? { ...item, view, fromAi: false } : item)),
    )
  }

  function redoBatch() {
    for (const ref of pending) void deletePhotoRef(ref)
    setLocalAssignments([])
    onChange({
      ...info,
      pendingViewPhotoRefs: [],
      viewSideSuggestions: undefined,
    })
  }

  async function confirmSides() {
    const assignments: ViewSideAssignment[] = localAssignments
      .filter((i) => i.view)
      .map((i) => ({ photoRef: i.photoRef, view: i.view as ViewType }))
    setConfirming(true)
    try {
      const viewPhotos = buildViewPhotosFromAssignments(assignments)
      const confirmedAt = new Date().toISOString()
      onChange({
        ...info,
        viewPhotos: { ...(info.viewPhotos || {}), ...viewPhotos },
        pendingViewPhotoRefs: [],
        viewSideSuggestions: undefined,
        viewSidesConfirmedAt: confirmedAt,
        viewSidesConfirmedBy: decidedByName || undefined,
      })
      setLocalAssignments([])
      damageRunForConfirmAt.current = null
      onToast?.('Lados confirmados. IA analisando avarias nas 4 vistas…')
      queueMicrotask(() => {
        void runDamageAnalysis(viewPhotos, { force: true, runKey: confirmedAt })
      })
    } finally {
      setConfirming(false)
    }
  }

  async function runLightning() {
    if (pending.length !== 4) {
      onToast?.('Tire as 4 fotos (frente, traseira, esquerda e direita) antes do relâmpago.')
      return
    }
    setAutoClassifying(true)
    try {
      const suggestions = await classifyViewSides(pending, accessToken)
      if (!suggestions.length) {
        onToast?.('IA não identificou os lados. Assinale na mão.')
        return
      }
      const assignments: ViewSideAssignment[] = suggestions
        .filter((s) => s.suggestedView)
        .map((s) => ({ photoRef: s.photoRef, view: s.suggestedView }))
      // Protege contra lados duplicados sugeridos pela IA: mantém só o primeiro por lado.
      const deduped = dedupeAssignmentsByView(assignments)
      if (deduped.length < 4) {
        onToast?.('IA deixou dúvida em algum lado. Assinale na mão para garantir.')
        return
      }
      const viewPhotos = buildViewPhotosFromAssignments(deduped)
      const confirmedAt = new Date().toISOString()
      onChange({
        ...info,
        viewPhotos: { ...(info.viewPhotos || {}), ...viewPhotos },
        pendingViewPhotoRefs: [],
        viewSideSuggestions: suggestions.map((s) => ({
          photoRef: s.photoRef,
          suggestedView: s.suggestedView,
        })),
        viewSidesConfirmedAt: confirmedAt,
        viewSidesConfirmedBy: 'IA (relâmpago)',
      })
      setLocalAssignments([])
      onToast?.('Lados identificados pela IA. Analisando avarias nas 4 vistas…')
      queueMicrotask(() => {
        void runDamageAnalysis(viewPhotos, { force: true, runKey: confirmedAt })
      })
    } catch (e) {
      console.error(e)
      onToast?.('Sem conexão ou IA indisponível. Assinale os lados na mão.')
    } finally {
      setAutoClassifying(false)
    }
  }

  const runDamageAnalysis = useCallback(
    async (
      viewPhotos: Partial<Record<ViewType, string>>,
      opts?: { onlyView?: ViewType; force?: boolean; runKey?: string },
    ) => {
      if (!onAddDamageRecord || !onRemoveDamage) return
      const runKey = opts?.runKey || opts?.onlyView || 'all'
      if (!opts?.force && damageRunForConfirmAt.current === runKey) return
      damageRunForConfirmAt.current = runKey
      const views = opts?.onlyView ? [opts.onlyView] : VIEW_PHOTO_ORDER
      try {
        for (const view of views) {
          const photoRef = viewPhotos[view]
          if (!photoRef) continue
          for (const d of filterDamagesToInvalidateOnViewChange(damages, { view })) {
            onRemoveDamage(d.id)
          }
        }

        setAnalyzingView(views[0] || null)
        const results = await Promise.all(
          views.map(async (view) => {
            const photoRef = viewPhotos[view]
            if (!photoRef) return { view, photoRef: null as string | null, suggestion: null, error: null }
            try {
              const suggestion = await suggestViewDamageFromPhoto({
                photoRef,
                partName: VIEW_NAME[view],
                accessToken,
              })
              return { view, photoRef, suggestion, error: null }
            } catch (e) {
              return {
                view,
                photoRef,
                suggestion: null,
                error: e instanceof Error ? e.message : 'Erro desconhecido',
              }
            }
          }),
        )

        let found = 0
        const errors = new Set<string>()
        for (const { view, photoRef, suggestion, error } of results) {
          setAnalyzingView(view)
          if (!photoRef) continue
          if (error) { errors.add(error); continue }
          if (!suggestion || suggestion.noDamage) {
            if (opts?.onlyView) onToast?.('Nenhuma avaria aparente nesta foto.')
            continue
          }
          found += 1
          onAddDamageRecord({
            id: createDamageId(),
            vehicle: vehicleType,
            view,
            partId: VIEW_FACE_PART_ID,
            partName: VIEW_NAME[view],
            type: suggestion.type,
            typeName: TYPE_LABEL[suggestion.type],
            severity: suggestion.severity,
            notes: suggestion.description,
            photos: [photoRef],
            photoNotes: [''],
            evidenceStatus: 'sugerido',
          })
        }
        if (!opts?.onlyView) {
          if (errors.size > 0) {
            onToast?.(`IA não pôde analisar: ${[...errors][0]}`)
          } else if (found > 0) {
            onToast?.(`IA encontrou ${found} possível(is) avaria(s). Revise e confirme cada uma.`)
          } else {
            onToast?.('IA não encontrou avarias aparentes nas 4 vistas.')
          }
        }
      } catch (e) {
        console.error(e)
        onToast?.(
          opts?.onlyView
            ? 'Não foi possível reanalisar esta foto.'
            : 'Lados ok; não foi possível analisar avarias agora.',
        )
      } finally {
        setAnalyzingView(null)
      }
    },
    [accessToken, damages, onAddDamageRecord, onRemoveDamage, onToast, vehicleType],
  )

  function changeConfirmedView(fromView: ViewType, toView: ViewType) {
    if (fromView === toView) return
    const photoRef = info.viewPhotos?.[fromView]
    if (!photoRef) return
    const nextPhotos = reassignViewPhoto(info.viewPhotos || {}, fromView, toView)
    // Invalida sugestões nas duas vistas afetadas
    for (const v of [fromView, toView]) {
      for (const d of filterDamagesToInvalidateOnViewChange(damages, { view: v })) {
        onRemoveDamage?.(d.id)
      }
    }
    onChange({
      ...info,
      viewPhotos: nextPhotos,
    })
    onToast?.(`Lado alterado para ${VIEW_TAB_SHORT[toView]}.`)
  }

  async function reanalyzeView(view: ViewType) {
    const photoRef = info.viewPhotos?.[view]
    if (!photoRef) return
    await runDamageAnalysis({ [view]: photoRef }, {
      onlyView: view,
      force: true,
      runKey: `reanalyze-${view}-${Date.now()}`,
    })
  }
  async function handleReplaceFile(view: ViewType, file: File) {
    setBusyView(view)
    startPhotoUploadProgress(1, `Foto ${VIEW_NAME[view]}…`)
    try {
      updatePhotoUploadProgress({ phase: 'compressing', label: 'Preservando original e otimizando…' })
      const { optimizedRef } = await storePhotoEvidence(file, {
        inspectionId: inspectionId || undefined,
        vehicleId: vehicleId || undefined,
      })
      updatePhotoUploadProgress({ phase: 'uploading', current: 1 })
      const prev = info.viewPhotos?.[view]
      if (prev) void deletePhotoRef(prev)
      for (const d of filterDamagesToInvalidateOnViewChange(damages, { view, photoRef: prev })) {
        onRemoveDamage?.(d.id)
      }
      onChange({
        ...info,
        viewPhotos: { ...(info.viewPhotos || {}), [view]: optimizedRef },
        viewSidesConfirmedAt: undefined,
        viewSidesConfirmedBy: undefined,
      })
      setReplaceView(null)
      onToast?.(`Foto ${VIEW_NAME[view]} atualizada. Confirme de novo se precisar.`)
    } catch (e) {
      console.error(e)
      onToast?.('Erro ao substituir foto.')
    } finally {
      finishPhotoUploadProgress()
      setBusyView(null)
    }
  }

  function removeConfirmed(view: ViewType) {
    const prev = info.viewPhotos?.[view]
    if (prev) void deletePhotoRef(prev)
    for (const d of filterDamagesToInvalidateOnViewChange(damages, { view, photoRef: prev })) {
      onRemoveDamage?.(d.id)
    }
    const next = { ...(info.viewPhotos || {}) }
    delete next[view]
    onChange({
      ...info,
      viewPhotos: next,
      viewSidesConfirmedAt: undefined,
    })
    setReplaceView(null)
  }

  const showBatch = phase === 'batch'
  const showConfirm = phase === 'confirm'
  const showDone = phase === 'done' || (filled > 0 && !showConfirm && !showBatch)

  return (
    <div
      className={`rounded-2xl px-4 py-5 space-y-4 transition-colors ${
        complete
          ? 'bg-[var(--success)]/[0.06] ring-1 ring-[var(--success)]/25'
          : 'bg-[var(--panel-bg)] ring-1 ring-[var(--card-border)]'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="ds-label">Evidência</p>
          <p className="ds-h3 mt-0.5">Evidências dos 4 lados</p>
          {!compact && (
            <p className="ds-caption mt-1">
              Tire as 4 fotos (~90°): frente, traseira, esquerda e direita. Você assinala o lado de
              cada uma; depois a IA analisa avarias para você confirmar.
            </p>
          )}
        </div>
        <span
          className={`inline-flex items-center min-h-7 px-2.5 rounded-lg text-[0.7rem] font-bold tabular-nums ${
            complete
              ? 'bg-[var(--success)]/15 text-[var(--success)]'
              : 'bg-white/[0.04] text-[var(--text-muted)]'
          }`}
        >
          {showBatch || showConfirm ? `${pending.length || localAssignments.length}/4 lote` : `${filled}/4`}
        </span>
      </div>

      {showBatch && (
        <div className="space-y-4">
          <p className="ds-caption text-center text-[var(--text-muted)]">
            Toque 4 vezes no botão para fotografar os 4 lados. Sem precisar pensar — o sistema
            guia o progresso. Depois você assinala os lados.
          </p>

          {/* FAB centralizado */}
          <div className="flex justify-center py-2">
            <PhotoFab
              disabled={busy || pending.length >= 4}
              onCapture={(files) => void addFiles(files)}
            />
          </div>

          {/* Lista das fotos do lote */}
          {pending.length > 0 && (
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 list-none m-0 p-0">
              {pending.map((ref, i) => (
                <li key={ref} className="relative rounded-xl overflow-hidden aspect-[3/4] bg-black/40 ring-1 ring-[var(--card-border)]">
                  <ResolvedPhoto refOrDataUrl={ref} alt={`Lote ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePending(ref)}
                    className="absolute top-1.5 right-1.5 min-w-8 min-h-8 rounded-lg bg-black/55 text-white text-xs font-bold"
                    aria-label="Remover foto do lote"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 text-[0.62rem] font-bold bg-black/55 text-white px-1.5 py-0.5 rounded">
                    {i + 1}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <ButtonGroup align="center" className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={pending.length !== 4 || busy}
              onClick={openSideAssignment}
            >
              Assinalar lados das 4 fotos
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={pending.length !== 4 || busy || autoClassifying}
              onClick={() => void runLightning()}
              title="IA identifica os lados e marca as avarias automaticamente"
            >
              {autoClassifying ? '⚡ Identificando…' : '⚡ Vistoria Relâmpago'}
            </Button>
            {pending.length > 0 && pending.length < 4 && (
              <p className="ds-caption self-center">
                Faltam {4 - pending.length} foto(s): frente, traseira, esquerda e direita.
              </p>
            )}
            {filled > 0 && pending.length === 0 && (
              <p className="ds-caption self-center">Ou use as fotos já confirmadas abaixo.</p>
            )}
          </ButtonGroup>
        </div>
      )}

      {showConfirm && (
        <ViewSideConfirmPanel
          items={localAssignments}
          onChangeView={onChangeView}
          onConfirm={() => void confirmSides()}
          onRedo={redoBatch}
          confirming={confirming}
        />
      )}

      {showDone && (
        <>
          {analyzingView && (
            <p className="text-xs font-semibold text-[var(--primary)]">
              IA analisando avarias · {VIEW_TAB_SHORT[analyzingView]}… Confirme depois.
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VIEW_PHOTO_ORDER.map((view) => (
              <ViewPhotoCard
                key={view}
                view={view}
                src={info.viewPhotos?.[view]}
                active={highlightView === view}
                replacing={replaceView === view}
                compact={compact}
                tags={faceDamagesByView[view] || []}
                analyzingView={analyzingView}
                busyView={busyView}
                decidedByName={decidedByName}
                onUpdateDamage={onUpdateDamage}
                onReanalyze={(v) => void reanalyzeView(v)}
                onRequestReplace={setReplaceView}
                onCancelReplace={() => setReplaceView(null)}
                onRemove={removeConfirmed}
                onFile={(v, file) => void handleReplaceFile(v, file)}
                onChangeView={changeConfirmedView}
              />
            ))}
          </div>
          {!compact && filled < 4 && pending.length === 0 && localAssignments.length === 0 && (
            <p className="ds-caption">Faltam fotos. Use Substituir/anexar em cada lado ou limpe e use o lote.</p>
          )}
        </>
      )}
    </div>
  )
}
