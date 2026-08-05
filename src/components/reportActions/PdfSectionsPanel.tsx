'use client'

import {
  DEFAULT_SECTIONS,
  type SectionVisibilityState,
} from './pdfExport'

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
  { key: 'showQrCode', label: '8. Selo & QR Code de Verificação' },
]

type Props = {
  open: boolean
  onToggle: () => void
  sectionsConfig: SectionVisibilityState
  onChange: (next: SectionVisibilityState) => void
}

export default function PdfSectionsPanel({ open, onToggle, sectionsConfig, onChange }: Props) {
  return (
    <div className="flex flex-col mb-1 bg-sky-950/15 border border-sky-500/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-[0.8rem] font-bold text-[var(--text-main)] hover:bg-sky-500/5 transition-all text-left"
      >
        <span className="flex items-center gap-2">
          <span>⚙️</span> Personalizar Seções do PDF
        </span>
        <span className="text-[0.7rem] text-sky-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-sky-500/10 bg-black/20">
          <div className="flex gap-1.5 pt-1 pb-1">
            <button
              type="button"
              onClick={() => onChange(DEFAULT_SECTIONS)}
              className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[0.68rem] font-bold rounded-md"
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
                showQrCode: false,
              })}
              className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[0.68rem] font-bold rounded-md"
            >
              Apenas Essenciais
            </button>
            <button
              type="button"
              onClick={() => onChange(DEFAULT_SECTIONS)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-400 text-[0.68rem] font-bold rounded-md ml-auto"
            >
              Restaurar
            </button>
          </div>

          {SECTION_OPTIONS.map(sec => (
            <label key={sec.key} className="flex items-center gap-2 cursor-pointer text-[0.76rem] text-[var(--text-main)] hover:text-sky-300 transition-colors">
              <input
                type="checkbox"
                checked={sectionsConfig[sec.key]}
                onChange={e => onChange({ ...sectionsConfig, [sec.key]: e.target.checked })}
                className="rounded bg-[var(--input-bg)] border-[var(--input-border)] text-sky-500 focus:ring-0 cursor-pointer"
              />
              <span>{sec.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
