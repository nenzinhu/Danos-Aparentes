'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MANUAL_STEPS, type ManualStep } from '../lib/manualContent';
import { manualIconPaths } from '../lib/manualIcons';
import { generateManualPdf } from '../lib/manual';

interface FeaturesSlidesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function StepVisual({ step }: { step: ManualStep }) {
  if (step.images?.length) {
    return (
      <div className="flex items-center justify-center gap-5 sm:gap-8 flex-wrap py-4">
        {step.images.map((img) => (
          <div
            key={img.src}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[var(--card-bg)]/60 border border-white/5"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={112}
              height={80}
              // o otimizador do next/image rejeita SVG sem dangerouslyAllowSVG
              unoptimized={img.src.endsWith('.svg')}
              className="object-contain h-16 w-auto drop-shadow-md"
            />
          </div>
        ))}
      </div>
    );
  }

  if (step.image) {
    return (
      <div className="relative w-full flex items-center justify-center p-2 min-h-[200px]">
        <Image
          src={step.image}
          alt={step.imageAlt ?? step.title}
          width={520}
          height={360}
          className="max-h-[240px] w-auto max-w-full object-contain rounded-xl drop-shadow-2xl"
          priority
        />
      </div>
    );
  }

  return null;
}

function TutorialProgress({
  steps,
  current,
  onSelect,
}: {
  steps: typeof MANUAL_STEPS;
  current: number;
  onSelect: (i: number) => void;
}) {
  const pct = Math.round(((current + 1) / steps.length) * 100);
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[10px] font-black tracking-widest text-[var(--primary)] uppercase">
          Passo {current + 1} de {steps.length}
        </span>
        <span className="text-[10px] font-bold text-[var(--text-muted)]">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--card-border)] overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => onSelect(i)}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                active
                  ? 'bg-[var(--primary)]/15 border-[var(--primary)]/40 text-[var(--primary)]'
                  : done
                    ? 'bg-[var(--success)]/10 border-[var(--success)]/25 text-[var(--success)]'
                    : 'bg-[var(--panel-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--primary)]/20 hover:text-[var(--text-main)]'
              }`}
              aria-current={active ? 'step' : undefined}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${
                  active ? 'bg-[var(--primary)] text-[var(--bg-main)]' : done ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-white/5'
                }`}
              >
                {done ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline max-w-[88px] truncate">{s.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FeaturesSlidesModal({ isOpen, onClose }: FeaturesSlidesModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [downloading, setDownloading] = useState(false);

  // Reset do slide ao abrir — ajuste durante o render (sem effect/setState sync).
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setCurrentSlide(0);
  }

  if (!isOpen) return null;

  const steps = MANUAL_STEPS;
  const step = steps[currentSlide];
  const isLast = currentSlide === steps.length - 1;

  const handleFinish = () => {
    localStorage.setItem('app_tour_seen', 'true');
    onClose();
  };

  const handleNext = () => {
    if (isLast) handleFinish();
    else setCurrentSlide((p) => p + 1);
  };

  const handleDownloadManual = async () => {
    setDownloading(true);
    try {
      await generateManualPdf();
    } catch (e) {
      console.error('Falha ao gerar manual PDF:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-[var(--bg-main)]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[var(--card-bg)]/95 border border-[var(--primary)]/20 rounded-2xl overflow-hidden flex flex-col relative max-h-[92vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="h-1 w-full bg-[var(--primary)] shrink-0" />

        <div className="px-5 sm:px-7 pt-5 pb-2 border-b border-white/5 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-[0.18em] text-[var(--primary)] uppercase mb-1">Tutorial</p>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-main)] font-outfit leading-tight truncate">
                {step.title}
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                {step.subtitle}
              </p>
            </div>
            <button
              onClick={handleFinish}
              className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-main)] p-2 hover:bg-white/5 rounded-xl transition-all text-lg leading-none"
              aria-label="Fechar tutorial"
            >
              ✕
            </button>
          </div>
          <TutorialProgress steps={steps} current={currentSlide} onSelect={setCurrentSlide} />
        </div>

        <div
          key={currentSlide}
          className="flex-1 overflow-y-auto min-h-0 px-5 sm:px-7 py-5 animate-in fade-in slide-in-from-right-3 duration-200 motion-reduce:animate-none"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-5 items-start">
            <div className="relative rounded-2xl border border-[var(--primary)]/20 bg-[var(--panel-bg)] p-4 sm:p-5 overflow-hidden">
              <StepVisual step={step} />
              <p className="relative mt-3 text-xs text-[var(--text-muted)] leading-relaxed font-outfit border-t border-[var(--card-border)] pt-3">
                {step.desc}
              </p>
            </div>

            <div className="space-y-2">
              {step.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-xl bg-[var(--panel-bg)] border border-[var(--card-border)] hover:border-[var(--primary)]/20 transition-colors"
                >
                  <span
                    className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center shrink-0"
                    aria-hidden
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width={18}
                      height={18}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--primary)]"
                      // markup estático de src/lib/manualIcons.ts — nunca entrada de usuário
                      dangerouslySetInnerHTML={{ __html: manualIconPaths(h.icon) }}
                    />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-extrabold text-slate-200 font-outfit">{h.label}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 font-outfit">{h.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-4 rounded-2xl border border-[var(--success)]/25 bg-[var(--success)]/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold text-[var(--success)] font-outfit">Manual completo em PDF</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-outfit">
                Mesmo conteúdo e imagens do tutorial, pronto para imprimir ou enviar à equipe.
              </p>
            </div>
            <button
              onClick={handleDownloadManual}
              disabled={downloading}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold font-outfit text-[var(--bg-main)] bg-[var(--success)] hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {downloading ? 'Gerando…' : 'Baixar PDF'}
            </button>
          </div>
        </div>

        <div className="bg-[var(--panel-bg)] border-t border-[var(--card-border)] px-5 sm:px-7 py-4 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleFinish}
            className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors uppercase tracking-wider"
          >
            Pular
          </button>

          <div className="flex gap-2">
            {currentSlide > 0 && (
              <button
                onClick={() => setCurrentSlide((p) => p - 1)}
                className="px-4 py-2.5 border border-[var(--card-border)] text-[var(--text-main)] hover:bg-white/5 font-bold text-xs rounded-xl transition-all"
              >
                Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-[var(--bg-main)] font-extrabold text-xs rounded-xl shadow-lg shadow-[var(--primary)]/20 transition-all active:scale-[0.98]"
            >
              {isLast ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
