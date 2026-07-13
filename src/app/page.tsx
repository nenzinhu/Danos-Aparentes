"use client";
import { ViewTransition } from 'react'
import { DirectionalTransition } from './DirectionalTransition'
import Link from 'next/link'
import IntroVideo from '../components/IntroVideo'
import Image from 'next/image';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LEGAL_CONTACT_EMAIL } from '../components/LegalContent';
import LandingCtaLink from '../components/LandingCtaLink';
import Reveal from '../components/Reveal';
import TrustSection from '../components/TrustSection';
import FinalCtaSection from '../components/FinalCtaSection';
import LandingPromoVideo from '../components/LandingPromoVideo';
import FloatingWhatsAppButton from '../components/FloatingWhatsAppButton';
import { motion, useReducedMotion } from 'framer-motion';
import HeroCarStage, { heroCarVariant, heroTagVariant, heroSpecCellVariant, heroSpecStage } from '../components/HeroCarStage';
import type { Damage } from '../types';

// Avarias reais do laudo (2 riscos leves nas portas esquerdas) para o
// hero renderizar o modelo realista com as peças marcadas/selecionadas.
const HERO_DAMAGES: Damage[] = [
  { id: 'hero-1' as Damage['id'], vehicle: 'car', view: 'lateral-left', partId: 'car-ll-door-front', partName: 'Porta Dianteira Esquerda', type: 'scratch', typeName: 'Risco', severity: 'low', notes: '', photos: [], photoNotes: [] },
  { id: 'hero-2' as Damage['id'], vehicle: 'car', view: 'lateral-left', partId: 'car-ll-door-rear', partName: 'Porta Traseira Esquerda', type: 'scratch', typeName: 'Risco', severity: 'low', notes: '', photos: [], photoNotes: [] },
];

// Data da última revisão de conteúdo/copy da home. Atualize ao editar
// headline, seções ou schema — reflete no dateModified do SoftwareApplication.
const HOME_UPDATED_DATE = '2026-07-12'

// Schema de marca/produto para rich results e Knowledge Graph.
const LANDING_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Danos Aparentes',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS (PWA)',
  url: 'https://danosaparentes.com.br',
  description:
    'Aplicativo de vistoria veicular: marque avarias em diagramas do veículo, anexe fotos com GPS e gere laudos em PDF com hash de validação e QR Code.',
  inLanguage: 'pt-BR',
  dateModified: HOME_UPDATED_DATE,
  offers: { '@type': 'Offer', category: 'subscription' },
  publisher: {
    '@type': 'Organization',
    name: 'Danos Aparentes',
    url: 'https://danosaparentes.com.br',
    logo: 'https://danosaparentes.com.br/logo-full.png',
  },
};

// Fonte única das perguntas do FAQ: usada tanto pelo FAQSection (visível)
// quanto pelo JSON-LD abaixo (schema), para as duas nunca divergirem.
const FAQ_ITEMS = [
  { q: "Qual o valor da assinatura do aplicativo?", a: "O plano Profissional (Pro) custa R$ 49,90 por mês com vistorias ilimitadas, relatórios personalizados, consulta de placas e todas as funcionalidades liberadas. Para frotas e empresas com múltiplos vistoriadores, temos o plano Corporativo com preços sob medida – consulte-nos clicando em 'Consulte Conosco'." },
  { q: "O que é o hash do PDF e a assinatura digital?", a: "O hash é um código de segurança único (SHA-256) gerado para cada PDF que comprova que o documento não foi alterado. Além disso, o laudo possui um sistema de assinatura digital na tela, onde o vistoriador e o cliente assinam diretamente no celular." },
  { q: "Preciso de internet para fazer as vistorias?", a: "Não! O aplicativo foi desenvolvido para funcionar 100% offline. Você pode fazer a vistoria, marcar as avarias, tirar fotos e colher assinaturas em locais sem sinal. Os dados são salvos localmente e sincronizados na nuvem assim que houver internet." },
  { q: "Como funciona a consulta de placas?", a: "Ao inserir a placa do veículo, o sistema realiza uma consulta automática e preenche de forma instantânea a marca, modelo, ano, cor e município do veículo, agilizando o processo de vistoria." },
  { q: "Consigo personalizar o relatório com meu logotipo?", a: "Sim! Usuários do plano Vistoria PRO podem configurar o nome da empresa e carregar seu próprio logotipo, que aparecerá de forma elegante no cabeçalho de todos os laudos gerados." },
  { q: "Quais são os tipos de veículos suportados?", a: "O aplicativo suporta a inspeção interativa em 6 categorias de veículos: Carro, Moto, Caminhão, Utilitário (Van), Ônibus e um modelo Genérico/Customizável, todos com 4 vistas em SVG clicáveis." },
  { q: "Como posso enviar o laudo para o cliente?", a: "Você pode exportar o laudo como um arquivo PDF profissional, gerar um relatório em formato de texto para copiar/enviar por e-mail ou mandar o PDF diretamente pelo WhatsApp do cliente." },
];

