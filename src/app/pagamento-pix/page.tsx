'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'
import { useSubscription } from '@/src/hooks/useSubscription'
import { trackPixPaymentConfirmed, trackPixQrGenerated } from '@/src/lib/analytics/events'
import { whatsappLink } from '@/src/lib/whatsapp'
import { loginUrlWithReturnTo } from '@/src/lib/safeReturnTo'

const MONTHLY_BRL = 49.9
const DURATION_OPTIONS = [1, 3, 6, 12] as const
type PixProviderOption = 'mercadopago' | 'asaas'

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
  const [provider, setProvider] = useState<PixProviderOption>(() => {
    const p = (searchParams.get('provider') || '').toLowerCase()
    return p === 'asaas' ? 'asaas' : 'mercadopago'
  })
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [copyPaste, setCopyPaste] = useState<string | null>(null)
  const [chargedMonths, setChargedMonths] = useState<number | null>(null)
  const [chargedProvider, setChargedProvider] = useState<PixProviderOption | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  /** Só true depois de gerar um PIX nesta sessão e o webhook confirmar. */
  const [pixJustPaid, setPixJustPaid] = useState(false)
  const [awaitingPix, setAwaitingPix] = useState(false)
  const [sawPendingCharge, setSawPendingCharge] = useState(false)
  const expiresAtWhenCharged = useRef<string | null>(null)
  const paymentConfirmedTracked = useRef(false)

  const total = useMemo(() => MONTHLY_BRL * durationMonths, [durationMonths])

  const generate = useCallback(async (months: number, pixProvider: PixProviderOption) => {
    setGenerating(true)
    setError(null)
    setQrCode(null)
    setCopyPaste(null)
    setPixJustPaid(false)
    setSawPendingCharge(false)
    paymentConfirmedTracked.current = false
    expiresAtWhenCharged.current = subscription?.expiresAt ?? null
    try {
      const result = await startPixCheckout(months, pixProvider)
      setQrCode(result.qrCode)
      setCopyPaste(result.copyPaste)
      setChargedMonths(months)
      setChargedProvider((result.provider as PixProviderOption) || pixProvider)
      setAwaitingPix(true)
      trackPixQrGenerated({
        source: 'pagamento-pix',
        duration_months: months,
        value: MONTHLY_BRL * months,
        currency: 'BRL',
      })
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar cobrança PIX')
      setAwaitingPix(false)
    } finally {
      setGenerating(false)
    }
  }, [startPixCheckout, refresh, subscription?.expiresAt])

  useEffect(() => {
    if (!qrCode || !awaitingPix) return
    const interval = setInterval(() => { void refresh() }, 3000)
    return () => clearInterval(interval)
  }, [qrCode, awaitingPix, refresh])

  // Confirma só o PIX gerado nesta sessão (não a assinatura que já existia).
  useEffect(() => {
    if (!awaitingPix || !subscription) return

    if (subscription.pendingMonths > 0) {
      setSawPendingCharge(true)
      return
    }

    const expiresGrew =
      Boolean(subscription.expiresAt) &&
      (
        !expiresAtWhenCharged.current ||
        new Date(subscription.expiresAt!).getTime() > new Date(expiresAtWhenCharged.current).getTime()
      )

    const settled =
      (sawPendingCharge && subscription.pendingMonths === 0) ||
      (subscription.pendingMonths === 0 && expiresGrew && (subscription.status === 'active_pix' || subscription.status === 'active'))

    if (settled) {
      setPixJustPaid(true)
      setAwaitingPix(false)
    }
  }, [awaitingPix, subscription, sawPendingCharge])

  function selectDuration(months: number) {
    setDurationMonths(months)
    if (qrCode) {
      setQrCode(null)
      setCopyPaste(null)
      setChargedMonths(null)
      setChargedProvider(null)
      setError(null)
      setAwaitingPix(false)
      setSawPendingCharge(false)
    }
  }

  function selectProvider(next: PixProviderOption) {
    setProvider(next)
    if (qrCode) {
      setQrCode(null)
      setCopyPaste(null)
      setChargedMonths(null)
      setChargedProvider(null)
      setError(null)
      setAwaitingPix(false)
      setSawPendingCharge(false)
    }
  }

  async function handleCopy() {
    if (!copyPaste) return
    await navigator.clipboard.writeText(copyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const alreadyHasAccess = Boolean(session) && Boolean(subscription?.hasAccess)

  useEffect(() => {
    if (!pixJustPaid || paymentConfirmedTracked.current) return
    paymentConfirmedTracked.current = true
    trackPixPaymentConfirmed({
      duration_months: chargedMonths ?? durationMonths,
      value: MONTHLY_BRL * (chargedMonths ?? durationMonths),
      currency: 'BRL',
    })
  }, [pixJustPaid, chargedMonths, durationMonths])

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-[var(--text-muted)]">
        Carregando…
      </main>
    )
  }

  if (!session) {
    const loginHref = loginUrlWithReturnTo(`/pagamento-pix?duration=${durationMonths}`)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-[var(--text-muted)]">Você precisa entrar na sua conta para pagar com PIX.</p>
        <Link href={loginHref} className="text-sm font-bold text-[var(--primary)] hover:underline">
          Fazer login →
        </Link>
      </main>
    )
  }

  if (pixJustPaid) {
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

        {alreadyHasAccess && (
          <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-[12px] text-emerald-400 leading-relaxed">
            Sua conta já tem acesso ativo
            {subscription?.status === 'trialing' ? ' (período de teste)' : ''}.
            Você pode gerar um PIX para <strong className="font-bold">renovar/estender</strong> o período —
            a confirmação só aparece depois que este pagamento for creditado.
          </div>
        )}

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
            <div className="space-y-3">
              <div className="rounded-xl border border-[var(--card-border)]/60 bg-[var(--bg-main)] px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--signal-bright)] mb-2">
                  Como pagar
                </p>
                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                  Provedor PIX
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3" role="group" aria-label="Provedor PIX">
                  <button
                    type="button"
                    onClick={() => selectProvider('mercadopago')}
                    className={`rounded-xl border py-2.5 px-2 text-[11px] font-bold transition-colors ${
                      provider === 'mercadopago'
                        ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]'
                        : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--primary)]/40'
                    }`}
                  >
                    Mercado Pago
                  </button>
                  <button
                    type="button"
                    onClick={() => selectProvider('asaas')}
                    className={`rounded-xl border py-2.5 px-2 text-[11px] font-bold transition-colors ${
                      provider === 'asaas'
                        ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]'
                        : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--primary)]/40'
                    }`}
                  >
                    Asaas (sandbox)
                  </button>
                </div>
                <ul className="space-y-1.5 text-[11px] text-[var(--text-muted)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--signal-bright)] mt-0.5 shrink-0" aria-hidden>✓</span>
                    <span>
                      Processado por{' '}
                      <strong className="text-[var(--text-main)] font-semibold">
                        {provider === 'asaas' ? 'Asaas (ambiente de testes)' : 'Mercado Pago'}
                      </strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--signal-bright)] mt-0.5 shrink-0" aria-hidden>✓</span>
                    <span>PIX — QR Code gerado na hora</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--signal-bright)] mt-0.5 shrink-0" aria-hidden>✓</span>
                    <span>Acesso liberado assim que o pagamento for confirmado</span>
                  </li>
                </ul>
                {provider === 'asaas' && (
                  <p className="text-[10px] text-amber-500/90 mt-2.5">
                    Sandbox: no painel Asaas use “Confirmar pagamento” na cobrança, ou configure o webhook
                    em <code className="text-[9px]">/api/webhooks/asaas</code>.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => generate(durationMonths, provider)}
                disabled={generating}
                className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--bg-main)] text-sm font-bold disabled:opacity-60"
              >
                {generating ? 'Gerando cobrança…' : `Gerar PIX · ${formatBRL(total)}`}
              </button>

              <p className="text-center text-[11px] text-[var(--text-muted)]">
                Prefere testar antes?{' '}
                <Link href="/app?mode=signup" className="font-bold text-[var(--primary)] hover:underline">
                  7 dias grátis sem cartão
                </Link>
              </p>
            </div>
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
              onClick={() => generate(durationMonths, provider)}
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
              {chargedProvider && (
                <>
                  {' '}via{' '}
                  <strong className="text-[var(--text-main)]">
                    {chargedProvider === 'asaas' ? 'Asaas' : 'Mercado Pago'}
                  </strong>
                </>
              )}
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
                onClick={() => generate(durationMonths, provider)}
                disabled={generating}
                className="w-full py-2.5 rounded-xl border border-[var(--primary)]/40 text-sm font-bold text-[var(--primary)] disabled:opacity-60"
              >
                {generating ? 'Gerando…' : `Gerar novo PIX · ${formatBRL(total)}`}
              </button>
            )}

            <p className="text-[11px] text-[var(--text-muted)]">
              {awaitingPix
                ? 'Aguardando confirmação do pagamento… esta página atualiza sozinha.'
                : 'Assim que o pagamento for confirmado, esta página atualiza automaticamente.'}
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
