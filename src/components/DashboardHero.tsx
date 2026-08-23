'use client';
import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { IconShieldCheck, IconSparkles, IconCar, IconFolder, IconDocument } from './ui/AnimatedIcons';
import { usePerformanceTelemetry } from '../hooks/usePerformanceTelemetry';

interface Props {
  savedCount: number;
  vehiclesMonitored: number;
  dossiersIssued: number;
  userName?: string;
  onNewInspection?: () => void;
}

function greeting(): string {
  if (typeof window === 'undefined') return 'Olá';
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function DashboardHero({
  savedCount,
  vehiclesMonitored,
  dossiersIssued,
  userName,
  onNewInspection,
}: Props) {
  const reduceMotion = useReducedMotion();
  const { metrics } = usePerformanceTelemetry();
  const name = userName?.trim();
  const title = useMemo(() => {
    const cumprimento = greeting();
    return name ? `${cumprimento}, ${name.split(' ')[0]}` : cumprimento;
  }, [name]);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const item = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
      };

  return (
    <motion.section
      variants={reduceMotion ? undefined : container}
      initial={reduceMotion ? undefined : 'hidden'}
      animate={reduceMotion ? undefined : 'show'}
      className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-6 sm:p-8 backdrop-blur-md"
      style={{
        backgroundImage:
          'radial-gradient(120% 120% at 100% 0%, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 55%)',
      }}
      aria-label="Cabeçalho do painel"
    >
      {/* Glow decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full"
        style={{ background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', opacity: 0.5 }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <motion.div variants={item} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--card-border)] bg-[var(--bg-main)]/60 px-3 py-1 font-mono-data text-[11px] font-semibold uppercase tracking-wider text-[var(--signal-bright)]">
              <IconShieldCheck size={13} className="text-[var(--signal-bright)]" />
              Inteligência Histórica Veicular
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                background: metrics.online ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                color: metrics.online ? '#10b981' : '#ef4444',
                border: `1px solid ${metrics.online ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: metrics.online ? '#10b981' : '#ef4444' }}
              />
              {metrics.online ? 'Sistema online' : 'Modo offline'}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-4 font-display text-2xl font-extrabold tracking-tight text-[var(--text-main)] sm:text-3xl lg:text-[2.1rem] leading-[1.05]"
          >
            {title}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base"
          >
            Sua memória digital de veículos está ativa. Inspecione com evidências, compare alterações e
            emita dossiês técnicos em minutos — tudo na nuvem ou offline.
          </motion.p>

          <motion.div variants={item} className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onNewInspection}
              className="group inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-[var(--primary)]/25 transition-all hover:opacity-95 active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)]"
              style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
            >
              <IconSparkles size={18} className="text-white" />
              Nova inspeção
              <svg
                aria-hidden
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-150 group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <a
              href="#historicos"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--card-border)] px-5 py-3.5 text-sm font-bold text-[var(--text-main)] transition-colors hover:bg-[var(--panel-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)]"
            >
              Ver históricos
            </a>
          </motion.div>
        </div>

        {/* Stats rápidas */}
        <motion.div
          variants={item}
          className="grid grid-cols-3 gap-3 lg:max-w-sm"
          aria-label="Resumo rápido"
        >
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg-main)]/50 p-4 text-center">
            <IconCar size={18} className="mx-auto text-[var(--primary)]" />
            <div className="mt-1 font-display text-xl font-extrabold text-[var(--text-main)]">
              {vehiclesMonitored}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Monitorados
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg-main)]/50 p-4 text-center">
            <IconFolder size={18} className="mx-auto text-[var(--primary)]" />
            <div className="mt-1 font-display text-xl font-extrabold text-[var(--text-main)]">
              {savedCount}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Inspeções
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg-main)]/50 p-4 text-center">
            <IconDocument size={18} className="mx-auto text-[var(--signal-bright)]" />
            <div className="mt-1 font-display text-xl font-extrabold text-[var(--text-main)]">
              {dossiersIssued}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Dossiês
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
