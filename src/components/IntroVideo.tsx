'use client';
import { useEffect, useState } from 'react';

export default function IntroVideo() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      const isBot = /Lighthouse|Googlebot|Chrome-Lighthouse|SpeedInsights/i.test(ua);
      if (isBot) return false;
    }
    return true;
  });
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [terminalText, setTerminalText] = useState('SYS // INITIALIZING SECURE DATABASE...');

  useEffect(() => {
    if (!isVisible) return;

    setProgress(0);
    setTerminalText('SYS // INITIALIZING SECURE DATABASE...');

    const t1 = setTimeout(() => { setProgress(25); setTerminalText('SYS // SYNC ENGINE: VERIFYING CACHE...'); }, 400);
    const t2 = setTimeout(() => { setProgress(50); setTerminalText('SYS // MAP ENGINE: CALIBRATING SVGs...'); }, 800);
    const t3 = setTimeout(() => { setProgress(75); setTerminalText('SYS // SECURITY MODULE: OK'); }, 1200);
    const t4 = setTimeout(() => { setProgress(100); setTerminalText('SYS // DANOS APARENTES ONLINE [100%]'); }, 1600);

    // Inicia o fade-out (CSS) e depois desmonta
    const tFade = setTimeout(() => setClosing(true), 2100);
    const tDone = setTimeout(() => setIsVisible(false), 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tFade);
      clearTimeout(tDone);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#020617] select-none overflow-hidden ${closing ? 'intro-closing' : ''}`}
      style={{ background: 'radial-gradient(circle at center, #051330 0%, #01040a 100%)' }}
    >
      {/* Custom CSS for holographic grid, rotate, scanner and intro animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .holo-grid {
          background-image:
            linear-gradient(rgba(0, 170, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 170, 255, 0.04) 1px, transparent 1px);
          background-size: 50px 50px;
          background-position: center;
        }
        .hud-ring-outer {
          border: 1px dashed rgba(0, 212, 255, 0.3);
          animation: rotate-cw 20s linear infinite;
        }
        .hud-ring-inner {
          border: 1px solid rgba(0, 212, 255, 0.15);
          border-top: 2px solid rgba(0, 212, 255, 0.6);
          border-bottom: 2px solid rgba(0, 212, 255, 0.6);
          animation: rotate-ccw 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .laser-scanner {
          background: linear-gradient(to bottom, transparent, rgba(0, 212, 255, 0.5), rgba(0, 212, 255, 0.8), rgba(0, 212, 255, 0.5), transparent);
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.8), 0 0 30px rgba(0, 212, 255, 0.4);
          animation: laser-sweep 2.2s ease-in-out infinite;
        }
        .intro-glow { animation: intro-glow-pulse 3s ease-in-out infinite; }
        .intro-logo { animation: intro-logo-reveal 1s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .intro-closing { animation: intro-fade-out 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes rotate-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rotate-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes laser-sweep {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes intro-glow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0.5; }
        }
        @keyframes intro-logo-reveal {
          from { transform: scale(0.8); opacity: 0; filter: blur(10px); }
          to { transform: scale(1); opacity: 1; filter: blur(0px); }
        }
        @keyframes intro-fade-out {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(1.05); }
        }
      `}} />

      {/* Holographic Background Grid & Tech Lines */}
      <div className="absolute inset-0 holo-grid pointer-events-none opacity-80" />
      <div className="absolute inset-x-0 top-10 flex justify-between px-10 text-[9px] font-mono tracking-widest text-[#00aaff]/40 pointer-events-none">
        <span>SYS_LOC: WIN_X64 // PRJ_FINAL</span>
        <span>OS_STATUS: ONLINE</span>
      </div>

      <div className="relative flex flex-col items-center justify-center">

        {/* Pulsing circular blue glow behind everything */}
        <div
          className="intro-glow absolute w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,170,255,0.3) 0%, transparent 70%)' }}
        />

        {/* Rotating Outer HUD Ring */}
        <div className="absolute hud-ring-outer rounded-full pointer-events-none w-[270px] h-[270px]" />

        {/* Rotating Inner HUD Ring */}
        <div className="absolute hud-ring-inner rounded-full pointer-events-none w-[240px] h-[240px]" />

        {/* Glowing Logo Wrapper */}
        <div className="intro-logo relative z-10 p-6 flex items-center justify-center">
          {/* Laser scanner sweeping down the logo */}
          <div className="absolute left-0 right-0 h-1 laser-scanner z-20 pointer-events-none" />

          {/* The Logo itself */}
          <img
            src="/logo.svg"
            alt="Danos Aparentes Logo"
            className="w-48 h-48 object-contain filter drop-shadow-[0_0_30px_rgba(0,170,255,0.45)]"
          />
        </div>
      </div>

      {/* Progress & Terminal Info Panel */}
      <div className="mt-12 w-64 flex flex-col items-center z-10">
        {/* Terminal Log */}
        <div className="w-full text-center h-4 overflow-hidden mb-3">
          <span className="text-[10px] font-mono tracking-widest text-[#00d4ff] uppercase">
            {terminalText}
          </span>
        </div>

        {/* Tech Progress Bar Container */}
        <div className="w-full h-[3px] bg-slate-950 border border-slate-900 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-[#00d4ff] shadow-[0_0_8px_#00d4ff] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Numeric Percentage */}
        <div className="mt-2 text-[11px] font-mono font-bold text-slate-500 tracking-wider">
          {Math.min(Math.round(progress), 100)}%
        </div>
      </div>

      {/* Corner Tech Brackets decoration */}
      <div className="absolute bottom-6 left-6 border-l-2 border-b-2 border-[#00aaff]/25 w-4 h-4 pointer-events-none" />
      <div className="absolute bottom-6 right-6 border-r-2 border-b-2 border-[#00aaff]/25 w-4 h-4 pointer-events-none" />
      <div className="absolute top-6 left-6 border-l-2 border-t-2 border-[#00aaff]/25 w-4 h-4 pointer-events-none" />
      <div className="absolute top-6 right-6 border-r-2 border-t-2 border-[#00aaff]/25 w-4 h-4 pointer-events-none" />
    </div>
  );
}
