'use client'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import type { SubscriptionStatus } from '../hooks/useSubscription'
import { LEGAL_CONTACT_EMAIL } from './LegalContent'
import {
  DEFAULT_PIX_UNIT_BRL,
  PIX_SURCHARGE_MAX_BRL,
  PIX_UNITS_MAX,
  PIX_UNITS_MIN,
  calculatePixAmount,
} from '../lib/pixPricing'

interface Props {
  status: SubscriptionStatus
  onSignOut?: () => void
  accessToken?: string
  onCheckoutCard?: () => Promise<void>
}

interface PixResponse {
  paymentId: number
  status: string
  qrCode: string | null
  qrCodeBase64: string | null
  ticketUrl: string | null
  expiresAt: string | null
  amount: {
    units: number
    unitPriceBrl: number
    unitsSubtotalBrl: number
    surchargeBrl: number
    totalBrl: number
  }
  error?: string
}

export default function Paywall({ status, onSignOut, accessToken, onCheckoutCard }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [units, setUnits] = useState(1)
  const [surchargeInput, setSurchargeInput] = useState('')
  const [showSurcharge, setShowSurcharge] = useState(false)
  const [loadingPix, setLoadingPix] = useState(false)
  const [loadingCard, setLoadingCard] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pix, setPix] = useState<PixResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [paid, setPaid] = useState(false)

  const surchargeBrl = (() => {
    const n = Number(String(surchargeInput).replace(',', '.'))
    return Number.isFinite(n) && n > 0 ? n : 0
  })()

  const breakdown = calculatePixAmount({
    units,
    surchargeBrl: showSurcharge ? surchargeBrl : 0,
    unitPriceBrl: DEFAULT_PIX_UNIT_BRL,
  })

  useEffect(() => {
    cardRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!pix?.paymentId || !accessToken || paid) return

    let cancelled = false
    const tick = async () => {
      try {
        const res = await fetch(`/api/pix-payment-status?id=${pix.paymentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!res.ok || cancelled) return
        const data = (await res.json()) as { approved?: boolean }
        if (data.approved) {
          setPaid(true)
          window.location.href = '/app?checkout=success'
        }
      } catch {
        // ignore transient poll errors
      }
    }

    const id = window.setInterval(tick, 4000)
    void tick()
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [pix?.paymentId, accessToken, paid])

  const title = status === 'past_due'
    ? 'Seu pagamento falhou'
    : 'Seu teste grátis de 7 dias acabou'

  const description = status === 'past_due'
    ? 'Não confirmamos o pagamento da assinatura. Pague via PIX (sem cartão) ou cartão para retomar o acesso.'
    : 'Para continuar com vistorias, laudos em PDF e sync na nuvem, assine o plano PRO. PIX gera o QR na hora.'

  const generatePix = useCallback(async () => {
    if (!accessToken) {
      setError('Faça login novamente para gerar o PIX.')
      return
    }
    setLoadingPix(true)
    setError(null)
    setPix(null)
    setCopied(false)
    try {
      const res = await fetch('/api/create-pix-payment', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          units: breakdown.units,
          surchargeBrl: breakdown.surchargeBrl,
        }),
      })
      const data = (await res.json()) as PixResponse & { error?: string }
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível gerar o PIX')
      }
      if (!data.qrCodeBase64 && !data.qrCode && !data.ticketUrl) {
        throw new Error(
          'Mercado Pago não retornou QR Code. Confira a chave PIX e o Access Token da conta.',
        )
      }
      setPix(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar PIX')
    } finally {
      setLoadingPix(false)
    }
  }, [accessToken, breakdown.units, breakdown.surchargeBrl])

  const copyPix = useCallback(async () => {
    if (!pix?.qrCode) return
    try {
      await navigator.clipboard.writeText(pix.qrCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Não foi possível copiar o código PIX')
    }
  }, [pix?.qrCode])

  const handleCard = useCallback(async () => {
    if (!onCheckoutCard) return
    setLoadingCard(true)
    setError(null)
    try {
      await onCheckoutCard()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no checkout com cartão')
      setLoadingCard(false)
    }
  }, [onCheckoutCard])

  const btnPrimary: CSSProperties = {
    display: 'block',
    background: '#00aaff',
    color: '#02101e',
    fontWeight: 800,
    fontSize: '0.95rem',
    padding: '14px 28px',
    borderRadius: 10,
    textDecoration: 'none',
    fontFamily: 'Outfit,sans-serif',
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    cursor: 'pointer',
  }

  const btnSecondary: CSSProperties = {
    ...btnPrimary,
    background: 'transparent',
    color: 'var(--text-main)',
    border: '1px solid var(--card-border)',
    marginTop: 10,
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      aria-describedby="paywall-desc"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 24,
          padding: '36px 28px',
          maxWidth: 460,
          width: '100%',
          textAlign: 'center',
          backdropFilter: 'blur(18px)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <div aria-hidden="true" style={{ fontSize: '2.4rem', marginBottom: 12 }}>
          {status === 'past_due' ? '⚠️' : '⏳'}
        </div>
        <h1 id="paywall-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
          {title}
        </h1>
        <p id="paywall-desc" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: 22 }}>
          {description}
        </p>

        {!pix && (
          <>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#00aaff', marginBottom: 4 }}>
              R$ {breakdown.totalBrl.toFixed(2).replace('.', ',')}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 18 }}>
              {breakdown.units}× R$ {breakdown.unitPriceBrl.toFixed(2).replace('.', ',')}
              {breakdown.surchargeBrl > 0
                ? ` + acréscimo R$ ${breakdown.surchargeBrl.toFixed(2).replace('.', ',')}`
                : ''}{' '}
              · cancele quando quiser
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unidades (meses)</span>
              <button
                type="button"
                aria-label="Diminuir unidades"
                disabled={units <= PIX_UNITS_MIN}
                onClick={() => setUnits((u) => Math.max(PIX_UNITS_MIN, u - 1))}
                style={stepperBtn}
              >
                −
              </button>
              <strong style={{ minWidth: 28, color: 'var(--text-main)' }}>{units}</strong>
              <button
                type="button"
                aria-label="Adicionar unidade"
                disabled={units >= PIX_UNITS_MAX}
                onClick={() => setUnits((u) => Math.min(PIX_UNITS_MAX, u + 1))}
                style={stepperBtn}
              >
                +
              </button>
            </div>

            {!showSurcharge ? (
              <button
                type="button"
                onClick={() => setShowSurcharge(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00aaff',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginBottom: 16,
                  textDecoration: 'underline',
                  fontFamily: 'Outfit,sans-serif',
                }}
              >
                + Adicionar acréscimo em cima da unidade
              </button>
            ) : (
              <label
                style={{
                  display: 'block',
                  textAlign: 'left',
                  marginBottom: 16,
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                }}
              >
                Acréscimo (R$) — somado em cima do subtotal das unidades
                <input
                  type="number"
                  min={0}
                  max={PIX_SURCHARGE_MAX_BRL}
                  step="0.01"
                  value={surchargeInput}
                  onChange={(e) => setSurchargeInput(e.target.value)}
                  placeholder="0,00"
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 6,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--card-border)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text-main)',
                    fontFamily: 'Outfit,sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
              </label>
            )}

            <button type="button" onClick={generatePix} disabled={loadingPix} style={btnPrimary}>
              {loadingPix ? 'Gerando PIX…' : 'Pagar com PIX'}
            </button>

            {onCheckoutCard && (
              <button type="button" onClick={handleCard} disabled={loadingCard} style={btnSecondary}>
                {loadingCard ? 'Abrindo cartão…' : 'Pagar com cartão'}
              </button>
            )}
          </>
        )}

        {pix && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              Escaneie o QR Code PIX
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 14 }}>
              Total R$ {pix.amount.totalBrl.toFixed(2).replace('.', ',')} · liberação automática após o pagamento
            </div>

            {pix.qrCodeBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/jpeg;base64,${pix.qrCodeBase64}`}
                alt="QR Code PIX"
                width={220}
                height={220}
                style={{
                  width: 220,
                  height: 220,
                  margin: '0 auto 14px',
                  borderRadius: 12,
                  background: '#fff',
                  display: 'block',
                }}
              />
            ) : pix.ticketUrl ? (
              <a
                href={pix.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...btnPrimary, marginBottom: 14 }}
              >
                Abrir QR Code no Mercado Pago
              </a>
            ) : null}

            {pix.qrCode && (
              <button type="button" onClick={copyPix} style={btnSecondary}>
                {copied ? 'Código copiado!' : 'Copiar código Pix'}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setPix(null)
                setError(null)
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                marginTop: 14,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontFamily: 'Outfit,sans-serif',
              }}
            >
              Voltar / gerar outro valor
            </button>
          </div>
        )}

        {error && (
          <p role="alert" style={{ color: '#ff6b6b', fontSize: '0.82rem', marginTop: 14, lineHeight: 1.4 }}>
            {error}
          </p>
        )}

        <Link
          href={`mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent('[Suporte] Assinatura / Plano PRO')}`}
          style={{
            display: 'inline-block',
            marginTop: 18,
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
          }}
        >
          Falar com o suporte
        </Link>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            style={{
              display: 'block',
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              marginTop: 12,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'Outfit,sans-serif',
            }}
          >
            Sair da conta
          </button>
        )}
      </div>
    </div>
  )
}

const stepperBtn: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: '1px solid var(--card-border)',
  background: 'rgba(0,170,255,0.12)',
  color: 'var(--text-main)',
  fontSize: '1.2rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Outfit,sans-serif',
}
