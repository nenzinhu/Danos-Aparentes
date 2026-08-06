'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'
import { useSubscription, type PurchasablePlan } from '@/src/hooks/useSubscription'
import { loginUrlWithReturnTo } from '@/src/lib/safeReturnTo'
import { buttonVariants } from '@/src/components/ui/Button'

const PLAN_PRICE: Record<PurchasablePlan, number> = { starter: 29.9, pro: 79.9 }
const PLAN_LABEL: Record<PurchasablePlan, string> = {
  starter: 'Plano Starter',
  pro: 'Plano Pro',
}
const PLAN_LAUDOS: Record<PurchasablePlan, number> = { starter: 20, pro: 80 }
const PLAN_FEATURES: Record<PurchasablePlan, string[]> = {
  starter: [
    'Até 20 laudos em PDF por mês',
    'Vistorias offline e online',
    'PDF com Hash SHA-256',
    'Assinatura digital vistoriador + cliente',
    'Consulta automática de placas',
  ],
  pro: [
    'Até 80 laudos em PDF por mês',
    'Tudo do plano Starter incluído',
    'Marca própria (nome e logotipo no PDF)',
    'Painel de estatísticas',
    'Suporte com prioridade',
  ],
}

function isPlan(value: string | null): value is PurchasablePlan {
  return value === 'starter' || value === 'pro'
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function PagamentoCartaoInner() {
  const searchParams = useSearchParams()
  const { session, loading: authLoading } = useAuth()
  const { startCheckout } = useSubscription(session?.user.id, session?.access_token)

  const [plan, setPlan] = useState<PurchasablePlan>(() =>
    isPlan(searchParams.get('plan')) ? (searchParams.get('plan') as PurchasablePlan) : 'pro',
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const autoStarted = useRef(false)

  const goStripe = useCallback(async () => {
    setError(null)
    setBusy(true)
    try {
      await startCheckout(plan)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível abrir o checkout Stripe')
      setBusy(false)
    }
  }, [plan, startCheckout])

  // Se veio dos cards com autostart=1 e já está logado, redireciona ao Stripe.
  useEffect(() => {
    if (authLoading || !session || autoStarted.current) return
    if (searchParams.get('autostart') !== '1') return
    autoStarted.current = true
    void goStripe()
  }, [authLoading, session, searchParams, goStripe])

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-[var(--text-muted)]">
        Carregando…
      </main>
    )
  }

  if (!session) {
    const loginHref = loginUrlWithReturnTo(`/pagamento-cartao?plan=${plan}&autostart=1`)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Você precisa entrar na sua conta para assinar com cartão.
        </p>
        <Link href={loginHref} className="text-sm font-bold text-[var(--primary)] hover:underline">
          Entrar ou criar conta →
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

        <h1 className="font-display text-2xl font-bold uppercase tracking-tight mb-1">
          Assinar com cartão
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Checkout seguro via Stripe. Cobrança mensal recorrente — cancele quando quiser.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5" role="group" aria-label="Escolha do plano">
          {(['starter', 'pro'] as const).map((p) => {
            const selected = plan === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                  selected
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--card-border)] bg-[var(--card-bg)]'
                }`}
              >
                <span className="block text-xs font-black uppercase tracking-wide text-[var(--text-main)]">
                  {p === 'starter' ? 'Starter' : 'Pro'}
                </span>
                <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">
                  {formatBRL(PLAN_PRICE[p])}/mês · {PLAN_LAUDOS[p]} laudos
                </span>
              </button>
            )
          })}
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 mb-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--primary)]">
            {PLAN_LABEL[plan]}
          </p>
          <p className="text-3xl font-black text-[var(--primary)] mt-1">
            {formatBRL(PLAN_PRICE[plan])}
            <span className="text-sm font-bold text-[var(--text-muted)]">/mês</span>
          </p>
          <ul className="mt-4 space-y-2 border-t border-[var(--card-border)]/50 pt-4">
            {PLAN_FEATURES[plan].map((feat) => (
              <li key={feat} className="flex items-start gap-2 text-xs text-[var(--text-main)]">
                <span className="text-[var(--signal-bright)] mt-0.5">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <p className="text-xs text-red-500 font-semibold mb-3" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => void goStripe()}
          className={buttonVariants({
            variant: 'primary',
            size: 'md',
            className: 'w-full disabled:opacity-60',
          })}
        >
          {busy ? 'Abrindo Stripe…' : `Pagar com cartão · ${formatBRL(PLAN_PRICE[plan])}/mês`}
        </button>

        <p className="text-center text-[11px] text-[var(--text-muted)] mt-3">
          Prefere PIX?{' '}
          <Link
            href={`/pagamento-pix?duration=1&plan=${plan}`}
            className="font-bold text-[var(--primary)] hover:underline"
          >
            Gerar cobrança PIX
          </Link>
        </p>
        <p className="text-center text-[11px] text-[var(--text-muted)] mt-2">
          Ainda quer testar?{' '}
          <Link href="/app?mode=signup" className="font-bold text-[var(--primary)] hover:underline">
            7 dias grátis sem cartão
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function PagamentoCartaoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-sm text-[var(--text-muted)]">
          Carregando…
        </main>
      }
    >
      <PagamentoCartaoInner />
    </Suspense>
  )
}
