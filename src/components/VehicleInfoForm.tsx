'use client';
import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react'
import { VehicleInfo, CustomField } from '../types'
import SignaturePad from './SignaturePad'
import SpeechButton from './SpeechButton'
import WizardStepper from './WizardStepper'
import type { WizardStep } from './wizardTypes'

function TrashIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' className='shrink-0' aria-hidden='true' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <polyline points='3 6 5 6 21 6' />
      <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
      <path d='M10 11v6' /><path d='M14 11v6' />
      <path d='M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' />
    </svg>
  )
}

function InspectionDataIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 512 341.39' className='shrink-0' aria-hidden='true' fill='currentColor'>
      <path d='M3.62 302.83c-2 0-3.62-1.62-3.62-3.62 0-1.04.14-2.05.39-3.06 5.8-46 41.82-58.27 67.37-64.9 12.79-3.31 44.6-15.93 31.92-33.3-7.1-9.74-13.53-16.58-19.97-26.87-4.65-6.86-7.1-12.99-7.1-17.89 0-5.23 2.77-11.35 8.32-12.74-.73-10.53-.98-24.38-.48-35.65 1.76-19.35 15.64-33.61 33.57-39.93 7.09-2.7 3.66-13.49 11.5-13.72 18.38-.5 48.51 15.19 60.28 27.92 6.86 7.35 11.26 17.15 12 30.14l-.74 32.46c3.43.98 5.64 3.19 6.62 6.62.98 3.92 0 9.31-3.43 16.91 0 .24-.25.24-.25.49-7.56 12.46-15.44 20.72-24.1 32.26-3.86 5.16-3.11 10.09.1 14.53-4.51 2.63-8.92 5.66-13.15 9.22-16.79 14.09-29.76 35.09-34.32 68.53-.9 3.91-1.25 8.64-.6 12.6H3.62zm415.6-73.61c-.03-3.56-.36-6.1 4.05-6.04l14.28.18c4.61-.03 5.84 1.43 5.79 5.75v19.48h19.36c3.55-.03 6.09-.36 6.03 4.05l-.17 14.29c.02 4.61-1.44 5.83-5.76 5.78h-19.46v19.47c.05 4.32-1.18 5.78-5.79 5.75l-14.28.18c-4.41.06-4.08-2.48-4.05-6.04v-19.36h-19.49c-4.31.05-5.77-1.17-5.75-5.78l-.17-14.29c-.07-4.41 2.48-4.08 6.03-4.05h19.38v-19.37zm12.05-49.31c22.29 0 42.48 9.04 57.08 23.65 14.61 14.61 23.65 34.81 23.65 57.09 0 22.3-9.04 42.48-23.65 57.09-14.6 14.61-34.8 23.65-57.08 23.65-22.3 0-42.48-9.04-57.09-23.65l-.45-.48c-14.35-14.59-23.2-34.59-23.2-56.61 0-22.26 9.04-42.45 23.66-57.06 14.6-14.64 34.79-23.68 57.08-23.68zm45.31 35.42c-11.59-11.59-27.61-18.76-45.31-18.76-17.7 0-33.74 7.17-45.33 18.76-11.6 11.57-18.76 27.6-18.76 45.32 0 17.53 7.01 33.41 18.36 44.94l.41.38c11.59 11.6 27.61 18.77 45.32 18.77 17.69 0 33.72-7.17 45.31-18.77 11.6-11.59 18.77-27.62 18.77-45.32 0-17.69-7.17-33.73-18.77-45.32z' />
    </svg>
  )
}

interface Props {
  info: VehicleInfo
  onChange: (info: VehicleInfo) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  onVehicleTypeDetected?: (type: 'car' | 'moto' | 'truck' | 'van' | 'bus') => void
  resetToken?: number
  onWizardComplete?: () => void
}

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const VEHICLE_TYPES = ['Passeio (Carro)', 'SUV / Crossover', 'Pickup / Caminhonete', 'Motocicleta', 'Caminhão', 'Van / Utilitário', 'Ônibus / Micro-ônibus', 'Outro']
const TOKEN = '622283d1f02d343efd13800a14dd0ab8'

