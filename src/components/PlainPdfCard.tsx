'use client'
import { useState } from 'react'
import Button from './ui/Button'
import { IconShieldCheck } from './ui/AnimatedIcons'

interface Props {
  /** Gera e baixa o PDF do laudo (com QR Code + hash SHA-256 de verificação). */
  onPlainPdf?: () => Promise<void> | void
  /** Habilita o botão de PDF (revisão humana confirmada + 4 fotos prontas). */
  canExportPlainPdf?: boolean
}

/**
 * Geração do laudo em PDF, sem certificação digital.
 * O PDF sai com QR Code (link /verify) e hash SHA-256 — qualquer alteração
 * do arquivo após a emissão quebra o hash na verificação pública.
 */
export default function PlainPdfCard({ onPlainPdf, canExportPlainPdf = true }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  const handlePlain = async () => {
    if (!onPlainPdf) return
    setStatus('loading')
    setError('')
    try {
      await onPlainPdf()
      setStatus('idle')
    } catch {
      setError('Não foi possível gerar o PDF.')
      setStatus('error')
    }
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <IconShieldCheck size={16} className="text-[var(--success)]" />
        <span className="text-[0.7rem] font-black text-[var(--success)] tracking-wider uppercase">
          Gerar laudo em PDF
        </span>
      </div>

      <p className="text-[0.72rem] text-[var(--text-muted)] leading-relaxed mb-2">
        Gera o laudo em PDF com <strong>QR Code</strong> e <strong>hash SHA-256</strong> de verificação.
        Se o arquivo for editado após a emissão, o hash não confere na verificação pública.
      </p>

      <Button
        type="button"
        variant="primary"
        onClick={() => { void handlePlain() }}
        loading={status === 'loading'}
        disabled={!onPlainPdf || !canExportPlainPdf}
        className="w-full"
      >
        {status === 'loading' ? 'Gerando PDF…' : '📄 Gerar PDF do laudo'}
      </Button>

      {!canExportPlainPdf && (
        <p className="text-[0.7rem] text-[var(--text-muted)] mt-1.5">
          Confirme a revisão humana e anexe as 4 fotos dos lados para liberar a geração do PDF.
        </p>
      )}

      {error && (
        <p className="text-[0.72rem] text-red-400 font-semibold mt-2" role="alert">{error}</p>
      )}
    </div>
  )
}