const PRICING_FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

const PricingSection = dynamic(() => import('../components/PricingSection'));
const FAQSection = dynamic(() => import('../components/FAQSection'));
const VehicleShowcaseSection = dynamic(() => import('../components/VehicleShowcaseSection'));
const PdfPreviewSection = dynamic(() => import('../components/PdfPreviewSection'));
const CarLateralLeft = dynamic(() => import('../components/vehicles/CarLateralLeft'), { ssr: false });
const VehicleDefs = dynamic(() => import('../components/vehicles/VehicleDefs'), { ssr: false });
const BlogTeaserSection = dynamic(() => import('../components/BlogTeaserSection'), { ssr: false });
const MobileStickyCta = dynamic(() => import('../components/MobileStickyCta'), { ssr: false });

function TextCarousel() {
  const slides = [
    {
      kicker: 'Laudo que comprova a si mesmo',
      description:
        'Chega de discutir amassado que já existia no carro. Marque avarias no diagrama, prove com foto, GPS e assinatura antes de sair do pátio. Laudo em PDF com hash de segurança e QR Code, pronto pra mandar no WhatsApp.',
    },
    {
      kicker: 'Laudos no WhatsApp que o cliente entende',
      description:
        'Envie o laudo em PDF direto no celular do cliente com todas as avarias marcadas visualmente, fotos reais do dano e assinatura com o dedo na tela.',
    },
    {
      kicker: 'Digite a placa e preencha os dados sozinho',
      description:
        'Digite a placa e o aplicativo preenche automaticamente a marca, modelo, cor e ano do veículo. Rápido, prático e sem erros de digitação no pátio.',
    },
  ];

  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  // Auto-rotate supporting copy only — pause when the user prefers reduced motion.
  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <div className="relative">
      <h1 className="font-display text-4xl sm:text-5xl lg:text-[5.25rem] font-bold uppercase leading-[0.92] tracking-[-0.015em] text-[var(--text-main)] [text-wrap:balance]">
        Danos Aparentes
        <span className="block mt-2 text-[0.55em] sm:text-[0.48em] lg:text-[2.75rem] normal-case tracking-tight font-semibold text-[var(--signal-bright)]">
          Vistoria digital que prova a si mesma.
        </span>
      </h1>

      <div
        key={index}
        aria-live="polite"
        className="space-y-3 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none"
      >
        <p className="font-mono-data text-[11px] tracking-[0.18em] uppercase text-[var(--signal-bright)]">
          {slides[index].kicker}
        </p>
        <p className="text-base lg:text-lg text-[var(--text-muted)] max-w-xl leading-relaxed">
          {slides[index].description}
        </p>
      </div>

      {/* Indicador em índice de laudo: 01 — 03 com navegação */}
      <div className="flex items-center gap-4 pt-7">
        <button
          onClick={prev}
          className="grid place-items-center w-9 h-9 border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--signal-bright)] hover:border-[var(--sheet-line)] transition-colors focus-visible:ring-2 ring-[var(--signal)] outline-none"
          aria-label="Mensagem anterior"
        >
          ←
        </button>
        <button
          onClick={next}
          className="grid place-items-center w-9 h-9 border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--signal-bright)] hover:border-[var(--sheet-line)] transition-colors focus-visible:ring-2 ring-[var(--signal)] outline-none"
          aria-label="Próxima mensagem"
        >
          →
        </button>
        <span aria-hidden="true" className="font-mono-data text-xs text-[var(--text-muted)] tracking-widest tabular-nums">
          <span className="text-[var(--signal-bright)]">{String(index + 1).padStart(2, '0')}</span>
          {' / '}
          {String(slides.length).padStart(2, '0')}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-[var(--card-border)]" />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const isDark = saved !== null ? saved !== 'false' : window.matchMedia('(prefers-color-scheme: dark)').matches;
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

  // Helper for smooth scrolling to FAQ
  const scrollToFaq = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const faqElement = document.getElementById('faq');
    if (faqElement) {
      faqElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <DirectionalTransition>
      <div className="min-h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 font-outfit overflow-y-auto flex flex-col relative selection:bg-primary selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LANDING_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRICING_FAQ_JSONLD) }} />
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
          <Image src="/logo.svg" alt="Danos Aparentes" width={48} height={48} className="object-contain shrink-0" priority />
          <span className="hidden sm:inline text-base sm:text-lg font-extrabold tracking-tight uppercase bg-clip-text text-transparent whitespace-nowrap" style={{ backgroundImage: 'var(--header-title-gradient)' }}>
            Danos Aparentes
          </span>
        </div>
        <nav className="flex items-center gap-3 sm:gap-6 shrink-0">
          <Link href="/planos" className="hidden sm:inline text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors outline-none cursor-pointer">
            Planos
          </Link>
          <a href="#faq" onClick={scrollToFaq} className="hidden sm:inline text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors outline-none cursor-pointer">
            FAQ
          </a>
          <Link href="/app" transitionTypes={['nav-forward']} className="inline-flex text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] rounded-lg outline-none">
            Entrar
          </Link>
          <button
            onClick={toggleDarkMode}
            className="p-2 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] rounded-xl transition-all outline-none"
            aria-label="Alternar tema"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <LandingCtaLink className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-xl shadow-[var(--primary)]/15 transition-all motion-safe:hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none">
            Testar 7 dias grátis
          </LandingCtaLink>
        </nav>
      </header>

      {/* Main Content — Prancha de Vistoria */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6 z-10 relative">
        <div className="sheet-frame max-w-7xl w-full animate-in fade-in duration-700 motion-reduce:animate-none">
          <span aria-hidden="true" className="crop-tr" />
          <span aria-hidden="true" className="crop-br" />

          {/* Faixa-cabeçalho do laudo */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 sm:px-8 py-3 border-b border-[var(--card-border)] font-mono-data text-[11px] tracking-wider text-[var(--text-muted)] uppercase">
            <span className="text-[var(--signal-bright)] font-semibold">Relatório de Vistoria</span>
            <span aria-hidden="true" className="text-[var(--card-border)]">/</span>
            <span>OS <span className="text-[var(--text-main)]">2026-0628</span></span>
            <span aria-hidden="true" className="hidden sm:inline text-[var(--card-border)]">/</span>
            <span className="hidden sm:inline-flex items-center gap-2">
              Placa
              <span className="px-2 py-0.5 border border-[var(--sheet-line)] text-[var(--text-main)] font-semibold tracking-[0.2em]">MKT4322</span>
            </span>
            <span className="ml-auto inline-flex items-center gap-2">
              <span aria-hidden="true" className="signal-dot w-1.5 h-1.5 rounded-full bg-[var(--signal-bright)] shadow-[0_0_8px_var(--signal-glow)]" />
              <span className="text-[var(--signal-bright)] font-semibold">Grau leve · 2 avarias</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
            {/* Coluna esquerda: tese + ação */}
            <div className="px-5 sm:px-8 py-10 lg:py-12 lg:border-r border-[var(--card-border)] animate-in fade-in slide-in-from-left-6 duration-1000 motion-reduce:animate-none">
              <TextCarousel />

              <div className="flex flex-wrap gap-4 pt-9">
                <LandingCtaLink
                  id="hero-primary-cta"
                  transitionTypes={['nav-forward']}
                  className="group/cta px-8 py-4 text-white font-black rounded-xl shadow-2xl shadow-[var(--primary)]/20 inline-flex items-center gap-3 transition-all motion-safe:hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--bg-main)] outline-none"
                  style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
                >
                  Testar 7 dias grátis
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/cta:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </LandingCtaLink>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 font-mono-data text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                <span aria-hidden="true" className="text-[var(--signal-bright)]">✓</span>
                <span>Sem cartão</span>
                <span aria-hidden="true" className="text-[var(--card-border)]">·</span>
                <span>7 dias liberados</span>
                <span aria-hidden="true" className="text-[var(--card-border)]">·</span>
                <span>Cancele online</span>
              </div>

              {/* Especificações — encodadas como ficha técnica */}
              <motion.dl
                className="grid grid-cols-1 sm:grid-cols-3 gap-px mt-10 bg-[var(--card-border)] border border-[var(--card-border)]"
                variants={reduceMotion ? undefined : heroSpecStage}
                initial={reduceMotion ? undefined : 'hidden'}
                animate={reduceMotion ? undefined : 'show'}
              >
                {[
                  { k: 'Saída', v: 'Laudo PDF', sub: 'hash 0DF20434…' },
                  { k: 'Prova', v: 'Fotos HD', sub: 'galeria + QR' },
                  { k: 'Rede', v: 'Offline', sub: '100% no pátio' },
                ].map(item => (
                  <motion.div key={item.k} variants={reduceMotion ? undefined : heroSpecCellVariant} className="bg-[var(--bg-main)] px-3 py-3">
                    <dt className="font-mono-data text-[9px] uppercase tracking-widest text-[var(--text-muted)]">{item.k}</dt>
                    <dd className="font-display text-lg font-semibold uppercase text-[var(--text-main)] leading-tight mt-0.5">{item.v}</dd>
                    <dd className="font-mono-data text-[9px] text-[var(--signal-bright)] tracking-wide">{item.sub}</dd>
                  </motion.div>
                ))}
              </motion.dl>
            </div>

            {/* Coluna direita: prancha do veículo */}
            <div className="relative px-5 sm:px-8 py-10 flex flex-col animate-in fade-in slide-in-from-right-8 duration-1000 delay-150 motion-reduce:animate-none">
              <div className="flex items-center justify-between font-mono-data text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-4">
                <span>Vista · Lateral Esq.</span>
                <span>2 avarias</span>
              </div>

              <div className="relative flex-1 grid place-items-center min-h-[260px]">
                <div aria-hidden="true" className="absolute inset-x-6 bottom-8 h-px bg-[var(--sheet-line)] opacity-60" />
                <div aria-hidden="true" className="absolute left-1/2 bottom-6 -translate-x-1/2 font-mono-data text-[9px] text-[var(--text-muted)] tracking-[0.3em] uppercase">eixo de referência</div>

                <VehicleDefs />
                <ViewTransition name="car-visualizer" share="morph" default="none">
                  <HeroCarStage className="relative w-full max-w-md drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                    <motion.div variants={heroCarVariant}>
                      <CarLateralLeft damages={HERO_DAMAGES} selectedPartId="car-ll-door-front" onPartClick={()=>{}} onPartHover={()=>{}} />
                    </motion.div>

                    {/* Marcadores de avaria — posicionados em relação ao mesmo container do SVG para manter alinhamento proporcional! */}
                    <motion.div variants={heroTagVariant} className="absolute top-[45%] left-[28%] flex items-center gap-2 pointer-events-none">
                      <span className="damage-tag hidden sm:inline-block px-2 py-1 bg-[var(--card-bg-solid)] border border-[var(--severity-low)]/70 text-[var(--text-main)] rounded whitespace-nowrap shadow-lg">Porta diant. esq. · risco</span>
                      <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-[var(--severity-low)] shadow-[0_0_10px_var(--severity-low)] shrink-0" />
                    </motion.div>
                    <motion.div variants={heroTagVariant} className="absolute top-[45%] left-[58%] flex items-center gap-2 pointer-events-none">
                      <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-[var(--severity-low)] shadow-[0_0_10px_var(--severity-low)] shrink-0" />
                      <span className="damage-tag hidden sm:inline-block px-2 py-1 bg-[var(--card-bg-solid)] border border-[var(--severity-low)]/70 text-[var(--text-main)] rounded whitespace-nowrap shadow-lg">Porta tras. esq. · risco</span>
                    </motion.div>
                  </HeroCarStage>
                </ViewTransition>
              </div>

              {/* Legenda de severidade */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 mt-2 border-t border-[var(--card-border)] font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {[
                  { c: 'var(--severity-low)', l: 'Leve' },
                  { c: 'var(--severity-medium)', l: 'Média' },
                  { c: 'var(--severity-high)', l: 'Grave' },
                ].map(s => (
                  <span key={s.l} className="inline-flex items-center gap-1.5">
                    <span aria-hidden="true" className="w-2 h-2 rounded-full" style={{ background: s.c }} />
                    {s.l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Seção Como Funciona */}
      <section className="w-full max-w-6xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-16 text-left">
        <Reveal className="text-center mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
            Fluxo de Trabalho
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)]">
            Da placa ao laudo assinado <span className="text-[var(--signal-bright)]">em 3 passos</span>
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-3 max-w-xl">
            O que no papel leva 20 minutos, você faz no pátio em poucos toques, com prova fotográfica e PDF pronto para enviar.
          </p>
        </Reveal>

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
            <Reveal key={idx} delay={idx * 90} className="glass-card p-8 border border-[var(--card-border)]/50 hover:border-[var(--sheet-line)] hover:shadow-[0_8px_30px_-12px_var(--signal-glow)] transition-all duration-300 relative group">
              <div className="font-mono-data text-4xl font-bold text-[var(--signal)]/25 group-hover:text-[var(--signal-bright)]/60 transition-colors absolute top-4 right-6">
                {item.step}
              </div>
              <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-[var(--text-main)] mt-4 mb-2">{item.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Vídeo promo — abaixo da dobra, sem autoplay */}
      <LandingPromoVideo />

      {/* Segurança e transparência do laudo */}
      <TrustSection />

      {/* Modelos de Veículos Suportados (lazy) */}
      <VehicleShowcaseSection />

      {/* Seção Modelo de Laudo PDF (lazy) */}
      <PdfPreviewSection />

      {/* Seção Do Blog (lazy) */}
      <BlogTeaserSection />

      <PricingSection />

      <FAQSection items={FAQ_ITEMS} />

      <FinalCtaSection />

      <MobileStickyCta heroCtaId="hero-primary-cta" />

      <FloatingWhatsAppButton />

      {/* Footer */}
      <footer className="w-full px-8 py-8 flex flex-col gap-6 text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase shrink-0 z-50 border-t border-[var(--card-border)]/20 bg-[var(--panel-bg)]">
        {/* Legal Info & Disclaimer */}
        <div className="w-full flex flex-col gap-2 text-center md:text-left text-[9px] font-semibold tracking-normal normal-case border-b border-[var(--card-border)]/10 pb-6 opacity-75">
          <p>
            <strong>Responsável Legal:</strong> Jeferson da Silva | Florianópolis - SC | <strong>Contato:</strong>{' '}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-primary hover:underline">{LEGAL_CONTACT_EMAIL}</a>
          </p>
          <p className="text-[8px] opacity-70 leading-relaxed">
            <strong>Aviso de Isenção:</strong> A consulta de dados cadastrais de veículos por meio da placa é realizada de forma estritamente privada por meio de APIs parceiras para fins de preenchimento automatizado de checklist, não possuindo qualquer vínculo, representação ou convênio com o DETRAN, Denatran, órgãos governamentais ou entidades públicas.
          </p>
        </div>
        
        {/* Bottom row */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-8">
            <span>© 2026 Danos Aparentes</span>
            <span className="hidden md:inline">Vistoria Digital de Alta Fidelidade</span>
          </div>
          <div className="flex gap-8 flex-wrap justify-center">
            <a href="/locadoras" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Para Locadoras</a>
            <a href="/demo" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Demonstração</a>
            <a href="/verify" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Verificar Laudo</a>
            <a href="/blog" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Blog</a>
            <a href="/faq" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">FAQ</a>
            <a href="/privacidade" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Privacidade</a>
            <a href="/termos" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Termos de Uso</a>
            <a href="/suporte" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
    </DirectionalTransition>
  )
}
