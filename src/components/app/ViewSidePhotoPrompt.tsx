'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { ViewType } from '@/src/types'
import { VIEW_NAME } from '@/src/components/app/constants'
import { storePhotoEvidence } from '@/src/lib/photoEvidence'
import { deletePhotoRef } from '@/src/lib/photoStore'
import {
  finishPhotoUploadProgress,
  startPhotoUploadProgress,
  updatePhotoUploadProgress,
} from '@/src/lib/photoUploadProgress'
import { IconCamera, IconGallery } from '@/src/components/ui/AnimatedIcons'

type Props = {
  view: ViewType
  currentPhoto?: string
  onSaved: (view: ViewType, photoRef: string) => void
  /** Opcional: só use se o fluxo permitir adiar (PDF ainda exige as 4 faces). */
  onSkip?: () => void
}

/**
 * Prompt após trocar a vista no diagrama: tirar ou anexar a foto desse lado.
 * As 4 vistas entram no dossiê junto com o diagrama SVG.
 */
export default function ViewSidePhotoPrompt({ view, currentPhoto, onSaved, onSkip }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(file: File) {
    setBusy(true)
    startPhotoUploadProgress(1, `Foto ${VIEW_NAME[view]}…`)
    try {
      updatePhotoUploadProgress({ phase: 'compressing', label: 'Preservando original e otimizando…' })
      const { optimizedRef } = await storePhotoEvidence(file)
      updatePhotoUploadProgress({ phase: 'uploading', current: 0, label: 'Salvando localmente…' })
      updatePhotoUploadProgress({ current: 1 })
      if (currentPhoto) void deletePhotoRef(currentPhoto)
      onSaved(view, optimizedRef)
    } catch (e) {
      console.error('Erro ao salvar foto do lado:', e)
    } finally {
      finishPhotoUploadProgress()
      setBusy(false)
    }
  }

  function pick(list: FileList | null) {
    const file = list?.[0]
    if (file) void handleFile(file)
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-[2px] p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-side-photo-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--signal-bright)] mb-1">
          Foto deste lado
        </p>
        <h2 id="view-side-photo-title" className="font-bold text-lg text-[var(--text-main)]">
          {VIEW_NAME[view]}
        </h2>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            pick(e.target.files)
            e.target.value = ''
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            pick(e.target.files)
            e.target.value = ''
          }}
        />

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
            className="min-h-12 w-full rounded-xl font-bold text-sm text-white inline-flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
          >
            <IconCamera size={18} />
            {busy ? 'Salvando…' : 'Tirar foto'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => galleryRef.current?.click()}
            className="min-h-12 w-full rounded-xl font-bold text-sm border border-emerald-500/35 bg-emerald-500/10 text-emerald-300 inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <IconGallery size={18} />
            Anexar da galeria
          </button>
          {onSkip ? (
            <button
              type="button"
              disabled={busy}
              onClick={onSkip}
              className="min-h-11 w-full rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              Depois (PDF exige as 4)
            </button>
          ) : null}
        </div>
      </motion.div>
    </div>
  )
}
