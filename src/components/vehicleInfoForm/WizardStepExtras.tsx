'use client'
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
  { key: 'tires', label: 'Estado dos Pneus', icon: '🛞', options: ['Bons (OK)', 'Desgastados', 'Substituir'] },
  { key: 'fuelLevel', label: 'Nível de Combustível', icon: '⛽', options: ['Vazio (Reserva)', '1/4', '1/2', '3/4', 'Cheio'] },
  { key: 'windshield', label: 'Para-brisa & Vidros', icon: '🪟', options: ['Sem trincas (OK)', 'Trincado', 'Com riscos'] },
  { key: 'jackAndWrench', label: 'Macaco & Chave de Roda', icon: '🔧', options: ['Presente', 'Ausente'] },
  { key: 'warningTriangle', label: 'Triângulo de Segurança', icon: '⚠️', options: ['Presente', 'Ausente'] },
  { key: 'crlvDocument', label: 'Documento (CRLV/CNH)', icon: '📄', options: ['Regular (OK)', 'Pendente'] },
  { key: 'headlights', label: 'Faróis & Lanternas', icon: '💡', options: ['Funcionando (OK)', 'Lâmpada Queimada', 'Lente Quebrada'] },
]

/** Observações, Fotos e Checklist de Pátio / Segurança. */
export default function WizardStepExtras({
  info, onChange, set, customFieldDefs, customFieldValue,
  setCustomFieldValue, removeCustomField, interiorCompressing, handleInteriorPhoto,
  updateInteriorPhotoNote, removeInteriorPhoto,
}: Props) {

  const checklist = info.checklist || {}

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
      {/* Checklist de Segurança & Pátio (Opcional) */}
      <div className="bg-slate-900/90 border border-sky-500/25 rounded-2xl p-4 mb-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <label className="text-[0.8rem] font-extrabold text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
            <span>📋 Checklist de Pátio & Segurança</span>
          </label>
          <span className="text-[0.65rem] text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            Opcional
          </span>
        </div>
        <p className="text-[0.7rem] text-slate-400 mb-2">
          Selecione os itens verificados no pátio. Eles serão incluídos na seção do laudo PDF.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHECKLIST_ITEMS.map((item) => {
            const currentSelected = checklist[item.key] || ''

            return (
              <div key={item.key} className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                <div className="text-[0.74rem] font-bold text-slate-200 flex items-center gap-1.5">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.options.map((opt) => {
                    const isSelected = currentSelected === opt

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleChecklistItem(item.key, opt)}
                        className={`
                          px-2 py-1 rounded-lg text-[0.68rem] font-bold transition-all border cursor-pointer active:scale-95
                          ${
                            isSelected
                              ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }
                        `}
                      >
                        {isSelected ? '✓ ' : ''}{opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
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
