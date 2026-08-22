'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

const VERIFY_URL = 'https://danosaparentes.com.br/verify';
const DEMO_HASH = 'A7F3C21E9B84D5F6A0C1E2D3B4F5A6978C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F';

/** Botão de copiar reutilizável */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard indisponível — usuário pode selecionar manualmente */
        }
      }}
      className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg-solid)] px-3 py-2 text-xs font-black text-[var(--signal-bright)] hover:bg-[var(--btn-secondary-hover)] transition-colors cursor-pointer"
    >
      {copied ? '✔ Copiado!' : label}
    </button>
  );
}

/**
 * "Verifique você mesmo": QR escaneável + código copiável + carta de
 * verificação de exemplo. A prova é o pitch — sem cadastro, sem promessa.
 */
export default function VerifyYourselfSection() {
  return (
    <section
      aria-labelledby="verify-yourself-heading"
      className="w-full z-10 relative border-y border-[var(--card-border)]/50 bg-[var(--panel-bg)]/70 backdrop-blur-sm"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
        <div className="flex flex-col items-center lg:items-start gap-5">
          <p className="font-mono-data text-[11px] tracking-[0.2em] uppercase text-[var(--signal-bright)]">
            Prova pública · sem cadastro
          </p>
          <h2
            id="verify-yourself-heading"
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] [text-wrap:balance]"
          >
            Verifique você mesmo
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-md">
            Cada laudo sai com um <strong className="text-[var(--text-main)]">hash SHA-256</strong> e um{' '}
            <strong className="text-[var(--text-main)]">QR Code</strong>. Aponte a câmera do celular
            para o código ao lado — ou copie o hash — e confirme na hora que o documento bate com o
            original, sem depender da palavra de ninguém.
          </p>
          <div className="flex flex-wrap gap-2.5 items-center">
            <Link
              href={`/verify?hash=${DEMO_HASH}`}
              className="px-5 py-3 min-h-12 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-black shadow-xl shadow-[var(--primary)]/25 inline-flex items-center gap-2 transition-colors"
            >
              Abrir verificação →
            </Link>
            <CopyButton value={DEMO_HASH} label="Copiar hash de exemplo" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* QR escaneável de verdade */}
          <div className="shrink-0 rounded-2xl border border-[var(--card-border)] bg-white p-4 shadow-xl shadow-black/20">
            <QRCodeSVG
              value={`${VERIFY_URL}?hash=${DEMO_HASH}`}
              size={148}
              level="M"
              bgColor="#ffffff"
              fgColor="#0f172a"
              aria-label={`QR Code apontando para ${VERIFY_URL} com hash de verificação`}
            />
            <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-widest text-slate-500">
              danosaparentes.com.br/verify
            </p>
          </div>

          {/* Carta de verificação de exemplo */}
          <div
            className="w-full max-w-xs rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-5 shadow-lg shadow-black/10 flex flex-col gap-3"
            aria-label="Exemplo de resultado de verificação de dossiê"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[var(--card-border)]/60 pb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Resultado da verificação
              </p>
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-2 py-0.5 text-[10px] font-black text-[var(--success)]">
                <span aria-hidden>✔</span> Íntegro
              </span>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs">
              <dt className="text-[var(--text-muted)] font-semibold">Hash</dt>
              <dd className="font-mono-data truncate text-[var(--text-main)]" title={DEMO_HASH}>
                {DEMO_HASH.slice(0, 20)}…
              </dd>
              <dt className="text-[var(--text-muted)] font-semibold">Veículo</dt>
              <dd className="text-[var(--text-main)]">ABC1D23 · Carro</dd>
              <dt className="text-[var(--text-muted)] font-semibold">Avarias</dt>
              <dd className="text-[var(--text-main)]">3 registradas · 5 evidências</dd>
              <dt className="text-[var(--text-muted)] font-semibold">Emitido</dt>
              <dd className="text-[var(--text-main)]">22/08/2026 09:41</dd>
            </dl>
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--card-border)]/60 pt-3">
              Exemplo ilustrativo de dossiê verificado. O laudo real é imutável após a emissão —
              qualquer alteração muda o hash e a verificação falha.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
