'use client';
import { useEffect, useState, use } from 'react'
import SignaturePad from '@/src/components/SignaturePad'

interface Summary {
  plate: string
  brand: string
  vehicleTypeDesc: string
  owner: string
  alreadySigned: boolean
  damages: { partName: string; typeName: string; severity: string }[]
}

const SEV_LABEL: Record<string, string> = { low: 'Leve', medium: 'Média', high: 'Grave' }

export default function AssinarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: token } = use(params)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'not_found' | 'error'>('loading')
  const [signature, setSignature] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/remote-signature?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          setStatus(res.status === 404 || res.status === 400 ? 'not_found' : 'error')
          return
        }
        const data = await res.json()
        setSummary(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [token])

  async function handleSubmit() {
    if (!signature) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/remote-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, signature }),
      })
      if (res.ok) {
        setDone(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setStatus(res.status === 409 ? 'ready' : 'error')
        if (res.status === 409 && summary) setSummary({ ...summary, alreadySigned: true })
        if (data.error) alert(data.error)
      }
    } catch {
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="font-display text-xl font-bold tracking-tight">Assinatura de Vistoria</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">Danos Aparentes</p>
        </header>

        {status === 'loading' && (
          <p className="text-center text-sm text-[var(--text-muted)]">Carregando…</p>
        )}

        {status === 'not_found' && (
          <p className="text-center text-sm text-[var(--text-muted)]">
            Link inválido ou expirado. Peça um novo link a quem te enviou.
          </p>
        )}

        {status === 'error' && (
          <p className="text-center text-sm text-red-400">
            Não foi possível carregar. Tente novamente em instantes.
          </p>
        )}

        {status === 'ready' && summary && (done || summary.alreadySigned) ? (
          <div className="glass-card p-6 text-center">
            <p className="text-sm font-bold">Assinatura registrada</p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Obrigado. O vistoriador já tem acesso à sua assinatura no laudo.
            </p>
          </div>
        ) : status === 'ready' && summary ? (
          <>
            <div className="glass-card p-5 mb-6">
              <p className="text-sm font-bold mb-1">
                {summary.brand || 'Veículo'} — {summary.plate || 'S/P'}
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Confira as avarias registradas antes de assinar.
              </p>
              {summary.damages.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">Nenhuma avaria registrada.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {summary.damages.map((d, i) => (
                    <div key={i} className="text-xs border-b border-[var(--card-border)]/40 pb-2">
                      <span className="font-bold">{d.partName}</span> — {d.typeName} · {SEV_LABEL[d.severity] || d.severity}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <SignaturePad label="Sua assinatura" value={signature} onChange={setSignature} />

            <button
              onClick={handleSubmit}
              disabled={!signature || submitting}
              className="w-full mt-5 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-white disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Enviando…' : 'Confirmar assinatura'}
            </button>
          </>
        ) : null}
      </div>
    </main>
  )
}
