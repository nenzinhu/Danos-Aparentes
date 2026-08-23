'use client'
import type { VehicleInfo } from '../../types'
import { toTitleCase } from '../../lib/cnhBarcode'
import CnhScanner from '../CnhScanner'
import { inputClasses, labelClasses } from './constants'
import { formatCNH, formatCPF, formatPhone } from './formatters'
import { IconCamera } from '../ui/AnimatedIcons'

/** Checkbox compacto "Doc. estrangeiro" alinhado no mesmo nível do rótulo do campo. */
function ForeignToggle({ checked, onChange, label = 'Doc. estrangeiro' }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label
      className="inline-flex items-center gap-1.5 cursor-pointer text-[0.62rem] font-bold uppercase tracking-wide text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors select-none"
      title="Documento estrangeiro (sem CPF/CNH brasileiro)"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded border-[var(--btn-secondary-border)] accent-[var(--primary)] cursor-pointer"
      />
      {label}
    </label>
  )
}

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
      {/* Linha 1: Nº OS / Referência (40%) + Perfil do Relatório (60%) */}
      {(show('profile') || show('ref')) && (
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_3fr] gap-3 mb-3">
          {show('ref') && (
            <div>
              <label htmlFor="ref-input" className={labelClasses}>Nº da OS / Referência</label>
              <input id="ref-input" className={inputClasses} value={info.ref} onChange={e => set('ref', e.target.value)} placeholder="Ex: 2026-00123" />
            </div>
          )}
          {show('profile') && (
            <div className="sm:col-span-3">
              <label htmlFor="profile-select" className={labelClasses}>Perfil do Relatório</label>
              <select id="profile-select" className={inputClasses} value={info.profile} onChange={e => set('profile', e.target.value)}>
                <option value="">— Selecione —</option>
                <option value="estacionamento">Estacionamento</option>
                <option value="valet">Valet</option>
                <option value="locadora">Locadora</option>
                <option value="guincho">Guincho</option>
                <option value="deposito">Depósito / Pátio</option>
                <option value="frota">Frota / Corporativo</option>
                <option value="oficina">Oficina</option>
                <option value="seguradora">Seguradora</option>
                <option value="despachante">Despachante</option>
                <option value="concessionaria">Concessionária</option>
                <option value="perito">Perito</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Linha 2: Proprietário / Cliente (60%) + Telefone + [ ] Estrangeiro (40%) */}
      {(show('owner') || show('phone')) && (
        <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr] gap-3 mb-3">
          {show('owner') && (
            <div>
              <label htmlFor="owner-input" className={labelClasses}>
                Proprietário / Cliente <span className="text-[var(--severity-high)]" aria-hidden="true">*</span>
              </label>
              <input id="owner-input" className={inputClasses} value={info.owner} onChange={e => set('owner', toTitleCase(e.target.value))} placeholder="Ex: João Silva" required aria-required="true" />
            </div>
          )}
          {show('phone') && (
            <div className="sm:col-span-2">
              <label htmlFor="phone-input" className={`${labelClasses} flex items-center justify-between gap-2`}>
                <span>Telefone (com DDD)</span>
                <ForeignToggle
                  checked={info.phone?.startsWith('+') || false}
                  onChange={(checked) => set('phone', checked ? '+' : '')}
                />
              </label>
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
                  className={`${inputClasses} max-w-[11rem]`}
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

      {/* Linha 3: CPF + [ ] Estrangeiro (35%) + Nº CNH + ícone câmera (45%) + Categoria CNH (20%) */}
      {(show('cpf') || show('cnh') || show('cnhCategory')) && (
        <div className="grid grid-cols-1 sm:grid-cols-[7fr_9fr_4fr] gap-3 mb-3">
          {show('cpf') && (
            <div>
              <label htmlFor="cpf-input" className={`${labelClasses} flex items-center justify-between gap-2`}>
                <span>CPF <span className="text-[var(--severity-high)]" aria-hidden="true">*</span></span>
                <ForeignToggle
                  checked={info.cpf?.startsWith('EX-') || false}
                  onChange={(checked) => set('cpf', checked ? 'EX-' : '')}
                />
              </label>
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
                  className={`${inputClasses} max-w-[10rem]`}
                  value={info.cpf || ''}
                  onChange={e => set('cpf', formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                  aria-required="true"
                />
              )}
            </div>
          )}
          {show('cnh') && (
            <div>
              <label htmlFor="cnh-input" className={labelClasses}>Nº da Habilitação (CNH)</label>
              <div className="flex gap-2">
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
                    className={`${inputClasses} max-w-[9.5rem]`}
                    value={info.cnh || ''}
                    onChange={e => set('cnh', formatCNH(e.target.value))}
                    placeholder="Ex: 12345678900"
                    maxLength={11}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setShowCnhScanner(true)}
                  title="Escanear código de barras da CNH"
                  className="shrink-0 w-10 rounded-lg bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] flex items-center justify-center hover:bg-[var(--btn-secondary-hover)] transition-colors"
                >
                  <IconCamera size={18} className="text-sky-400" />
                </button>
              </div>
              {showCnhScanner && (
                <CnhScanner
                  onResult={(fields) => {
                    if (fields.nome) set('owner', fields.nome)
                    if (fields.cpf) set('cpf', formatCPF(fields.cpf))
                    if (fields.cnhNumber) set('cnh', fields.cnhNumber)
                    setShowCnhScanner(false)
                  }}
                  onClose={() => setShowCnhScanner(false)}
                />
              )}
            </div>
          )}
          {show('cnhCategory') && (
            <div>
              <label htmlFor="cnh-category-select" className={labelClasses}>Categoria CNH</label>
              <select
                id="cnh-category-select"
                className={`${inputClasses} max-w-[5rem]`}
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
  )
}
