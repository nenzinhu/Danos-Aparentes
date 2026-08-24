'use client';

import Image from 'next/image';

/**
 * Hero da home: destaque visual do relatório entrada vs retorno.
 * Layout baseado na referência de marketing: antes/depois lado a lado,
 * com badges de status (verde OK / vermelho alerta) e copy direto.
 */
export default function HeroBeforeAfter() {
  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="relative w-full aspect-[4/3] rounded-2xl border border-[var(--card-border)] overflow-hidden bg-[var(--panel-bg)] shadow-xl shadow-black/20">
        <Image
          src="/exemplos/hero-vistoria-entrada-retorno.png"
          alt="Relatório de vistoria entrada e retorno lado a lado: evidência comparável do estado do veículo no check-out e check-in"
          fill
          className="w-full h-full object-cover object-top"
          draggable={false}
        />

        {/* Badge esquerdo — ENTRADA sem avarias */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--success)]">
          <span aria-hidden>✔</span> Entrada — Sem avarias
        </span>

        {/* Badge direito — RETORNO avaria detectada */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-[rgba(248,113,113,0.35)] bg-[rgba(239,68,68,0.12)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#f87171]">
          <span aria-hidden>⚠</span> Retorno — Avaria detectada
        </span>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
          Veja a diferença na prática
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          A mesma placa, duas inspeções. Na entrada, sem avarias. No retorno, o dano aparece no dossier — com foto, data/hora e hash. É assim que você prova o que mudou.
        </p>
      </div>
    </div>
  );
}
