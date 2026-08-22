import React from 'react'

type Cell = string

type CompareRow = {
  feature: string
  starter: Cell
  pro: Cell
  corp: Cell
  enterprise: Cell
}

/** Tabela alinhada aos recursos reais comercializados / implementados. */
const ROWS: CompareRow[] = [
  {
    feature: 'Vistorias',
    starter: '20/mês',
    pro: '80/mês',
    corp: 'Ilimitadas',
    enterprise: 'Ilimitadas',
  },
  {
    feature: 'Histórico digital',
    starter: '✓',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'Diagrama de avarias',
    starter: '✓',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'Fotos e evidências',
    starter: '✓',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'GPS e data/hora',
    starter: '✓',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'Assinatura digital',
    starter: '✓',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'Relatório PDF',
    starter: '✓',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'Consulta por placa',
    starter: '✓',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'Comparação de vistorias',
    starter: '✓',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'Assistente de IA (assinatura ativa)',
    starter: '✓',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'Personalização (marca no PDF)',
    starter: '—',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'Dashboard de estatísticas',
    starter: '—',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'Modelos de relatório',
    starter: '—',
    pro: '✓',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'Multiusuário',
    starter: '—',
    pro: '—',
    corp: '✓ (Start/Growth)',
    enterprise: '✓ (15+)',
  },
  {
    feature: 'Gestão de equipe',
    starter: '—',
    pro: '—',
    corp: '✓',
    enterprise: '✓',
  },
  {
    feature: 'API',
    starter: '—',
    pro: '—',
    corp: '—',
    enterprise: '✓',
  },
  {
    feature: 'SLA',
    starter: '—',
    pro: '—',
    corp: '—',
    enterprise: 'Sob consulta',
  },
]

export default function PlanosCompareTable() {
  return (
    <section aria-labelledby="compare-planos-heading" className="mt-14">
      <h2
        id="compare-planos-heading"
        className="font-display text-2xl font-bold tracking-tight text-center mb-6"
      >
        Compare os recursos
      </h2>
      <p className="text-center text-sm text-[var(--text-muted)] mb-6 max-w-xl mx-auto">
        Cada vistoria alimenta o histórico digital do veículo. O relatório PDF é uma das saídas desse
        registro.
      </p>
      <div className="overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--panel-bg)]">
        <table className="w-full min-w-[640px] text-left text-sm border-collapse">
          <caption className="sr-only">
            Comparação dos planos Starter, Pro, Corporativo e Enterprise do Danos Aparentes
          </caption>
          <thead>
            <tr className="border-b border-[var(--card-border)] font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              <th scope="col" className="px-4 py-3 font-semibold sticky left-0 bg-[var(--panel-bg)] z-[1]">
                Recurso
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Starter
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--signal-bright)]">
                Pro
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Corporativo
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Enterprise
              </th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-main)]">
            {ROWS.map((row, idx) => (
              <tr
                key={row.feature}
                className={idx < ROWS.length - 1 ? 'border-b border-[var(--card-border)]/60' : undefined}
              >
                <th
                  scope="row"
                  className="px-4 py-3 font-medium text-[var(--text-muted)] sticky left-0 bg-[var(--panel-bg)] z-[1]"
                >
                  {row.feature}
                </th>
                <td className="px-4 py-3">{row.starter}</td>
                <td className="px-4 py-3 font-semibold">{row.pro}</td>
                <td className="px-4 py-3">{row.corp}</td>
                <td className="px-4 py-3">{row.enterprise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
