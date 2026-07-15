'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'
import { useSubscription } from '@/src/hooks/useSubscription'
import { whatsappLink } from '@/src/lib/whatsapp'

const MONTHLY_BRL = 49.9
const DURATION_OPTIONS = [1, 3, 6, 12] as const

const PRO_FEATURES = [
  'Vistorias offline e online ilimitadas',
  'PDF com Hash SHA-256',
  'Assinatura digital vistoriador + cliente',
  'Envio do laudo por WhatsApp',
  'Consulta automática de placas',
  'Marca própria (nome e logotipo)',
]

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function parseDuration(raw: string | null): number {
  const n = Number(raw ?? '1')
  return (DURATION_OPTIONS as readonly number[]).includes(n) ? n : 1
}

function PagamentoPixContent() {
  const searchParams = useSearchParams()
  const { session, loading: authLoading } = useAuth()
  const { info: subscription, refresh, startPixCheckout } = useSubscription(
    session?.user.id,
    session?.access_token,
  )

  const [durationMonths, setDurationMonths] = useState(() => parseDuration(searchParams.get('duration')))
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [copyPaste, setCopyPaste] = useState<string | null>(null)
  const [chargedMonths, setChargedMonths] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const total = useMemo(() => MONTHLY_BRL * durationMonths, [durationMonths])

  const generate = useCallback(async (months: number) => {
    setGenerating(true)
    setError(null)
    setQrCode(null)
    setCopyPaste(null)
    try {
      const result = await startPixCheckout(months)
      setQrCode(result.qrCode)
      setCopyPaste(result.copyPaste)
      setChargedMonths(months)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar cobrança PIX')
    } finally {
      setGenerating(false)
    }
  }, [startPixCheckout])

  useEffect(() => {
    if (!qrCode || subscription?.hasAccess) return
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [qrCode, subscription?.hasAccess, refresh])

  function selectDuration(months: number) {
    setDurationMonths(months)
    if (qrCode) {
      setQrCode(null)
      setCopyPaste(null)
      setChargedMonths(null)
      setError(null)
    }
  }

  async function handleCopy() {
    if (!copyPaste) return
    await navigator.clipboard.writeText(copyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-[var(--text-muted)]">
        Carregando…
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-[var(--text-muted)]">Você precisa entrar na sua conta para pagar com PIX.</p>
        <Link href="/app" className="text-sm font-bold text-[var(--primary)] hover:underline">
          Fazer login →
        </Link>
      </main>
    )
  }

  if (subscription?.hasAccess) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-2xl" aria-hidden>✅</p>
        <p className="text-sm font-bold text-[var(--text-main)]">
          Pagamento confirmado! Sua assinatura está ativa.
        </p>
        <Link href="/app" className="text-sm font-bold text-[var(--primary)] hover:underline">
          Ir para o app →
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-10 font-outfit text-[var(--text-main)]">
      <div className="w-full max-w-md">
        <Link
          href="/planos"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Ver todos os planos
        </Link>

        <h1 className="font-display text-2xl font-bold uppercase tracking-tight mb-1">Assinar com PIX</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Escolha o plano e quantos meses deseja pagar agora.
        </p>

        <section className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--card-bg)] p-5 mb-4 shadow-[0_0_24px_var(--primary-glow)]">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--primary)]">Plano Pro</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Vistoriadores e oficinas</p>
            </div>
            <p className="text-sm font-bold text-[var(--text-muted)] whitespace-nowrap">
              {formatBRL(MONTHLY_BRL)}/mês
            </p>
          </div>

          <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-2">
            Quantos meses?
          </p>
          <div className="grid grid-cols-4 gap-2 mb-4" role="group" aria-label="Quantidade de meses">
            {DURATION_OPTIONS.map((m) => {
              const selected = durationMonths === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectDuration(m)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition-colors ${
                    selected
                      ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]'
                      : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--primary)]/40'
                  }`}
                >
                  {m}
                </button>
              )
            })}
          </div>

          <div className="rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)]/50 px-4 py-3 mb-4">
            <p className="text-[11px] text-[var(--text-muted)]">Total a pagar</p>
            <p className="text-2xl font-black text-[var(--primary)] tracking-tight">{formatBRL(total)}</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {durationMonths} {durationMonths === 1 ? 'mês' : 'meses'} × {formatBRL(MONTHLY_BRL)}
            </p>
          </div>

          <ul className="space-y-1.5 mb-5">
            {PRO_FEATURES.map((feat) => (
              <li key={feat} className="flex items-start gap-2 text-[11px] text-[var(--text-main)]">
                <span className="text-[var(--signal-bright)] mt-0.5">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          {!qrCode && (
            <button
              type="button"
              onClick={() => generate(durationMonths)}
              disabled={generating}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--bg-main)] text-sm font-bold disabled:opacity-60"
            >
              {generating ? 'Gerando cobrança…' : `Gerar PIX · ${formatBRL(total)}`}
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 mb-6">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Corporativo</p>
          <p className="text-sm font-bold text-[var(--text-main)] mt-1">Equipes, frotas e locadoras</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 mb-3">
            Múltiplos usuários, painel central e preço sob consulta.
          </p>
          <a
            href={whatsappLink('Olá! Quero o plano Corporativo do Danos Aparentes.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-xs font-bold text-[var(--primary)] hover:underline"
          >
            Falar no WhatsApp →
          </a>
        </section>

        {error && (
          <div className="flex flex-col items-center gap-3 mb-4 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => generate(durationMonths)}
              className="text-sm font-bold text-[var(--primary)] hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {qrCode && !error && (
          <div className="flex flex-col items-center gap-4 text-center rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
            <p className="text-xs text-[var(--text-muted)]">
              QR gerado para{' '}
              <strong className="text-[var(--text-main)]">
                {chargedMonths} {chargedMonths === 1 ? 'mês' : 'meses'}
              </strong>
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code para pagamento PIX"
              className="w-56 h-56 rounded-xl border border-[var(--card-border)]"
            />

            {copyPaste && (
              <div className="w-full text-left">
                <p className="text-xs text-[var(--text-muted)] mb-2">Ou copie o código:</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={copyPaste}
                    className="flex-1 text-[11px] px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-main)] truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-xs font-bold px-3 py-2 rounded-lg bg-[var(--primary)] text-[var(--bg-main)] whitespace-nowrap"
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            {chargedMonths !== durationMonths && (
              <button
                type="button"
                onClick={() => generate(durationMonths)}
                disabled={generating}
                className="w-full py-2.5 rounded-xl border border-[var(--primary)]/40 text-sm font-bold text-[var(--primary)] disabled:opacity-60"
              >
                {generating ? 'Gerando…' : `Gerar novo PIX · ${formatBRL(total)}`}
              </button>
            )}

            <p className="text-[11px] text-[var(--text-muted)]">
              Assim que o pagamento for confirmado, esta página atualiza automaticamente.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function PagamentoPixPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-sm text-[var(--text-muted)]">
          Carregando…
        </main>
      }
    >
      <PagamentoPixContent />
    </Suspense>
  )
}
