'use client'

type Props = {
  newCount: number
  compact?: boolean
}

/** Aviso quando o SVG/lista tem danos a mais que a inspeção anterior. */
export default function NewDamagesAlert({ newCount, compact }: Props) {
  if (newCount <= 0) return null

  return (
    <div
      role="status"
      className={`rounded-xl border border-red-500/35 bg-red-500/10 text-red-300 ${
        compact ? 'px-3 py-2.5' : 'px-4 py-3'
      }`}
    >
      <p className={`font-bold ${compact ? 'text-[0.78rem]' : 'text-sm'}`}>
        {newCount === 1
          ? '1 dano a mais que na inspeção anterior'
          : `${newCount} danos a mais que na inspeção anterior`}
      </p>
      {!compact && (
        <p className="mt-1 text-[0.72rem] text-red-200/80 leading-relaxed">
          A IA analisa a evidência da peça. Você confirma como responsável antes de gerar o dossiê.
        </p>
      )}
    </div>
  )
}
