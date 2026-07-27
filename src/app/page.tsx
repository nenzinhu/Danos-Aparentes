"use client";
import { DirectionalTransition } from './DirectionalTransition'
import Link from 'next/link'
import IntroVideo from '../components/IntroVideo'
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { LEGAL_CONTACT_EMAIL, LEGAL_CNPJ, LEGAL_COMPANY_NAME } from '../components/LegalContent';
import LandingCtaLink from '../components/LandingCtaLink';
import Reveal from '../components/Reveal';
import GsapTextReveal from '../components/GsapTextReveal';
import LupaVehicleReveal, { SELECTOR_VEHICLES } from '../components/LupaVehicleReveal';
import GsapSplitSubline from '../components/GsapSplitSubline';
import GsapLetterScanText from '../components/GsapLetterScanText';
import HeroVehiclePicker from '../components/HeroVehiclePicker';
import TrustSection from '../components/TrustSection';
import FinalCtaSection from '../components/FinalCtaSection';
import LandingPromoVideo from '../components/LandingPromoVideo';
import FloatingWhatsAppButton from '../components/FloatingWhatsAppButton';
import { motion, useReducedMotion } from 'framer-motion';
import {
  heroSpecCellVariant,
  heroSpecStage,
  heroCopyStage,
  heroCopyItem,
} from '../components/HeroCarStage';
import { IconSunMoon, IconSearch, IconCar, IconSignature } from '../components/ui/AnimatedIcons';

// Data da última revisão de conteúdo/copy da home. Atualize ao editar
// headline, seções ou schema — reflete no dateModified do SoftwareApplication.
const HOME_PUBLISHED_DATE = '2026-01-15'
const HOME_UPDATED_DATE = '2026-07-25'

// Schema de marca/produto para rich results e Knowledge Graph.
const LANDING_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Danos Aparentes',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS (PWA)',
  url: 'https://danosaparentes.com.br',
  description:
    'Aplicativo de vistoria veicular digital: marque avarias em diagramas do veículo, anexe fotos com GPS e gere laudos em PDF com hash de validação e QR Code.',
  inLanguage: 'pt-BR',
  datePublished: HOME_PUBLISHED_DATE,
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
  { q: "Qual o valor da assinatura do aplicativo?", a: "Starter R$ 29,90/mês (até 20 laudos, ≈ R$ 1,50/laudo) e Pro R$ 49,90/mês (até 80 laudos, ≈ R$ 0,62/laudo, com marca própria no PDF). Corporativo a partir de R$ 299/mês (Start até 5 usuários), Growth R$ 699 (até 15) e Enterprise a partir de R$ 1.490 — laudos ilimitados e multi-usuário." },
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
const PdfPreviewSection = dynamic(() => import('../components/PdfPreviewSection'));
const BrandOnPdfSection = dynamic(() => import('../components/BrandOnPdfSection'));
// Blog teaser must SSR so crawlers see internal links to /blog posts.
const BlogTeaserSection = dynamic(() => import('../components/BlogTeaserSection'));
const MobileStickyCta = dynamic(() => import('../components/MobileStickyCta'), { ssr: false });

