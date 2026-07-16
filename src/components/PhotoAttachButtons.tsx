'use client';

import { useRef } from 'react'

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
    'flex-1 min-h-12 rounded-xl border border-dashed flex items-center justify-center text-[0.78rem] sm:text-sm gap-1.5 font-bold font-outfit transition-colors px-2'

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
          ⏳ Comprimindo…
        </div>
      ) : (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
            className={`${baseBtn} border-sky-500/30 bg-sky-500/5 text-sky-500 hover:bg-sky-500/10 disabled:opacity-50`}
          >
            📷 Tirar {label}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => galleryRef.current?.click()}
            className={`${baseBtn} border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50`}
          >
            🖼️ Galeria
          </button>
        </>
      )}
    </div>
  )
}
