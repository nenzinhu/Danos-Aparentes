'use client'
import { useState, useCallback } from 'react'
import Button, { ButtonGroup } from './ui/Button'
import { IconShieldCheck } from './ui/AnimatedIcons'

type Mode = 'certified' | 'plain'
type Channel = 'whatsapp' | 'email'

interface Props {
  inspectionId?: string | null
  accessToken?: string | null
  /** Nome padrão do signatário (ex.: nome do cliente já informado). */
  defaultName?: string
  /** Garante que a inspeção existe no banco (salva a prévia) e retorna o id. */
  onEnsureInspectionId?: () => Promise<string | null>
  /** Layout compacto (usado junto aos botões de exportação). */
  compact?: boolean
  /** Gera e baixa o PDF simples, sem certificação. */
  onPlainPdf?: () => Promise<void> | void
  /** Habilita o botão de PDF simples (revisão humana confirmada). */
  canExportPlainPdf?: boolean
}

const onlyDigits = (s: string) => s.replace(/\D/g, '')
const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
/** BR: 10 (fixo) ou 11 (celular) dígitos, com DDD. */
const isValidPhone = (s: string) => {
  const d = onlyDigits(s)
  return d.length === 10 || d.length === 11
}

/**
 * Geração do laudo em PDF, em dois modos:
 *  - "Com certificação digital" (Assinafy — ICP-Brasil): assinatura qualificada,
 *    com envio do link por WhatsApp e/ou e-mail (pelo menos um obrigatório);
 *  - "Sem certificação": apenas o PDF, sem validade jurídica de assinatura.
 */
