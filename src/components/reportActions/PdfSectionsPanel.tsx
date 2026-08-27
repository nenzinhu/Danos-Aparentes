'use client'

import {
  DEFAULT_SECTIONS,
  type SectionVisibilityState,
} from './pdfExport'
import {
  DISCLOSURE_LABELS,
  DISCLOSURE_SCOPES,
  type DisclosureScope,
} from '../../lib/verify/disclosureScope'

const SECTION_OPTIONS: Array<{ key: keyof SectionVisibilityState; label: string }> = [
  { key: 'showInfoTable', label: '1. Identificação do Veículo' },
  { key: 'showChecklistSection', label: '1b. Checklist de Pátio & Segurança' },
  { key: 'showGeoAuditSection', label: '1c. Carimbo GPS & Certificado de Geolocalização' },
  { key: 'showSvgDiagrams', label: '2. Diagramas / Vistas Periciais' },
  { key: 'showSummaryStats', label: '3. Resumo Estatístico de Avarias' },
  { key: 'showDamageTable', label: '4. Detalhamento Técnico' },
  { key: 'showPhotoGallery', label: '5. Galeria Fotográfica' },
  { key: 'showInteriorSection', label: '6. Observações do Interior' },
  { key: 'showSignatures', label: '7. Assinaturas (Vistoriador / Resp.)' },
]

type Props = {
  open: boolean
  onToggle: () => void
  sectionsConfig: SectionVisibilityState
  onChange: (next: SectionVisibilityState) => void
  disclosureScope: DisclosureScope
  onDisclosureChange: (scope: DisclosureScope) => void
}

export default function PdfSectionsPanel({
  open,
  onToggle,
  sectionsConfig,
  onChange,
  disclosureScope,
  onDisclosureChange,
}: Props) {
  return (
    <div className="flex flex-col mb-1 bg-[var(--primary)]/[0.06] border border-[var(--primary)]/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-[0.8rem] font-bold text-[var(--text-main)] hover:bg-[var(--primary)]/5 transition-all text-left"
      >
        <span>Personalizar Seções do PDF</span>
        <span className="text-[0.7rem] text-[var(--primary)]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-[var(--primary)]/10 bg-black/20">
          <div className="flex gap-1.5 pt-1 pb-1">
            <button
              type="button"
              onClick={() => onChange(DEFAULT_SECTIONS)}
              className="px-2 py-1 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] text-[0.68rem] font-bold rounded-md"
            >
              Marcar Todas
            </button>
            <button
              type="button"
              onClick={() => onChange({
                ...DEFAULT_SECTIONS,
                showSummaryStats: false,
                showPhotoGallery: false,
                showInteriorSection: false,
                showSignatures: false,
              })}
              className="px-2 py-1 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] text-[0.68rem] font-bold rounded-md"
            >
              Apenas Essenciais
            </button>
            <button
              type="button"
              onClick={() => onChange(DEFAULT_SECTIONS)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[var(--text-muted)] text-[0.68rem] font-bold rounded-md ml-auto"
            >
              Restaurar
            </button>
          </div>

          {SECTION_OPTIONS.map(sec => (
            <label key={sec.key} className="flex items-center gap-2 cursor-pointer text-[0.76rem] text-[var(--text-main)] hover:text-[var(--primary)] transition-colors">
              <input
                type="checkbox"
                checked={sectionsConfig[sec.key]}
                onChange={e => onChange({ ...sectionsConfig, [sec.key]: e.target.checked })}
                className="rounded bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--primary)] focus:ring-0 cursor-pointer"
              />
              <span>{sec.label}</span>
            </label>
          ))}

          <div className="pt-2 mt-1 border-t border-[var(--primary)]/10 space-y-1.5">
            <label
              htmlFor="disclosure-scope"
              className="block text-[0.72rem] font-bold text-[var(--signal-bright)] uppercase tracking-wider"
            >
              Divulgação pública do QR (/verify)
            </label>
            <select
              id="disclosure-scope"
              value={disclosureScope}
              onChange={(e) => onDisclosureChange(e.target.value as DisclosureScope)}
              className="w-full rounded-md bg-[var(--input-bg)] border border-[var(--input-border)] text-[0.78rem] text-[var(--text-main)] px-2 py-1.5"
            >
              {DISCLOSURE_SCOPES.map((s) => (
                <option key={s} value={s}>
                  {DISCLOSURE_LABELS[s].short}
                </option>
              ))}
            </select>
            <p className="text-[0.68rem] text-[var(--text-muted)] leading-relaxed">
              {DISCLOSURE_LABELS[disclosureScope].description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
