'use client'
import { useState } from 'react'
import type { VehicleInfo, VehicleChecklist } from '../../types'
import SpeechButton from '../SpeechButton'
import { ResolvedPhoto } from '../ResolvedPhoto'
import PhotoAttachButtons from '../PhotoAttachButtons'
import { inputClasses, labelClasses, type CustomFieldDef } from './constants'
import { TrashIcon } from './icons'

interface Props {
  info: VehicleInfo
  onChange: (info: VehicleInfo) => void
  set: (field: keyof VehicleInfo, value: string) => void
  customFieldDefs: CustomFieldDef[]
  customFieldValue: (id: string) => string
  setCustomFieldValue: (id: string, label: string, value: string) => void
  removeCustomField: (id: string) => void
  interiorCompressing: boolean
  handleInteriorPhoto: (file: File) => void
  updateInteriorPhotoNote: (idx: number, note: string) => void
  removeInteriorPhoto: (idx: number) => void
}

const CHECKLIST_ITEMS: { key: keyof VehicleChecklist; label: string; icon: string; options: string[] }[] = [
  { key: 'tires', label: 'Pneus', icon: '🛞', options: ['Bons (OK)', 'Desgastados', 'Substituir'] },
  { key: 'fuelLevel', label: 'Combustível', icon: '⛽', options: ['Vazio (Reserva)', '1/4', '1/2', '3/4', 'Cheio'] },
  { key: 'windshield', label: 'Vidros', icon: '🪟', options: ['Sem trincas (OK)', 'Trincado', 'Com riscos'] },
  { key: 'jackAndWrench', label: 'Macaco/Ch.', icon: '🔧', options: ['Presente', 'Ausente'] },
  { key: 'warningTriangle', label: 'Triângulo', icon: '⚠️', options: ['Presente', 'Ausente'] },
  { key: 'crlvDocument', label: 'Documento', icon: '📄', options: ['Regular (OK)', 'Pendente'] },
  { key: 'headlights', label: 'Faróis/Lant.', icon: '💡', options: ['Funcionando (OK)', 'Lâmpada Queimada', 'Lente Quebrada'] },
]

/** Opção "OK" de cada item (a que contém "OK"), usada no "Marcar Todos como OK". */
const OK_OPTION: Partial<Record<keyof VehicleChecklist, string>> = Object.fromEntries(
  CHECKLIST_ITEMS.map(i => [i.key, i.options.find(o => o.includes('OK'))]),
) as Partial<Record<keyof VehicleChecklist, string>>

