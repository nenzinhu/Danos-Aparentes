'use client'

import React from 'react'

/**
 * Estado vazio ilustrado das abas do app: explica o que a aba faz e oferece
 * o próximo passo — aba vazia não deve ser um beco sem saída.
 */
export default function TabEmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg-solid)]/70 backdrop-blur-md px-6 py-12 text-center flex flex-col items-center gap-3">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--card-border)]/60 bg-[var(--panel-bg)] text-[var(--signal)] shadow-inner">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)]">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md [text-wrap:balance]">
        {description}
      </p>
      {children && <div className="mt-2 flex flex-wrap justify-center gap-2.5">{children}</div>}
    </div>
  )
}
