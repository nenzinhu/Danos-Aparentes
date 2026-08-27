'use client'

import { useState } from 'react'
import type { SavedReport } from '@/src/types'
import type { RetornoLookupKind } from '@/src/lib/inspectionPurpose'

const KINDS: { id: RetornoLookupKind; label: string; placeholder: string; hint: string }[] = [
  {
    id: 'plate',
    label: 'Placa',
    placeholder: 'ABC1D23',
    hint: 'Placa do veículo da inspeção anterior',
  },
  {
    id: 'cpf',
    label: 'CPF',
    placeholder: '000.000.000-00',
    hint: 'CPF do cliente cadastrado na entrada',
  },
  {
    id: 'publicCode',
    label: 'Código do PDF',
    placeholder: 'DA-2026-A1B2C3',
    hint: 'Número de identificação impresso no laudo (ex.: DA-2026-XXXXXX)',
  },
]

type Props = {
  busy?: boolean
  onLookup: (kind: RetornoLookupKind, value: string) => void | Promise<void>
  onClearBaseline?: () => void
  /** Confirma dados importados e segue para o diagrama SVG. */
  onConfirmToDiagram?: () => void
  baselineReport?: SavedReport | null
}

export default function RetornoLookupPanel({
  busy,
  onLookup,
  onClearBaseline,
  onConfirmToDiagram,
  baselineReport = null,
}: Props) {
  const [kind, setKind] = useState<RetornoLookupKind>('plate')
  const [value, setValue] = useState('')
  const active = KINDS.find((k) => k.id === kind) || KINDS[0]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || busy) return
    await onLookup(kind, trimmed)
  }

  if (baselineReport) {
    const v = baselineReport.vehicleInfo
    const rows = [
      ['Placa', v.plate],
      ['Cliente', v.owner],
      ['CPF', v.cpf],
      ['Telefone', v.phone],
      ['Marca/modelo', v.brand],
      ['Cor', v.color],
      ['Cidade/UF', [v.city, v.state].filter(Boolean).join('/')],
      ['Ref./OS', v.ref],
      ['Código PDF', baselineReport.publicCode],
      ['Tipo', baselineReport.vehicleType],
    ].filter(([, val]) => Boolean(val))

    return (
      <div className="rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-4 space-y-4">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--success)] mb-1">
            Dados importados. Confirme
          </p>
          <p className="text-[0.72rem] text-[var(--text-muted)] leading-relaxed">
            Todos os dados da inspeção anterior foram carregados. O diagrama começa vazio para você marcar
            o estado no retorno. Depois gere o PDF no passo Dossiê Técnico.
          </p>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {rows.map(([label, val]) => (
            <div key={String(label)} className="min-w-0">
              <dt className="font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {label}
              </dt>
              <dd className="font-semibold text-[var(--text-main)] truncate">{String(val)}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={onConfirmToDiagram}
            className="min-h-11 px-5 rounded-xl font-bold text-sm text-white flex-1"
            style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
          >
            Confirmar e ir ao diagrama →
          </button>
          {onClearBaseline && (
            <button
              type="button"
              onClick={onClearBaseline}
              className="min-h-11 px-4 rounded-xl text-xs font-bold border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              Buscar outra
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--success)]/25 bg-[var(--success)]/[0.06] px-4 py-4">
      <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--success)] mb-2">
        Localizar inspeção anterior
      </p>
      <p className="text-[0.72rem] text-[var(--text-muted)] mb-3 leading-relaxed">
        Informe apenas a placa, o CPF do cliente ou o código de identificação do PDF.
      </p>

      <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Tipo de busca">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => {
              setKind(k.id)
              setValue('')
            }}
            className={`text-xs px-3 py-2 rounded-lg font-bold border transition-all ${
              kind === k.id
                ? 'bg-[var(--success)]/20 border-[var(--success)]/40 text-[var(--success)]'
                : 'border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <label className="sr-only" htmlFor="retorno-lookup-value">
          {active.label}
        </label>
        <input
          id="retorno-lookup-value"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={active.placeholder}
          autoComplete="off"
          className="flex-1 min-h-11 px-3 rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)] text-sm text-[var(--text-main)] outline-none focus:ring-2 ring-[var(--success)]/40"
        />
        <button
          type="submit"
          disabled={busy || !value.trim()}
          className="min-h-11 px-5 rounded-xl font-bold text-sm text-white disabled:opacity-50"
          style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
        >
          {busy ? 'Buscando…' : 'Buscar'}
        </button>
      </form>
      <p className="mt-2 text-[0.68rem] text-[var(--text-muted)]">{active.hint}</p>
    </div>
  )
}