/** Observações, Fotos e Checklist de Pátio / Segurança. */
export default function WizardStepExtras({
  info, onChange, set, customFieldDefs, customFieldValue,
  setCustomFieldValue, removeCustomField, interiorCompressing, handleInteriorPhoto,
  updateInteriorPhotoNote, removeInteriorPhoto,
}: Props) {

  const checklist = info.checklist || {}
  const [open, setOpen] = useState(false)

  const verifiedCount = CHECKLIST_ITEMS.filter(i => checklist[i.key]).length
  const allOk = CHECKLIST_ITEMS.every(i => checklist[i.key] === OK_OPTION[i.key])

  const markAllOk = () => {
    const next = { ...checklist }
    for (const item of CHECKLIST_ITEMS) {
      const ok = OK_OPTION[item.key]
      if (ok) next[item.key] = ok
    }
    onChange({ ...info, checklist: next })
  }
  const toggleChecklistItem = (key: keyof VehicleChecklist, val: string) => {
    const currentVal = checklist[key]
    const newVal = currentVal === val ? '' : val
    onChange({
      ...info,
      checklist: {
        ...checklist,
        [key]: newVal,
      },
    })
  }

  return (
    <>
      {/* Checklist de Segurança & Pátio (Opcional) — Accordion */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl mb-4 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
        >
          <span className="flex items-center gap-1.5 text-[0.78rem] font-extrabold text-[var(--primary)] uppercase tracking-wide">
            <span>📋 Checklist de Pátio & Segurança</span>
            <span className="text-[0.62rem] font-semibold bg-[var(--btn-secondary-bg)] text-[var(--text-muted)] px-2 py-0.5 rounded-full border border-[var(--btn-secondary-border)]">
              Opcional
            </span>
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <span className={`text-[0.66rem] font-bold ${allOk ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
              {verifiedCount === 0 ? 'Nenhum item alterado' : allOk ? 'Tudo OK ✓' : `${verifiedCount} de ${CHECKLIST_ITEMS.length} verificados`}
            </span>
            <span className={`text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
          </span>
        </button>

        {open && (
          <div className="px-3 pb-3 pt-1 border-t border-[var(--card-border)]">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={markAllOk}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.68rem] font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
              >
                ⚡ Marcar Todos como OK
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
              {CHECKLIST_ITEMS.map((item) => {
                const currentSelected = checklist[item.key] || ''
                return (
                  <div key={item.key} className="flex items-center justify-between gap-2 py-0.5">
                    <span className="text-[0.72rem] font-bold text-[var(--text-main)] flex items-center gap-1.5 shrink-0">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {/* Segmented control encavalado */}
                    <div className="flex rounded-lg border border-[var(--btn-secondary-border)] overflow-hidden bg-[var(--btn-secondary-bg)]">
                      {item.options.map((opt, oi) => {
                        const isSelected = currentSelected === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleChecklistItem(item.key, opt)}
                            title={opt}
                            className={`px-1.5 py-1 text-[0.62rem] font-bold whitespace-nowrap transition-colors border-l border-[var(--btn-secondary-border)] first:border-l-0 ${
                              isSelected
                                ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                          >
                            {opt.replace(' (OK)', '').replace(' (Reserva)', '')}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="general-notes-textarea" className={labelClasses} style={{ marginBottom: 0 }}>📝 Observações Gerais</label>
          <SpeechButton
            onTranscript={(text) => {
              const current = info.generalNotes || ''
              const space = current ? (current.endsWith(' ') ? '' : ' ') : ''
              set('generalNotes', current + space + text)
            }}
          />
        </div>
        <textarea
          id="general-notes-textarea"
          className={`${inputClasses} min-h-[52px] resize-vertical`}
          value={info.generalNotes} onChange={e => set('generalNotes', e.target.value)}
          placeholder="Observações adicionais sobre o veículo..." />
      </div>

      <div className="mt-4">
        <label htmlFor="interior-notes-textarea" className={labelClasses}>🪑 Interior do Veículo</label>
        <textarea
          id="interior-notes-textarea"
          className={`${inputClasses} min-h-[52px] resize-vertical`}
          value={info.interiorNotes}
          onChange={e => onChange({ ...info, interiorNotes: e.target.value })}
          placeholder="Observações sobre bancos, painel, forro, porta-malas..." />

        <div className="flex flex-col gap-2 mt-2.5">
          {info.interiorPhotos.map((p, i) => (
            <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-2 flex gap-2.5 items-start">
              <div className="relative shrink-0">
                <ResolvedPhoto
                  refOrDataUrl={p}
                  alt=""
                  className="w-[72px] h-[72px] object-cover rounded-lg border border-white/10 block"
                />
                <button
                  type="button"
                  onClick={() => removeInteriorPhoto(i)}
                  className="absolute -top-1.5 -right-1.5 bg-black/80 hover:bg-red-600 rounded-full text-white w-5 h-5 text-[0.65rem] flex items-center justify-center font-black transition-colors shadow-lg"
                >✕</button>
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  🏷️ Legenda da foto
                </div>
                <textarea
                  value={(info.interiorPhotoNotes ?? [])[i] ?? ''}
                  onChange={e => updateInteriorPhotoNote(i, e.target.value)}
                  placeholder="Ex.: Banco traseiro rasgado..."
                  rows={2}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-1.5 text-[var(--input-color)] font-outfit text-[0.78rem] resize-none outline-none focus:border-sky-500/40 transition-colors"
                />
              </div>
            </div>
          ))}

          <PhotoAttachButtons
            label="foto do interior"
            compressing={interiorCompressing}
            onFile={handleInteriorPhoto}
          />
        </div>
      </div>

      {customFieldDefs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 mt-3">
          {customFieldDefs.map(d => (
            <div key={d.id}>
              <label htmlFor={`custom-${d.id}`} className={`${labelClasses} flex items-center justify-between gap-2`}>
                <span>{d.label}</span>
                <button
                  type="button"
                  onClick={() => { if (window.confirm(`Excluir o campo "${d.label}"? Ele será removido de todas as vistorias.`)) removeCustomField(d.id) }}
                  title="Excluir campo"
                  className="bg-transparent border-none text-red-500 cursor-pointer p-0.5 flex items-center opacity-50 hover:opacity-100 transition-opacity"
                >
                  <TrashIcon size={12} />
                </button>
              </label>
              <input
                id={`custom-${d.id}`}
                className={inputClasses}
                value={customFieldValue(d.id)}
                onChange={e => setCustomFieldValue(d.id, d.label, e.target.value)}
                placeholder={`Digite ${d.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