interface FoundData {
  brand: string
  color: string
  city: string
  state: string
  vehicleTypeDesc: string
  svgType: 'car' | 'moto' | 'truck' | 'van' | 'bus'
  ano: string
  especie: string
}

const FIELD_LABELS: Record<string, string> = {
  profile: 'Perfil do Relatório',
  ref: 'Nº da OS',
  owner: 'Proprietário / Cliente',
  phone: 'Telefone',
  cpf: 'CPF',
  cnh: 'Nº da Habilitação (CNH)',
  cnhCategory: 'Categoria CNH',
  brand: 'Marca / Modelo',
  plate: 'Placa do Veículo',
  color: 'Cor do Veículo',
  vehicleTypeDesc: 'Tipo do Veículo',
  city: 'Cidade de Emplacamento',
  state: 'Estado (UF)',
  inspectorSignature: 'Assinatura do Vistoriador',
  clientSignature: 'Assinatura do Cliente',
}

const formatCPF = (val: string) => {
  const clean = val.replace(/\D/g, '').slice(0, 11)
  let formatted = ''
  if (clean.length > 0) {
    formatted += clean.slice(0, 3)
  }
  if (clean.length > 3) {
    formatted += '.' + clean.slice(3, 6)
  }
  if (clean.length > 6) {
    formatted += '.' + clean.slice(6, 9)
  }
  if (clean.length > 9) {
    formatted += '-' + clean.slice(9, 11)
  }
  return formatted
}

const formatPhone = (val: string) => {
  const clean = val.replace(/\D/g, '').slice(0, 11)
  if (clean.length === 0) return ''
  let f = '(' + clean.slice(0, 2)
  if (clean.length > 2) f += ') ' + clean.slice(2, 7)
  if (clean.length > 7) f += '-' + clean.slice(7, 11)
  return f
}

const formatCNH = (val: string) => {
  return val.replace(/\D/g, '').slice(0, 11)
}

function loadFieldFilter(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem('vistoria_field_filter')
    if (saved) return JSON.parse(saved)
  } catch {}
  return Object.fromEntries(Object.keys(FIELD_LABELS).map(k => [k, true]))
}

function saveFieldFilter(state: Record<string, boolean>) {
  localStorage.setItem('vistoria_field_filter', JSON.stringify(state))
}

interface CustomFieldDef { id: string; label: string }

