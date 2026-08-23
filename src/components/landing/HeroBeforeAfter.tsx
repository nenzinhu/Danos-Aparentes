'use client';

import { useState } from 'react';

/**
 * Hero da home: destaque visual do relatório entrada vs retorno.
 * Usa a screenshot comparativa (check-out/check-in) como evidência direta
 * do produto.
 */
export default function HeroBeforeAfter() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="relative w-full aspect-[4/3] rounded-2xl border border-[var(--card-border)] overflow-hidden bg-[var(--panel-bg)] shadow-xl shadow-black/20">
        <img
          src="/exemplos/hero-vistoria-entrada-retorno.png"
          alt="Relatório de vistoria entrada e retorno lado a lado: evidência comparável do estado do veículo no check-out e check-in"
          className={`w-full h-full object-cover object-top transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          draggable={false}
          onLoad={() => setLoaded(true)}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-[var(--card-border)] border-t-[var(--signal-bright)] animate-spin" />
          </div>
        )}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--success)]">
          <span aria-hidden>✔</span> Comparativo entrada × retorno
        </span>
      </div>

      <p className="text-center text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
        Vistoria de entrada e retorno no mesmo padrão, com hash, QR Code e assinatura digital
      </p>
    </div>
  );
}
