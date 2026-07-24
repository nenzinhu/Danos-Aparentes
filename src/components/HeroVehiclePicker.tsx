'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { vehicleRegistry } from './vehicles/registry';
import { vehicleOptions } from './VehicleShowcaseSection';
import VehicleDefs from './vehicles/VehicleDefs';
import GsapLineCascade from './GsapLineCascade';
import Reveal from './Reveal';
import { IconDamageScratch, IconDamageDent, IconDamageBroken } from './ui/AnimatedIcons';
import type { VehicleType } from '../types';

/**
 * Hero's vehicle-type picker — swaps in the same real interactive SVG
 * diagrams used throughout the app (via vehicleRegistry), not static
 * mockup images, so this is a live preview of what the app actually draws.
 */
export default function HeroVehiclePicker() {
  const [activeVehicle, setActiveVehicle] = useState<VehicleType>('car');
  const stageRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = stageRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.96, y: 6 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [activeVehicle]);

  const selected = vehicleOptions.find(o => o.type === activeVehicle) || vehicleOptions[0];
  const damage = selected.mockDamages[0];
  const DiagramComp = vehicleRegistry[activeVehicle]?.['lateral-left'];

  return (
    <>
      <VehicleDefs />

      <Reveal className="space-y-3 mb-6">
        <GsapLineCascade
          as="h2"
          delay={0}
          stagger={0.1}
          className="font-display text-2xl lg:text-3xl font-bold uppercase tracking-tight leading-[1.15] text-[var(--text-main)]"
        >
          Suporte a todo tipo de veículo
        </GsapLineCascade>
        <GsapLineCascade
          as="p"
          delay={280}
          stagger={0.09}
          className="text-sm text-[var(--text-muted)] leading-relaxed"
        >
          O aplicativo oferece diagramas interativos de alta fidelidade desenhados especificamente para cada tipo de veículo. Toque em qualquer parte para abrir as opções de marcação.
        </GsapLineCascade>
      </Reveal>

      <div className="flex items-center justify-between font-mono-data text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-4">
        <span>Vista · Lateral Esq.</span>
        <span>{selected.mockDamages.length} avaria{selected.mockDamages.length === 1 ? '' : 's'}</span>
      </div>

      {/* Seletor de tipo de veículo — troca o diagrama real abaixo */}
      <div role="radiogroup" aria-label="Tipo de veículo" className="flex flex-wrap gap-1.5 mb-4">
        {vehicleOptions.map(opt => {
          const isActive = opt.type === activeVehicle;
          const Icon = opt.IconComponent;
          return (
            <button
              key={opt.type}
              type="button"
              role="radio"
              aria-checked={isActive}
              title={opt.name}
              onClick={() => setActiveVehicle(opt.type)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono-data text-[10px] uppercase tracking-wider transition-colors duration-150 outline-none cursor-pointer ${
                isActive
                  ? 'bg-[var(--signal)]/15 border-[var(--signal-bright)]/70 text-[var(--signal-bright)]'
                  : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--sheet-line)]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-[var(--signal-bright)]' : 'text-current'} />
              {opt.name}
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 grid place-items-center min-h-[260px]">
        <div aria-hidden="true" className="absolute inset-x-6 bottom-8 h-px bg-[var(--sheet-line)] opacity-60" />
        <div aria-hidden="true" className="absolute left-1/2 bottom-6 -translate-x-1/2 font-mono-data text-[9px] text-[var(--text-muted)] tracking-[0.3em] uppercase">eixo de referência</div>

        <div ref={stageRef} className="relative w-full max-w-md drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          {DiagramComp && (
            <DiagramComp
              damages={selected.mockDamages}
              selectedPartId={damage.partId}
              onPartClick={() => {}}
              onPartHover={() => {}}
            />
          )}
        </div>
      </div>

      {/* Avaria simulada do veículo selecionado */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-4 mt-2 border-t border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_#ef4444]" />
          <span className="text-xs font-bold text-[var(--text-main)]">
            Avaria Detectada: {damage.partName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {damage.type === 'broken' ? (
              <IconDamageBroken size={13} className="text-red-400" />
            ) : damage.type === 'dent' ? (
              <IconDamageDent size={13} className="text-orange-400" />
            ) : (
              <IconDamageScratch size={13} className="text-amber-400" />
            )}
            Tipo: {damage.typeName}
          </span>
          <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
            {damage.severity === 'high' ? 'Grave' : damage.severity === 'medium' ? 'Médio' : 'Leve'}
          </span>
        </div>
      </div>
    </>
  );
}