function loadCustomFieldDefs(): CustomFieldDef[] {
  try {
    const saved = localStorage.getItem('vistoria_custom_field_defs')
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

function saveCustomFieldDefs(defs: CustomFieldDef[]) {
  localStorage.setItem('vistoria_custom_field_defs', JSON.stringify(defs))
}

const inputClasses = "w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[var(--input-color)] font-outfit text-[0.85rem] outline-none focus:border-sky-500/50 transition-colors placeholder:text-slate-500";
const labelClasses = "block text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider mb-1";

function VehicleInfoFormComponent({ info, onChange, collapsed, onToggleCollapse, onVehicleTypeDetected, resetToken, onWizardComplete }: Props) {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(loadFieldFilter)
  const [filterOpen, setFilterOpen] = useState(false)
  const [plateStatus, setPlateStatus] = useState<'idle' | 'loading' | 'found' | 'error'>('idle')
  const [foundData, setFoundData] = useState<FoundData | null>(null)
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDef[]>(loadCustomFieldDefs)
  const [newFieldName, setNewFieldName] = useState('')
  const [wizardStep, setWizardStep] = useState<WizardStep>(1)
  const [maxVisited, setMaxVisited] = useState<WizardStep>(1)
  const filterRef = useRef<HTMLDivElement>(null)
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setWizardStep(1)
    setMaxVisited(1)
  }, [resetToken])

  const anyHidden = Object.values(visibleFields).some(v => !v)

  const addCustomField = useCallback(() => {
    const label = newFieldName.trim()
    if (!label) return
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const next = [...customFieldDefs, { id, label }]
    setCustomFieldDefs(next); saveCustomFieldDefs(next)
    const fields: CustomField[] = [...(info.customFields || []), { id, label, value: '' }]
    onChange({ ...info, customFields: fields })
    setNewFieldName('')
  }, [newFieldName, customFieldDefs, info, onChange])

  const removeCustomField = useCallback((id: string) => {
    const next = customFieldDefs.filter(d => d.id !== id)
    setCustomFieldDefs(next); saveCustomFieldDefs(next)
    const fields = (info.customFields || []).filter(f => f.id !== id)
    onChange({ ...info, customFields: fields })
  }, [customFieldDefs, info, onChange])

  const setCustomFieldValue = useCallback((id: string, label: string, value: string) => {
    const existing = info.customFields || []
    const has = existing.some(f => f.id === id)
    const fields = has
      ? existing.map(f => f.id === id ? { ...f, value } : f)
      : [...existing, { id, label, value }]
    onChange({ ...info, customFields: fields })
  }, [info, onChange])

  const customFieldValue = useCallback((id: string): string => {
    return (info.customFields || []).find(f => f.id === id)?.value || ''
  }, [info])

  // Auto‑close on outside click was removed to keep the filter dropdown open until the user explicitly toggles it.
  // If you prefer to close it manually, uncomment the code below.
  // useEffect(() => {
  //   if (!filterOpen) return
  //   function onDown(e: MouseEvent) {
  //     if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
  //   }
  //   document.addEventListener('mousedown', onDown)
  //   return () => document.removeEventListener('mousedown', onDown)
  // }, [filterOpen])

  const set = useCallback((field: keyof VehicleInfo, value: string) => {
    onChange({ ...info, [field]: value })
  }, [info, onChange])

  const toggleField = useCallback((key: string) => {
    setVisibleFields(prev => {
      const next = { ...prev, [key]: !prev[key] }
      saveFieldFilter(next)
      return next
    })
  }, [])

  const filterAll = useCallback((show: boolean) => {
    const next = Object.fromEntries(Object.keys(FIELD_LABELS).map(k => [k, show]))
    setVisibleFields(next); saveFieldFilter(next)
  }, [])

  const show = useCallback((key: string) => visibleFields[key] !== false, [visibleFields])

  const goToStep = useCallback((step: WizardStep) => {
    setWizardStep(step)
    setMaxVisited(prev => (step > prev ? step : prev))
  }, [])

  const goNext = useCallback(() => {
    if (wizardStep < 3) goToStep((wizardStep + 1) as WizardStep)
  }, [wizardStep, goToStep])

  const goBack = useCallback(() => {
    if (wizardStep > 1) setWizardStep((wizardStep - 1) as WizardStep)
  }, [wizardStep])

  const handleComplete = useCallback(() => {
    onWizardComplete?.()
    onToggleCollapse?.()
  }, [onWizardComplete, onToggleCollapse])

  const lookupPlate = useCallback(async (plate: string) => {
    setPlateStatus('loading')
    try {
      const res = await fetch(`https://wdapi2.com.br/consulta/${plate}/${TOKEN}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.erro || data.error || data.message?.toLowerCase().includes('not found')) throw new Error('not found')

      const marca = (data.MARCA || data.marca || '').trim()
      const modelo = (data.MODELO || data.modelo || data.SUBMODELO || '').trim()
      const anoVal = String(data.anoModelo || data.ano || data.ANO || '').trim()
      const cor = (data.cor || data.COR || '').trim()
      const cidade = (data.municipio || data.MUNICIPIO || data.cidade || '').trim()
      const uf = (data.uf || data.UF || data.estado || '').trim().toUpperCase()
      const especieRaw = [data.especie, data.ESPECIE].filter(Boolean).join(' ')
      const tipoRaw = [data.tipo, data.TIPO, data.carroceria, data.CARROCERIA, data.especie, data.ESPECIE, data.categoria, data.CATEGORIA].filter(Boolean).join(' ').toLowerCase()

      let vtypeVal = 'Passeio (Carro)'
      let svgType: 'car' | 'moto' | 'truck' | 'van' | 'bus' = 'car'

      if (tipoRaw.includes('motoneta') || tipoRaw.includes('motociclet') || tipoRaw.includes('moto') || tipoRaw.includes('ciclomotor') || tipoRaw.includes('triciclo')) {
        vtypeVal = 'Motocicleta'; svgType = 'moto'
      } else if (tipoRaw.includes('caminh') || tipoRaw.includes('trator') || tipoRaw.includes('reboque') || tipoRaw.includes('semi-reboque')) {     
        vtypeVal = 'Caminhão'; svgType = 'truck'
      } else if (tipoRaw.includes('ônibus') || tipoRaw.includes('onibus') || tipoRaw.includes('micro') || tipoRaw.includes('microônibus')) {      
        vtypeVal = 'Ônibus / Micro-ônibus'; svgType = 'bus'
      } else if (tipoRaw.includes('van') || tipoRaw.includes('utilitário') || tipoRaw.includes('utilitario') || tipoRaw.includes('furgão') || tipoRaw.includes('furgao')) {
        vtypeVal = 'Van / Utilitário'; svgType = 'van'
      } else if (tipoRaw.includes('caminhonete') || tipoRaw.includes('pickup')) {
        vtypeVal = 'Pickup / Caminhonete'
      } else if (tipoRaw.includes('suv') || tipoRaw.includes('crossover')) {
        vtypeVal = 'SUV / Crossover'
      }

      const brandText = [marca, modelo, anoVal].filter(Boolean).join(' ')
      const colorText = cor ? cor.charAt(0).toUpperCase() + cor.slice(1).toLowerCase() : ''
      const cityText = cidade ? cidade.charAt(0).toUpperCase() + cidade.slice(1).toLowerCase() : ''

      const fd: FoundData = {
        brand: brandText, color: colorText, city: cityText, state: uf,
        vehicleTypeDesc: vtypeVal, svgType, ano: anoVal, especie: especieRaw || vtypeVal,
      }
      setFoundData(fd)

      const updates: Partial<VehicleInfo> = {}
      if (brandText && !info.brand) updates.brand = brandText
      if (colorText && !info.color) updates.color = colorText
      if (cityText && !info.city) updates.city = cityText
      if (uf && !info.state) updates.state = uf
      if (!info.vehicleTypeDesc) updates.vehicleTypeDesc = vtypeVal

      onChange({ ...info, ...updates, plate })
      if (onVehicleTypeDetected) onVehicleTypeDetected(svgType)

      setPlateStatus('found')
    } catch {
      setPlateStatus('error')
      setFoundData(null)
    }
  }, [info, onChange, onVehicleTypeDetected])

  const onPlateChange = useCallback((value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
    set('plate', clean)
    setPlateStatus('idle')
    setFoundData(null)
    if (lookupTimer.current) clearTimeout(lookupTimer.current)
    if (clean.length === 7) {
      lookupTimer.current = setTimeout(() => lookupPlate(clean), 600)
    }
  }, [set, lookupPlate])

  const summary = useMemo(() => [info.owner, info.plate, info.brand].filter(Boolean).join(' • '), [info.owner, info.plate, info.brand])

  if (collapsed) {
    return (
      <div className="flex items-center justify-between font-outfit">
        <div>
          <div className="font-extrabold text-[0.95rem] inline-flex items-center gap-1.5"><InspectionDataIcon /> Dados da Vistoria</div>
          {summary && <div className="text-[0.8rem] text-slate-400 mt-0.5">{summary}</div>}
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="bg-sky-500/10 border border-sky-500/20 rounded-lg px-3.5 py-1.5 cursor-pointer text-[var(--primary)] font-bold text-[0.75rem] hover:bg-sky-500/20 transition-colors"
          >
            ▼ Expandir
          </button>
        )}
      </div>
    )
  }

  const plateBorderClass =
    plateStatus === 'found' ? 'border-green-500/60 shadow-[0_0_18px_rgba(34,197,94,0.25)]' :
    plateStatus === 'error' ? 'border-red-500/50 shadow-[0_0_18px_rgba(239,68,68,0.2)]' :
    plateStatus === 'loading' ? 'border-yellow-500/50 shadow-[0_0_18px_rgba(234,179,8,0.2)]' :
    'border-sky-500/35 shadow-[0_0_18px_rgba(0,170,255,0.15)]'

  return (
    <div className="font-outfit">
      <div className="flex justify-between items-center mb-4">
        <div className="font-extrabold text-[0.95rem]">🗒️ Dados da Vistoria</div>
        <div className="flex gap-2 items-center relative">
          <div ref={filterRef} className="relative">
            <button onClick={() => setFilterOpen(o => !o)} className={`
              ${anyHidden ? 'bg-sky-500/15 border-sky-500/50 text-sky-400 shadow-[0_0_10px_rgba(0,200,255,0.2)]' : 'bg-sky-500/10 border-sky-500/20 text-slate-400'}
              border rounded-lg px-3 py-1.5 cursor-pointer font-extrabold text-[0.75rem] flex items-center gap-1.5 backdrop-blur-sm transition-all  
            `}>
              ⚙️ Campos {anyHidden ? `(${Object.values(visibleFields).filter(v => !v).length} oculto${Object.values(visibleFields).filter(v => !v).length > 1 ? 's' : ''})` : ''}
            </button>
            {filterOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 z-[500] bg-slate-950/95 border border-sky-500/25 rounded-2xl p-4 min-w-[230px] shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-200">
                <div className="text-[0.72rem] font-black text-sky-500 tracking-widest uppercase mb-3">
                  ⚙️ Campos Visíveis
                </div>
                <div className="flex flex-col gap-2">
                  {Object.entries(FIELD_LABELS).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-[0.78rem] text-slate-300 font-semibold select-none">    
                      <input type="checkbox" checked={visibleFields[key] !== false} onChange={() => toggleField(key)}
                        className="accent-sky-500 w-3.5 h-3.5 cursor-pointer" />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-sky-500/10">
                  <button onClick={() => filterAll(true)} className="flex-1 bg-sky-500/10 border border-sky-500/25 text-sky-500 rounded-md p-1.5 text-[0.72rem] font-black cursor-pointer hover:bg-sky-500/20 transition-colors">Todos</button>
                  <button onClick={() => filterAll(false)} className="flex-1 bg-red-500/10 border border-red-500/25 text-red-500 rounded-md p-1.5 text-[0.72rem] font-black cursor-pointer hover:bg-red-500/20 transition-colors">Nenhum</button>
                </div>

                <div className="mt-4 pt-3 border-t border-sky-500/10">
                  <div className="text-[0.72rem] font-black text-sky-500 tracking-widest uppercase mb-3">
                    ➕ Campos Personalizados
                  </div>
                  {customFieldDefs.length > 0 && (
                    <div className="flex flex-col gap-1.5 mb-2.5">
                      {customFieldDefs.map(d => (
                        <div key={d.id} className="flex items-center gap-2">
                          <span className="flex-1 text-[0.78rem] text-slate-300 font-semibold truncate">{d.label}</span>
                          <button
                            type="button"
                            onClick={() => { if (window.confirm(`Excluir o campo "${d.label}"? Ele será removido de todas as vistorias.`)) removeCustomField(d.id) }}
                            title="Excluir campo"
                            className="bg-red-500/10 border border-red-500/30 rounded-md p-1 text-red-500 cursor-pointer flex items-center hover:bg-red-500/20 transition-colors"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    <input
                      value={newFieldName}
                      onChange={e => setNewFieldName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomField() } }}
                      placeholder="Nome do novo campo"
                      className={`${inputClasses} flex-1 p-1.5 text-[0.78rem]`}
                    />
                    <button
                      type="button"
                      onClick={addCustomField}
                      disabled={!newFieldName.trim()}
                      className={`
                        rounded-md px-3 py-1.5 text-[0.72rem] font-black transition-all
                        ${newFieldName.trim()
                          ? 'bg-green-500/15 border border-green-500/40 text-green-500 cursor-pointer hover:bg-green-500/25'
                          : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'}
                      `}
                    >+ Criar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="bg-sky-500/10 border border-sky-500/20 rounded-lg px-3 py-1.5 cursor-pointer text-slate-400 font-bold text-[0.75rem] hover:bg-sky-500/20 transition-colors backdrop-blur-sm"
            >
              ▲ Minimizar
            </button>
          )}
        </div>
      </div>

      <p className="text-[0.72rem] font-bold text-slate-500 mb-1">
        Passo {wizardStep} de 3
      </p>
      <WizardStepper current={wizardStep} maxVisited={maxVisited} onStepClick={goToStep} />

      <div key={wizardStep} className="pb-20 animate-in fade-in slide-in-from-right-2 duration-200 motion-reduce:animate-none">
      {wizardStep === 1 && (
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

      {(show('brand') || show('color') || show('vehicleTypeDesc')) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {show('brand') && (
            <div className="sm:col-span-1">
              <label htmlFor="brand-input" className={labelClasses}>Marca / Modelo / Ano</label>
              <input id="brand-input" className={inputClasses} value={info.brand} onChange={e => set('brand', e.target.value)} placeholder="Ex: Toyota Corolla 2023" />
            </div>
          )}
          {show('color') && (
            <div className="sm:col-span-1">
              <label htmlFor="color-input" className={labelClasses}>Cor do Veículo</label>
              <input id="color-input" className={inputClasses} value={info.color} onChange={e => set('color', e.target.value)} placeholder="Ex: Prata, Preto" />
            </div>
          )}
          {show('vehicleTypeDesc') && (
            <div className="sm:col-span-1">
              <label htmlFor="vehicle-type-select" className={labelClasses}>Tipo / Espécie</label>
              <select id="vehicle-type-select" className={inputClasses} value={info.vehicleTypeDesc} onChange={e => set('vehicleTypeDesc', e.target.value)}>
                <option value="">— Selecione —</option>
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {(show('city') || show('state')) && (
        <div className="grid grid-cols-3 gap-3 mb-3">
          {show('city') && (
            <div className="col-span-2">
              <label htmlFor="city-input" className={labelClasses}>Cidade de Emplacamento</label>
              <input id="city-input" className={inputClasses} value={info.city} onChange={e => set('city', e.target.value)} placeholder="Ex: São Paulo" />
            </div>
          )}
          {show('state') && (
            <div className="col-span-1">
              <label htmlFor="state-select" className={labelClasses}>Estado (UF)</label>
              <select id="state-select" className={inputClasses} value={info.state} onChange={e => set('state', e.target.value)}>
                <option value="">— UF —</option>
                {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
      </>
      )}

      {wizardStep === 2 && (
      <>
      {(show('profile') || show('ref')) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {show('profile') && (
            <div>
              <label htmlFor="profile-select" className={labelClasses}>Perfil do Relatório</label>
              <select id="profile-select" className={inputClasses} value={info.profile} onChange={e => set('profile', e.target.value)}>
                <option value="">— Selecione —</option>
                <option value="oficina">Oficina</option>
                <option value="perito">Perito</option>
                <option value="seguradora">Seguradora</option>
              </select>
            </div>
          )}
          {show('ref') && (
            <div>
              <label htmlFor="ref-input" className={labelClasses}>Nº da OS / Referência</label>
              <input id="ref-input" className={inputClasses} value={info.ref} onChange={e => set('ref', e.target.value)} placeholder="Ex: 2026-00123" />
            </div>
          )}
        </div>
      )}

      {(show('owner') || show('phone')) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {show('owner') && (
            <div>
              <label htmlFor="owner-input" className={labelClasses}>Proprietário / Cliente</label>
              <input id="owner-input" className={inputClasses} value={info.owner} onChange={e => set('owner', e.target.value)} placeholder="Ex: João Silva" />      
            </div>
          )}
          {show('phone') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <label htmlFor="phone-input" className={labelClasses}>Telefone (com DDD)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-muted)', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={info.phone?.startsWith('+') || false}
                    onChange={e => {
                      if (e.target.checked) {
                        set('phone', '+')
                      } else {
                        set('phone', '')
                      }
                    }}
                    style={{ width: 13, height: 13, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  🌍 Estrangeiro
                </label>
              </div>
              {info.phone?.startsWith('+') ? (
                <input
                  id="phone-input"
                  className={inputClasses}
                  value={info.phone}
                  onChange={e => set('phone', '+' + e.target.value.replace(/[^0-9\s\-().]/g, '').replace(/^\+*/, ''))}
                  placeholder="+1 555 000-0000"
                  type="tel"
                />
              ) : (
                <input
                  id="phone-input"
                  className={inputClasses}
                  value={info.phone}
                  onChange={e => set('phone', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  type="tel"
                  maxLength={15}
                />
              )}
            </div>
          )}
        </div>
      )}

      {(show('cpf') || show('cnh') || show('cnhCategory')) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {show('cpf') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <label htmlFor="cpf-input" className={labelClasses}>CPF</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-muted)', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={info.cpf?.startsWith('EX-') || false}
                    onChange={e => set('cpf', e.target.checked ? 'EX-' : '')}
                    style={{ width: 13, height: 13, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  🌍 Estrangeiro
                </label>
              </div>
              {info.cpf?.startsWith('EX-') ? (
                <input
                  id="cpf-input"
                  className={inputClasses}
                  value={info.cpf.slice(3)}
                  onChange={e => set('cpf', 'EX-' + e.target.value)}
                  placeholder="Nº do documento estrangeiro"
                />
              ) : (
                <input
                  id="cpf-input"
                  className={inputClasses}
                  value={info.cpf || ''}
                  onChange={e => set('cpf', formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              )}
            </div>
          )}
          {show('cnh') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <label htmlFor="cnh-input" className={labelClasses}>Nº da Habilitação (CNH)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-muted)', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={info.cnh?.startsWith('EX-') || false}
                    onChange={e => set('cnh', e.target.checked ? 'EX-' : '')}
                    style={{ width: 13, height: 13, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  🌍 Estrangeiro
                </label>
              </div>
              {info.cnh?.startsWith('EX-') ? (
                <input
                  id="cnh-input"
                  className={inputClasses}
                  value={info.cnh.slice(3)}
                  onChange={e => set('cnh', 'EX-' + e.target.value)}
                  placeholder="Nº da carteira estrangeira"
                />
              ) : (
                <input
                  id="cnh-input"
                  className={inputClasses}
                  value={info.cnh || ''}
                  onChange={e => set('cnh', formatCNH(e.target.value))}
                  placeholder="Ex: 12345678900"
                  maxLength={11}
                />
              )}
            </div>
          )}
          {show('cnhCategory') && (
            <div>
              <label htmlFor="cnh-category-select" className={labelClasses}>Categoria CNH</label>
              <select
                id="cnh-category-select"
                className={inputClasses}
                value={info.cnhCategory || ''}
                onChange={e => set('cnhCategory', e.target.value)}
              >
                <option value="">— Categoria —</option>
                {['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      </>
      )}

      {wizardStep === 3 && (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
          {show('inspectorSignature') && (
            <SignaturePad
              label="Assinatura do Vistoriador"
              value={info.inspectorSignature}
              onChange={val => set('inspectorSignature', val)}
            />
          )}
          {show('clientSignature') && (
            <SignaturePad
              label="Assinatura do Proprietário / Responsável"
              value={info.clientSignature}
              onChange={val => set('clientSignature', val)}
            />
          )}
        </div>
      )}
      </>
      )}

      </div>

      <div className="sticky bottom-0 z-10 mt-4 pt-3 pb-1 bg-[var(--card-bg)]/95 border-t border-white/5 flex gap-2">
        {wizardStep > 1 && (
          <button type="button" onClick={goBack}
            className="flex-1 py-3 rounded-xl text-sm font-bold border border-white/10 text-slate-300 hover:bg-white/5">
            ← Voltar
          </button>
        )}
        {wizardStep < 3 ? (
          <button type="button" onClick={goNext}
            className="flex-1 py-3 rounded-xl text-sm font-black bg-sky-600 hover:bg-sky-500 text-white">
            Continuar →
          </button>
        ) : (
          <button type="button" onClick={handleComplete}
            className="flex-1 py-3 rounded-xl text-sm font-black bg-green-600 hover:bg-green-500 text-white">
            Concluir dados
          </button>
        )}
      </div>
    </div>
  )
}

const VehicleInfoForm = memo(VehicleInfoFormComponent)
export default VehicleInfoForm

function Chip({ icon, label, color }: { icon: string; label: string; color: string }) {
  const colorClasses: Record<string, string> = {
    sky: "bg-sky-500/15 border-sky-500/30 text-sky-400",
    violet: "bg-violet-500/15 border-violet-500/30 text-violet-400",
    orange: "bg-orange-500/15 border-orange-500/30 text-orange-400",
    green: "bg-green-500/15 border-green-500/30 text-green-400",
  }

  return (
    <div className={`
      inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5
      text-[0.72rem] font-bold max-w-[240px] truncate ${colorClasses[color] || colorClasses.sky}
    `}>
      <span>{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  )
}




