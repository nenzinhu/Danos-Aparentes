'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { IconCamera, IconGallery } from './ui/AnimatedIcons'

interface Props {
  disabled?: boolean
  compressing?: boolean
  /** Rótulo base, ex.: "foto da avaria" → vira "Tirar foto da avaria" / "Galeria" */
  label?: string
  onFile: (file: File) => void
  /** Galeria pode enviar várias (câmera continua 1 a 1). */
  multiple?: boolean
  maxFiles?: number
  onFiles?: (files: File[]) => void
  className?: string
}

/**
 * Duas ações de anexo: câmera (capture) e galeria (sem capture).
 * Em desktop ambos abrem o seletor de arquivos; no mobile o capture
 * costuma ir direto para a câmera traseira.
 */
export default function PhotoAttachButtons({
  disabled = false,
  compressing = false,
  label = 'foto',
  onFile,
  multiple = false,
  maxFiles = 4,
  onFiles,
  className = '',
}: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const busy = disabled || compressing

  function pickOne(fileList: FileList | null) {
    const file = fileList?.[0]
    if (file) onFile(file)
  }

  function pickMany(fileList: FileList | null) {
    if (!fileList?.length) return
    const files = Array.from(fileList).slice(0, Math.max(1, maxFiles))
    if (onFiles) onFiles(files)
    else if (files[0]) onFile(files[0])
  }

  const baseBtn =
    'flex-1 min-h-12 rounded-xl border border-dashed flex items-center justify-center text-[0.78rem] sm:text-sm gap-2 font-bold font-outfit transition-colors px-2 cursor-pointer'

  return (
    <div className={`flex gap-2 w-full ${className}`}>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={busy}
        onChange={e => {
          pickOne(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        disabled={busy}
        onChange={e => {
          if (multiple) pickMany(e.target.files)
          else pickOne(e.target.files)
          e.target.value = ''
        }}
      />

      {compressing ? (
        <div className={`${baseBtn} border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)] cursor-wait w-full`}>
          <span className="animate-spin text-[var(--primary)]" aria-hidden>…</span> Comprimindo…
        </div>
      ) : (
        <>
          <motion.button
            type="button"
            disabled={busy}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => cameraRef.current?.click()}
            className={`${baseBtn} border-[var(--primary)]/30 bg-[var(--primary)]/5 text-[var(--primary)] hover:bg-[var(--primary)]/10 disabled:opacity-50`}
          >
            <IconCamera size={18} />
            <span>Tirar {label}</span>
          </motion.button>
          <motion.button
            type="button"
            disabled={busy}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => galleryRef.current?.click()}
            className={`${baseBtn} border-[var(--success)]/30 bg-[var(--success)]/5 text-[var(--success)] hover:bg-[var(--success)]/10 disabled:opacity-50`}
          >
            <IconGallery size={18} />
            <span>Galeria</span>
          </motion.button>
        </>
      )}
    </div>
  )
}
