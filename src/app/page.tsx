"use client";
import { ViewTransition } from 'react'
import { DirectionalTransition } from './DirectionalTransition'
import Link from 'next/link'
import IntroVideo from '../components/IntroVideo'
import Image from 'next/image';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const PricingSection = dynamic(() => import('../components/PricingSection'), { ssr: false });
const FAQSection = dynamic(() => import('../components/FAQSection'), { ssr: false });
const VehicleShowcaseSection = dynamic(() => import('../components/VehicleShowcaseSection'), { ssr: false });
const PdfPreviewSection = dynamic(() => import('../components/PdfPreviewSection'), { ssr: false });
const CarLateralLeft = dynamic(() => import('../components/vehicles/CarLateralLeft'), { ssr: false });

function TextCarousel() {
  const slides = [
    {
      title: (
        <>
          Vistoria digital de avarias <br />
          <span className="text-primary italic">em menos de 1 minuto.</span>
        </>
      ),
      description:
        'Marque danos em carros, motos, caminhões, ônibus ou vans utilitárias em segundos. Clique no local exato do modelo digital e exporte o laudo.',
    },
    {
      title: (
        <>
          Laudos 100% invioláveis com <br />
          <span className="text-primary italic">criptografia e hash digital.</span>
        </>
      ),
      description:
        'Gere relatórios PDF profissionais auditáveis. Cada laudo possui assinatura eletrônica digital e código SHA-256 rastreável com QR Code.',
    },
    {
      title: (
        <>
          Digite a placa e o resto <br />
          <span className="text-primary italic">preenche sozinho.</span>
        </>
      ),
      description:
        'Ao informar a placa do veículo, o sistema preenche automaticamente marca, modelo, ano de fabricação, cor e município — sem digitação manual.',
    },
  ];

  const [index, setIndex] = useState(0);
  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  // Auto‑rotate every 8 seconds
  useEffect(() => {
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative text-center">
      <div key={index} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none">
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.05] text-[var(--text-main)] text-wrap:balance">
          {slides[index].title}
        </h1>
        <p className="text-lg text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
          {slides[index].description}
        </p>
      </div>
      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-primary hover:bg-[var(--btn-secondary-hover)] rounded-full transition-all focus:outline-none"
        aria-label="Previous slide"
      >
        ◀
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-primary hover:bg-[var(--btn-secondary-hover)] rounded-full transition-all focus:outline-none"
        aria-label="Next slide"
      >
        ▶
      </button>
    </div>
  );
}

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') !== 'false';
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('darkMode', String(nextDark));
  };

  const faqItems = [
    { q: "Qual o valor da assinatura do aplicativo?", a: "O plano Profissional (Pro) custa R$ 49,90 por mês com vistorias ilimitadas, relatórios personalizados, consulta de placas e todas as funcionalidades liberadas. Para frotas e empresas com múltiplos vistoriadores, temos o plano Corporativo com preços sob medida – consulte-nos clicando em 'Consulte Conosco'." },
    { q: "O que é o hash do PDF e a assinatura digital?", a: "O hash é um código de segurança único (SHA-256) gerado para cada PDF que comprova que o documento não foi alterado. Além disso, o laudo possui um sistema de assinatura digital na tela, onde o vistoriador e o cliente assinam diretamente no celular." },
    { q: "Preciso de internet para fazer as vistorias?", a: "Não! O aplicativo foi desenvolvido para funcionar 100% offline. Você pode fazer a vistoria, marcar as avarias, tirar fotos e colher assinaturas em locais sem sinal. Os dados são salvos localmente e sincronizados na nuvem assim que houver internet." },
    { q: "Como funciona a consulta de placas?", a: "Ao inserir a placa do veículo, o sistema realiza uma consulta automática e preenche de forma instantânea a marca, modelo, ano, cor e município do veículo, agilizando o processo de vistoria." },
    { q: "Consigo personalizar o relatório com meu logotipo?", a: "Sim! Usuários do plano Vistoria PRO podem configurar o nome da empresa e carregar seu próprio logotipo, que aparecerá de forma elegante no cabeçalho de todos os laudos gerados." },
    { q: "Quais são os tipos de veículos suportados?", a: "O aplicativo suporta a inspeção interativa em 6 categorias de veículos: Carro, Moto, Caminhão, Utilitário (Van), Ônibus e um modelo Genérico/Customizável, todos com 4 vistas em SVG clicáveis." },
    { q: "Como posso enviar o laudo para o cliente?", a: "Você pode exportar o laudo como um arquivo PDF profissional, gerar um relatório em formato de texto para copiar/enviar por e-mail ou mandar o PDF diretamente pelo WhatsApp do cliente." }
  ];

  // Helper for smooth scrolling to FAQ
  const scrollToFaq = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const faqElement = document.getElementById('faq');
    if (faqElement) {
      faqElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper for smooth scrolling to Pricing
  const scrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const pricingElement = document.getElementById('pricing');
    if (pricingElement) {
      pricingElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <DirectionalTransition>
      <div className="min-h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 font-outfit overflow-y-auto flex flex-col relative selection:bg-primary selection:text-white">
      <IntroVideo />

      {/* Hide native browser details arrows */}
      <style dangerouslySetInnerHTML={{ __html: `
        summary::-webkit-details-marker {
          display: none;
        }
      `}} />

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div aria-hidden="true" className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,170,255,0.07) 0%, transparent 70%)' }} />
        <div aria-hidden="true" className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Grid Overlay */}
      <div aria-hidden="true" className="fixed inset-0 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full px-4 sm:px-8 py-6 flex justify-between items-center gap-3 z-50 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Image src="/logo.svg" alt="Logo" width={48} height={48} className="object-contain shrink-0" priority />
          <span className="hidden sm:inline text-base sm:text-lg font-extrabold tracking-tight uppercase bg-clip-text text-transparent whitespace-nowrap" style={{ backgroundImage: 'var(--header-title-gradient)' }}>
            Danos Aparentes
          </span>
        </div>
        <nav className="flex items-center gap-3 sm:gap-6 shrink-0">
          <a href="#pricing" onClick={scrollToPricing} className="hidden sm:inline text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors outline-none cursor-pointer">
            Planos
          </a>
          <a href="#faq" onClick={scrollToFaq} className="hidden sm:inline text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors outline-none cursor-pointer">
            FAQ
          </a>
          <Link href="/app" transitionTypes={['nav-forward']} className="hidden sm:inline-flex text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] rounded-lg outline-none">
            Entrar
          </Link>
          <button
            onClick={toggleDarkMode}
            className="p-2 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] rounded-xl transition-all outline-none"
            aria-label="Alternar tema"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <Link href="/app" transitionTypes={['nav-forward']} className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-xl shadow-[var(--primary)]/15 transition-all motion-safe:hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none">
            Começar Agora
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 z-10 relative">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 motion-reduce:animate-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black tracking-widest text-[var(--primary-badge-text)] uppercase">
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--primary-badge-text)] animate-pulse" />
              Sistema Profissional de Vistoria
            </div>

            <TextCarousel />
{/* Rotating banner with extra info */}


            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/app"
                transitionTypes={['nav-forward']}
                className="px-8 py-4 text-white font-black rounded-2xl shadow-2xl shadow-[var(--primary)]/20 flex items-center gap-3 transition-all motion-safe:hover:scale-[1.02] hover:shadow-[var(--primary)]/35 active:scale-100 focus-visible:ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--bg-main)] outline-none"
                style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
              >
                Criar Conta Grátis
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>

            <Link href="/app?intent=subscribe" transitionTypes={['nav-forward']} className="inline-block text-sm font-bold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors outline-none">
              Não quer testar? Assinar direto →
            </Link>

            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-semibold pl-1">
              <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z"/></svg>
              Teste Grátis por 7 dias — Sem compromisso e Sem Cartão de Crédito
            </div>

            <div className="flex gap-10 pt-8 border-t border-[var(--card-border)]/40">
              {[
                { label: 'Laudos PDF', icon: '📄' },
                { label: 'Fotos HD', icon: '📷' },
                { label: 'Modo Offline', icon: '📡' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 text-sm font-semibold text-[var(--text-muted)]">
                  <span aria-hidden="true" className="text-xl grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visualizer / Rive */}
          <div className="relative group perspective-1000 hidden lg:block animate-in fade-in slide-in-from-right-12 duration-1000 delay-200 motion-reduce:animate-none">
            <div aria-hidden="true" className="absolute inset-0 rounded-full transition-all duration-700" style={{ background: 'radial-gradient(circle, rgba(0,170,255,0.12) 0%, transparent 70%)' }} />
            <div className="relative transform-gpu rotate-y-[-12deg] group-hover:rotate-y-[-5deg] transition-all duration-1000 ease-out">
              {/* Note: I'm using the SVG component here for now, but the idea is to replace with Rive */}
              <ViewTransition name="car-visualizer" share="morph" default="none">
                <div className="filter drop-shadow-[0_35px_60px_rgba(0,0,0,0.8)]">
                  <CarLateralLeft damages={[]} selectedPartId={null} onPartClick={()=>{}} onPartHover={()=>{}} />
                </div>
              </ViewTransition>
            </div>

            {/* Floating UI Elements */}
            <div role="status" aria-live="polite" className="absolute top-1/4 -right-4 px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-md rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-slow motion-reduce:animate-none">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]" />
              <span className="text-xs font-bold text-[var(--text-main)] tracking-wide">Avaria: Porta Dianteira</span>
            </div>

            <div role="status" aria-live="polite" className="absolute bottom-1/4 -left-8 px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-md rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-slow-reverse motion-reduce:animate-none">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e]" />
              <span className="text-xs font-bold text-[var(--text-main)] tracking-wide">Laudo Gerado: 100% OK</span>
            </div>
          </div>
        </div>
      </main>

      {/* Seção Como Funciona */}
      <section className="w-full max-w-6xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-16 text-left">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black tracking-widest text-primary uppercase mb-3">
            Fluxo de Trabalho
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-[var(--text-main)] to-[var(--text-muted)] bg-clip-text text-transparent">
            Como Funciona em 3 Passos Simples
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Vistoria rápida, profissional e segura direto no seu celular.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Consulte a Placa',
              desc: 'Insira a placa do veículo e deixe o sistema preencher automaticamente marca, modelo, ano de fabricação, cor e município.'
            },
            {
              step: '02',
              title: 'Toque para Marcar Avarias',
              desc: 'Selecione o modelo do veículo e toque na área exata do SVG clicável. Aponte o tipo de avaria (risco, amassado, quebrado), adicione fotos HD e notas.'
            },
            {
              step: '03',
              title: 'Assine e Envie o Laudo',
              desc: 'Vistoriador e cliente assinam digitalmente na tela do celular. O laudo em PDF inviolável com hash SHA-256 é gerado e enviado por WhatsApp.'
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-8 border border-[var(--card-border)]/50 hover:border-primary/30 transition-all duration-300 relative group">
              <div className="text-4xl font-black text-primary/20 group-hover:text-primary/45 transition-colors absolute top-4 right-6 font-mono">
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-[var(--text-main)] mt-4 mb-2">{item.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modelos de Veículos Suportados (lazy) */}
      <VehicleShowcaseSection />

      {/* Seção Modelo de Laudo PDF (lazy) */}
      <PdfPreviewSection />

      <PricingSection />

      <FAQSection items={faqItems} />

      {/* Footer */}
      <footer className="w-full px-8 py-6 flex justify-between items-center text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase shrink-0 z-50 border-t border-[var(--card-border)]/20 bg-[var(--panel-bg)]">
        <div className="flex gap-8">
          <span>© 2026 Danos Aparentes</span>
          <span className="hidden md:inline">Vistoria Digital de Alta Fidelidade</span>
        </div>
        <div className="flex gap-8">
          <a href="/privacidade" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Privacidade</a>
          <a href="/termos" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Termos de Uso</a>
          <a href="/suporte" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Suporte</a>
        </div>
      </footer>
    </div>
    </DirectionalTransition>
  )
}
