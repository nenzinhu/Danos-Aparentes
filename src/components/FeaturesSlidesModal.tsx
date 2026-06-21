'use client';
import React, { useState, useEffect } from 'react';
import { MANUAL_STEPS } from '../lib/manualContent';
import { generateManualPdf } from '../lib/manual';

interface FeaturesSlidesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ilustrações por passo (mesma ordem de MANUAL_STEPS). Texto fica em manualContent.ts.
const STEP_SVGS: React.ReactNode[] = [
  // 1. Layout do app
  (
    <svg viewBox="0 0 200 130" className="w-full h-full text-sky-400 fill-none" stroke="currentColor" strokeWidth="1.2">
      <rect x="15" y="10" width="170" height="110" rx="6" strokeWidth="1.5" />
      <line x1="15" y1="28" x2="185" y2="28" strokeOpacity="0.3" />
      <circle cx="28" cy="19" r="4" fill="currentColor" opacity="0.8" />
      <line x1="155" y1="19" x2="175" y2="19" strokeWidth="2" strokeOpacity="0.4" />
      <line x1="110" y1="28" x2="110" y2="120" strokeOpacity="0.3" />
      <rect x="23" y="36" width="78" height="24" rx="3" strokeOpacity="0.4" />
      <line x1="28" y1="43" x2="68" y2="43" strokeOpacity="0.6" />
      <line x1="28" y1="48" x2="90" y2="48" strokeOpacity="0.4" />
      <line x1="28" y1="53" x2="80" y2="53" strokeOpacity="0.4" />
      <rect x="23" y="66" width="78" height="46" rx="4" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M35,92 C38,82 85,82 88,92 L85,96 L38,96 Z" fill="currentColor" fillOpacity="0.1" strokeWidth="1" />
      <circle cx="43" cy="96" r="3" fill="#000" />
      <circle cx="80" cy="96" r="3" fill="#000" />
      <rect x="118" y="36" width="58" height="36" rx="3" strokeOpacity="0.4" />
      <line x1="124" y1="44" x2="160" y2="44" strokeWidth="2" strokeOpacity="0.7" />
      <line x1="124" y1="50" x2="152" y2="50" strokeOpacity="0.5" />
      <line x1="124" y1="56" x2="166" y2="56" strokeOpacity="0.5" />
      <circle cx="166" cy="44" r="2.5" fill="#ef4444" stroke="none" />
      <rect x="118" y="78" width="58" height="15" rx="3" fill="currentColor" fillOpacity="0.15" strokeWidth="1.5" />
      <line x1="128" y1="85" x2="166" y2="85" strokeWidth="2" />
      <rect x="118" y="98" width="58" height="14" rx="3" strokeOpacity="0.3" />
      <line x1="128" y1="105" x2="166" y2="105" strokeWidth="1.5" strokeOpacity="0.5" />
    </svg>
  ),
  // 2. Consulta de placa
  (
    <svg viewBox="0 0 200 130" className="w-full h-full text-sky-400 fill-none" stroke="currentColor" strokeWidth="1.2">
      <rect x="35" y="20" width="130" height="42" rx="4" fill="rgba(15,23,42,0.6)" strokeWidth="2" />
      <rect x="35" y="20" width="130" height="11" fill="#3b82f6" stroke="none" />
      <circle cx="45" cy="25" r="1" fill="#fff" stroke="none" />
      <circle cx="55" cy="26" r="1.2" fill="#fff" stroke="none" />
      <circle cx="65" cy="25" r="0.8" fill="#fff" stroke="none" />
      <text x="92" y="29" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="7" fill="#fff" stroke="none" textAnchor="middle">BRASIL</text>
      <text x="100" y="55" fontFamily="Outfit, sans-serif" fontWeight="900" fontSize="24" fill="#fff" stroke="none" textAnchor="middle" letterSpacing="2">ABC1D23</text>
      <g stroke="none" fill="#00dcff">
        <path d="M22,78 L25,83 L30,84 L25,85 L22,90 L19,85 L14,84 L19,83 Z" />
        <path d="M178,42 L180,46 L184,47 L180,48 L178,52 L176,48 L172,47 L176,46 Z" />
      </g>
      <path d="M100,68 L100,82" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M97,79 L100,83 L103,79" strokeWidth="1.5" />
      <rect x="40" y="88" width="120" height="32" rx="4" strokeOpacity="0.4" fill="currentColor" fillOpacity="0.05" />
      <text x="50" y="100" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="8" fill="#cbd5e1" stroke="none">MARCA/MOD: TOYOTA COROLLA</text>
      <text x="50" y="112" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="8" fill="#cbd5e1" stroke="none">ANO: 2024  |  COR: CINZA METÁLICO</text>
    </svg>
  ),
  // 3. Toque no desenho
  (
    <svg viewBox="0 0 200 130" className="w-full h-full text-sky-400 fill-none" stroke="currentColor" strokeWidth="1.2">
      <path d="M25,85 C25,85 30,55 55,50 C80,45 110,45 130,50 C150,55 175,85 175,85 L170,95 L30,95 Z" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
      <circle cx="50" cy="95" r="11" fill="#020617" strokeWidth="2" />
      <circle cx="150" cy="95" r="11" fill="#020617" strokeWidth="2" />
      <path d="M78,50 L75,83" strokeOpacity="0.5" />
      <path d="M122,50 L125,83" strokeOpacity="0.5" />
      <path d="M75,83 L125,83" strokeOpacity="0.5" />
      <rect x="83" y="60" width="8" height="3" rx="1.5" fill="#fff" stroke="none" />
      <rect x="113" y="60" width="8" height="3" rx="1.5" fill="#fff" stroke="none" />
      <circle cx="100" cy="68" r="9" stroke="#ef4444" strokeWidth="1.5" className="animate-pulse" />
      <circle cx="100" cy="68" r="4" fill="#ef4444" stroke="none" />
      <g transform="translate(100, 68)" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0,0 L18,18 M13,20 L24,24 L20,13 M20,13 L13,20" />
        <path d="M10,12 L17,8 A1.5,1.5 0 0,1 19.5,10.2 L15,15" />
        <path d="M-6,-15 A12,12 0 0,0 -16,-5" stroke="#ef4444" strokeWidth="1" opacity="0.6" />
        <path d="M-10,-19 A17,17 0 0,0 -20,-9" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
      </g>
    </svg>
  ),
  // 4. Detalhes e fotos
  (
    <svg viewBox="0 0 200 130" className="w-full h-full text-sky-400 fill-none" stroke="currentColor" strokeWidth="1.2">
      <rect x="25" y="32" width="70" height="46" rx="6" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" />
      <rect x="42" y="24" width="36" height="8" rx="2" strokeWidth="1.5" />
      <circle cx="60" cy="55" r="16" strokeWidth="2" />
      <circle cx="60" cy="55" r="11" fill="#020617" strokeWidth="1.5" />
      <circle cx="83" cy="40" r="2.5" fill="#ef4444" stroke="none" />
      <rect x="110" y="20" width="70" height="74" rx="4" strokeWidth="1.5" />
      <line x1="110" y1="34" x2="180" y2="34" strokeOpacity="0.3" />
      <rect x="118" y="44" width="7" height="7" rx="1.5" fill="#ef4444" stroke="none" />
      <line x1="130" y1="47.5" x2="168" y2="47.5" strokeWidth="1.5" />
      <rect x="118" y="56" width="7" height="7" rx="1.5" strokeOpacity="0.6" />
      <line x1="130" y1="59.5" x2="160" y2="59.5" strokeWidth="1.5" strokeOpacity="0.6" />
      <rect x="118" y="68" width="7" height="7" rx="1.5" strokeOpacity="0.6" />
      <line x1="130" y1="71.5" x2="164" y2="71.5" strokeWidth="1.5" strokeOpacity="0.6" />
      <rect x="118" y="80" width="7" height="7" rx="1.5" fill="#eab308" stroke="none" />
      <line x1="130" y1="83.5" x2="158" y2="83.5" strokeWidth="1.5" />
      <rect x="52" y="90" width="96" height="22" rx="5" fill="#3b82f6" stroke="none" />
      <text x="100" y="104" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="9" fill="#fff" stroke="none" textAnchor="middle">📷 ADICIONAR FOTO HD</text>
    </svg>
  ),
  // 5. Layout do PDF
  (
    <svg viewBox="0 0 200 130" className="w-full h-full text-sky-400 fill-none" stroke="currentColor" strokeWidth="1.2">
      <g opacity="0.45" transform="translate(110, 15) rotate(6)">
        <rect x="0" y="0" width="55" height="78" rx="2" fill="rgba(15,23,42,0.8)" stroke="currentColor" strokeWidth="1.2" />
        <line x1="6" y1="10" x2="49" y2="10" stroke="currentColor" strokeWidth="1.8" />
        <line x1="6" y1="18" x2="35" y2="18" stroke="currentColor" strokeWidth="1.2" />
        <rect x="6" y="24" width="43" height="44" rx="1" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1" />
      </g>
      <g opacity="0.6" transform="translate(35, 18) rotate(-6)">
        <rect x="0" y="0" width="55" height="78" rx="2" fill="rgba(15,23,42,0.8)" stroke="currentColor" strokeWidth="1.2" />
        <line x1="6" y1="10" x2="49" y2="10" stroke="currentColor" strokeWidth="1.8" />
        <line x1="6" y1="18" x2="42" y2="18" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="27" cy="42" r="14" stroke="currentColor" strokeWidth="1" />
      </g>
      <g transform="translate(68, 22)">
        <rect x="0" y="0" width="64" height="88" rx="3" fill="rgba(15,23,42,0.95)" stroke="#00dcff" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.5" fill="#00dcff" stroke="none" />
        <line x1="20" y1="12" x2="48" y2="12" stroke="#00dcff" strokeWidth="2.5" />
        <line x1="6" y1="22" x2="58" y2="22" stroke="currentColor" strokeOpacity="0.3" />
        <line x1="10" y1="30" x2="54" y2="30" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
        <line x1="10" y1="36" x2="44" y2="36" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
        <rect x="10" y="44" width="44" height="28" rx="1.5" stroke="#00dcff" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" />
        <line x1="12" y1="80" x2="36" y2="80" stroke="currentColor" strokeOpacity="0.4" />
        <circle cx="52" cy="79" r="4" stroke="#00dcff" strokeWidth="1.2" />
      </g>
    </svg>
  ),
  // 6. Assinatura e segurança
  (
    <svg viewBox="0 0 200 130" className="w-full h-full text-sky-400 fill-none" stroke="currentColor" strokeWidth="1.2">
      <rect x="30" y="15" width="82" height="100" rx="4" strokeWidth="2" fill="currentColor" fillOpacity="0.03" />
      <line x1="38" y1="28" x2="104" y2="28" strokeWidth="2" strokeOpacity="0.8" />
      <line x1="38" y1="36" x2="88" y2="36" strokeOpacity="0.5" />
      <line x1="38" y1="42" x2="94" y2="42" strokeOpacity="0.5" />
      <rect x="38" y="50" width="66" height="24" rx="2" strokeOpacity="0.3" strokeDasharray="2 1" />
      <line x1="38" y1="92" x2="104" y2="92" strokeOpacity="0.4" />
      <path d="M42,91 Q48,80 54,92 T66,91 T78,92" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      <text x="38" y="102" fontFamily="Outfit, sans-serif" fontSize="6" fill="#64748b" stroke="none">Assinatura do Cliente</text>
      <rect x="124" y="24" width="50" height="46" rx="6" fill="rgba(15,23,42,0.85)" stroke="#00dcff" strokeWidth="1.5" />
      <path d="M139,24 L139,18 A10,10 0 0,1 159,18 L159,24" stroke="#00dcff" strokeWidth="1.5" />
      <circle cx="149" cy="40" r="4.5" fill="#00dcff" stroke="none" />
      <path d="M149,42 L149,54" stroke="#00dcff" strokeWidth="1.8" />
      <text x="149" y="62" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="6" fill="#00dcff" stroke="none" textAnchor="middle">SELO DE SEGURANÇA</text>
      <rect x="132" y="80" width="34" height="34" rx="3" strokeWidth="1.5" />
      <rect x="137" y="85" width="8" height="8" fill="currentColor" stroke="none" />
      <rect x="153" y="85" width="8" height="8" fill="currentColor" stroke="none" />
      <rect x="137" y="101" width="8" height="8" fill="currentColor" stroke="none" />
      <rect x="149" y="97" width="4" height="4" fill="currentColor" stroke="none" />
      <rect x="157" y="101" width="4" height="4" fill="currentColor" stroke="none" />
      <rect x="149" y="105" width="4" height="4" fill="currentColor" stroke="none" />
    </svg>
  ),
  // 7. Offline e nuvem
  (
    <svg viewBox="0 0 200 130" className="w-full h-full text-sky-400 fill-none" stroke="currentColor" strokeWidth="1.2">
      <rect x="25" y="15" width="56" height="100" rx="8" strokeWidth="2" fill="currentColor" fillOpacity="0.03" />
      <rect x="29" y="24" width="48" height="82" rx="2" strokeOpacity="0.3" />
      <path d="M38,36 A10,10 0 0,1 68,36" stroke="#ef4444" strokeWidth="2" />
      <path d="M43,41 A6,6 0 0,1 63,41" stroke="#ef4444" strokeWidth="2" />
      <line x1="53.5" y1="36" x2="52.5" y2="44" stroke="#ef4444" strokeWidth="1.5" />
      <text x="53" y="58" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="7" fill="#ef4444" stroke="none" textAnchor="middle">MODO OFFLINE</text>
      <g transform="translate(39, 70)">
        <ellipse cx="14" cy="4" rx="10" ry="3.5" fill="currentColor" fillOpacity="0.2" />
        <path d="M4,4 L4,11 C4,13 24,13 24,11 L24,4" />
        <path d="M4,11 L4,18 C4,20 24,20 24,18 L24,11" />
        <ellipse cx="14" cy="11" rx="10" ry="3.5" strokeOpacity="0.5" />
        <ellipse cx="14" cy="18" rx="10" ry="3.5" strokeOpacity="0.5" />
      </g>
      <path d="M100,55 A15,15 0 0,1 130,55" strokeWidth="2" strokeDasharray="3 1" />
      <path d="M126,51 L131,55 L126,59" strokeWidth="2" />
      <path d="M130,75 A15,15 0 0,1 100,75" strokeWidth="2" strokeDasharray="3 1" />
      <path d="M104,79 L99,75 L104,71" strokeWidth="2" />
      <text x="115" y="46" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="7" fill="#00dcff" stroke="none" textAnchor="middle">SYNC</text>
      <g transform="translate(144, 45)">
        <path d="M10,25 A8,8 0 0,1 18,12 A11,11 0 0,1 36,15 A7,7 0 0,1 42,25 Z" fill="rgba(15,23,42,0.85)" stroke="#00dcff" strokeWidth="1.5" />
        <g transform="translate(17, 18)" stroke="#00dcff" strokeWidth="1">
          <ellipse cx="8" cy="2" rx="5" ry="1.5" />
          <path d="M3,2 L3,6 C3,7 13,7 13,6 L13,2" />
          <path d="M3,6 L3,10 C3,11 13,11 13,10 L13,6" />
        </g>
      </g>
    </svg>
  ),
];

