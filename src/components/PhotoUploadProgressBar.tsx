'use client';
import { usePhotoUploadProgress } from '@/src/hooks/usePhotoUploadProgress'

export default function PhotoUploadProgressBar() {
  const { active, phase, current, total, label } = usePhotoUploadProgress()

  if (!active || total <= 0) return null

  const visualUnits =
    phase === 'compressing' ? current + 0.35
    : phase === 'uploading' ? current + 0.85
    : current
  const pct = Math.min(100, Math.round((visualUnits / total) * 100))
  const phaseLabel = phase === 'compressing' ? 'Comprimindo' : phase === 'uploading' ? 'Enviando' : 'Processando'

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label || 'Progresso do upload de fotos'}
      className="fixed top-0 inset-x-0 z-[99998] px-4 pt-3 pb-2 bg-slate-950/95 border-b border-[var(--primary)]/25 backdrop-blur-md"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-1.5 text-[0.72rem] font-bold font-outfit text-slate-300">
          <span className="truncate">
            <span className="text-[var(--primary)] mr-1.5">{phaseLabel}</span>
            {label}
          </span>
          <span className="text-[var(--primary)] shrink-0 tabular-nums">
            {current}/{total} · {pct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-800/90 overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
