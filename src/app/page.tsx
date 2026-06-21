"use client";
import { ViewTransition } from 'react'
import { DirectionalTransition } from './DirectionalTransition'
import Link from 'next/link'
import IntroVideo from '../components/IntroVideo'
import CarLateralLeft from '../components/vehicles/CarLateralLeft'
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { staticVehicleRegistry } from '../components/vehicles/staticRegistry'
import { VehicleType } from '../types'

const PricingSection = dynamic(() => import('../components/PricingSection'), { ssr: false });
const FAQSection = dynamic(() => import('../components/FAQSection'), { ssr: false });

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
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          variants={{
            initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
            animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
            exit: { opacity: 0, y: -20, filter: 'blur(8px)' },
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.05] text-[var(--text-main)] text-wrap:balance">
            {slides[index].title}
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
            {slides[index].description}
          </p>
        </motion.div>
      </AnimatePresence>
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

const vehicleOptions: { type: VehicleType; name: string; icon: string; mockDamages: any[] }[] = [
  {
    type: 'car',
    name: 'Carro',
    icon: '🚗',
    mockDamages: [
      {
        id: 'mock-1' as any,
        vehicle: 'car',
        view: 'lateral-left',
        partId: 'car-ll-door-front',
        partName: 'Porta Dianteira Esquerda',
        type: 'scratch',
        typeName: 'Risco',
        severity: 'high',
        notes: 'Risco profundo contínuo',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'car2d',
    name: 'Carro 2 Portas',
    icon: '🚙',
    mockDamages: [
      {
        id: 'mock-car2d' as any,
        vehicle: 'car2d',
        view: 'lateral-left',
        partId: 'car2d-ll-door',
        partName: 'Porta Esquerda',
        type: 'dent',
        typeName: 'Amassado',
        severity: 'medium',
        notes: 'Amassado na porta',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'moto',
    name: 'Moto',
    icon: '🏍️',
    mockDamages: [
      {
        id: 'mock-2' as any,
        vehicle: 'moto',
        view: 'lateral-left',
        partId: 'moto-ll-fuel-tank',
        partName: 'Tanque de Combustível',
        type: 'dent',
        typeName: 'Amassado',
        severity: 'medium',
        notes: 'Amassado leve lateral',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'truck',
    name: 'Caminhão',
    icon: '🚚',
    mockDamages: [
      {
        id: 'mock-3' as any,
        vehicle: 'truck',
        view: 'lateral-left',
        partId: 'truck-ll-cargo-box',
        partName: 'Baú de Carga',
        type: 'scratch',
        typeName: 'Risco',
        severity: 'low',
        notes: 'Risco superficial na chapa',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'van',
    name: 'Utilitário (Van)',
    icon: '🚐',
    mockDamages: [
      {
        id: 'mock-4' as any,
        vehicle: 'van',
        view: 'lateral-left',
        partId: 'van-ll-door-front',
        partName: 'Porta Dianteira Esquerda',
        type: 'broken',
        typeName: 'Quebrado',
        severity: 'high',
        notes: 'Vidro trincado',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'bus',
    name: 'Ônibus',
    icon: '🚌',
    mockDamages: [
      {
        id: 'mock-5' as any,
        vehicle: 'bus',
        view: 'lateral-left',
        partId: 'bus-ll-body',
        partName: 'Carroceria / Lateral',
        type: 'scratch',
        typeName: 'Risco',
        severity: 'medium',
        notes: 'Risco na pintura perto da roda',
        photos: [],
        photoNotes: []
      }
    ]
  },
  {
    type: 'microbus',
    name: 'Micro-ônibus',
    icon: '🚐',
    mockDamages: [
      {
        id: 'mock-microbus' as any,
        vehicle: 'microbus',
        view: 'lateral-left',
        partId: 'microbus-l-body',
        partName: 'Carroceria / Lateral',
        type: 'scratch',
        typeName: 'Risco',
        severity: 'medium',
        notes: 'Risco na lateral',
        photos: [],
        photoNotes: []
      }
    ]
  }
];



// QR Code simulado (mockup do laudo) — três marcadores de canto + módulos determinísticos
function QrCodeMock({ className = '' }: { className?: string }) {
  const N = 21
  const cells: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false))
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4
        cells[r0 + r][c0 + c] = edge || inner
      }
    }
  }
  drawFinder(0, 0)
  drawFinder(0, N - 7)
  drawFinder(N - 7, 0)
  const reserved = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8)
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (reserved(r, c)) continue
      const v = (r * 73856093) ^ (c * 19349663) ^ ((r + c) * 83492791)
      cells[r][c] = Math.abs(v) % 100 > 52
    }
  }
  const rects: React.ReactNode[] = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (cells[r][c]) rects.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" />)
    }
  }
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className={className} shapeRendering="crispEdges" preserveAspectRatio="xMidYMid meet" aria-label="QR Code de validação">
      <rect x={0} y={0} width={N} height={N} fill="#ffffff" />
      {rects}
    </svg>
  )
}

