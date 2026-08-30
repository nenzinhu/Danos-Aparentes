'use client';
import { useState } from 'react';
import CarLateralLeft from '../vehicles/CarLateralLeft';
import CarLateralRight from '../vehicles/CarLateralRight';
import CarFrontal from '../vehicles/CarFrontal';
import CarTraseira from '../vehicles/CarTraseira';
import type { Damage, DamageType, Severity } from '../../types';

type ViewKey = 'lateral-left' | 'lateral-right' | 'frontal' | 'traseira';

const TYPE_LABEL: Record<DamageType, string> = {
  scratch: 'Risco',
  dent: 'Amassado',
  broken: 'Quebrado',
};

const SEVERITY_LABEL: Record<Severity, string> = {
  low: 'Leve',
  medium: 'Médio',
  high: 'Grave',
};

function demoDamage(partial: {
  partId: string;
  partName: string;
  view: ViewKey;
  type: DamageType;
  severity: Severity;
}): Damage {
  return {
    id: `demo-${partial.partId}`,
    vehicle: 'car',
    view: partial.view,
    partId: partial.partId,
    partName: partial.partName,
    type: partial.type,
    typeName: TYPE_LABEL[partial.type],
    severity: partial.severity,
    notes: '',
    photos: [],
    photoNotes: [],
  };
}

const VIEWS: {
  key: ViewKey;
  label: string;
  Component: typeof CarLateralLeft;
  damage: Damage;
}[] = [
  {
    key: 'lateral-left',
    label: 'Lat. Esquerda',
    Component: CarLateralLeft,
    damage: demoDamage({
      partId: 'car-ll-fender-rear',
      partName: 'Para-lama Traseiro Esquerdo',
      view: 'lateral-left',
      type: 'scratch',
      severity: 'low',
    }),
  },
  {
    key: 'lateral-right',
    label: 'Lat. Direita',
    Component: CarLateralRight,
    damage: demoDamage({
      partId: 'car-rr-wheel-rear',
      partName: 'Roda Traseira Direita',
      view: 'lateral-right',
      type: 'scratch',
      severity: 'low',
    }),
  },
  {
    key: 'frontal',
    label: 'Frontal',
    Component: CarFrontal,
    damage: demoDamage({
      partId: 'car-f-bumper',
      partName: 'Para-choque Dianteiro',
      view: 'frontal',
      type: 'dent',
      severity: 'medium',
    }),
  },
  {
    key: 'traseira',
    label: 'Traseira',
    Component: CarTraseira,
    damage: demoDamage({
      partId: 'car-r-light-right',
      partName: 'Lanterna Traseira Direita',
      view: 'traseira',
      type: 'broken',
      severity: 'high',
    }),
  },
];

const noop = () => {};

export default function VehicleViewsDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = VIEWS[activeIndex];
  const Diagram = active.Component;

  return (
    <div className="not-prose my-10 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 backdrop-blur-md">
      <div className="flex flex-wrap gap-2 mb-2">
        {VIEWS.map((v, i) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-colors ${
              i === activeIndex
                ? 'bg-primary border-primary text-white'
                : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)]'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <div className="h-1.5 rounded-full bg-[var(--btn-secondary-bg)] overflow-hidden">
          <div
            className="h-full bg-[var(--success)] transition-all"
            style={{ width: `${((activeIndex + 1) / VIEWS.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1.5">
          {activeIndex + 1} de {VIEWS.length} vistas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <Diagram
            damages={[active.damage]}
            selectedPartId={null}
            onPartClick={noop}
            onPartHover={noop}
          />
        </div>

        <div className="lg:col-span-5">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-widest text-[var(--signal-bright)] mb-2">
            Avaria registrada nesta vista
          </p>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--btn-secondary-bg)] px-4 py-3">
            <p className="text-sm font-bold text-[var(--text-main)]">{active.damage.partName}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {TYPE_LABEL[active.damage.type]} · {SEVERITY_LABEL[active.damage.severity]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
