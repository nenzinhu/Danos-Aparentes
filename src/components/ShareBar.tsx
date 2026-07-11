'use client';
import { useState } from 'react'
import { whatsappLink } from '../lib/whatsapp'

function waContactLink(title: string) {
  return whatsappLink(`Olá! Vi o artigo "${title}" no site da Danos Aparentes e queria saber mais sobre as vistorias.`)
}

export default function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  function currentUrl() {
    return typeof window !== 'undefined' ? window.location.href : ''
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`${title}\n${currentUrl()}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  async function nativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title, url: currentUrl() }) } catch { /* cancelado */ }
    } else {
      copyLink()
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* sem permissão */ }
  }

  return (
    <div className="not-prose">
      {/* Partilhar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[0.7rem] font-extrabold uppercase tracking-widest text-[var(--text-muted)] mr-1">
          Partilhar
        </span>

        <button
          type="button"
          onClick={shareWhatsApp}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--whatsapp-color)] hover:bg-[var(--whatsapp-hover)] transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.039zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          WhatsApp
        </button>

        <button
          type="button"
          onClick={nativeShare}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--text-main)] bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover)] transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Compartilhar
        </button>

        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--text-main)] bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover)] transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          {copied ? 'Link copiado!' : 'Copiar link'}
        </button>
      </div>

      {/* Contato direto com o proprietário */}
      <div className="mt-5 rounded-2xl border border-[var(--whatsapp-color)]/30 bg-[var(--whatsapp-color)]/10 px-5 py-5">
        <p className="text-sm font-bold text-[var(--text-main)]">
          Sou o Jeferson, proprietário da Danos Aparentes 👋
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
          Estou aqui para tirar todas as suas dúvidas e ouvir sugestões. Fale comigo direto:
        </p>

        <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
          <a
            href={waContactLink(title)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold text-white bg-[var(--whatsapp-color)] hover:bg-[var(--whatsapp-hover)] transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.039zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            WhatsApp · (48) 99835-5802
          </a>
          <a
            href="mailto:suporte@danosaparentes.com.br"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--text-main)] bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover)] transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
            suporte@danosaparentes.com.br
          </a>
        </div>
      </div>
    </div>
  )
}
