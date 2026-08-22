'use client'
import React from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  /** Estilo do botão de confirmação: 'danger' (vermelho) ou 'primary'. */
  tone?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Modal de confirmação reutilizável (padrão Sim/Não).
 * Fecha ao clicar fora ou em Cancelar. Ação destrutiva deve usar tone="danger".
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Sim',
  cancelLabel = 'Não',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null

  const confirmBg = tone === 'danger' ? '#ef4444' : '#2563eb'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2,6,23,0.72)',
        zIndex: 10000,
        padding: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Outfit, sans-serif',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(15,23,42,0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          overflow: 'hidden',
          color: '#f8fafc',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ padding: '22px 22px 8px' }}>
          <h2
            id="confirm-title"
            style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em', margin: 0 }}
          >
            {title}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: 10, lineHeight: 1.5, marginBottom: 0 }}>
            {message}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 22,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '16px 22px',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '10px 16px',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.2s',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              background: confirmBg,
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '10px 20px',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.2s',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
