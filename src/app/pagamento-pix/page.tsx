'use client';
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/src/hooks/useAuth'
import { useSubscription } from '@/src/hooks/useSubscription'

export default function PagamentoPixPage() {
  const { session, loading: authLoading } = useAuth()
  const { info: subscription, refresh, startPixCheckout } = useSubscription(session?.user.id, session?.access_token)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [copyPaste, setCopyPaste] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = useCallback(async () => {
    setGenerating(true)
    setError(null)
    try {
      const { qrCode, copyPaste } = await startPixCheckout()
      setQrCode(qrCode)
      setCopyPaste(copyPaste)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar cobrança PIX')
    } finally {
      setGenerating(false)
    }
  }, [startPixCheckout])

  // Assim que logado, gera a cobrança automaticamente.
  useEffect(() => {
    if (session?.access_token && !qrCode && !generating && !error) {
      generate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token])

  // Enquanto aguarda o pagamento, confere periodicamente se a assinatura já foi ativada.
  useEffect(() => {
    if (!qrCode || subscription?.hasAccess) return
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [qrCode, subscription?.hasAccess, refresh])

  async function handleCopy() {
    if (!copyPaste) return
    await navigator.clipboard.writeText(copyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (authLoading) {
    return <main className="min-h-screen flex items-center justify-center text-sm text-[var(--text-muted)]">Carregando…</main>
  }

  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-[var(--text-muted)]">Você precisa entrar na sua conta para pagar com PIX.</p>
        <Link href="/app" className="text-sm font-bold text-[var(--primary)] hover:underline">Fazer login →</Link>
      </main>
    )
  }

  if (subscription?.hasAccess) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-2xl">✅</p>
        <p className="text-sm font-bold text-[var(--text-main)]">Pagamento confirmado! Sua assinatura está ativa.</p>
        <Link href="/app" className="text-sm font-bold text-[var(--primary)] hover:underline">Ir para o app →</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <div className="w-full max-w-sm text-center">
        <Link href="/planos" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6">
          ← Voltar aos planos
        </Link>

        <h1 className="font-display text-2xl font-bold uppercase tracking-tight mb-2">Pagar com PIX</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Plano Pro · R$ 49,90/mês</p>

        {generating && <p className="text-sm text-[var(--text-muted)]">Gerando cobrança…</p>}

        {error && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={generate} className="text-sm font-bold text-[var(--primary)] hover:underline">Tentar novamente</button>
          </div>
        )}

        {qrCode && !error && (
          <div className="flex flex-col items-center gap-4">
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code para pagamento PIX"
              className="w-56 h-56 rounded-xl border border-[var(--card-border)]"
            />

            {copyPaste && (
              <div className="w-full">
                <p className="text-xs text-[var(--text-muted)] mb-2">Ou copie o código:</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={copyPaste}
                    className="flex-1 text-[11px] px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-main)] truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="text-xs font-bold px-3 py-2 rounded-lg bg-[var(--primary)] text-[var(--bg-main)] whitespace-nowrap"
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            <p className="text-[11px] text-[var(--text-muted)] mt-2">
              Assim que o pagamento for confirmado, esta página atualiza automaticamente.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
