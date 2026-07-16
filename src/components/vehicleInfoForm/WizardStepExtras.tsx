'use client'
import type { VehicleInfo } from '../../types'
import SignaturePad from '../SignaturePad'
import SpeechButton from '../SpeechButton'
import { ResolvedPhoto } from '../ResolvedPhoto'
import PhotoAttachButtons from '../PhotoAttachButtons'
import Button from '../ui/Button'
import { inputClasses, labelClasses, type CustomFieldDef } from './constants'
import { TrashIcon } from './icons'

interface Props {
  info: VehicleInfo
  onChange: (info: VehicleInfo) => void
  set: (field: keyof VehicleInfo, value: string) => void
  show: (key: string) => boolean
  orderedKeysIn: (keys: string[]) => string[]
  customFieldDefs: CustomFieldDef[]
  customFieldValue: (id: string) => string
  setCustomFieldValue: (id: string, label: string, value: string) => void
  removeCustomField: (id: string) => void
  interiorCompressing: boolean
  handleInteriorPhoto: (file: File) => void
  updateInteriorPhotoNote: (idx: number, note: string) => void
  removeInteriorPhoto: (idx: number) => void
  geoStatus: 'idle' | 'loading' | 'done' | 'error'
  geoError: string
  captureGeo: () => void
  clearGeo: () => void
}

export default function WizardStepExtras({
  info, onChange, set, show, orderedKeysIn, customFieldDefs, customFieldValue,
  setCustomFieldValue, removeCustomField, interiorCompressing, handleInteriorPhoto,
  updateInteriorPhotoNote, removeInteriorPhoto, geoStatus, geoError, captureGeo, clearGeo,
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

      {show('geo') && (
        <div className="mt-4 rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-700/10 to-blue-900/5 p-4">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="inline-flex items-center gap-1.5 text-[0.7rem] font-black text-sky-400 tracking-wider uppercase">
              📍 Localização da Vistoria
            </div>
            {info.geo && (
              <button
                type="button"
                onClick={clearGeo}
                className="text-[0.7rem] font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                Remover
              </button>
            )}
          </div>

          {!info.geo ? (
            <>
              <p className="text-[0.78rem] text-slate-400 leading-relaxed mb-3">
                Registre o ponto GPS exato de onde a vistoria está sendo feita. A coordenada entra no laudo junto do hash e do QR Code.
              </p>
              <Button
                type="button"
                variant="primary"
                onClick={captureGeo}
                loading={geoStatus === 'loading'}
                className="w-full"
              >
                {geoStatus === 'loading' ? 'Obtendo localização…' : '📡 Capturar localização atual'}
              </Button>
              {geoStatus === 'error' && (
                <p className="text-[0.75rem] text-red-400 font-semibold mt-2">{geoError}</p>
              )}
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out motion-reduce:animate-none">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="inline-flex items-center gap-1 bg-green-500/15 border border-green-500/30 text-green-400 rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold animate-in zoom-in-75 duration-200 motion-reduce:animate-none">
                  ✓ Localização registrada
                </span>
                {typeof info.geo.accuracy === 'number' && (
                  <span className="inline-flex items-center gap-1 bg-sky-500/15 border border-sky-500/30 text-sky-400 rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold">
                    ± {info.geo.accuracy} m
                  </span>
                )}
              </div>
              <p className="font-mono text-[0.8rem] text-[var(--text-main)] font-bold">
                {info.geo.lat.toFixed(6)}, {info.geo.lng.toFixed(6)}
              </p>
              {info.geo.address && (
                <p className="text-[0.75rem] text-slate-400 mt-1 leading-relaxed">{info.geo.address}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2.5">
                <a
                  href={`https://www.google.com/maps?q=${info.geo.lat},${info.geo.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.75rem] font-bold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  🗺️ Ver no mapa
                </a>
                <button
                  type="button"
                  onClick={captureGeo}
                  className="text-[0.75rem] font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ↻ Atualizar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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

      {(show('inspectorSignature') || show('clientSignature')) && (
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5">
          {orderedKeysIn(['inspectorSignature', 'clientSignature']).filter(show).map(key => (
            <div key={key} className="flex-1 min-w-[220px]">
              {key === 'inspectorSignature' && (
                <SignaturePad
                  label="Assinatura do Vistoriador"
                  value={info.inspectorSignature}
                  onChange={val => set('inspectorSignature', val)}
                />
              )}
              {key === 'clientSignature' && (
                <SignaturePad
                  label="Assinatura do Proprietário / Responsável"
                  value={info.clientSignature}
                  onChange={val => set('clientSignature', val)}
                />
              )}
            </div>
          ))}
        </div>
      )}
      </>
  )
}
