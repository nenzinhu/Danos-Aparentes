'use client'

import { useCallback, useMemo, useState, useRef } from 'react'
import type { Damage, VehicleInfo, ViewType } from '@/src/types'
import { VIEW_NAME } from '@/src/components/app/constants'
import { VIEW_PHOTO_ORDER, hasAllViewPhotos } from '@/src/lib/viewPhotos'
import { TYPE_LABEL } from '@/src/components/app/viewPhotosCaptureLogic'
import { ResolvedPhoto } from '@/src/components/ResolvedPhoto'
import { suggestViewDamageFromPhoto } from '@/src/lib/viewDamageSuggestClient'
import { storePhotoEvidence } from '@/src/lib/photoEvidence'
import { deletePhotoRef } from '@/src/lib/photoStore'
import { startPhotoUploadProgress, updatePhotoUploadProgress, finishPhotoUploadProgress } from '@/src/lib/photoUploadProgress'
import Button from '@/src/components/ui/Button'
import { IconCamera, IconGallery } from '@/src/components/ui/AnimatedIcons'

type Props = {
  info: VehicleInfo
  damages: Damage[]
  accessToken?: string | null
  onChange?: (info: VehicleInfo) => void
  inspectionId?: string | null
  vehicleId?: string | null
  onToast?: (msg: string) => void
  onUseText?: (text: string) => void
}

const SEVERITY_PT: Record<string, string> = {
  low: 'leve',
  medium: 'moderada',
  high: 'grave',
}

type PendingItem = { ref: string; view: ViewType | '' }

/**
 * Aba "Análise das Fotografias": captura (câmera ou galeria) das 4 fotos,
 * assinala o lado de cada uma e gera um laudo textual das avarias.
 */
