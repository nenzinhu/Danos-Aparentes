'use client'
import { useState } from 'react'

interface InspectionReviewPanelProps {
  reviewedAt?: number
  reviewNotes?: string
  reviewerName?: string
  contentStale?: boolean
  busy?: boolean
  onCompleteReview: (notes: string) => void | Promise<void>
  onReopenReview: () => void | Promise<void>
}

export default function InspectionReviewPanel({
  reviewedAt,
  reviewNotes,
  reviewerName,
  contentStale,
  busy,
  onCompleteReview,
  onReopenReview,
}: InspectionReviewPanelProps) {
  const [notes, setNotes] = useState(reviewNotes ?? '')
  const [open, setOpen] = useState(false)
  const reviewed = typeof reviewedAt === 'number' && reviewedAt > 0

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2">
          <span className={`text-[0.7rem] font-black uppercase tracking-wider ${reviewed ? 'text-[var(--success)]' : 'text-sky-400'}`}>
            Revisão humana{reviewed ? ' ✓' : ' (obrigatória)'}
          </span>
        </span>
        <span className={`text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-[var(--card-border)] space-y-3">
          {reviewed ? (
            <div>
              <p className="text-[0.78rem] text-[var(--text-main)] font-bold">
                Concluída em {new Date(reviewedAt!).toLocaleString('pt-BR')}
              </p>
              {reviewerName && (
                <p className="text-[0.72rem] text-[var(--text-muted)] mt-0.5">por {reviewerName}</p>
              )}
              {reviewNotes && (
                <p className="text-[0.72rem] text-[var(--text-muted)] mt-1 leading-relaxed">{reviewNotes}</p>
              )}
              {contentStale && (
                <p className="text-[0.72rem] text-amber-400 mt-2">
                  O conteúdo mudou após a revisão. Reabra para reconfirmar antes de emitir o PDF.
                </p>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => { void onReopenReview() }}
                className="mt-2 text-xs px-3 py-1.5 rounded-lg font-bold border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
              >
                Reabrir revisão
              </button>
            </div>
          ) : (
            <div>
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
          )}
        </div>
      )}
    </div>
  )
}