export default function FeaturesSlidesModal({ isOpen, onClose }: FeaturesSlidesModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [downloading, setDownloading] = useState(false);

  // Reset to first slide when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = MANUAL_STEPS;
  const step = steps[currentSlide];

  const handleNext = () => {
    if (currentSlide < steps.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('app_tour_seen', 'true');
    onClose();
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modalSlideUp {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-container {
          animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      <div className="modal-container w-full max-w-2xl bg-slate-900/95 border border-sky-500/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative max-h-[90vh]">
        {/* Glowing top line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={handleFinish}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-2 hover:bg-white/5 rounded-full transition-all focus:outline-none z-10 text-xl font-bold"
          aria-label="Fechar tutorial"
        >
          ✕
        </button>

        <div className="p-6 md:p-8 flex-1 flex flex-col overflow-y-auto min-h-0">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
              💡 Passo {step.num} de {steps.length}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 font-outfit mt-3">
              {step.title}
            </h2>
            <p className="text-xs font-bold text-sky-400/80 uppercase tracking-wider mt-1">
              {step.subtitle}
            </p>
          </div>

          {/* Core Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center flex-1 min-h-0">
            {/* Visual Panel */}
            <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 flex items-center justify-center aspect-video md:aspect-square relative overflow-hidden shadow-inner">
              {/* Radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,170,255,0.06)_0%,transparent_70%)] pointer-events-none" />
              {STEP_SVGS[currentSlide]}
            </div>

            {/* Explanation Panel */}
            <div className="flex flex-col justify-center space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed font-outfit">
                {step.desc}
              </p>

              <ul className="space-y-2.5">
                {step.highlights.map((h, i) => (
                  <li key={i} className="text-xs leading-relaxed font-outfit flex items-start gap-2.5 text-slate-400">
                    <span className="text-base leading-none shrink-0 mt-0.5" aria-hidden="true">{h.icon}</span>
                    <div>
                      <strong className="text-slate-200 mr-1">{h.label}:</strong>
                      {h.text}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Baixar manual em PDF */}
          <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
            <button
              onClick={handleDownloadManual}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-outfit text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {downloading ? '⏳ Gerando manual…' : '📥 Baixar manual completo em PDF'}
            </button>
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-slate-950/60 border-t border-white/5 p-5 md:px-8 flex items-center justify-between shrink-0">
          {/* Skip / Finish button */}
          <button
            onClick={handleFinish}
            className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider focus:outline-none"
          >
            Pular Tutorial
          </button>

          {/* Indicators */}
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide ? 'bg-sky-500 w-5' : 'bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Passo ${i + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-white/5 font-bold text-xs rounded-xl transition-all"
              >
                Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/10 transition-all active:scale-95"
            >
              {currentSlide === steps.length - 1 ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