export default function CertifySignatureCard({
  inspectionId,
  accessToken,
  defaultName,
  onEnsureInspectionId,
  compact,
  onPlainPdf,
  canExportPlainPdf = true,
}: Props) {
  const [mode, setMode] = useState<Mode>('certified')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ signingUrl: string; signerName: string } | null>(null)
  const [name, setName] = useState(defaultName || '')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  // Canal principal escolhido; o outro fica opcional.
  const [channel, setChannel] = useState<Channel>('whatsapp')

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

    const mail = email.trim()
    const tel = phone.trim()

    // Regra: pelo menos um canal de envio preenchido; o outro é opcional.
    if (!mail && !tel) {
      setError('Informe o WhatsApp ou o e-mail para enviar o link de assinatura.')
      return
    }
    if (channel === 'whatsapp' && !tel) {
      setError('Informe o número de WhatsApp (ou troque o canal para e-mail).')
      return
    }
    if (channel === 'email' && !mail) {
      setError('Informe o e-mail (ou troque o canal para WhatsApp).')
      return
    }
    if (mail && !isValidEmail(mail)) {
      setError('E-mail inválido.')
      return
    }
    if (tel && !isValidPhone(tel)) {
      setError('WhatsApp inválido. Use DDD + número (ex.: 11 91234-5678).')
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
          signer: {
            fullName: signerName,
            email: mail || undefined,
            whatsappPhone: tel ? onlyDigits(tel) : undefined,
          },
          deliveryChannel: channel,
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
  }, [inspectionId, accessToken, name, email, phone, channel, onEnsureInspectionId])

  const handlePlain = useCallback(async () => {
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
  }, [onPlainPdf])

  const shareLink = useCallback(async () => {
    const digits = onlyDigits(phone)
    const text = `Laudo para assinatura digital (ICP-Brasil): ${result?.signingUrl ?? ''}`
    // Web Share API: abre o seletor do SO (WhatsApp do app nativo, etc.)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Laudo para assinatura', text, url: result?.signingUrl ?? '' })
        return
      } catch { /* usuário cancelou ou não suportado: cai no fallback */ }
    }
    // Fallback: wa.me (preenche o número se houver, senão abre apenas a mensagem)
    const waHref = `https://wa.me/${digits ? (digits.length > 11 ? digits : `55${digits}`) : ''}?text=${encodeURIComponent(text)}`
    window.open(waHref, '_blank', 'noopener,noreferrer')
  }, [phone, result])

  if (result) {
    const digits = onlyDigits(phone)
    const waHref = digits
      ? `https://wa.me/${digits.length > 11 ? digits : `55${digits}`}?text=${encodeURIComponent(
          `Laudo para assinatura digital (ICP-Brasil): ${result.signingUrl}`,
        )}`
      : null
    return (
      <div className={`glass-card p-4 text-center ${compact ? '' : 'mt-4'}`}>
        <p className="text-sm font-bold text-emerald-400">Certificação iniciada</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Link de assinatura criado no app. Compartilhe para o signatário assinar.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <a
            href={result.signingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.75rem] font-bold text-emerald-400 hover:text-emerald-300 underline"
          >
            Abrir link de assinatura →
          </a>
          <button
            type="button"
            onClick={() => { void shareLink() }}
            className="text-[0.75rem] font-bold text-green-500 hover:text-green-400 underline"
          >
            📤 Compartilhar (WhatsApp do app)
          </button>
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.75rem] font-bold text-green-500 hover:text-green-400 underline"
            >
              Reenviar no WhatsApp
            </a>
          )}
        </div>
      </div>
    )
  }

  const tabBase =
    'flex-1 px-3 py-2 rounded-lg text-[0.74rem] font-bold transition-colors cursor-pointer border'
  const tabOn = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
  const tabOff =
    'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
  const inputCls =
    'w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-color)] px-3 py-2 rounded-lg text-[0.8rem] outline-none focus:border-emerald-500/40'

  return (
    <div className={compact ? 'mt-3' : 'mt-4 pt-4 border-t border-emerald-500/20'}>
      <div className="flex items-center gap-2 mb-2">
        <IconShieldCheck size={16} className="text-emerald-400" />
        <span className="text-[0.7rem] font-black text-emerald-400 tracking-wider uppercase">
          Gerar laudo em PDF
        </span>
      </div>

      {/* Seletor de modo */}
      <div className="flex gap-2 mb-2.5" role="group" aria-label="Tipo de geração de PDF">
        <button
          type="button"
          onClick={() => { setMode('certified'); setError('') }}
          aria-pressed={mode === 'certified'}
          className={`${tabBase} ${mode === 'certified' ? tabOn : tabOff}`}
        >
          🔐 Com certificação digital
        </button>
        <button
          type="button"
          onClick={() => { setMode('plain'); setError('') }}
          aria-pressed={mode === 'plain'}
          className={`${tabBase} ${mode === 'plain' ? tabOn : tabOff}`}
        >
          📄 Sem certificação
        </button>
      </div>

      {mode === 'certified' ? (
        <>
          <p className="text-[0.72rem] text-[var(--text-muted)] leading-relaxed mb-2">
            Assinatura qualificada ICP-Brasil: gera o PDF e envia para assinatura com certificado
            digital (validade jurídica). O signatário recebe o link e assina com token de verificação.
          </p>
          <div className="space-y-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do signatário (certificação)"
              className={inputCls}
            />

            {/* Canal de envio: um obrigatório, o outro opcional */}
            <div className="flex gap-2" role="group" aria-label="Canal de envio do link">
              <button
                type="button"
                onClick={() => { setChannel('whatsapp'); setError('') }}
                aria-pressed={channel === 'whatsapp'}
                className={`${tabBase} ${channel === 'whatsapp' ? tabOn : tabOff}`}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => { setChannel('email'); setError('') }}
                aria-pressed={channel === 'email'}
                className={`${tabBase} ${channel === 'email' ? tabOn : tabOff}`}
              >
                E-mail
              </button>
            </div>

            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={
                channel === 'whatsapp'
                  ? 'WhatsApp com DDD (ex.: 11 91234-5678)'
                  : 'WhatsApp com DDD (opcional)'
              }
              aria-label="WhatsApp do signatário"
              className={inputCls}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                channel === 'email'
                  ? 'E-mail para envio do link'
                  : 'E-mail para envio do link (opcional)'
              }
              aria-label="E-mail do signatário"
              className={inputCls}
            />

            <Button
              type="button"
              variant="primary"
              onClick={() => { void handleCertify() }}
              loading={status === 'loading'}
              className="w-full"
            >
              {status === 'loading' ? 'Enviando para Assinafy…' : '🔐 Gerar PDF com certificação digital'}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => { void handlePlain() }}
              loading={status === 'loading'}
              disabled={!onPlainPdf || !canExportPlainPdf}
              className="w-full"
            >
              {status === 'loading' ? 'Gerando PDF…' : '📄 Gerar PDF sem certificação'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[0.72rem] text-[var(--text-muted)] leading-relaxed mb-2">
            Gera apenas o laudo em PDF, sem assinatura com certificado digital. Mantém hash e QR Code
            de verificação, mas <strong>não</strong> tem validade jurídica de assinatura qualificada.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={() => { void handlePlain() }}
            loading={status === 'loading'}
            disabled={!onPlainPdf || !canExportPlainPdf}
            className="w-full"
          >
            {status === 'loading' ? 'Gerando PDF…' : '📄 Gerar PDF sem certificação'}
          </Button>
          {!canExportPlainPdf && (
            <p className="text-[0.7rem] text-[var(--text-muted)] mt-1.5">
              Confirme a revisão humana acima para liberar a geração do PDF.
            </p>
          )}
        </>
      )}

      {error && (
        <p className="text-[0.72rem] text-red-400 font-semibold mt-2" role="alert">{error}</p>
      )}
    </div>
  )
}
