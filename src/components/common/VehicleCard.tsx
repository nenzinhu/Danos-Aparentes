'use client';

import type { Vehicle } from '@/types';

type Props = {
  vehicle: Vehicle;
  onClick?: () => void;
};

export function VehicleCard({ vehicle, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 text-left hover:border-[var(--signal-bright)]/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold tracking-wide text-[var(--text-main)]">
            {vehicle.plate.toUpperCase()}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {[vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' ') || 'Veículo'}
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--signal-bright)]">
          {vehicle.inspection_count} inspeç{vehicle.inspection_count === 1 ? 'ão' : 'ões'}
        </span>
      </div>
      {vehicle.last_inspection_at && (
        <p className="mt-2 text-[10px] text-[var(--text-muted)]">
          Última vistoria: {new Date(vehicle.last_inspection_at).toLocaleDateString('pt-BR')}
        </p>
      )}
    </button>
  );
}
