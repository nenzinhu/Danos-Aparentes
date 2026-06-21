'use client';
import { useState } from 'react'
import Logo from '../components/Logo'
import IntroAnimation from '../components/IntroAnimation'
import VehicleDefs from '../components/vehicles/VehicleDefs'
import CarLateralLeft from '../components/vehicles/CarLateralLeft'
import TermsModal from '../components/TermsModal'

const noop = () => {}

export default function Landing() {
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy'>('terms')

  return (
    <div className="landing-container">
      <IntroAnimation />
      <VehicleDefs />

      {/* Header — Navegação à Direita */}
      <header className="landing-header">
        <div className="logo-placeholder"></div>
        <nav className="header-nav">
          <a href="/app.html" className="nav-link">Entrar</a>
          <a href="/app.html" className="btn-primary-sm">Começar Agora</a>
        </nav>
      </header>

      {/* Hero Content */}
      <main className="landing-main">
        <div className="hero-grid">
          
          {/* Lado Esquerdo: Conteúdo */}
          <div className="hero-content">
            <div className="badge-new">SISTEMA PROFISSIONAL</div>
            <h1 className="hero-title">
              Vistoria digital com <span className="text-highlight">precisão pericial</span>
            </h1>
            <p className="hero-description">
              Mapeamento interativo, fotos por avaria e laudos PDF profissionais em segundos.
            </p>
            
            <div className="hero-actions">
              <a href="/app.html" className="btn-primary">
                Criar Conta Grátis
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="/demo.html" className="btn-secondary">Demo Interativa</a>
            </div>

            <div className="features-mini">
              {['Relatórios PDF', 'Fotos anexadas', 'Modo Offline'].map(item => (
                <div key={item} className="feature-item">
                  <span className="feature-dot"></span> {item}
                </div>
              ))}
            </div>
          </div>

          {/* Lado Direito: Visualizer */}
          <div className="hero-visualizer">
            <div className="visualizer-bg-glow"></div>
            <div className="car-container">
              <CarLateralLeft damages={[]} selectedPartId={null} onPartClick={noop} onPartHover={noop} />
            </div>
            
            {/* Elementos flutuantes de UI */}
            <div className="floating-ui ui-top">
              <span className="ui-dot-red"></span> Porta Dianteira: Risco
            </div>
            <div className="floating-ui ui-bottom">
              <span className="ui-dot-green"></span> Laudo Gerado: 100% OK
            </div>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <span>© {new Date().getFullYear()} DANOS APARENTES</span>
          <div className="footer-links">
            <button onClick={() => { setTermsTab('privacy'); setTermsOpen(true) }} style={{ color: 'inherit', background: 'transparent', border: 'none', font: 'inherit', cursor: 'pointer', padding: 0 }} className="hover:text-slate-200 transition-colors">Privacidade</button>
            <button onClick={() => { setTermsTab('terms'); setTermsOpen(true) }} style={{ color: 'inherit', background: 'transparent', border: 'none', font: 'inherit', cursor: 'pointer', padding: 0 }} className="hover:text-slate-200 transition-colors">Termos</button>
            <a href="mailto:suporte@danosaparentes.com.br" className="hover:text-slate-200 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>

      <TermsModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        defaultTab={termsTab}
      />

      <style>{`
        .landing-container {
          height: 100vh;
          width: 100vw;
          background: var(--bg-gradient);
          color: var(--text-main);
          font-family: 'Outfit', sans-serif;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        /* Header */
        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2.5rem;
          z-index: 100;
          flex-shrink: 0;
        }
        .header-nav { display: flex; align-items: center; gap: 1.5rem; }
        .nav-link { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; font-weight: 600; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }

        /* Botões */
        .btn-primary-sm {
          background: var(--primary);
          color: #fff;
          padding: 0.5rem 1.2rem;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0, 170, 255, 0.3);
        }
        .btn-primary {
          background: linear-gradient(135deg, #00aaff, #0077cc);
          color: #fff;
          padding: 1rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          box-shadow: 0 8px 20px rgba(0, 170, 255, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0, 170, 255, 0.4); }
        .btn-secondary {
          background: rgba(0, 170, 255, 0.05);
          border: 1px solid rgba(0, 170, 255, 0.2);
          color: #00aaff;
          padding: 1rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          transition: background 0.2s;
        }
        .btn-secondary:hover { background: rgba(0, 170, 255, 0.1); }

        /* Main Content */
        .landing-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 2.5rem;
          min-height: 0; /* Essencial para flex-child no-scroll */
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 4rem;
          max-width: 1200px;
          width: 100%;
          align-items: center;
        }

        /* Lado Esquerdo */
        .badge-new {
          display: inline-block;
          background: rgba(0, 170, 255, 0.1);
          color: #00d4ff;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(0, 170, 255, 0.2);
        }
        .hero-title {
          font-size: clamp(2.2rem, 4vw, 3.5rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(to bottom, #fff, #a8d8ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .text-highlight { color: #00aaff; -webkit-text-fill-color: initial; }
        .hero-description {
          color: var(--text-muted);
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2.5rem;
          max-width: 480px;
        }
        .hero-actions { display: flex; gap: 1rem; margin-bottom: 3rem; }
        .features-mini { display: flex; gap: 2rem; }
        .feature-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
        .feature-dot { width: 6px; height: 6px; background: #00aaff; border-radius: 50%; }

        /* Visualizer */
        .hero-visualizer {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .visualizer-bg-glow {
          position: absolute;
          width: 140%;
          height: 140%;
          background: radial-gradient(circle, rgba(0, 170, 255, 0.1) 0%, transparent 70%);
          z-index: -1;
        }
        .car-container { width: 110%; filter: drop-shadow(0 20px 50px rgba(0,0,0,0.5)); transform: rotateY(-5deg); }
        .floating-ui {
          position: absolute;
          background: var(--card-bg);
          backdrop-filter: blur(12px);
          border: 1px solid var(--card-border);
          padding: 0.6rem 1rem;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: var(--glass-shadow);
          white-space: nowrap;
        }
        .ui-top { top: 10%; right: 0; animation: float 3s ease-in-out infinite; }
        .ui-bottom { bottom: 10%; left: 0; animation: float 3s ease-in-out infinite reverse; }
        .ui-dot-red { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 8px #ef4444; }
        .ui-dot-green { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px #22c55e; }

        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        @media (prefers-reduced-motion: reduce) {
          .ui-top, .ui-bottom { animation: none; }
        }

        /* Footer */
        .landing-footer {
          padding: 1.5rem 2.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          z-index: 10;
        }
        .footer-content { display: flex; justify-content: space-between; align-items: center; color: rgba(255, 255, 255, 0.2); font-size: 0.65rem; letter-spacing: 1px; }
        .footer-links { display: flex; gap: 1.5rem; }
        .footer-links a { color: inherit; text-decoration: none; }

        /* MEDIA QUERIES RESPONSIVAS */
        @media (max-width: 1024px) {
          .hero-grid { gap: 2rem; }
          .hero-title { font-size: 2.8rem; }
        }

        @media (max-width: 900px) {
          .landing-container { overflow-y: auto; height: auto; min-height: 100vh; }
          .landing-header { padding: 1rem 1.5rem; }
          .hero-grid { grid-template-columns: 1fr; text-align: center; padding: 4rem 0; gap: 3rem; }
          .hero-content { display: flex; flex-direction: column; align-items: center; order: 2; }
          .hero-visualizer { order: 1; min-height: 250px; }
          .car-container { width: 90%; }
          .hero-actions { flex-direction: column; width: 100%; max-width: 300px; }
          .features-mini { justify-content: center; flex-wrap: wrap; gap: 1rem; }
          .footer-content { flex-direction: column; gap: 1rem; text-align: center; }
          /* Perf mobile: matar animação infinita sobre vidro (pior caso de repaint) */
          .ui-top, .ui-bottom { animation: none; }
          /* Balões: vidro embaçado -> fundo sólido */
          .floating-ui {
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            background: var(--card-bg-solid);
          }
          /* Glow radial menor (menos área de pintura) */
          .visualizer-bg-glow { width: 90%; height: 90%; }
        }

        @media (max-height: 700px) and (min-width: 901px) {
          .hero-title { font-size: 2.2rem; margin-bottom: 1rem; }
          .hero-description { margin-bottom: 1.5rem; }
          .hero-actions { margin-bottom: 1.5rem; }
          .car-container { width: 80%; }
        }
      `}</style>
    </div>
  )
}

