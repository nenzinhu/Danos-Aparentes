'use client';
import { useState } from 'react'
import { LEGAL_CONTACT_EMAIL } from './LegalContent'
import Button from './ui/Button'

const MAX_CHARS = 600

const TABS = [
  { id: 'duvida', label: 'Dúvida geral', subject: 'Dúvida geral' },
  { id: 'tecnico', label: 'Problema técnico', subject: 'Problema técnico' },
  { id: 'sugestao', label: 'Sugestão', subject: 'Sugestão' },
  { id: 'financeiro', label: 'Financeiro / Assinatura', subject: 'Financeiro / Assinatura' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function SupportForm() {
  const [activeTab, setActiveTab] = useState<TabId>('duvida')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const remaining = MAX_CHARS - message.length
  const tooLong = remaining < 0
  const canSend = message.trim().length > 0 && !tooLong

  const subject = TABS.find((t) => t.id === activeTab)?.subject ?? 'Suporte'

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(LEGAL_CONTACT_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // navegador sem permissão de clipboard — ignora silenciosamente
    }
  }

  function send() {
    if (!canSend) return
    const mailto = `mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent(
      `[Suporte] ${subject}`
    )}&body=${encodeURIComponent(message)}`
    window.location.href = mailto
  }

  return (
    <div className="space-y-5 font-outfit">
      {/* Email em destaque */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)]">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
            Email de suporte
          </p>
          <a
            href={`mailto:${LEGAL_CONTACT_EMAIL}`}
            className="text-sm font-bold text-[var(--text-main)] hover:text-sky-400 transition-colors break-all"
          >
            {LEGAL_CONTACT_EMAIL}
          </a>
        </div>
        <button
          onClick={copyEmail}
          className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-main)] bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] border border-[var(--btn-secondary-border)] transition-all cursor-pointer"
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>

      {/* Falar com suporte */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
          Falar com o suporte
        </p>

        {/* Abas de assunto */}
        <div className="theme-tabs flex flex-wrap gap-2 mb-3 p-1 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeTab === tab.id
                  ? 'theme-tab-active border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'theme-tab-idle border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mensagem */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_CHARS}
          rows={6}
          placeholder="Descreva sua mensagem para o suporte..."
          className="w-full resize-none rounded-2xl bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] focus:border-sky-500 focus:outline-none p-4 text-sm text-[var(--text-main)] placeholder:text-slate-500 transition-colors scrollbar-thin"
        />
        <div className="flex items-center justify-between mt-2">
          <span
            className={`text-[11px] font-bold ${
              tooLong ? 'text-red-400' : 'text-[var(--text-muted)]'
            }`}
          >
            {message.length} / {MAX_CHARS}
          </span>
          <Button variant="primary" size="sm" onClick={send} disabled={!canSend}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  )
}
