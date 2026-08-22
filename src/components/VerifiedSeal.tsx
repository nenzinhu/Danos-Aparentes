/**
 * Selo "Dossiê Verificável" — badge público que clientes white-label podem
 * incorporar em seus sites, linkando para a verificação pública. A prova
 * vira distribuição: cada cliente é um ponto de entrada.
 */
export default function VerifiedSeal({
  url = 'https://danosaparentes.com.br',
  compact = false,
}: {
  url?: string;
  compact?: boolean;
}) {
  return (
    <a
      href={`${url}/verify`}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] px-3.5 py-2.5 shadow-md shadow-black/10 transition-[transform,border-color,box-shadow] motion-safe:hover:-translate-y-0.5 hover:border-sky-400/50 hover:shadow-[0_0_24px_-8px_rgba(56,189,248,0.45)]"
      aria-label="Dossiê Verificável — verificação pública Danos Aparentes"
    >
      <svg
        width={compact ? 26 : 32}
        height={compact ? 26 : 32}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M24 3l4.2 3.1 5.2-.4 1.6 5 4.4 2.9-1.4 5 1.4 5-4.4 2.9-1.6 5-5.2-.4L24 45l-4.2-3.9-5.2.4-1.6-5L8.6 33.6l1.4-5-1.4-5 4.4-2.9 1.6-5 5.2.4L24 3z"
          fill="currentColor"
          className="text-sky-500/15"
        />
        <path
          d="M24 3l4.2 3.1 5.2-.4 1.6 5 4.4 2.9-1.4 5 1.4 5-4.4 2.9-1.6 5-5.2-.4L24 45l-4.2-3.9-5.2.4-1.6-5L8.6 33.6l1.4-5-1.4-5 4.4-2.9 1.6-5 5.2.4L24 3z"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-sky-400"
        />
        <path
          d="M16 24.5l5.5 5.5L32.5 19"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-400"
        />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-[0.68rem] font-black uppercase tracking-widest text-[var(--text-main)]">
          Dossiê Verificável
        </span>
        <span className="text-[0.6rem] font-semibold text-[var(--text-muted)]">
          conferido por Danos Aparentes
        </span>
      </span>
    </a>
  );
}
