'use client';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { useEffect, useState } from 'react';

export default function IntroRive() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const { RiveComponent, rive } = useRive({
    src: 'https://cdn.rive.app/animations/vehicles.riv',
    stateMachines: 'bumpy',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  useEffect(() => {
    // Esconde a animação após 3 segundos
    const fadeTimer = setTimeout(() => setIsFading(true), 2500);
    const hideTimer = setTimeout(() => setIsVisible(false), 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617] transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="w-64 h-64 md:w-96 md:h-96">
        <RiveComponent />
      </div>
      <div className="absolute bottom-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-2xl font-black tracking-widest text-white uppercase bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
          Danos Aparentes
        </h2>
        <p className="text-xs font-bold text-primary/50 tracking-[0.3em] uppercase">
          Carregando Alta Fidelidade
        </p>
      </div>
    </div>
  );
}
