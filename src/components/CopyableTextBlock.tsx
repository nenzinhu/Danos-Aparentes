'use client';
import { useState } from 'react'

interface Props {
  title: string
  text: string
  description?: string
  defaultOpen?: boolean
}

export default function CopyableTextBlock({ title, text, description, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: selecionar texto manualmente no textarea readonly
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] overflow-hidden font-outfit">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer bg-transparent border-0"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-[var(--text-main)]">{title}</p>
          {description && (
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
        <span className="text-[var(--text-muted)] text-xs shrink-0" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-white/5">
          <textarea
            readOnly
            value={text}
            rows={16}
            className="w-full mt-3 resize-y rounded-xl bg-slate-950/50 border border-white/10 p-3 text-[11px] leading-relaxed text-[var(--text-main)] font-mono scrollbar-thin"
            aria-label={title}
          />
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={copyText}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-all cursor-pointer"
            >
              {copied ? '✓ Texto copiado' : 'Copiar texto'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