export default function DamageTextGenerator({
  info,
  damages,
  accessToken,
  onChange,
  inspectionId,
  vehicleId,
  onToast,
  onUseText,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [text, setText] = useState('')
  const [pending, setPending] = useState<PendingItem[]>([])
  const [saving, setSaving] = useState(false)
  const viewPhotos = info.viewPhotos || {}
  const complete = hasAllViewPhotos(info)

  const damagesByView = useMemo(() => {
    const map: Partial<Record<ViewType, Damage[]>> = {}
    for (const d of damages) {
      if (d.view) (map[d.view] ||= []).push(d)
    }
    return map
  }, [damages])

  const buildText = useCallback(
    (extraByView?: Partial<Record<ViewType, { type: string; severity: string; description: string }>>) => {
      const lines: string[] = []
      lines.push('RELATÓRIO DE AVARIAS (ANÁLISE POR FOTOGRAFIA)')
      if (info.plate) lines.push(`Veículo: ${info.plate}${info.brand ? ` — ${info.brand}` : ''}`)
      lines.push('')

      let total = 0
      for (const view of VIEW_PHOTO_ORDER) {
        const labeled = damagesByView[view] || []
        const ai = extraByView?.[view]
        type Row = { partName: string; typeName: string; severity: string; notes?: string }
        const items: Row[] = labeled.map((d) => ({
          partName: d.partName,
          typeName: d.typeName || TYPE_LABEL[d.type] || d.type,
          severity: d.severity,
          notes: d.notes,
        }))
        if (ai && !labeled.length) {
          items.push({
            partName: VIEW_NAME[view],
            typeName: TYPE_LABEL[ai.type as Damage['type']] || ai.type,
            severity: ai.severity,
            notes: ai.description,
          })
        }
        if (!items.length) continue
        lines.push(`${VIEW_NAME[view].toUpperCase()}:`)
        for (const it of items) {
          total += 1
          const sev = SEVERITY_PT[String(it.severity)] || it.severity
          const desc = it.notes?.trim() ? ` — ${it.notes.trim()}` : ''
          lines.push(`• ${it.partName}: ${it.typeName?.toLowerCase() || it.typeName} (${sev})${desc}`)
        }
        lines.push('')
      }

      if (total === 0) {
        lines.push('Nenhuma avaria aparente identificada nas fotografias dos 4 lados.')
      } else {
        lines.push(`Total de avarias identificadas: ${total}.`)
      }
      return lines.join('\n').trim()
    },
    [damagesByView, info.brand, info.plate],
  )

  const handleFile = useCallback(
    async (file: File) => {
      if (pending.length >= 4) {
        onToast?.('Já há 4 fotos no lote.')
        return
      }
      setSaving(true)
      startPhotoUploadProgress(1, 'Salvando foto…')
      try {
        const { optimizedRef } = await storePhotoEvidence(file, {
          inspectionId: inspectionId || undefined,
          vehicleId: vehicleId || undefined,
        })
        updatePhotoUploadProgress({ current: 1 })
        setPending((prev) => [...prev, { ref: optimizedRef, view: '' }])
      } catch (e) {
        console.error(e)
        const msg = e instanceof Error ? e.message : String(e)
        onToast?.(`Não foi possível salvar a foto: ${msg.slice(0, 80)}`)
      } finally {
        finishPhotoUploadProgress()
        setSaving(false)
      }
    },
    [pending.length, inspectionId, vehicleId, onToast],
  )

  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const openCamera = () => cameraRef.current?.click()
  const openGallery = () => galleryRef.current?.click()

  const removePending = (ref: string) => {
    void deletePhotoRef(ref)
    setPending((prev) => prev.filter((p) => p.ref !== ref))
  }

  const setPendingView = (ref: string, view: ViewType) => {
    setPending((prev) => prev.map((p) => (p.ref === ref ? { ...p, view } : p)))
  }

  const confirmSides = useCallback(() => {
    const missing = pending.find((p) => !p.view)
    if (missing) {
      onToast?.('Selecione o lado de todas as fotos.')
      return
    }
    const viewPhotosNext: Partial<Record<ViewType, string>> = { ...viewPhotos }
    for (const p of pending) {
      if (p.view) viewPhotosNext[p.view] = p.ref
    }
    onChange?.({
      ...info,
      viewPhotos: viewPhotosNext,
      pendingViewPhotoRefs: [],
      viewSideSuggestions: undefined,
      viewSidesConfirmedAt: new Date().toISOString(),
      viewSidesConfirmedBy: 'Análise de Fotos',
    })
    setPending([])
    onToast?.('Lados confirmados. Gere o texto de danos.')
  }, [pending, viewPhotos, info, onChange, onToast])

  const handleGenerate = useCallback(async () => {
    if (!complete) {
      onToast?.('Capture e confirme as 4 fotos antes de gerar o texto.')
      return
    }
    setBusy(true)
    try {
      const extras: Partial<Record<ViewType, { type: string; severity: string; description: string }>> = {}
      for (const view of VIEW_PHOTO_ORDER) {
        if ((damagesByView[view]?.length ?? 0) > 0) continue
        const ref = viewPhotos[view]
        if (!ref) continue
        try {
          const s = await suggestViewDamageFromPhoto({ photoRef: ref, partName: VIEW_NAME[view], accessToken })
          if (s && !s.noDamage) extras[view] = { type: s.type, severity: s.severity, description: s.description }
        } catch {
          /* ignora vista individual que falhar */
        }
      }
      setText(buildText(extras))
      onToast?.('Texto de danos gerado a partir das fotografias.')
    } catch {
      onToast?.('Não foi possível gerar o texto agora.')
    } finally {
      setBusy(false)
    }
  }, [complete, damagesByView, viewPhotos, accessToken, buildText, onToast])

  return (
    <div className="glass-card p-5 sm:p-7 space-y-5">
      <div>
        <p className="ds-label">Análise das Fotografias</p>
        <p className="ds-h3 mt-0.5">Gerar texto de danos do veículo</p>
        <p className="ds-caption mt-1">
          Tire ou anexe as 4 fotos dos lados (frente, traseira, esquerda e direita), selecione o lado de
          cada uma e gere o laudo textual das avarias.
        </p>
      </div>

      {/* Captura: câmera ou galeria */}
      {pending.length < 4 && (
        <div className="flex flex-wrap gap-2 items-center">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleFile(f)
              e.target.value = ''
            }}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              for (const f of files) void handleFile(f)
              e.target.value = ''
            }}
          />
          <Button type="button" variant="primary" size="sm" disabled={saving} onClick={openCamera}>
            <span className="inline-flex items-center gap-1.5"><IconCamera size={15} /> Câmera</span>
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={saving} onClick={openGallery}>
            <span className="inline-flex items-center gap-1.5"><IconGallery size={15} /> Galeria</span>
          </Button>
          <span className="text-[0.7rem] font-bold text-[var(--text-muted)] tabular-nums">
            {pending.length}/4 no lote
          </span>
        </div>
      )}

      {/* Lote pendente: assinalar lados */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="ds-label">Selecione o lado de cada foto</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {pending.map((p) => (
              <div key={p.ref} className="relative rounded-xl overflow-hidden aspect-[3/4] bg-black/40 ring-1 ring-[var(--card-border)]">
                <ResolvedPhoto refOrDataUrl={p.ref} alt="Foto" className="absolute inset-0 w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePending(p.ref)}
                  className="absolute top-1.5 right-1.5 min-w-7 min-h-7 rounded-lg bg-black/55 text-white text-xs font-bold"
                  aria-label="Remover foto"
                >
                  ✕
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/55 p-1">
                  <select
                    value={p.view}
                    onChange={(e) => setPendingView(p.ref, e.target.value as ViewType)}
                    className="w-full rounded-md bg-white/10 text-white text-[0.62rem] font-bold px-1 py-1 outline-none"
                  >
                    <option value="">Lado…</option>
                    {VIEW_PHOTO_ORDER.map((v) => (
                      <option key={v} value={v} className="text-black">{VIEW_NAME[v]}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="primary" size="md" onClick={confirmSides} disabled={pending.length < 1}>
            Confirmar lados ({pending.length})
          </Button>
        </div>
      )}

      {/* Pré-visualização dos 4 lados confirmados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {VIEW_PHOTO_ORDER.map((view) => {
          const ref = viewPhotos[view]
          const count = damagesByView[view]?.length ?? 0
          return (
            <div
              key={view}
              className="relative rounded-xl overflow-hidden aspect-[3/4] bg-black/40 ring-1 ring-[var(--card-border)]"
            >
              {ref ? (
                <ResolvedPhoto refOrDataUrl={ref} alt={VIEW_NAME[view]} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[var(--text-muted)]">
                  <span className="text-2xl font-bold opacity-40">+</span>
                  <span className="text-[0.62rem] font-bold px-2 text-center">{VIEW_NAME[view]}</span>
                </div>
              )}
              <span className="absolute bottom-1.5 left-1.5 text-[0.6rem] font-bold bg-black/55 text-white px-1.5 py-0.5 rounded">
                {VIEW_NAME[view]} · {count} {count === 1 ? 'ava.' : 'ava.'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="primary" size="md" onClick={handleGenerate} disabled={busy || !complete} title={!complete ? 'Capture e confirme as 4 fotos antes de gerar o texto.' : undefined}>
          {busy ? 'Gerando…' : 'Gerar texto de danos'}
        </Button>
        {!complete && (
          <span className="self-center text-[0.7rem] font-bold text-amber-300/90">
            Faltam fotos ({Object.keys(viewPhotos).length}/4)
          </span>
        )}
        {text && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                navigator.clipboard?.writeText(text)
                onToast?.('Texto copiado.')
              }}
            >
              Copiar
            </Button>
            {onUseText && (
              <Button type="button" variant="secondary" size="md" onClick={() => onUseText(text)}>
                Usar no dossiê
              </Button>
            )}
          </>
        )}
      </div>

      {text && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-48 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] p-3 text-[0.8rem] font-outfit leading-relaxed text-[var(--input-color)] outline-none focus:border-[var(--primary)]/50"
          placeholder="O texto das avarias aparece aqui…"
        />
      )}
    </div>
  )
}
