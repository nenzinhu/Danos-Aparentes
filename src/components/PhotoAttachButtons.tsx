'use client';

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { IconCamera, IconGallery } from './ui/AnimatedIcons'

interface Props {
  disabled?: boolean
  compressing?: boolean
  /** Rótulo base, ex.: "foto da avaria" → vira "Tirar foto da avaria" / "Galeria" */
  label?: string
  onFile: (file: File) => void
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
  className = '',
}: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const busy = disabled || compressing

  function pick(fileList: FileList | null) {
    const file = fileList?.[0]
    if (file) onFile(file)
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
        onChange={e => {
          pick(e.target.files)
          e.target.value = ''
        }}
      />

      {compressing ? (
        <div className={`${baseBtn} border-sky-500/40 bg-sky-500/10 text-sky-400 cursor-wait w-full`}>
          <span className="animate-spin text-sky-400">⏳</span> Comprimindo…
        </div>
      ) : (
        <>
          <motion.button
            type="button"
            disabled={busy}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => cameraRef.current?.click()}
            className={`${baseBtn} border-sky-500/30 bg-sky-500/5 text-sky-500 hover:bg-sky-500/10 disabled:opacity-50`}
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
            className={`${baseBtn} border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50`}
          >
            <IconGallery size={18} />
            <span>Galeria</span>
          </motion.button>
        </>
      )}
    </div>
  )
}
