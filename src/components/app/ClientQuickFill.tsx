'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useClients } from '@/src/hooks/useClients';
import { IconCar, IconDocument, IconSearch } from '@/src/components/ui/AnimatedIcons';
import type { VehicleInfo } from '@/src/types';

interface Props {
  vehicleInfo: VehicleInfo;
  onVehicleInfoChange: (info: VehicleInfo) => void;
  userId?: string;
  onToast?: (msg: string) => void;
}

function normalizePlate(p: unknown): string {
  if (typeof p === 'string') return p.trim().toUpperCase();
  if (p && typeof p === 'object' && 'value' in p) return String((p as { value: unknown }).value ?? '').trim().toUpperCase();
  return '';
}

export default function ClientQuickFill({ vehicleInfo, onVehicleInfoChange, userId, onToast }: Props) {
  const { clients, getByPlate, createOrUpdate, applyToVehicleInfo } = useClients(userId);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  // Auto-fill vindo da tela de Clientes ("Usar em nova inspeção")
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fillId = sessionStorage.getItem('da_fill_client_id');
    if (!fillId) return;
    sessionStorage.removeItem('da_fill_client_id');
    const rec = clients.find((c) => c.id === fillId);
    if (rec) {
      onVehicleInfoChange(applyToVehicleInfo(vehicleInfo, rec));
      onToast?.(`Dados de ${rec.owner || rec.plate} carregados`);
    }
  }, [clients, applyToVehicleInfo, onVehicleInfoChange, onToast, vehicleInfo]);

  const plate = normalizePlate(vehicleInfo.plate);

  const suggestions = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return [];
    return clients
      .filter(
        (c) =>
          c.owner.toUpperCase().includes(q) ||
          c.plate.toUpperCase().includes(q) ||
          c.brand.toUpperCase().includes(q),
      )
      .slice(0, 6);
  }, [clients, query]);

  const matchedByPlate = plate ? getByPlate(plate) : undefined;

  const fillFrom = (id: string) => {
    const rec = clients.find((c) => c.id === id);
    if (!rec) return;
    onVehicleInfoChange(applyToVehicleInfo(vehicleInfo, rec));
    setOpen(false);
    setQuery('');
    onToast?.(`Dados de ${rec.owner || rec.plate} carregados`);
  };

  const saveCurrent = async () => {
    const rec = await createOrUpdate(useClientsPlateInput(vehicleInfo));
    if (rec) onToast?.(`${rec.owner || rec.plate} salvo nos clientes`);
    else onToast?.('Não foi possível salvar (sem conexão)');
  };

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-3 sm:p-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="ds-label flex items-center gap-1.5 m-0">
          <IconCar size={14} className="text-[var(--primary)]" />
          Clientes & Veículos
        </p>
        {matchedByPlate && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-300">
            <IconDocument size={11} /> Cadastrado
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <IconSearch size={15} />
          </span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder="Buscar por nome, placa ou marca..."
            className="w-full rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--bg-main)]/60 pl-9 pr-3 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
            aria-label="Buscar cliente ou veículo existente"
          />
          {open && suggestions.length > 0 && (
            <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)] shadow-2xl">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      fillFrom(s.id);
                    }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-[var(--panel-bg)]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-[var(--text-main)]">{s.owner || '—'}</span>
                      <span className="block truncate text-[0.7rem] text-[var(--text-muted)]">
                        {s.plate} · {s.brand}
                      </span>
                    </span>
                    <span className="shrink-0 text-[0.7rem] font-semibold text-[var(--primary)]">Usar →</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={saveCurrent}
          disabled={!plate && !vehicleInfo.owner}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--primary)]/20 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)]"
          style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
          title="Salva cliente + veículo para reutilizar nas próximas inspeções"
        >
          <IconDocument size={15} /> Salvar
        </button>
      </div>
      <p className="mt-1.5 text-[0.68rem] text-[var(--text-muted)] leading-snug">
        Pré-preenche nome, placa, marca e dados do veículo em 1 clique. Os dados ficam na nuvem e sincronizam entre dispositivos.
      </p>
    </div>
  );
}

/** Converte VehicleInfo -> ClientInput sem importar o tipo interno do hook (evita acoplamento). */
function useClientsPlateInput(info: VehicleInfo) {
  return {
    owner: info.owner ?? '',
    phone: info.phone ?? '',
    cpf: info.cpf ?? null,
    cnh: info.cnh ?? null,
    cnhCategory: info.cnhCategory ?? null,
    plate: normalizePlate(info.plate),
    brand: info.brand ?? '',
    color: info.color ?? '',
    vehicleTypeDesc: info.vehicleTypeDesc ?? '',
    ano: info.ano ?? null,
    km: info.km ?? null,
    city: info.city ?? '',
    state: info.state ?? '',
    profile: info.profile ?? '',
  };
}
