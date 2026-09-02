'use client';
import { useEffect, useRef, useState } from 'react'
import LegalContent from './LegalContent'

interface Props {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'terms' | 'privacy'
}

export default function TermsModal({ isOpen, onClose, defaultTab = 'terms' }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(defaultTab)

  // Reset da aba ao abrir — ajuste durante o render (sem setState sync em effect).
  const [appliedTabKey, setAppliedTabKey] = useState<string | null>(isOpen ? defaultTab : null)
  const tabKey = isOpen ? defaultTab : null
  if (tabKey !== appliedTabKey) {
    setAppliedTabKey(tabKey)
    if (tabKey !== null) setActiveTab(tabKey)
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        className="w-full max-w-2xl bg-slate-900/90 border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] font-outfit"
        style={{
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        {/* Header com Abas */}
        <div className="p-5 pb-0 border-b border-[var(--card-border)]/60 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 id="terms-modal-title" className="font-extrabold text-base text-[var(--text-main)] flex items-center gap-2">
              📜 Documentos Legais
            </h3>
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl w-8 h-8 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2" role="tablist" aria-label="Documentos legais">
            <button
              role="tab"
              aria-selected={activeTab === 'terms'}
              aria-controls="tab-panel-terms"
              onClick={() => setActiveTab('terms')}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-b-2 ${
                activeTab === 'terms'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Termos de Uso
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'privacy'}
              aria-controls="tab-panel-privacy"
              onClick={() => setActiveTab('privacy')}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-b-2 ${
                activeTab === 'privacy'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Política de Privacidade
            </button>
          </div>
        </div>

        {/* Conteúdo com scroll */}
        <div className="p-6 overflow-y-auto scrollbar-thin">
          <LegalContent doc={activeTab} />
        </div>

        {/* Footer do Modal */}
        <div className="p-4 bg-slate-950/60 border-t border-[var(--card-border)]/60 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
