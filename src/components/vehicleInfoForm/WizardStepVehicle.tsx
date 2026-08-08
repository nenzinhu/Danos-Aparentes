'use client'
import type { VehicleInfo } from '../../types'
import { UF_LIST, VEHICLE_TYPES, inputClasses, labelClasses, type FoundData } from './constants'
import { Chip } from './icons'

export type PlateStatus = 'idle' | 'loading' | 'found' | 'error'

interface Props {
  info: VehicleInfo
  set: (field: keyof VehicleInfo, value: string) => void
  show: (key: string) => boolean
  orderedKeysIn: (keys: string[]) => string[]
  plateStatus: PlateStatus
  foundData: FoundData | null
  plateBorderClass: string
  onPlateChange: (value: string) => void
}

export default function WizardStepVehicle({
  info, set, show, orderedKeysIn, plateStatus, foundData, plateBorderClass, onPlateChange,
}: Props) {
  return (
      <>
      <div className="bg-gradient-to-br from-sky-700/15 to-blue-900/10 border border-sky-500/30 rounded-2xl p-5 mb-5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-60 pointer-events-none" />

        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/15 border border-sky-500/30 rounded-full px-3 py-1 text-[0.7rem] font-black text-sky-400 tracking-wider uppercase backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8] inline-block" />
            Consulta de Placa
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-[1_1_220px] min-w-0 max-w-[280px]">
            <label htmlFor="plate-input" className={labelClasses}>
              Placa do Veículo
            </label>
            <div className="relative block w-full">
              <input
                id="plate-input"
                value={info.plate}
                onChange={e => onPlateChange(e.target.value)}
                placeholder="ABC1D23"
                maxLength={7}
                autoComplete="off"
                spellCheck={false}
                className={`
                  w-full max-w-[240px] bg-slate-950/85 border-[1.5px] rounded-xl p-3 text-white font-mono text-2xl font-black outline-none tracking-[0.14em] uppercase text-center box-border transition-all duration-300
                  ${plateBorderClass}
                `}
              />
              {plateStatus === 'loading' && (
                <div className="absolute -top-2.5 -right-2.5 bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 rounded-full px-2 py-0.5 text-[0.65rem] font-black animate-pulse">⏳</div>
              )}
              {plateStatus === 'found' && (
                <div className="absolute -top-2.5 -right-2.5 bg-green-500/20 border border-green-500/50 text-green-500 rounded-full px-2 py-0.5 text-[0.65rem] font-black">✓</div>
              )}
              {plateStatus === 'error' && (
                <div className="absolute -top-2.5 -right-2.5 bg-red-500/20 border border-red-500/50 text-red-500 rounded-full px-2 py-0.5 text-[0.65rem] font-black">✖</div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-[160px] pb-0.5">
            {plateStatus === 'idle' && (
              <div className="text-[0.78rem] text-slate-400 leading-relaxed">
                Digite a placa completa (7 caracteres) para buscar automaticamente os dados do veículo.
              </div>
            )}
            {plateStatus === 'loading' && (
              <div className="text-[0.82rem] text-yellow-500 font-bold flex items-center gap-2">
                <span className="animate-spin inline-block text-lg">⏳</span>
                Consultando base de dados...
              </div>
            )}
            {plateStatus === 'found' && foundData && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="text-[0.72rem] font-black text-green-500 uppercase tracking-wider mb-2">
                  ✓ Veículo Encontrado
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {foundData.brand && <Chip icon="🚗" label={foundData.brand} color="sky" />}
                  {foundData.color && <Chip icon="🎨" label={foundData.color} color="violet" />}
                  {foundData.especie && <Chip icon="🏷️" label={foundData.especie} color="orange" />}
                  {foundData.city && foundData.state && <Chip icon="📍" label={`${foundData.city} / ${foundData.state}`} color="green" />}
                </div>
              </div>
            )}
            {plateStatus === 'error' && (
              <div className="text-[0.82rem] text-red-500 font-bold">
                ✖ Placa não encontrada na base de dados.
                <div className="text-[0.72rem] text-slate-400 font-normal mt-1">Preencha os dados manualmente abaixo.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(show('brand') || show('color') || show('vehicleTypeDesc') || show('km') || show('ano')) && (
        <div className="flex flex-wrap gap-3 mb-3">
          {orderedKeysIn(['brand', 'color', 'vehicleTypeDesc', 'km', 'ano']).filter(show).map(key => (
            <div key={key} className="flex-1 min-w-[160px]">
              {key === 'brand' && (
                <>
                  <label htmlFor="brand-input" className={labelClasses}>Marca / Modelo</label>
                  <input id="brand-input" className={inputClasses} value={info.brand} onChange={e => set('brand', e.target.value)} placeholder="Ex: Toyota Corolla" />
                </>
              )}
              {key === 'color' && (
                <>
                  <label htmlFor="color-input" className={labelClasses}>Cor do Veículo</label>
                  <input id="color-input" className={inputClasses} value={info.color} onChange={e => set('color', e.target.value)} placeholder="Ex: Prata, Preto" />
                </>
              )}
              {key === 'vehicleTypeDesc' && (
                <>
                  <label htmlFor="vehicle-type-select" className={labelClasses}>Tipo / Espécie</label>
                  <select id="vehicle-type-select" className={inputClasses} value={info.vehicleTypeDesc} onChange={e => set('vehicleTypeDesc', e.target.value)}>
                    <option value="">— Selecione —</option>
                    {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </>
              )}
              {key === 'km' && (
                <>
                  <label htmlFor="km-input" className={labelClasses}>Quilometragem (KM)</label>
                  <input id="km-input" className={inputClasses} value={info.km || ''} onChange={e => set('km', e.target.value.replace(/[^0-9]/g, ''))} placeholder="Ex: 45000" inputMode="numeric" />
                </>
              )}
              {key === 'ano' && (
                <>
                  <label htmlFor="ano-input" className={labelClasses}>Ano do Veículo</label>
                  <input id="ano-input" className={inputClasses} value={info.ano || ''} onChange={e => set('ano', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} placeholder="Ex: 2023" inputMode="numeric" maxLength={4} />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {(show('city') || show('state')) && (
        <div className="flex flex-wrap gap-3 mb-3">
          {orderedKeysIn(['city', 'state']).filter(show).map(key => (
            <div key={key} className={key === 'city' ? 'flex-[2] min-w-[200px]' : 'flex-1 min-w-[100px]'}>
              {key === 'city' && (
                <>
                  <label htmlFor="city-input" className={labelClasses}>Cidade de Emplacamento</label>
                  <input id="city-input" className={inputClasses} value={info.city} onChange={e => set('city', e.target.value)} placeholder="Ex: São Paulo" />
                </>
              )}
              {key === 'state' && (
                <>
                  <label htmlFor="state-select" className={labelClasses}>Estado (UF)</label>
                  <select id="state-select" className={inputClasses} value={info.state} onChange={e => set('state', e.target.value)}>
                    <option value="">— UF —</option>
                    {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      </>
  )
}