// Temas de preview do laudo PDF (slider na landing)
const PDF_THEMES = [
  { id: 'modern',    name: 'Moderno',   icon: '🎨', font: 'system-ui, sans-serif',                 bg: '#ffffff', text: '#0f172a', border: '#e2e8f0', bar: 'linear-gradient(90deg,#1d4ed8,#06b6d4,#3b82f6)', accent: '#2563eb', headerBg: '#f8fafc', headerText: '#0f172a', headerSub: '#64748b' },
  { id: 'editorial', name: 'Editorial', icon: '📖', font: 'Georgia, "Times New Roman", serif',     bg: '#faf9f5', text: '#26201a', border: '#e7ddcd', bar: 'linear-gradient(90deg,#d97757,#6a9bcc,#788c5d)', accent: '#b08642', headerBg: '#efe6d4', headerText: '#3a2f22', headerSub: '#8a7a62' },
  { id: 'tecnico',   name: 'Técnico',   icon: '🔬', font: 'ui-monospace, "Courier New", monospace', bg: '#ffffff', text: '#0b1220', border: '#cbd5e1', bar: 'linear-gradient(90deg,#0f766e,#2dd4bf,#0ea5e9)', accent: '#0f766e', headerBg: '#0b1220', headerText: '#e8eef5', headerSub: '#7f93ab' },
]

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeVehicle, setActiveVehicle] = useState<VehicleType>('car');
  const [pdfPreview, setPdfPreview] = useState(0);

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
        <div aria-hidden="true" className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
        <div aria-hidden="true" className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Grid Overlay */}
      <div aria-hidden="true" className="fixed inset-0 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full px-8 py-6 flex justify-between items-center z-50 shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Logo" width={48} height={48} className="object-contain" priority />
          <span className="text-lg font-extrabold tracking-tight uppercase bg-clip-text text-transparent" style={{ backgroundImage: 'var(--header-title-gradient)' }}>
            Danos Aparentes
          </span>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <a href="#pricing" onClick={scrollToPricing} className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors outline-none cursor-pointer">
            Planos
          </a>
          <a href="#faq" onClick={scrollToFaq} className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors outline-none cursor-pointer">
            FAQ
          </a>
          <Link href="/app" transitionTypes={['nav-forward']} className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] rounded-lg outline-none">
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
              <Link href="/demo" transitionTypes={['nav-forward']} className="px-8 py-4 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] font-bold rounded-2xl backdrop-blur-sm transition-all hover:bg-[var(--btn-secondary-hover)] focus-visible:ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--bg-main)] outline-none">
                Ver Demo Interativa
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
            <div aria-hidden="true" className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
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

      {/* Modelos de Veículos Suportados */}
      <section className="w-full max-w-6xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna Esquerda: Seletor de veículos */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black tracking-widest text-primary uppercase">
              Modelos SVG Clicáveis
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-[var(--text-main)] to-[var(--text-muted)] bg-clip-text text-transparent leading-tight">
              Suporte Completo a Todo Tipo de Veículo
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              O aplicativo oferece diagramas interativos de alta fidelidade desenhados especificamente para cada tipo de veículo. Toque em qualquer parte para abrir as opções de marcação.
            </p>

            {/* Botões do Seletor */}
            <div className="flex flex-col gap-2.5 pt-2">
              {vehicleOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setActiveVehicle(opt.type)}
                  className={`w-full px-5 py-4 rounded-xl border flex items-center justify-between text-sm font-bold transition-all outline-none ${
                    activeVehicle === opt.type
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{opt.icon}</span>
                    <span>{opt.name}</span>
                  </div>
                  {activeVehicle === opt.type && (
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Ativo</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Coluna Direita: Renderizador interativo de SVG */}
          <div className="lg:col-span-7 flex flex-col justify-center items-center relative group min-h-[350px]">
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="w-full max-w-[480px] filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] bg-[var(--card-bg)] border border-[var(--card-border)] p-8 rounded-3xl relative backdrop-blur-md">
              
              {/* Etiqueta indicando vista */}
              <div className="absolute top-4 left-4 bg-primary/10 border border-primary/20 text-[9px] font-black tracking-widest text-primary uppercase px-2.5 py-1 rounded-lg">
                Vista Lateral Esquerda
              </div>

              {/* Componente SVG Dinâmico */}
              <div className="py-8">
                {(() => {
                  const selectedOpt = vehicleOptions.find(o => o.type === activeVehicle) || vehicleOptions[0];
                  const ActiveVehicleComponent = staticVehicleRegistry[activeVehicle]['lateral-left'];
                  return (
                    <ActiveVehicleComponent
                      damages={selectedOpt.mockDamages}
                      selectedPartId={null}
                      onPartClick={() => {}}
                      onPartHover={() => {}}
                    />
                  );
                })()}
              </div>

              {/* Nota simulada explicando a avaria */}
              {(() => {
                const selectedOpt = vehicleOptions.find(o => o.type === activeVehicle) || vehicleOptions[0];
                return (
                  <div className="border-t border-[var(--card-border)]/50 pt-4 mt-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_#ef4444]" />
                      <span className="text-xs font-bold text-[var(--text-main)]">
                        Avaria Detectada: {selectedOpt.mockDamages[0].partName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {selectedOpt.mockDamages[0].type === 'broken' ? '💥' : selectedOpt.mockDamages[0].type === 'dent' ? '🔨' : '✏️'}
                        Tipo: {selectedOpt.mockDamages[0].typeName}
                      </span>
                      <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        {selectedOpt.mockDamages[0].severity === 'high' ? 'Grave' : selectedOpt.mockDamages[0].severity === 'medium' ? 'Médio' : 'Leve'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Modelo de Laudo PDF */}
      <section className="w-full max-w-6xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna Esquerda: Mockup Visual do PDF */}
          <div className="lg:col-span-7 flex flex-col items-center gap-4 order-2 lg:order-1">
            {/* Abas de tema do laudo */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {PDF_THEMES.map((th, i) => (
                <button
                  key={th.id}
                  onClick={() => setPdfPreview(i)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${pdfPreview === i ? 'text-white shadow-md' : 'text-[var(--text-muted)] border-[var(--card-border)] hover:border-primary/40'}`}
                  style={pdfPreview === i ? { background: th.accent, borderColor: th.accent } : undefined}
                >{th.icon} {th.name}</button>
              ))}
            </div>

            <div className="relative w-full max-w-[480px]">
              <button
                onClick={() => setPdfPreview((pdfPreview + PDF_THEMES.length - 1) % PDF_THEMES.length)}
                aria-label="Tema anterior"
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[var(--panel-bg)] border border-[var(--card-border)] text-[var(--text-main)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-lg leading-none"
              >‹</button>
              <button
                onClick={() => setPdfPreview((pdfPreview + 1) % PDF_THEMES.length)}
                aria-label="Próximo tema"
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[var(--panel-bg)] border border-[var(--card-border)] text-[var(--text-main)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-lg leading-none"
              >›</button>
            <div className="w-full max-w-[480px] rounded-2xl shadow-2xl p-6 border relative overflow-hidden text-left transition-colors duration-300" style={{ minHeight: '580px', fontFamily: PDF_THEMES[pdfPreview].font, background: PDF_THEMES[pdfPreview].bg, color: PDF_THEMES[pdfPreview].text, borderColor: PDF_THEMES[pdfPreview].border }}>

              {/* Detalhe Superior colorido */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: PDF_THEMES[pdfPreview].bar }} />
              
              {/* Cabeçalho */}
              <div className="flex justify-between items-start -mx-6 -mt-6 px-6 pt-7 pb-4 mb-1" style={{ background: PDF_THEMES[pdfPreview].headerBg, color: PDF_THEMES[pdfPreview].headerText }}>
                <div className="flex items-center gap-3">
                  {/* Personalização de Logo */}
                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-1 text-center select-none shrink-0 leading-none">
                    <span className="text-[7px] font-black tracking-tighter block uppercase">Sua Logo</span>
                    <span className="text-[6px] text-slate-400 mt-0.5 font-bold">Aqui</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-tight uppercase" style={{ color: PDF_THEMES[pdfPreview].headerText }}>Danos Aparentes</h4>
                    <p className="text-[7px] font-semibold tracking-wider" style={{ color: PDF_THEMES[pdfPreview].headerSub }}>Nome da sua Empresa / Concessionária</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[7px] font-bold px-1.5 py-0.5 rounded border" style={{ color: PDF_THEMES[pdfPreview].accent, background: `${PDF_THEMES[pdfPreview].accent}1a`, borderColor: `${PDF_THEMES[pdfPreview].accent}40` }}>PDF COMPROVADO</span>
                  <p className="text-[8px] font-bold mt-1" style={{ color: PDF_THEMES[pdfPreview].headerSub }}>OS: #2026-0042</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 bg-rose-50 border border-rose-200/50 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-extrabold text-rose-700 uppercase tracking-wider">AVARIAS DETECTADAS NO VEÍCULO</span>
                  <p className="text-[7px] text-rose-500 font-medium">1 ocorrência de grau grave registrada.</p>
                </div>
                <span className="text-xs font-black text-rose-600">1x ⚠️</span>
              </div>

              {/* Tabela de Informações */}
              <div className="mt-4 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                <span className="text-[8px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: PDF_THEMES[pdfPreview].accent }}>Identificação do Veículo</span>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[9px]">
                  <div>
                    <span className="text-slate-400 text-[8px] block">Proprietário / Cliente</span>
                    <strong className="text-slate-700 font-semibold">Carlos Henrique Silva</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] block">Marca / Modelo</span>
                    <strong className="text-slate-700 font-semibold">Porsche 911 Carrera S</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] block">Placa</span>
                    <strong className="text-slate-700 font-semibold">DAN-2026</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] block">Cor</span>
                    <strong className="text-slate-700 font-semibold">Cinza Quartz</strong>
                  </div>
                </div>
              </div>

              {/* Desenho do Veículo com a avaria */}
              <div className="mt-4 border border-slate-200 rounded-lg p-3 bg-white flex flex-col items-center">
                <span className="text-[8px] font-extrabold uppercase tracking-widest block align-self-start mb-1 w-full text-left" style={{ color: PDF_THEMES[pdfPreview].accent }}>Diagrama de Danos</span>
                <div className="w-full max-w-[280px] py-1 opacity-90 filter brightness-95">
                  <CarLateralLeft
                    damages={[
                      {
                        id: 'pdf-mock-dmg' as any,
                        vehicle: 'car',
                        view: 'lateral-left',
                        partId: 'car-ll-door-front',
                        partName: 'Porta Dianteira Esquerda',
                        type: 'scratch',
                        typeName: 'Risco',
                        severity: 'high',
                        notes: 'Risco profundo',
                        photos: [],
                        photoNotes: []
                      }
                    ]}
                    selectedPartId={null}
                    onPartClick={() => {}}
                    onPartHover={() => {}}
                  />
                </div>
              </div>

              {/* Detalhamento Técnico das Avarias (igual ao documento oficial gerado) */}
              <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-2.5 py-1.5" style={{ background: PDF_THEMES[pdfPreview].accent }}>
                  <span className="text-[7px] font-extrabold text-white uppercase tracking-widest">Detalhamento Técnico das Avarias</span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-[6.5px] uppercase text-slate-500 font-bold">
                      <th className="px-2 py-1">Peça / Componente</th>
                      <th className="px-2 py-1">Tipo de Dano</th>
                      <th className="px-2 py-1 text-center">Grau</th>
                    </tr>
                  </thead>
                  <tbody className="text-[7px] text-slate-700">
                    <tr className="border-t border-slate-100 bg-white">
                      <td className="px-2 py-1.5 font-bold uppercase">Porta Diant. Esquerda</td>
                      <td className="px-2 py-1.5">
                        <span className="inline-flex items-center gap-1">✏️ Risco / Arranhão</span>
                      </td>
                      <td className="px-2 py-1.5 text-center"><span className="text-rose-600 font-black uppercase">Grave</span></td>
                    </tr>
                  </tbody>
                </table>
                <div className="bg-slate-50 px-2.5 py-1 border-t border-slate-100 flex items-center gap-2 text-[6px] text-slate-400 font-semibold uppercase tracking-wide">
                  <span>Tipos classificados:</span>
                  <span className="text-slate-500">✏️ Risco</span>
                  <span className="text-slate-500">🔨 Deformação</span>
                  <span className="text-slate-500">💥 Fratura</span>
                </div>
              </div>

              {/* Seção de Fotos Anexadas no Mockup do PDF */}
              <div className="mt-4 border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-left">
                <span className="text-[8px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: PDF_THEMES[pdfPreview].accent }}>Fotos das Avarias Anexadas</span>
                <div className="flex gap-2">
                  <div className="w-1/3 border border-slate-200 rounded overflow-hidden bg-white">
                    {/* Imagem simulada */}
                    <div className="h-16 bg-slate-100 flex items-center justify-center relative">
                      <span className="text-lg">📷</span>
                      <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full border border-red-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="p-1 border-t border-slate-100 text-[6px] leading-tight text-slate-600">
                      <strong>Porta Dianteira Esq.</strong>
                      <p className="text-slate-400 font-semibold mt-0.5">Risco na pintura</p>
                    </div>
                  </div>
                  {/* Descrição e Geotagging */}
                  <div className="w-2/3 flex flex-col justify-center text-[8px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>Fotos em alta resolução anexadas automaticamente</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>Carimbo de data, hora e coordenadas de GPS na imagem</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assinaturas */}
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="text-center">
                  <div className="h-8 flex items-center justify-center">
                    <span className="font-serif italic text-xs text-blue-800 opacity-80 select-none">Vistoriador Assinado</span>
                  </div>
                  <div className="border-t border-slate-300 mx-4 mt-1"></div>
                  <span className="text-[7px] text-slate-400 uppercase font-bold mt-1 block">Vistoriador Responsável</span>
                </div>
                <div className="text-center">
                  <div className="h-8 flex items-center justify-center">
                    <span className="font-serif italic text-xs text-blue-800 opacity-80 select-none">Carlos H. Silva</span>
                  </div>
                  <div className="border-t border-slate-300 mx-4 mt-1"></div>
                  <span className="text-[7px] text-slate-400 uppercase font-bold mt-1 block">Assinatura do Cliente</span>
                </div>
              </div>

              {/* Rodapé e validação */}
              <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-slate-400">
                <div className="space-y-1">
                  <span className="text-[7px] font-black uppercase text-slate-400 block tracking-widest">Hash de Validação SHA-256</span>
                  <code className="text-[7px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded block">
                    8F3C7E9A4B1D0E3F5C7A9E2B0D4F6A8C
                  </code>
                </div>
                <div className="w-10 h-10 border border-slate-200 p-0.5 rounded bg-white">
                  <QrCodeMock className="w-full h-full" />
                </div>
              </div>
            </div>
            </div>
            {/* Indicadores do slider */}
            <div className="flex items-center gap-1.5">
              {PDF_THEMES.map((th, i) => (
                <button
                  key={th.id}
                  onClick={() => setPdfPreview(i)}
                  aria-label={`Ver tema ${th.name}`}
                  className="h-2 rounded-full transition-all cursor-pointer border-0 p-0"
                  style={{ width: pdfPreview === i ? 22 : 8, background: pdfPreview === i ? th.accent : 'var(--card-border)' }}
                />
              ))}
            </div>
          </div>

          {/* Coluna Direita: Informações explicativas */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black tracking-widest text-primary uppercase">
              Laudos Automatizados
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-[var(--text-main)] to-[var(--text-muted)] bg-clip-text text-transparent leading-tight">
              Gere Relatórios PDF Invioláveis Prontos para Enviar
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Ao concluir a vistoria, o sistema gera instantaneamente um arquivo PDF formatado para impressão. Ele inclui todos os dados de identificação, fotos anexadas, observações, diagramas de danos e as assinaturas colhidas na tela.
            </p>

            <ul className="space-y-3.5">
              {[
                { title: 'Identificação do Veículo e Proprietário Personalizável', desc: 'Você decide o que incluir e onde: mostre ou oculte campos, crie campos próprios e mova cada seção (perfil, cliente, documentos, veículo, local, assinaturas) para a posição que quiser no laudo.' },
                { title: 'Código Hash SHA-256', desc: 'Garante que o PDF original não pode ser adulterado de forma alguma, gerando validade e segurança jurídica perante seguradoras.' },
                { title: 'QR Code de Validação', desc: 'Qualquer pessoa pode escanear o QR Code no papel para conferir o laudo digital original armazenado na nuvem segura.' },
                { title: 'Assinatura Eletrônica na Tela', desc: 'Elimina totalmente a necessidade de papéis físicos e canetas. Coleta rápida pelo celular de forma legal e simples.' }
              ].map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary text-base mt-0.5">✓</span>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-main)]">{feat.title}</h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

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
