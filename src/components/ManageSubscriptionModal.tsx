'use client';
import React from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onChooseCartao: () => void
  onChoosePix: () => void
}

export default function ManageSubscriptionModal({ open, onClose, onChooseCartao, onChoosePix }: Props) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Escolher forma de pagamento"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div
        role="presentation"
        className="glass-card w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-[var(--text-main)] mb-1">
          Gerenciar assinatura
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Como você quer pagar sua assinatura?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onChooseCartao}
            className="w-full py-3 rounded-lg bg-[var(--primary)] text-[var(--bg-main)] text-sm font-bold"
          >
            Cartão de crédito (Stripe)
          </button>
          <button
            onClick={onChoosePix}
            className="w-full py-3 rounded-lg border border-[var(--card-border)] text-[var(--text-main)] text-sm font-bold"
          >
            PIX (Asaas)
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
