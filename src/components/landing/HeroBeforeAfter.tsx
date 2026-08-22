'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hero antes/depois interativo: arraste o divisor e veja a vistoria no
 * diagrama virar laudo PDF com hash e QR Code. A prova em um gesto.
 */
export default function HeroBeforeAfter() {
  const [pos, setPos] = useState(55);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(96, Math.max(4, pct)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => updateFromClientX(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [dragging, updateFromClientX]);

  return (
    <div className="flex flex-col gap-3 select-none">
      <div
        ref={wrapRef}
        className="relative w-full aspect-[4/3] rounded-2xl border border-[var(--card-border)] overflow-hidden cursor-ew-resize touch-none bg-[var(--bg-main)] shadow-xl shadow-black/20"
        onPointerDown={(e) => {
          setDragging(true);
          updateFromClientX(e.clientX);
        }}
        role="slider"
        aria-label="Arraste para comparar: diagrama de vistoria antes, laudo verificável depois"
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPos((p) => Math.max(4, p - 4));
          if (e.key === 'ArrowRight') setPos((p) => Math.min(96, p + 4));
        }}
      >
        {/* DEPOIS (fundo): laudo PDF verificável */}
        <div className="absolute inset-0 bg-[var(--panel-bg)]">
          <img
            src="/exemplos/modelo-relatorio.webp"
            alt="Laudo PDF gerado: diagrama de danos, fotos, assinaturas, hash SHA-256 e QR Code de verificação"
            className="w-full h-full object-cover object-top"
            draggable={false}
          />
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--success)]">
            <span aria-hidden>✔</span> Laudo verificável
          </span>
        </div>

        {/* ANTES (recortado): diagrama da vistoria */}
        <div
          className="absolute inset-0 overflow-hidden bg-[var(--bg-main)]"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <img
              src="/icons/vehicles/car.svg"
              alt=""
              aria-hidden="true"
              className="w-40 sm:w-48 max-h-[45%] object-contain opacity-90"
              draggable={false}
            />
            <div className="flex flex-col items-center gap-2">
              <span className="rounded-md border border-sky-400/40 bg-sky-400/10 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                ● Risco · Porta dianteira esq.
              </span>
              <span className="rounded-md border border-red-400/40 bg-red-400/10 px-2 py-0.5 text-[10px] font-bold text-red-300">
                ● Amassado · Para-choque
              </span>
              <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                ● Trinca · Farol
              </span>
            </div>
          </div>
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--card-border)] bg-[var(--card-bg-solid)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
            ◎ Vistoria no diagrama
          </span>
        </div>

        {/* Divisor */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[var(--signal-bright)] shadow-[0_0_16px_var(--signal-glow)]"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--signal-bright)] bg-[var(--bg-main)] text-[var(--signal-bright)] shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
            </svg>
          </span>
        </div>
      </div>

      <label className="sr-only" htmlFor="hero-ba-range">Posição da comparação</label>
      <input
        id="hero-ba-range"
        type="range"
        min={4}
        max={96}
        value={Math.round(pos)}
        onChange={(e) => setPos(Number(e.target.value))}
        className="w-full accent-[var(--signal-bright)] cursor-pointer"
        aria-label="Controlar comparação antes e depois"
      />
      <p className="text-center text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
        Arraste · veja a vistoria virar prova
      </p>
    </div>
  );
}
