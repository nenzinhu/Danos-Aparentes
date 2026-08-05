'use client'

import type { Damage } from '@/src/types'

type Props = {
  newDamages: Damage[]
  confirmedIds: Set<string>
  onToggle: (id: string) => void
  onConfirmAll: () => void
}

/**
 * Confirmação: responsável confirma cada dano novo (a mais vs baseline)
 * antes de liberar o dossiê.
 */
export default function NewDamagesInspectorConfirm({
  newDamages,
  confirmedIds,
  onToggle,
  onConfirmAll,
}: Props) {
  if (newDamages.length === 0) return null

  const confirmedCount = newDamages.filter((d) => confirmedIds.has(d.id)).length
  const allDone = confirmedCount === newDamages.length

  return (
    <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 space-y-3">
      <div>
        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-amber-400 mb-1">
          Confirmação do responsável
        </p>
        <p className="text-[0.72rem] text-[var(--text-muted)] leading-relaxed">
          Estes danos não existiam na inspeção anterior. A IA pode ter sugerido tipo/severidade na
          foto — confirme cada um como responsável do veículo para liberar o dossiê.
        </p>
      </div>

      <ul className="space-y-2">
        {newDamages.map((d) => {
          const checked = confirmedIds.has(d.id)
          return (
            <li key={d.id}>
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  checked
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-black/10 border-amber-500/25'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(d.id)}
                  className="mt-0.5 accent-emerald-500 w-4 h-4 shrink-0 cursor-pointer"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[var(--text-main)]">{d.partName}</span>
                    <span className="text-[0.62rem] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400">
                      Nova
                    </span>
                  </div>
                  <p className="text-[0.72rem] text-[var(--text-muted)] mt-0.5">
                    {d.typeName}
                    {d.notes ? ` — ${d.notes}` : ''}
                  </p>
                </div>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        {!allDone && (
          <button
            type="button"
            onClick={onConfirmAll}
            className="min-h-11 px-4 rounded-xl font-bold text-sm text-white"
            style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
          >
            Confirmar todas como responsável
          </button>
        )}
        <p
          className={`text-[0.72rem] font-bold ${
            allDone ? 'text-emerald-400' : 'text-amber-400'
          }`}
        >
          {allDone
            ? 'Confirmado — PDF liberado'
            : `${confirmedCount}/${newDamages.length} confirmada(s)`}
        </p>
      </div>
    </div>
  )
}
