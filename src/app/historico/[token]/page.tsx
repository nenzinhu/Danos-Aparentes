import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

export const metadata: Metadata = {
  title: 'Histórico de Vistorias | Danos Aparentes',
  robots: { index: false, follow: false },
}

interface ReportSummary {
  hash: string
  ref: string
  issued_at: string
  damages_count: number
}

async function getHistory(token: string): Promise<{ plate: string; reports: ReportSummary[] } | null> {
  if (!supabaseAdmin) return null

  const { data: tokenRow } = await supabaseAdmin
    .from('vehicle_qr_tokens')
    .select('plate')
    .eq('token', token)
    .maybeSingle()

  if (!tokenRow?.plate) return null

  const { data: reports } = await supabaseAdmin
    .from('report_hashes')
    .select('hash, ref, issued_at, damages_count')
    .eq('plate', tokenRow.plate)
    .order('created_at', { ascending: false })

  return { plate: tokenRow.plate, reports: (reports ?? []) as ReportSummary[] }
}

export default async function HistoricoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const history = await getHistory(token)

  if (!history) notFound()

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <div className="w-full max-w-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Danos Aparentes
        </Link>

        <header className="text-center mb-10">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Histórico de vistorias — {history.plate}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Lista pública de laudos já emitidos para este veículo, sem dados pessoais do proprietário.
          </p>
        </header>

        {history.reports.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)]">
            Nenhuma vistoria registrada para este veículo ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.reports.map(r => (
              <div key={r.hash} className="glass-card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold">
                    {r.issued_at || 'Data não informada'}
                    {r.ref && <span className="text-[var(--text-muted)] font-normal"> · OS {r.ref}</span>}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {r.damages_count} avaria(s) registrada(s)
                  </p>
                </div>
                <Link
                  href={`/verify?hash=${encodeURIComponent(r.hash)}`}
                  className="text-xs font-bold text-[var(--primary)] hover:underline shrink-0"
                >
                  Verificar laudo →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
