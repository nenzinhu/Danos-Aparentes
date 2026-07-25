'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { trackLead } from '@/src/lib/analytics/pixels'
import { appendUtmsToPath } from '@/src/lib/analytics/utm'
import { buttonVariants } from './ui/Button'

const CARGO_OPTIONS = [
  'Dono/sócio',
  'Gerente de operações/pátio',
  'Coordenador de vistoria',
  'Outro',
] as const

const SEGMENTO_OPTIONS = [
  'Locadora',
  'Frota de aluguel',
  'Oficina',
  'Gestão de frota',
  'Outro',
] as const

const DESAFIO_OPTIONS = [
  'Disputa “já estava assim”',
  'Padronizar vistoriadores',
  'Substituir WhatsApp/papel',
  'White-label no PDF',
  'Offline no pátio',
  'Outro',
] as const

const inputClass =
  'w-full rounded-xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]'

export default function LocadorasTrialForm() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    setBusy(true)

    const fd = new FormData(e.currentTarget)
    const payload = {
      nome: String(fd.get('nome') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      whatsapp: String(fd.get('whatsapp') || '').trim(),
      empresa: String(fd.get('empresa') || '').trim(),
      cargo: String(fd.get('cargo') || '').trim(),
      segmento: String(fd.get('segmento') || '').trim(),
      desafio: String(fd.get('desafio') || '').trim(),
      volume: String(fd.get('volume') || '').trim(),
      source: 'locadoras-lp',
      at: new Date().toISOString(),
    }

    // Gap: sem CRM — guarda localmente para eventual integração; trial vai para signup.
    try {
      sessionStorage.setItem('da_locadoras_lead', JSON.stringify(payload))
    } catch {
      /* private mode / quota — ignore */
    }

    trackLead()
    router.push(appendUtmsToPath('/app?mode=signup'))
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-left" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--text-muted)]">
          Nome
          <input name="nome" required autoComplete="name" className={inputClass} placeholder="Seu nome" />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--text-muted)]">
          E-mail
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="voce@empresa.com"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--text-muted)]">
          WhatsApp
          <input
            name="whatsapp"
            required
            autoComplete="tel"
            inputMode="tel"
            className={inputClass}
            placeholder="(48) 99999-9999"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--text-muted)]">
          Empresa
          <input
            name="empresa"
            required
            autoComplete="organization"
            className={inputClass}
            placeholder="Nome da locadora"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--text-muted)]">
          Cargo
          <select name="cargo" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Selecione
            </option>
            {CARGO_OPTIONS.map(o => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--text-muted)]">
          Segmento
          <select name="segmento" required defaultValue="Locadora" className={inputClass}>
            {SEGMENTO_OPTIONS.map(o => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--text-muted)]">
        Principal desafio
        <select name="desafio" required defaultValue='Disputa “já estava assim”' className={inputClass}>
          {DESAFIO_OPTIONS.map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--text-muted)]">
        Volume aproximado de devoluções/mês <span className="font-normal">(opcional)</span>
        <input name="volume" inputMode="numeric" className={inputClass} placeholder="Ex.: 80" />
      </label>

      <button
        type="submit"
        disabled={busy}
        className={buttonVariants({ variant: 'primary', size: 'lg', className: 'w-full mt-2' })}
      >
        {busy ? 'Abrindo trial…' : 'Quero meu trial de 7 dias'}
      </button>

      <p className="text-[11px] text-[var(--text-muted)] text-center leading-relaxed">
        Dados confidenciais. Sem cartão no trial. Resposta em até 1 dia útil no WhatsApp se Corporativo.
      </p>
    </form>
  )
}
