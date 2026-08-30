'use client'
import type { VehicleInfo } from '../../types'
import { UF_LIST, VEHICLE_TYPES, inputClasses, inputClassesAuto, labelClasses, type FoundData } from './constants'
import { CITIES_BY_UF } from '../../lib/brazilCities'
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
  onPlateSearch?: () => void
}

export default function WizardStepVehicle({
  info, set, show, orderedKeysIn, plateStatus, foundData, plateBorderClass, onPlateChange, onPlateSearch,
}: Props) {
  return (
      <>
      <div className="bg-gradient-to-br from-sky-700/15 to-blue-900/10 border border-sky-500/30 rounded-xl px-3 py-2.5 mb-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-60 pointer-events-none" />
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/15 border border-sky-500/30 rounded-full px-2.5 py-1 text-[0.62rem] font-black text-sky-400 tracking-wider uppercase shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8] inline-block" />
            Consulta de Placa
          </div>

          <div className="relative flex-1 min-w-[180px] max-w-[240px]">
            <input
              id="plate-input"
              value={info.plate}
              onChange={e => onPlateChange(e.target.value)}
              placeholder="ABC1D23"
              maxLength={7}
              autoComplete="off"
              spellCheck={false}
              className={`
                w-full bg-slate-950/85 border-[1.5px] rounded-lg py-2 px-3 text-white font-mono text-lg font-black outline-none tracking-[0.14em] uppercase text-center box-border transition-all duration-300
                ${plateBorderClass}
              `}
            />
            {plateStatus === 'loading' && (
              <div className="absolute -top-2 -right-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 rounded-full px-1.5 py-0.5 text-[0.6rem] font-black animate-pulse">⏳</div>
            )}
            {plateStatus === 'found' && (
              <div className="absolute -top-2 -right-2 bg-[var(--success-bg)] border border-[var(--success-border)] text-[var(--success-bright)] rounded-full px-1.5 py-0.5 text-[0.6rem] font-black">✓</div>
            )}
            {plateStatus === 'error' && (
              <div className="absolute -top-2 -right-2 bg-red-500/20 border border-red-500/50 text-red-500 rounded-full px-1.5 py-0.5 text-[0.6rem] font-black">✖</div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onPlateSearch?.()}
            disabled={plateStatus === 'loading'}
            aria-label="Buscar placa"
            className="shrink-0 w-9 h-9 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/40 text-[var(--primary)] flex items-center justify-center hover:bg-[var(--primary)]/25 transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          <div className="flex-1 min-w-[160px] text-[0.72rem] leading-snug text-[var(--text-muted)]">
            {plateStatus === 'idle' && 'Digite a placa (7 caracteres) para busca automática.'}
            {plateStatus === 'loading' && <span className="text-yellow-500 font-bold">Consultando base de dados…</span>}
            {plateStatus === 'found' && foundData && (
              <div className="flex flex-wrap gap-1.5">
                {foundData.brand && <Chip icon="🚗" label={foundData.brand} color="sky" />}
                {foundData.color && <Chip icon="🎨" label={foundData.color} color="violet" />}
                {foundData.especie && <Chip icon="🏷️" label={foundData.especie} color="orange" />}
                {foundData.city && foundData.state && <Chip icon="📍" label={`${foundData.city} / ${foundData.state}`} color="green" />}
              </div>
            )}
            {plateStatus === 'error' && <span className="text-red-500 font-bold">Placa não encontrada. Preencha manualmente.</span>}
          </div>
        </div>
      </div>

      {(show('brand') || show('color') || show('ano')) && (
        <div className="grid grid-cols-1 sm:grid-cols-[4fr_3fr_3fr] gap-2 mb-2">
          {show('brand') && (
            <div>
              <label htmlFor="brand-input" className={labelClasses}>Marca</label>
              <input id="brand-input" className={inputClasses} value={info.brand} onChange={e => set('brand', e.target.value)} placeholder="Ex: Toyota Corolla" />
            </div>
          )}
          {show('color') && (
            <div>
              <label htmlFor="color-input" className={labelClasses}>Cor</label>
              <input id="color-input" className={inputClasses} value={info.color} onChange={e => set('color', e.target.value)} placeholder="Ex: Prata, Preto" />
            </div>
          )}
          {show('ano') && (
            <div className="max-w-[5rem]">
              <label htmlFor="ano-input" className={labelClasses}>Ano</label>
              <input id="ano-input" className={inputClassesAuto} value={info.ano || ''} onChange={e => set('ano', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} placeholder="Ex: 2023" inputMode="numeric" maxLength={4} />
            </div>
          )}
        </div>
      )}

      {(show('vehicleTypeDesc') || show('km') || show('city') || show('state')) && (
        <div className="grid grid-cols-1 sm:grid-cols-[7fr_7fr_4fr_2fr] gap-2 mb-2">
          {show('vehicleTypeDesc') && (
            <div>
              <label htmlFor="vehicle-type-select" className={labelClasses}>Tipo</label>
              <select id="vehicle-type-select" className={inputClassesAuto} value={info.vehicleTypeDesc} onChange={e => set('vehicleTypeDesc', e.target.value)}>
                <option value="">— Selecione —</option>
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
          {show('km') && (
            <div className="max-w-[8rem]">
              <label htmlFor="km-input" className={labelClasses}>KM</label>
              <input id="km-input" className={inputClassesAuto} value={info.km || ''} onChange={e => set('km', e.target.value.replace(/[^0-9]/g, ''))} placeholder="Ex: 45000" inputMode="numeric" />
            </div>
          )}
          {show('city') && (
            <div className={info.state ? '' : 'sm:col-span-2'}>
              <label htmlFor="city-select" className={labelClasses}>
                {info.state ? 'Cidade' : 'Cidade'}
              </label>
              {info.state ? (
                <select
                  id="city-select"
                  className={inputClassesAuto}
                  value={info.city}
                  onChange={e => set('city', e.target.value)}
                >
                  <option value="">— Selecione —</option>
                  {(CITIES_BY_UF[info.state] ?? []).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                  {/* Cidade preenchida pela placa com grafia fora da lista oficial: preserva o valor. */}
                  {info.city && !(CITIES_BY_UF[info.state] ?? []).includes(info.city) && (
                    <option value={info.city}>{info.city}</option>
                  )}
                </select>
              ) : (
                <input id="city-input" className={inputClasses} value={info.city} onChange={e => set('city', e.target.value)} placeholder="Ex: São Paulo" />
              )}
              {!info.state && info.city && (
                <p className="mt-0.5 text-[0.55rem] leading-tight text-[var(--text-muted)]">
                  Escolha a UF para listar as cidades.
                </p>
              )}
            </div>
          )}
          {show('state') && (
            <div className="max-w-[4rem]">
              <label htmlFor="state-select" className={labelClasses}>UF</label>
              <select
                id="state-select"
                className={inputClassesAuto}
                value={info.state}
                onChange={e => {
                  const nextUf = e.target.value
                  const nextCity = CITIES_BY_UF[nextUf]?.includes(info.city) ? info.city : ''
                  set('state', nextUf)
                  if (nextCity !== info.city) set('city', nextCity)
                }}
              >
                <option value="">—</option>
                {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
      </>
  )
}