function TextCarousel() {
  const slides = [
    {
      kicker: 'Vistoria veicular digital',
      description:
        'Chega de discutir amassado que já existia no carro. Faça a vistoria veicular digital no pátio: marque avarias no diagrama, prove com foto, GPS e assinatura. Laudo em PDF com hash e QR Code, pronto pro WhatsApp.',
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
    <motion.div
      className="relative"
      variants={reduceMotion ? undefined : heroCopyStage}
      initial={reduceMotion ? undefined : 'hidden'}
      animate={reduceMotion ? undefined : 'show'}
    >
      {/* Beat 1 — brand (hero-level) */}
      <div className="flex items-center gap-3">
        <LupaVehicleReveal size={64} className="hidden sm:inline-flex" />
        <GsapTextReveal
          as="h1"
          split="words"
          className="font-display text-4xl sm:text-5xl lg:text-[5.25rem] font-bold uppercase leading-[0.92] tracking-[-0.015em] text-[var(--text-main)] [text-wrap:balance]"
        >
          Danos Aparentes
        </GsapTextReveal>
      </div>

      {/* Beat 2 — supporting headline, SplitText hands off from the title reveal */}
      {reduceMotion ? (
        <p className="mt-3 text-xl sm:text-2xl lg:text-[2.75rem] tracking-tight font-semibold text-[var(--signal-bright)] leading-tight [text-wrap:balance]">
          Vistoria veicular digital que prova a si mesma.
        </p>
      ) : (
        <GsapSplitSubline
          as="p"
          delay={650}
          className="mt-3 text-xl sm:text-2xl lg:text-[2.75rem] tracking-tight font-semibold text-[var(--signal-bright)] leading-tight [text-wrap:balance]"
        >
          Vistoria veicular digital que prova a si mesma.
        </GsapSplitSubline>
      )}

      <motion.div variants={reduceMotion ? undefined : heroCopyItem} className="mt-6">
        <div
          key={index}
          aria-live="polite"
          className="space-y-3 motion-safe:transition-opacity motion-safe:duration-500"
        >
          <p className="font-mono-data text-[11px] tracking-[0.18em] uppercase text-[var(--signal-bright)]">
            {slides[index].kicker}
          </p>
          <p className="text-base lg:text-lg text-[var(--text-muted)] max-w-xl leading-relaxed">
            {slides[index].description}
          </p>
        </div>
      </motion.div>

      {/* Indicador em índice de laudo: 01 — 03 com navegação */}
      <motion.div variants={reduceMotion ? undefined : heroCopyItem} className="flex items-center gap-4 pt-7">
        <button
          onClick={prev}
          className="grid place-items-center w-9 h-9 border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--signal-bright)] hover:border-[var(--sheet-line)] transition-colors duration-150 focus-visible:ring-2 ring-[var(--signal)] outline-none"
          aria-label="Mensagem anterior"
        >
          ←
        </button>
        <button
          onClick={next}
          className="grid place-items-center w-9 h-9 border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--signal-bright)] hover:border-[var(--sheet-line)] transition-colors duration-150 focus-visible:ring-2 ring-[var(--signal)] outline-none"
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
      </motion.div>

      {/* Beat 3 — CTA settle (same stage so brand leads) */}
      <motion.div variants={reduceMotion ? undefined : heroCopyItem} className="flex flex-wrap gap-4 pt-9">
        <LandingCtaLink
          id="hero-primary-cta"
          transitionTypes={['nav-forward']}
          className="group/cta px-8 py-4 text-white font-black rounded-xl shadow-2xl shadow-[var(--primary)]/20 inline-flex items-center gap-3 transition-transform duration-150 motion-safe:hover:scale-[1.02] active:scale-[0.99] focus-visible:ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--bg-main)] outline-none"
          style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
        >
          Testar 7 dias grátis
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-150 group-hover/cta:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </LandingCtaLink>
      </motion.div>

      <motion.div
        variants={reduceMotion ? undefined : heroCopyItem}
        className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 font-mono-data text-[11px] text-[var(--text-muted)] uppercase tracking-wider"
      >
        <span aria-hidden="true" className="text-[var(--signal-bright)]">✓</span>
        <span>Sem cartão</span>
        <span aria-hidden="true" className="text-[var(--card-border)]">·</span>
        <span>7 dias liberados</span>
        <span aria-hidden="true" className="text-[var(--card-border)]">·</span>
        <span>Cancele online</span>
      </motion.div>
    </motion.div>
  );
}

import { useGsapScrollAnimations } from '../hooks/useGsapScrollAnimations';

export default function LandingPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true);
  const reduceMotion = useReducedMotion();
  useGsapScrollAnimations();

  useEffect(() => {
    router.prefetch('/app')
  }, [router])

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
        <div aria-hidden="true" className="bg-glow-orb bg-glow-orb-1 absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,170,255,0.18) 0%, transparent 70%)' }} />
        <div aria-hidden="true" className="bg-glow-orb bg-glow-orb-2 absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
      </div>

      {/* Grid Overlay */}
      <div aria-hidden="true" className="fixed inset-0 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full px-4 sm:px-8 py-6 flex justify-between items-center gap-3 z-50 shrink-0">
        <div className="gsap-header-item flex items-center gap-2 sm:gap-3 min-w-0">
          <LupaVehicleReveal size={44} vehicles={SELECTOR_VEHICLES} />
          <span className="hidden sm:inline">
            <GsapLetterScanText
              text="Danos Aparentes"
              fontSize={18}
              className="font-extrabold tracking-tight uppercase whitespace-nowrap text-[var(--text-main)]"
            />
          </span>
        </div>
        <nav className="flex items-center gap-3 sm:gap-6 shrink-0">
          <Link href="/planos" className="gsap-header-item hidden sm:inline text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors outline-none cursor-pointer">
            Planos
          </Link>
          <a href="#faq" onClick={scrollToFaq} className="gsap-header-item hidden sm:inline text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors outline-none cursor-pointer">
            FAQ
          </a>
          {/* Sem nav-forward: View Transitions congelam a landing até /app pintar,
              o que no mobile parece "Entrar não responde". Prefetch + loading.tsx
              dão feedback imediato. */}
          <Link href="/app" prefetch className="gsap-header-item inline-flex text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] rounded-lg outline-none">
            Entrar
          </Link>
          <button
            onClick={toggleDarkMode}
            className="gsap-header-item p-2 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] rounded-xl transition-all outline-none cursor-pointer flex items-center justify-center"
            aria-label="Alternar tema"
          >
            <IconSunMoon isDark={darkMode} className={darkMode ? 'text-amber-400' : 'text-slate-400'} size={20} />
          </button>
          <LandingCtaLink className="gsap-header-item px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-xl shadow-[var(--primary)]/15 transition-transform duration-150 motion-safe:hover:scale-[1.02] active:scale-[0.99] focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none">
            Testar 7 dias grátis
          </LandingCtaLink>
        </nav>
      </header>

      {/* Main Content — Prancha de Vistoria */}
      <main className="gsap-hero-container flex-1 flex items-center justify-center px-4 sm:px-8 py-6 z-10 relative">
        <div className="gsap-hero-3d sheet-frame max-w-7xl w-full">
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
            {/* Coluna esquerda: tese + ação — motion 1: brand → copy → CTA */}
            <div className="px-5 sm:px-8 py-10 lg:py-12 lg:border-r border-[var(--card-border)]">
              <TextCarousel />

              {/* Especificações — último beat da coluna (após CTA) */}
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

            {/* Coluna direita: prancha do veículo — seletor de tipo + diagrama real */}
            <div className="relative px-5 sm:px-8 py-10 flex flex-col">
              <HeroVehiclePicker />

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
            <GsapTextReveal as="span" split="words" onScroll>Da placa ao laudo assinado</GsapTextReveal>{' '}
            <GsapTextReveal as="span" split="words" onScroll delay={150} className="text-[var(--signal-bright)]">em 3 passos</GsapTextReveal>
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-3 max-w-xl">
            O que no papel leva 20 minutos, você faz no pátio em poucos toques, com prova fotográfica e PDF pronto para enviar.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: <IconSearch className="text-sky-400" size={24} />,
              title: 'Consulte a Placa',
              desc: 'Insira a placa do veículo e deixe o sistema preencher automaticamente marca, modelo, ano de fabricação, cor e município.'
            },
            {
              step: '02',
              icon: <IconCar className="text-amber-400" size={24} />,
              title: 'Toque para Marcar Avarias',
              desc: 'Selecione o modelo do veículo e toque na área exata do SVG clicável. Aponte o tipo de avaria (risco, amassado, quebrado), adicione fotos HD e notas.'
            },
            {
              step: '03',
              icon: <IconSignature className="text-emerald-400" size={24} />,
              title: 'Assine e Envie o Laudo',
              desc: 'Vistoriador e cliente assinam digitalmente na tela do celular. O laudo em PDF inviolável com hash SHA-256 é gerado e enviado por WhatsApp.'
            }
          ].map((item, idx) => (
            <Reveal key={idx} delay={idx * 70}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="spotlight-card gsap-card glass-card p-8 border border-[var(--card-border)]/50 hover:border-[var(--sheet-line)] hover:shadow-[0_8px_30px_-12px_var(--signal-glow)] transition-colors duration-300 relative group h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div className="font-mono-data text-3xl font-bold text-[var(--signal)]/25 group-hover:text-[var(--signal-bright)]/60 transition-colors">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-[var(--text-main)] mt-2 mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Vídeo promo — abaixo da dobra, sem autoplay */}
      <LandingPromoVideo />

      {/* Segurança e transparência do laudo */}
      <TrustSection />

      {/* Destaque: nome + logo da empresa no PDF */}
      <BrandOnPdfSection />

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
            <strong>{LEGAL_COMPANY_NAME}</strong> | <strong>CNPJ:</strong> {LEGAL_CNPJ} | <strong>Contato:</strong>{' '}
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
            <a href="/sobre" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Sobre</a>
            <a href="/planos" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Planos</a>
            <a href="/locadoras" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Para Locadoras</a>
            <a href="/oficinas" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Para Oficinas</a>
            <a href="/seguradoras" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Para Seguradoras</a>
            <a href="/frotas" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Para Frotas</a>
            <a href="/demo" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Demonstração</a>
            <a href="/verify" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Verificar Laudo</a>
            <a href="/blog" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Guias de vistoria veicular</a>
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
