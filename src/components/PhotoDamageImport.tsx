'use client'

import { useRef, useState } from 'react'
import type { DamageType, Severity, VehicleType, ViewType } from '../types'
import type { PhotoDamageSuggestion } from '../lib/damageFromPhoto'
import { DAMAGE_TYPE_LABEL } from '../lib/damageFromPhoto'
import { getPartsForVehicle } from '../lib/vehiclePartsCatalog'
import { compressImage, fileToDataUrl, LOCAL_PHOTO_MAX_WIDTH, LOCAL_PHOTO_QUALITY } from '../lib/imageUtils'
import { VIEW_NAME } from './app/constants'

interface Props {
  vehicleType: VehicleType
  accessToken?: string
  disabled?: boolean
  onToast: (msg: string) => void
  onConfirm: (payload: {
    partId: string
    partName: string
    view: ViewType
    type: DamageType
    typeName: string
    severity: Severity
    notes: string
    photoFile: File
  }) => void
  onViewChange?: (view: ViewType) => void
}

const SEV_LABEL: Record<Severity, string> = { low: 'Leve', medium: 'Média', high: 'Grave' }
const CONF_LABEL = { high: 'Alta', medium: 'Média', low: 'Baixa' } as const

export default function PhotoDamageImport({
  vehicleType,
  accessToken,
  disabled,
  onToast,
  onConfirm,
  onViewChange,
}: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [suggestions, setSuggestions] = useState<PhotoDamageSuggestion[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [draft, setDraft] = useState<PhotoDamageSuggestion | null>(null)

  const parts = getPartsForVehicle(vehicleType)

  function reset() {
    setPreviewUrl(null)
    setPhotoFile(null)
    setSuggestions([])
    setSelectedIdx(0)
    setDraft(null)
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  async function handleFile(file: File | undefined) {
    if (!file || analyzing || disabled) return
    if (!file.type.startsWith('image/')) {
      onToast('❌ Selecione uma imagem')
      return
    }

    setAnalyzing(true)
    setSuggestions([])
    setDraft(null)

    try {
      const compressed = await compressImage(file, LOCAL_PHOTO_MAX_WIDTH, LOCAL_PHOTO_QUALITY)
      const compressedFile = new File([compressed], file.name.replace(/\.\w+$/, '.jpg') || 'avaria.jpg', {
        type: 'image/jpeg',
      })
      const dataUrl = await fileToDataUrl(compressedFile)
      setPreviewUrl(dataUrl)
      setPhotoFile(compressedFile)

      const res = await fetch('/api/damage-from-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ photo: dataUrl, vehicleType }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao analisar a foto')
      }

      const list = Array.isArray(data.suggestions) ? (data.suggestions as PhotoDamageSuggestion[]) : []
      if (list.length === 0) {
        onToast('⚠️ Não foi possível identificar a peça. Marque manualmente no diagrama.')
        reset()
        return
      }

      setSuggestions(list)
      setSelectedIdx(0)
      setDraft({ ...list[0] })
      if (list[0]?.view) onViewChange?.(list[0].view)
    } catch (err) {
      console.error(err)
      onToast(`❌ ${err instanceof Error ? err.message : 'Erro ao analisar foto'}`)
      reset()
    } finally {
      setAnalyzing(false)
    }
  }

  function selectSuggestion(idx: number) {
    const s = suggestions[idx]
    if (!s) return
    setSelectedIdx(idx)
    setDraft({ ...s })
    onViewChange?.(s.view)
  }

  function applyPartChange(partId: string) {
    const part = parts.find(p => p.partId === partId)
    if (!part || !draft) return
    setDraft({ ...draft, partId: part.partId, partName: part.partName, view: part.view })
    onViewChange?.(part.view)
  }

  function handleConfirm() {
    if (!draft || !photoFile) return
    onConfirm({
      partId: draft.partId,
      partName: draft.partName,
      view: draft.view,
      type: draft.type,
      typeName: draft.typeName,
      severity: draft.severity,
      notes: draft.description,
      photoFile,
    })
    onToast(`✅ Avaria marcada: ${draft.partName}`)
    reset()
  }

  return (
    <div className="mb-5 rounded-xl border border-[var(--panel-border)] bg-black/15 p-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
            <span aria-hidden="true">📷✨</span> Foto → diagrama
          </div>
          <p className="text-[0.72rem] text-[var(--text-muted)] mt-0.5 leading-snug">
            Tire uma foto ou anexe da galeria. A IA sugere a peça; você confirma antes de gravar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            disabled={analyzing || disabled}
            onClick={() => cameraInputRef.current?.click()}
            className="text-xs px-3.5 py-2 rounded-lg font-bold border border-fuchsia-500/35 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20 transition-all disabled:opacity-50"
          >
            {analyzing ? 'Analisando…' : 'Tirar foto'}
          </button>
          <button
            type="button"
            disabled={analyzing || disabled}
            onClick={() => galleryInputRef.current?.click()}
            className="text-xs px-3.5 py-2 rounded-lg font-bold border border-sky-500/35 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-all disabled:opacity-50"
          >
            {analyzing ? 'Analisando…' : 'Anexar foto'}
          </button>
        </div>
        {/* Câmera: capture tipicamente abre a câmera no celular */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => void handleFile(e.target.files?.[0])}
        />
        {/* Galeria: sem capture abre o seletor de arquivos */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => void handleFile(e.target.files?.[0])}
        />
      </div>

      {(previewUrl || analyzing) && (
        <div className="mt-3 flex flex-col gap-3">
          {previewUrl && (
            <div className="relative rounded-lg overflow-hidden border border-white/5 bg-black/30 max-h-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Prévia da avaria" className="w-full max-h-40 object-contain" />
              {analyzing && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-xs font-bold text-fuchsia-200 animate-pulse">
                  Identificando peça…
                </div>
              )}
            </div>
          )}

          {draft && !analyzing && (
            <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 flex flex-col gap-2.5">
              {suggestions.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, i) => (
                    <button
                      key={`${s.partId}-${i}`}
                      type="button"
                      onClick={() => selectSuggestion(i)}
                      className={`text-[0.68rem] px-2 py-1 rounded-md font-bold border transition-all ${
                        i === selectedIdx
                          ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 text-[var(--text-muted)] hover:border-white/20'
                      }`}
                    >
                      {s.partName}
                    </button>
                  ))}
                </div>
              )}

              <label className="text-[0.68rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Peça sugerida
                <select
                  value={draft.partId}
                  onChange={e => applyPartChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--panel-border)] bg-[var(--bg-main)] px-2.5 py-2 text-sm text-[var(--text-main)]"
                >
                  {parts.map(p => (
                    <option key={p.partId} value={p.partId}>
                      {VIEW_NAME[p.view]} · {p.partName}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-[0.68rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  Tipo
                  <select
                    value={draft.type}
                    onChange={e => {
                      const type = e.target.value as DamageType
                      setDraft({ ...draft, type, typeName: DAMAGE_TYPE_LABEL[type] })
                    }}
                    className="mt-1 w-full rounded-lg border border-[var(--panel-border)] bg-[var(--bg-main)] px-2.5 py-2 text-sm text-[var(--text-main)]"
                  >
                    {(Object.keys(DAMAGE_TYPE_LABEL) as DamageType[]).map(t => (
                      <option key={t} value={t}>{DAMAGE_TYPE_LABEL[t]}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[0.68rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  Severidade
                  <select
                    value={draft.severity}
                    onChange={e => setDraft({ ...draft, severity: e.target.value as Severity })}
                    className="mt-1 w-full rounded-lg border border-[var(--panel-border)] bg-[var(--bg-main)] px-2.5 py-2 text-sm text-[var(--text-main)]"
                  >
                    {(Object.keys(SEV_LABEL) as Severity[]).map(s => (
                      <option key={s} value={s}>{SEV_LABEL[s]}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="text-[0.68rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Descrição
                <textarea
                  value={draft.description}
                  onChange={e => setDraft({ ...draft, description: e.target.value.slice(0, 500) })}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-[var(--panel-border)] bg-[var(--bg-main)] px-2.5 py-2 text-sm text-[var(--text-main)] resize-y"
                />
              </label>

              <div className="text-[0.68rem] text-[var(--text-muted)]">
                Vista: <strong className="text-[var(--text-main)]">{VIEW_NAME[draft.view]}</strong>
                {' · '}Confiança: <strong className="text-[var(--text-main)]">{CONF_LABEL[draft.confidence]}</strong>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold border border-white/10 text-[var(--text-muted)] hover:bg-white/5"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="text-xs px-3.5 py-1.5 rounded-lg font-bold border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                >
                  Confirmar no diagrama
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
