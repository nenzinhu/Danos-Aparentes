'use client'
import { GlobeIcon, CameraIcon } from '@/src/components/app/AppIcons'
import type { VehicleInfo } from '../../types'
import { toTitleCase } from '../../lib/cnhBarcode'
import CnhScanner from '../CnhScanner'
import { inputClasses, labelClasses } from './constants'
import { formatCNH, formatCPF, formatPhone } from './formatters'

interface Props {
  info: VehicleInfo
  set: (field: keyof VehicleInfo, value: string) => void
  show: (key: string) => boolean
  orderedKeysIn: (keys: string[]) => string[]
  showCnhScanner: boolean
  setShowCnhScanner: (v: boolean) => void
}

export default function WizardStepOwner({
  info, set, show, orderedKeysIn, showCnhScanner, setShowCnhScanner,
}: Props) {
  return (
      <>
      {(show('profile') || show('ref')) && (
        <div className="flex flex-wrap gap-3 mb-3">
          {orderedKeysIn(['profile', 'ref']).filter(show).map(key => (
            <div key={key} className="flex-1 min-w-[160px]">
              {key === 'profile' && (
                <>
                  <label htmlFor="profile-select" className={labelClasses}>Perfil do Relatório</label>
                  <select id="profile-select" className={inputClasses} value={info.profile} onChange={e => set('profile', e.target.value)}>
                    <option value="">— Selecione —</option>
                    <option value="oficina">Oficina</option>
                    <option value="perito">Perito</option>
                    <option value="seguradora">Seguradora</option>
                  </select>
                </>
              )}
              {key === 'ref' && (
                <>
                  <label htmlFor="ref-input" className={labelClasses}>Nº da OS / Referência</label>
                  <input id="ref-input" className={inputClasses} value={info.ref} onChange={e => set('ref', e.target.value)} placeholder="Ex: 2026-00123" />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {(show('owner') || show('phone')) && (
        <div className="flex flex-wrap gap-3 mb-3">
          {orderedKeysIn(['owner', 'phone']).filter(show).map(key => (
            <div key={key} className="flex-1 min-w-[200px]">
              {key === 'owner' && (
                <>
                  <label htmlFor="owner-input" className={labelClasses}>Proprietário / Cliente</label>
                  <input id="owner-input" className={inputClasses} value={info.owner} onChange={e => set('owner', toTitleCase(e.target.value))} placeholder="Ex: João Silva" />
                </>
              )}
              {key === 'phone' && (
                <>
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
                      <span className="inline-flex items-center gap-1"><GlobeIcon size={12} />Estrangeiro</span>
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
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {(show('cpf') || show('cnh') || show('cnhCategory')) && (
        <div className="flex flex-wrap gap-3 mb-3">
          {orderedKeysIn(['cpf', 'cnh', 'cnhCategory']).filter(show).map(key => (
            <div key={key} className="flex-1 min-w-[160px]">
              {key === 'cpf' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <label htmlFor="cpf-input" className={labelClasses}>CPF</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-muted)', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={info.cpf?.startsWith('EX-') || false}
                        onChange={e => set('cpf', e.target.checked ? 'EX-' : '')}
                        style={{ width: 13, height: 13, accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      <span className="inline-flex items-center gap-1"><GlobeIcon size={12} />Estrangeiro</span>
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
                </>
              )}
              {key === 'cnh' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <label htmlFor="cnh-input" className={labelClasses}>Nº da Habilitação (CNH)</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-muted)', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={info.cnh?.startsWith('EX-') || false}
                        onChange={e => set('cnh', e.target.checked ? 'EX-' : '')}
                        style={{ width: 13, height: 13, accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      <span className="inline-flex items-center gap-1"><GlobeIcon size={12} />Estrangeiro</span>
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
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        id="cnh-input"
                        className={inputClasses}
                        value={info.cnh || ''}
                        onChange={e => set('cnh', formatCNH(e.target.value))}
                        placeholder="Ex: 12345678900"
                        maxLength={11}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCnhScanner(true)}
                        title="Escanear código de barras da CNH"
                        style={{ flexShrink: 0, width: 40, borderRadius: 10, background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', color: 'var(--text-main)', fontSize: '1.1rem' }}
                      >
                        <CameraIcon size={16} />
                      </button>
                    </div>
                  )}
                  {showCnhScanner && (
                    <CnhScanner
                      onResult={(fields) => {
                        // Nome já vem em Title Case de extractCnhFieldsFromBarcode.
                        if (fields.nome) set('owner', fields.nome)
                        if (fields.cpf) set('cpf', formatCPF(fields.cpf))
                        if (fields.cnhNumber) set('cnh', fields.cnhNumber)
                        setShowCnhScanner(false)
                      }}
                      onClose={() => setShowCnhScanner(false)}
                    />
                  )}
                </>
              )}
              {key === 'cnhCategory' && (
                <>
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
                </>
              )}
            </div>
          ))}
        </div>
      )}
      </>
  )
}
