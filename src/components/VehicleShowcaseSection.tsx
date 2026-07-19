'use client';
import { useState } from 'react';
import { VehicleType } from '../types'
import Reveal from './Reveal'
import {
  VehicleLineIcon,
  ScratchIcon,
  DentIcon,
  BrokenIcon,
} from './marketing/VehicleLineIcons'

const vehicleOptions: { type: VehicleType; name: string; mockDamages: any[] }[] = [
  {
    type: 'car',
    name: 'Carro',
    mockDamages: [
      {
        id: 'mock-1' as any,
        vehicle: 'car',
        view: 'lateral-left',
        partId: 'car-ll-door-front',
        partName: 'Porta Dianteira Esquerda',
        type: 'scratch',
        typeName: 'Risco',
        severity: 'high',
        notes: 'Risco profundo contínuo',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'car2d',
    name: 'Carro 2 Portas',
    mockDamages: [
      {
        id: 'mock-car2d' as any,
        vehicle: 'car2d',
        view: 'lateral-left',
        partId: 'car2d-ll-door',
        partName: 'Porta Esquerda',
        type: 'dent',
        typeName: 'Amassado',
        severity: 'medium',
        notes: 'Amassado na porta',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'moto',
    name: 'Moto',
    mockDamages: [
      {
        id: 'mock-2' as any,
        vehicle: 'moto',
        view: 'lateral-left',
        partId: 'moto-ll-fuel-tank',
        partName: 'Tanque de Combustível',
        type: 'dent',
        typeName: 'Amassado',
        severity: 'medium',
        notes: 'Amassado leve lateral',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'truck',
    name: 'Caminhão',
    mockDamages: [
      {
        id: 'mock-3' as any,
        vehicle: 'truck',
        view: 'lateral-left',
        partId: 'truck-ll-cargo-box',
        partName: 'Baú de Carga',
        type: 'scratch',
        typeName: 'Risco',
        severity: 'low',
        notes: 'Risco superficial na chapa',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'van',
    name: 'Utilitário (Van)',
    mockDamages: [
      {
        id: 'mock-4' as any,
        vehicle: 'van',
        view: 'lateral-left',
        partId: 'van-ll-door-front',
        partName: 'Porta Dianteira Esquerda',
        type: 'broken',
        typeName: 'Quebrado',
        severity: 'high',
        notes: 'Vidro trincado',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'bus',
    name: 'Ônibus',
    mockDamages: [
      {
        id: 'mock-5' as any,
        vehicle: 'bus',
        view: 'lateral-left',
        partId: 'bus-ll-body',
        partName: 'Carroceria / Lateral',
        type: 'scratch',
        typeName: 'Risco',
        severity: 'medium',
        notes: 'Risco na pintura perto da roda',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'microbus',
    name: 'Micro-ônibus',
    mockDamages: [
      {
        id: 'mock-microbus' as any,
        vehicle: 'microbus',
        view: 'lateral-left',
        partId: 'microbus-l-body',
        partName: 'Carroceria / Lateral',
        type: 'scratch',
        typeName: 'Risco',
        severity: 'medium',
        notes: 'Risco na lateral',
        photos: [],
        photoNotes: []
      }
    ]
  }
];

function DamageTypeIcon({ type }: { type: string }) {
  if (type === 'broken') return <BrokenIcon size={12} />
  if (type === 'dent') return <DentIcon size={12} />
  return <ScratchIcon size={12} />
}

export default function VehicleShowcaseSection() {
  const [activeVehicle, setActiveVehicle] = useState<VehicleType>('car');

  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Coluna Esquerda: Seletor de veículos */}
        <div className="lg:col-span-5 space-y-6">
          <Reveal className="space-y-6">
          <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)]">
            Suporte a todo tipo de veículo
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            O aplicativo oferece diagramas interativos de alta fidelidade desenhados especificamente para cada tipo de veículo. Toque em qualquer parte para abrir as opções de marcação.
          </p>
          </Reveal>

          {/* Botões do Seletor */}
          <div className="flex flex-col gap-2.5 pt-2">
            {vehicleOptions.map((opt) => {
              const isActive = activeVehicle === opt.type
              return (
              <button
                key={opt.type}
                onClick={() => setActiveVehicle(opt.type)}
                className={`w-full px-5 py-4 rounded-xl border flex items-center justify-between text-sm font-bold transition-all outline-none ${
                  isActive
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <VehicleLineIcon
                    type={opt.type}
                    size={24}
                    className={isActive ? 'opacity-95' : 'opacity-70'}
                  />
                  <span>{opt.name}</span>
                </div>
                {isActive && (
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Ativo</span>
                )}
              </button>
              )
            })}
          </div>
        </div>

        {/* Coluna Direita: Renderizador interativo de SVG */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center relative group min-h-[350px]">
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, var(--signal-glow) 0%, transparent 70%)', opacity: 0.5 }} />
          <div className="w-full max-w-[480px] filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] bg-[var(--card-bg)] border border-[var(--card-border)] p-8 rounded-2xl relative backdrop-blur-md">

            {/* Etiqueta indicando vista */}
            <div className="absolute top-4 left-4 font-mono-data text-[9px] tracking-[0.18em] text-[var(--signal-bright)] uppercase border border-[var(--sheet-line)] px-2.5 py-1 rounded">
              Vista · Lateral Esq.
            </div>

            {/* Imagem estática do veículo (leve, sem hidratação de SVG) */}
            <div className="py-8">
              <img
                src={`/vehicles-img/${activeVehicle}.png`}
                alt={`Diagrama lateral do veículo: ${vehicleOptions.find(o => o.type === activeVehicle)?.name || ''}`}
                loading="lazy"
                decoding="async"
                width={828}
                height={352}
                className="w-full h-auto"
              />
            </div>

            {/* Nota simulada explicando a avaria */}
            {(() => {
              const selectedOpt = vehicleOptions.find(o => o.type === activeVehicle) || vehicleOptions[0];
              return (
                <div className="border-t border-[var(--card-border)]/50 pt-4 mt-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_#ef4444]" />
                    <span className="text-xs font-bold text-[var(--text-main)]">
                      Avaria Detectada: {selectedOpt.mockDamages[0].partName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <DamageTypeIcon type={selectedOpt.mockDamages[0].type} />
                      Tipo: {selectedOpt.mockDamages[0].typeName}
                    </span>
                    <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      {selectedOpt.mockDamages[0].severity === 'high' ? 'Grave' : selectedOpt.mockDamages[0].severity === 'medium' ? 'Médio' : 'Leve'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}
