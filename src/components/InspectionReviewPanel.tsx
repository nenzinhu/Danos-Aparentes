'use client'
import { useState } from 'react'

interface InspectionReviewPanelProps {
  reviewedAt?: number
  reviewNotes?: string
  contentStale?: boolean
  busy?: boolean
  onCompleteReview: (notes: string) => void | Promise<void>
  onReopenReview: () => void | Promise<void>
}

export default function InspectionReviewPanel({
  reviewedAt,
  reviewNotes,
  contentStale,
  busy,
  onCompleteReview,
  onReopenReview,
}: InspectionReviewPanelProps) {
  const [notes, setNotes] = useState(reviewNotes ?? '')
  const reviewed = typeof reviewedAt === 'number' && reviewedAt > 0

  if (reviewed) {
    return (
      <div className="mb-6 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-emerald-400">Revisão humana concluída</p>
            <p className="text-[0.72rem] text-[var(--text-muted)] mt-1">
              {new Date(reviewedAt!).toLocaleString('pt-BR')}
              {reviewNotes ? ` — ${reviewNotes}` : ''}
            </p>
            {contentStale && (
              <p className="text-[0.72rem] text-amber-400 mt-2">
                O conteúdo mudou após a revisão. Reabra a revisão antes de emitir o PDF.
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => { void onReopenReview() }}
            className="text-xs px-3 py-1.5 rounded-lg font-bold border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
          >
            Reabrir revisão
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 p-4 rounded-xl border border-sky-500/25 bg-sky-500/5">
      <p className="text-sm font-bold text-sky-400 mb-1">Revisão humana (obrigatória)</p>
      <p className="text-[0.72rem] text-[var(--text-muted)] mb-3 leading-relaxed">
        Confira avarias, dados e assinaturas. Só depois da revisão o PDF oficial pode ser emitido.
      </p>
      <label className="block text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
        Observações (opcional)
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full mb-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-color)] px-3 py-2 rounded-lg text-[0.82rem] outline-none focus:border-sky-500/40 resize-none"
        placeholder="Ex.: conferido com cliente no pátio"
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => { void onCompleteReview(notes) }}
        className="text-xs px-4 py-2 rounded-lg font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
      >
        Concluir revisão humana
      </button>
    </div>
  )
}
