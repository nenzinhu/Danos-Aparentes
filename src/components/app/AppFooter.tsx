'use client'

import {
  LEGAL_CNPJ,
  LEGAL_COMPANY_NAME,
  LEGAL_CONTACT_EMAIL,
} from '@/src/components/LegalContent'

interface AppFooterProps {
  onOpenTerms: () => void
  onOpenPrivacy: () => void
}

export default function AppFooter({ onOpenTerms, onOpenPrivacy }: AppFooterProps) {
  return (
    <footer className="w-full max-w-7xl mx-auto px-4 py-8 mt-12 border-t border-[var(--panel-border)]/60 flex flex-col gap-6 text-[0.7rem] text-[var(--text-muted)] font-outfit select-none shrink-0">
      <div className="w-full flex flex-col gap-1.5 text-center sm:text-left text-[0.65rem] opacity-75 leading-relaxed border-b border-[var(--panel-border)]/40 pb-6">
        <p>
          <strong>{LEGAL_COMPANY_NAME}</strong> | <strong>CNPJ:</strong> {LEGAL_CNPJ} | <strong>Contato:</strong>{' '}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-sky-500 hover:underline">{LEGAL_CONTACT_EMAIL}</a>
        </p>
        <p className="opacity-70">
          <strong>Aviso de Isenção:</strong> A consulta de dados de placas é realizada via API privada para fins cadastrais de vistoria e não possui qualquer vínculo, representação ou convênio com o DETRAN, Denatran ou órgãos governamentais.
        </p>
      </div>

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© 2026 DANOS APARENTES</div>
        <div className="flex gap-4">
          <button
            onClick={onOpenTerms}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors bg-transparent border-0 cursor-pointer p-0 text-[0.7rem] font-bold"
          >
            Termos de Uso
          </button>
          <span>•</span>
          <button
            onClick={onOpenPrivacy}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors bg-transparent border-0 cursor-pointer p-0 text-[0.7rem] font-bold"
          >
            Política de Privacidade
          </button>
        </div>
      </div>
    </footer>
  )
}
