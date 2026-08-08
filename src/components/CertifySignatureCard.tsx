'use client'
import { useState, useCallback } from 'react'
import Button from './ui/Button'
import { IconShieldCheck } from './ui/AnimatedIcons'

interface Props {
  inspectionId?: string | null
  accessToken?: string | null
  /** Nome padrão do signatário (ex.: nome do cliente já informado). */
  defaultName?: string
  /** Garante que a inspeção existe no banco (salva a prévia) e retorna o id. */
  onEnsureInspectionId?: () => Promise<string | null>
  /** Layout compacto (usado junto aos botões de exportação). */
  compact?: boolean
}

/**
 * Assinatura com certificado digital (Assinafy — ICp-Brasil).
 * Gera o laudo PDF no servidor, envia para a Assinafy e retorna o link
 * de assinatura qualificada do signatário.
 */
export default function CertifySignatureCard({ inspectionId, accessToken, defaultName, onEnsureInspectionId, compact }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ signingUrl: string; signerName: string } | null>(null)
  const [name, setName] = useState(defaultName || '')
  const [email, setEmail] = useState('')

  const handleCertify = useCallback(async () => {
    if (!accessToken) {
      setError('Faça login novamente para certificar a assinatura digital.')
      return
    }
    const signerName = name.trim()
    if (!signerName) {
      setError('Informe o nome do signatário para a certificação digital.')
      return
    }
    setStatus('loading')
    setError('')
    try {
      // Garante que a inspeção existe no banco (salva a prévia) antes de certificar.
      let id = inspectionId || null
      if (!id && onEnsureInspectionId) {
        id = await onEnsureInspectionId()
      }
      if (!id) {
        setError('Salve a vistoria antes de certificar a assinatura digital.')
        setStatus('error')
        return
      }
      const res = await fetch('/api/certify-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          inspectionId: id,
          signer: { fullName: signerName, email: email.trim() || undefined },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.signingUrl) {
        setResult({ signingUrl: data.signingUrl, signerName })
        setStatus('done')
      } else {
        setError(data.error || 'Não foi possível iniciar a certificação digital.')
        setStatus('error')
      }
    } catch {
      setError('Erro de conexão ao solicitar certificação.')
      setStatus('error')
    }
  }, [inspectionId, accessToken, name, email])

  if (result) {
    return (
      <div className={`glass-card p-4 text-center ${compact ? '' : 'mt-4'}`}>
        <p className="text-sm font-bold text-emerald-400">Certificação iniciada</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Link enviado para <strong>{result.signerName}</strong>.
        </p>
        <a
          href={result.signingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-[0.75rem] font-bold text-emerald-400 hover:text-emerald-300 underline"
        >
          Abrir link de assinatura →
        </a>
      </div>
    )
  }

  return (
    <div className={compact ? 'mt-3' : 'mt-4 pt-4 border-t border-emerald-500/20'}>
      <div className="flex items-center gap-2 mb-2">
        <IconShieldCheck size={16} className="text-emerald-400" />
        <span className="text-[0.7rem] font-black text-emerald-400 tracking-wider uppercase">
          Certificação Digital
        </span>
        <span className="text-[0.62rem] text-[var(--text-muted)]">Assinatura qualificada ICp-Brasil</span>
      </div>
      <p className="text-[0.72rem] text-[var(--text-muted)] leading-relaxed mb-2">
        Gera o laudo em PDF e envia para assinatura com certificado digital (validade jurídica).
        O signatário recebe o link e assina com token de verificação.
      </p>
      <div className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do signatário (certificação)"
          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-color)] px-3 py-2 rounded-lg text-[0.8rem] outline-none focus:border-emerald-500/40"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail para envio do token (opcional)"
          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-color)] px-3 py-2 rounded-lg text-[0.8rem] outline-none focus:border-emerald-500/40"
        />
        <Button
          type="button"
          variant="primary"
          onClick={() => { void handleCertify() }}
          loading={status === 'loading'}
          className="w-full"
        >
          {status === 'loading' ? 'Enviando para Assinafy…' : '🔐 Assinar com certificação digital'}
        </Button>
        {error && (
          <p className="text-[0.72rem] text-red-400 font-semibold" role="alert">{error}</p>
        )}
      </div>
    </div>
  )
}
