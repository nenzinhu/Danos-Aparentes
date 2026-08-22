'use client';
import { useRef, useState, useCallback } from 'react'
import { IconCamera } from '@/src/components/ui/AnimatedIcons'
import { buttonVariants } from '@/src/components/ui/buttonVariants'

const VIEWS = ['lateral-left', 'lateral-right', 'frontal', 'traseira'] as const
type FabView = (typeof VIEWS)[number]

const VIEW_SHORT: Record<FabView, string> = {
  'lateral-left': 'Lat. Esq.',
  'lateral-right': 'Lat. Dir.',
  frontal: 'Frontal',
  traseira: 'Traseira',
}

/**
 * Botão de ação flutuante (FAB) para captura em lote de 4 fotos.
 * O vistoriador clica 4x seguidas na câmera; o sistema gerencia o progresso.
 */
export default function PhotoFab({
  onCapture,
  disabled,
}: {
  onCapture: (files: File[], index: number) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [count, setCount] = useState(0)
  const [busy, setBusy] = useState(false)
  const [pendingView, setPendingView] = useState<FabView | null>(null)

  const openCamera = useCallback(() => {
    if (disabled || busy || count >= 4) return
    inputRef.current?.click()
  }, [disabled, busy, count])

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      // limpa o input para permitir tirar a mesma foto de novo se necessário
      e.target.value = ''
      if (!file) return
      const idx = count
      const view = VIEWS[idx] ?? 'lateral-left'
      setBusy(true)
      setPendingView(view)
      try {
        onCapture([file], idx)
        setCount((c) => Math.min(4, c + 1))
      } finally {
        setBusy(false)
        setPendingView(null)
        // Reabre a câmera automaticamente para a próxima foto (fluxo contínuo).
        if (idx + 1 < 4 && !disabled) {
          window.setTimeout(() => inputRef.current?.click(), 350)
        }
      }
    },
    [count, disabled, onCapture],
  )

  const pct = (count / 4) * 100

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {/* FAB centralizado */}
      <button
        type="button"
        onClick={openCamera}
        disabled={disabled || busy || count >= 4}
        aria-label={`Tirar foto ${count + 1} de 4`}
        className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 text-white shadow-2xl transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${buttonVariants({ variant: 'primary', size: 'lg' })}`}
      >
        <IconCamera size={34} />
        <span className="text-[0.8rem] font-black leading-tight">Tirar Foto</span>
        <span className="text-[0.7rem] font-bold tabular-nums opacity-90">
          {count >= 4 ? 'Pronto ✓' : `${count + 1}/4`}
        </span>
        {busy && (
          <span className="absolute inset-0 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        )}
      </button>

      {/* Barra de progresso + 4 bolinhas */}
      <div className="w-full max-w-[16rem] space-y-2">
        <div className="h-2 rounded-full bg-[var(--btn-secondary-bg)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          {VIEWS.map((v, i) => (
            <div key={v} className="flex flex-col items-center gap-1">
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                  i < count
                    ? 'bg-[var(--primary)] border-[var(--primary)]'
                    : i === count && pendingView === v
                      ? 'border-[var(--primary)] animate-pulse'
                      : 'border-[var(--btn-secondary-border)]'
                }`}
                aria-label={`Foto ${i + 1}: ${VIEW_SHORT[v]}${i < count ? ' (feita)' : ''}`}
              />
              <span className="text-[0.55rem] font-bold text-[var(--text-muted)]">{VIEW_SHORT[v]}</span>
            </div>
          ))}
        </div>
      </div>

      {count >= 4 && (
        <p className="text-[0.7rem] font-semibold text-emerald-300 text-center">
          4 fotos capturadas. Confirme os lados abaixo.
        </p>
      )}
    </div>
  )
}
