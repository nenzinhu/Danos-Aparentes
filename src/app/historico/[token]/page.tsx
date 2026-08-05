import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { normalizePlate } from '@/src/lib/reportComparison'

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

function maskPlate(plate: string): string {
  const p = normalizePlate(plate)
  if (p.length < 4) return '***'
  return `${p.slice(0, 3)}****${p.slice(-1)}`
}

async function getHistory(token: string): Promise<{
  plateLabel: string
  reports: ReportSummary[]
} | null> {
  if (!supabaseAdmin) return null

  const { data: tokenRow } = await supabaseAdmin
    .from('vehicle_qr_tokens')
    .select('plate, user_id, vehicle_id')
    .eq('token', token)
    .maybeSingle()

  if (!tokenRow?.plate && !tokenRow?.vehicle_id) return null

  const plate = String(tokenRow.plate || '')
  const userId = tokenRow.user_id as string
  const vehicleId = tokenRow.vehicle_id as string | null

  // Escopo mínimo: sempre filtra pelo dono do token (LGPD / multi-tenant).
  // Se houver vehicle_id, restringe às inspeções daquele veículo.
  let inspectionIds: string[] | null = null
  if (vehicleId) {
    const { data: inspections } = await supabaseAdmin
      .from('vehicle_inspections')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .eq('user_id', userId)
    inspectionIds = (inspections ?? []).map((i) => i.id as string)
  }

  let query = supabaseAdmin
    .from('report_hashes')
    .select('hash, ref, issued_at, damages_count, inspection_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (inspectionIds && inspectionIds.length > 0) {
    query = query.in('inspection_id', inspectionIds)
  } else if (plate) {
    query = query.eq('plate', plate)
  } else {
    return { plateLabel: 'Veículo', reports: [] }
  }

  const { data: reports } = await query

  return {
    plateLabel: maskPlate(plate),
    reports: (reports ?? []).map((r) => ({
      hash: r.hash as string,
      ref: (r.ref as string) || '',
      issued_at: (r.issued_at as string) || '',
      damages_count: (r.damages_count as number) || 0,
    })),
  }
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
            Histórico de vistorias — {history.plateLabel}
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
