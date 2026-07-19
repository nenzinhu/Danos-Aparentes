'use client'
import type { VehicleInfo } from '../../types'
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

/** Observações e fotos do interior — sem GPS nem assinaturas (essas ficam após as avarias). */
export default function WizardStepExtras({
  info, onChange, set, customFieldDefs, customFieldValue,
  setCustomFieldValue, removeCustomField, interiorCompressing, handleInteriorPhoto,
  updateInteriorPhotoNote, removeInteriorPhoto,
}: Props) {
  return (
      <>
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
