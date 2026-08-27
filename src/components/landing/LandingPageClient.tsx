"use client";
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { DirectionalTransition } from '../../app/DirectionalTransition'
import Link from 'next/link'
import { LEGAL_CONTACT_EMAIL, LEGAL_CNPJ, LEGAL_COMPANY_NAME } from '../legalMeta'
import LandingCtaLink from '../LandingCtaLink'
import LandingTopNav from '../LandingTopNav'
import LupaVehicleReveal from '../LupaVehicleReveal'
import GsapTextReveal from '../GsapTextReveal'
import GsapSplitSubline from '../GsapSplitSubline'
import { motion, useReducedMotion } from 'framer-motion'
import {
  heroCopyStage,
  heroCopyItem,
} from '../HeroCarStage'
import { IconSunMoon } from '../ui/AnimatedIcons'
import { useGsapScrollAnimations } from '../../hooks/useGsapScrollAnimations'
import { HOME_FAQ_ITEMS } from '../../lib/landingHomeFaq'
import {
  B2B_CATEGORY_SHORT,
  B2B_CTA_DEMO,
  B2B_TRIAL_BADGE,
  B2B_CTA_TRIAL_SHORT,
  B2B_HERO_HEADLINE_CONVERSION,
  B2B_HERO_SUB_CONVERSION,
} from '../../lib/b2bPositioning'

/** Sticky CTA depends on viewport — keep client-only. */
const MobileStickyCta = dynamic(() => import('../MobileStickyCta'), { ssr: false });

/** Below-fold / heavy: code-split (react-best-practices bundle-dynamic-imports). */
const IntroVideo = dynamic(() => import('../IntroVideo'), { ssr: false });
const ChatSupportWidget = dynamic(() => import('../ChatSupportWidget'), { ssr: false });
const ProblemSection = dynamic(() => import('./ProblemSection'));
const HowItWorksHistorySection = dynamic(() => import('./HowItWorksHistorySection'));
const VehicleHistoryTimelineSection = dynamic(() => import('./VehicleHistoryTimelineSection'));
const VisualDamageSection = dynamic(() => import('./VisualDamageSection'));
const LiveDemoCarousel = dynamic(() => import('./LiveDemoCarousel'));
const IaFlowSlider = dynamic(() => import('./IaFlowSlider'));
const AudienceSection = dynamic(() => import('./AudienceSection'));
const FeaturesGridSection = dynamic(() => import('./FeaturesGridSection'));
const EvidenceContextSection = dynamic(() => import('./EvidenceContextSection'));
const DiffCompareSection = dynamic(() => import('./DiffCompareSection'));
const HeroBeforeAfter = dynamic(() => import('./HeroBeforeAfter'));
const VerifyYourselfSection = dynamic(() => import('./VerifyYourselfSection'));
const PricingSection = dynamic(() => import('../PricingSection'));
const SocialProofSection = dynamic(() => import('../SocialProofSection'));
const FAQSection = dynamic(() => import('../FAQSection'));
const SolutionEvidenceSection = dynamic(() => import('./SolutionEvidenceSection'));
const IntegritySection = dynamic(() => import('./IntegritySection'));
const RoiSection = dynamic(() => import('./RoiSection'));
const CnhSection = dynamic(() => import('./CnhSection'));
const EuConsigoProvarSection = dynamic(() => import('./EuConsigoProvarSection'));
const HeroMicroMessage = dynamic(() => import('./HeroMicroMessage'));
const ThreeStepsSection = dynamic(() => import('./ThreeStepsSection'));
const DefinitionsSection = dynamic(() => import('./DefinitionsSection'));
const PdfPreviewSection = dynamic(() => import('../PdfPreviewSection'));
const BlogTeaserSection = dynamic(() => import('../BlogTeaserSection'));
const FinalCtaSection = dynamic(() => import('../FinalCtaSection'));

function HeroCopy() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative"
      variants={reduceMotion ? undefined : heroCopyStage}
      initial={reduceMotion ? undefined : 'hidden'}
      animate={reduceMotion ? undefined : 'show'}
    >
      <div className="flex items-center gap-3">
        <LupaVehicleReveal size={48} className="hidden sm:inline-flex" />
        <p className="font-outfit text-2xl sm:text-3xl lg:text-4xl font-bold uppercase leading-[0.95] tracking-tight text-[var(--text-main)]">
          Danos Aparentes
        </p>
      </div>

      {reduceMotion ? (
        <h1 className="mt-5 text-xl max-[400px]:text-2xl sm:text-3xl lg:text-[2.35rem] tracking-tight font-semibold text-[var(--text-main)] leading-[1.12] sm:leading-[1.08] [text-wrap:balance] max-w-xl">
          {B2B_HERO_HEADLINE_CONVERSION}
        </h1>
      ) : (
        <GsapTextReveal
          as="h1"
          split="words"
          className="mt-5 text-xl max-[400px]:text-2xl sm:text-3xl lg:text-[2.35rem] tracking-tight font-semibold text-[var(--text-main)] leading-[1.12] sm:leading-[1.08] [text-wrap:balance] max-w-xl"
        >
          {B2B_HERO_HEADLINE_CONVERSION}
        </GsapTextReveal>
      )}

      {reduceMotion ? (
        <p className="mt-4 max-w-lg text-base lg:text-lg text-[var(--text-muted)] leading-relaxed">
          {B2B_HERO_SUB_CONVERSION}
        </p>
      ) : (
        <GsapSplitSubline
          as="p"
          delay={350}
          className="mt-4 max-w-lg text-base lg:text-lg text-[var(--text-muted)] leading-relaxed"
        >
          {B2B_HERO_SUB_CONVERSION}
        </GsapSplitSubline>
      )}


      <motion.div variants={reduceMotion ? undefined : heroCopyItem} className="pt-7 flex flex-wrap gap-3">
        <Link
          id="hero-primary-cta"
          href="/planos"
          className="group/cta cursor-pointer px-8 py-4 min-h-12 text-[var(--bg-main)] font-black rounded-xl shadow-2xl shadow-[var(--primary)]/25 inline-flex items-center gap-2.5 transition-colors duration-150 hover:opacity-95 active:opacity-90 focus-visible:ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--bg-main)] outline-none"
          style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
        >
          {B2B_CTA_TRIAL_SHORT}
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-150 group-hover/cta:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
        <a
          href="#demonstracao"
          className="px-6 py-4 min-h-12 rounded-xl border border-[var(--card-border)] text-sm font-bold text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] transition-colors focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none inline-flex items-center"
        >
          {B2B_CTA_DEMO}
        </a>
      </motion.div>

      <motion.p
        variants={reduceMotion ? undefined : heroCopyItem}
        className="mt-4 text-sm font-semibold text-[var(--text-muted)]"
      >
        {B2B_TRIAL_BADGE}
      </motion.p>

    </motion.div>
  );
}

export default function LandingPageClient() {
  const router = useRouter()
  // Começa indeterminado (null) para evitar hydration mismatch: o servidor
  // renderiza sempre o estado "neutro" e o tema real só é aplicado no cliente,
  // após ler localStorage / prefers-color-scheme no effect abaixo.
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  useGsapScrollAnimations();

  useEffect(() => {
    router.prefetch('/app')
  }, [router])

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const isDark = saved !== null ? saved !== 'false' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Adia um tick: evita setState sincrono no effect (cascata de renders).
    const t = setTimeout(() => setDarkMode(isDark), 0);
    return () => clearTimeout(t);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !(darkMode ?? true);
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('darkMode', String(nextDark));
  };

  return (
    <DirectionalTransition>
      <div className="min-h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 font-outfit overflow-y-auto flex flex-col relative selection:bg-primary selection:text-[var(--bg-main)]">
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo
      </a>





      <IntroVideo />

      <style dangerouslySetInnerHTML={{ __html: `
        summary::-webkit-details-marker {
          display: none;
        }
      `}} />

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div aria-hidden="true" className="bg-glow-orb bg-glow-orb-1 absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,170,255,0.18) 0%, transparent 70%)' }} />
        <div aria-hidden="true" className="bg-glow-orb bg-glow-orb-2 absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
      </div>

      <div aria-hidden="true" className="fixed inset-0 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />

      <header className="site-header w-full px-4 sm:px-8 py-5 flex justify-between items-center gap-3 z-50 shrink-0">
        <div className="gsap-header-item flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <Image
            src="/brand/logo-full-dark.svg"
            alt="Danos Aparentes"
            width={150}
            height={40}
            priority
            unoptimized
            className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.25)]"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link
            href="/verify"
            className="gsap-header-item hidden sm:inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] transition-colors focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none"
            title="Verificar autenticidade do dossiê"
          >
            <Image
              src="/icons/laudos-verify.svg"
              alt=""
              width={28}
              height={28}
              unoptimized
              className="h-6 w-6 sm:h-7 sm:w-7"
              aria-hidden
            />
            <span>Dossiês</span>
          </Link>
          <LandingTopNav />
          <nav className="flex items-center gap-2 sm:gap-4 shrink-0" aria-label="Ações da conta">
            <Link href="/app" prefetch className="gsap-header-item inline-flex text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] rounded-lg outline-none">
              Entrar
            </Link>
            <button
              onClick={toggleDarkMode}
              className="gsap-header-item shrink-0 p-2 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] rounded-xl transition-all outline-none cursor-pointer flex items-center justify-center"
              aria-label="Alternar tema"
            >
              <IconSunMoon isDark={darkMode ?? true} className={darkMode ? 'text-amber-400' : 'text-slate-400'} size={20} />
            </button>
            <LandingCtaLink
              eventSource="home"
              className="gsap-header-item px-3 sm:px-5 py-2 sm:py-2.5 bg-primary hover:bg-primary-hover text-[var(--bg-main)] text-xs sm:text-sm font-bold rounded-xl shadow-xl shadow-[var(--primary)]/15 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none"
            >
              <span className="sm:hidden">Grátis</span>
              <span className="hidden sm:inline">{B2B_CTA_TRIAL_SHORT}</span>
            </LandingCtaLink>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="hero-section gsap-hero-container flex-1 flex items-center justify-center px-4 sm:px-8 py-6 z-10 relative outline-none">
        <div className="sheet-frame max-w-7xl w-full">
          <span aria-hidden="true" className="crop-tr" />
          <span aria-hidden="true" className="crop-br" />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 sm:px-8 py-3 border-b border-[var(--card-border)] font-mono-data text-[11px] tracking-wider text-[var(--text-muted)] uppercase">
            <span className="text-[var(--signal-bright)] font-semibold">{B2B_CATEGORY_SHORT}</span>
            <span aria-hidden="true" className="text-[var(--card-border)]">/</span>
            <span>Memória digital permanente do veículo</span>
            <span className="ml-auto inline-flex items-center gap-2">
              <span aria-hidden="true" className="signal-dot w-1.5 h-1.5 rounded-full bg-[var(--signal-bright)] shadow-[0_0_8px_var(--signal-glow)]" />
              <span className="text-[var(--signal-bright)] font-semibold">Nova evidência · ABC1D23</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] items-stretch">
            <div className="flex flex-col justify-center px-5 sm:px-8 py-10 lg:py-14 lg:border-r border-[var(--card-border)]">
              <HeroCopy />
            </div>
            <div className="relative px-5 sm:px-8 py-8 lg:py-10 flex flex-col justify-center bg-[linear-gradient(160deg,transparent_40%,color-mix(in_srgb,var(--signal)_6%,transparent)_100%)]">
              <HeroBeforeAfter />
            </div>
          </div>
        </div>
      </main>

      <aside
        aria-label="Destaque de prova social"
        className="w-full z-10 relative border-y border-[var(--card-border)]/50 bg-[var(--panel-bg)]/70 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-5 text-center space-y-2">
          <p className="text-sm sm:text-base font-bold text-[var(--text-main)] leading-snug">
            “Zerou as discussões na devolução dos carros e evitou prejuízos.”
          </p>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Marcelo R., Gerente de Operações em Locadora —{' '}
            <a href="#prova-social" className="text-[var(--signal-bright)] hover:underline font-semibold">
              ver depoimentos
            </a>
          </p>
        </div>
      </aside>

      <VerifyYourselfSection />

      {/* Prova social no fluxo principal */}
      <HeroMicroMessage />
      <ThreeStepsSection />
      <DefinitionsSection />
      <section
        aria-label="Começar"
        className="w-full z-10 relative border-y border-[var(--card-border)]/50 bg-[var(--panel-bg)]/70 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto px-6 py-10 sm:py-12 flex flex-col items-center text-center gap-4">
          <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)]">
            Comece o histórico do seu primeiro veículo grátis.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Em quatro passos: <strong className="text-[var(--text-main)] font-semibold">comece grátis, cadastre o veículo, inspecione com evidências e gere o histórico</strong>. Registre, compare alterações e comprove tudo em minutos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              id="mid-page-cta"
              href="/planos"
              className="px-6 py-4 min-h-12 rounded-xl bg-primary hover:bg-primary-hover text-[var(--bg-main)] text-sm font-black shadow-xl shadow-[var(--primary)]/25 inline-flex items-center gap-2.5 transition-colors outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)]"
            >
              Começar grátis
            </Link>
            <a
              href="#como-funciona"
              className="px-6 py-4 min-h-12 rounded-xl border border-[var(--card-border)] text-sm font-bold text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] transition-colors inline-flex items-center outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)]"
            >
              Ver como funciona
            </a>
          </div>
        </div>
      </section>
      <SocialProofSection vertical="home" />
      <ProblemSection />
      <VehicleHistoryTimelineSection />
      <EuConsigoProvarSection />
      <HowItWorksHistorySection />
      <SolutionEvidenceSection />
      <VisualDamageSection />
      <LiveDemoCarousel />
      <IaFlowSlider />
      <DiffCompareSection />
      <EvidenceContextSection />
      <IntegritySection />
      <CnhSection />
      <RoiSection />
      <AudienceSection />
      <FeaturesGridSection />
      <PdfPreviewSection />
      <PricingSection />
      <FAQSection items={[...HOME_FAQ_ITEMS]} />
      <FinalCtaSection />
      <BlogTeaserSection />

      <MobileStickyCta heroCtaId="hero-primary-cta" eventSource="home" />
      <ChatSupportWidget segment="home" liftAboveMobileSticky />

      <footer className="w-full px-8 py-10 flex flex-col gap-8 text-[11px] font-semibold tracking-wide text-[var(--text-muted)] shrink-0 z-50 border-t border-[var(--card-border)]/20 bg-[var(--panel-bg)]">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8">
          <div>
            <p className="font-outfit text-xl font-bold text-[var(--text-main)] tracking-tight normal-case">
              Danos Aparentes
            </p>
            <p className="mt-1 font-mono-data text-[11px] tracking-[0.16em] text-[var(--signal-bright)] uppercase">
              Inteligência Histórica Veicular
            </p>
            <p className="mt-2 text-[12px] font-medium tracking-normal normal-case text-[var(--text-muted)] leading-relaxed">
              Não registra apenas uma inspeção — constrói a memória digital permanente de cada veículo.
            </p>
          </div>
          <nav
            aria-label="Links do rodapé"
            className="flex flex-wrap md:justify-end gap-x-5 gap-y-2 text-[12px] font-semibold tracking-normal normal-case"
          >
            <a href="#como-funciona" className="underline underline-offset-2 decoration-[var(--card-border)] hover:text-[var(--text-main)] hover:decoration-[var(--text-main)] transition-colors">Produto</a>
            <a href="#como-funciona" className="underline underline-offset-2 decoration-[var(--card-border)] hover:text-[var(--text-main)] hover:decoration-[var(--text-main)] transition-colors">Como funciona</a>
            <a href="#para-quem" className="underline underline-offset-2 decoration-[var(--card-border)] hover:text-[var(--text-main)] hover:decoration-[var(--text-main)] transition-colors">Para empresas</a>
            <a href="#recursos" className="underline underline-offset-2 decoration-[var(--card-border)] hover:text-[var(--text-main)] hover:decoration-[var(--text-main)] transition-colors">Recursos</a>
            <Link href="/suporte" className="underline underline-offset-2 decoration-[var(--card-border)] hover:text-[var(--text-main)] hover:decoration-[var(--text-main)] transition-colors">Contato</Link>
            <Link href="/termos" className="underline underline-offset-2 decoration-[var(--card-border)] hover:text-[var(--text-main)] hover:decoration-[var(--text-main)] transition-colors">Termos de uso</Link>
            <Link href="/privacidade" className="underline underline-offset-2 decoration-[var(--card-border)] hover:text-[var(--text-main)] hover:decoration-[var(--text-main)] transition-colors">Política de privacidade</Link>
            <Link href="/planos" className="underline underline-offset-2 decoration-[var(--card-border)] hover:text-[var(--text-main)] hover:decoration-[var(--text-main)] transition-colors">Planos</Link>
            <Link href="/blog" className="underline underline-offset-2 decoration-[var(--card-border)] hover:text-[var(--text-main)] hover:decoration-[var(--text-main)] transition-colors">Blog</Link>
            <Link href="/verify" className="underline underline-offset-2 decoration-[var(--card-border)] hover:text-[var(--text-main)] hover:decoration-[var(--text-main)] transition-colors">Verificar dossiê</Link>
          </nav>
        </div>

        <div className="w-full flex flex-col gap-2 text-center md:text-left text-[11px] font-medium tracking-normal normal-case border-t border-[var(--card-border)]/10 pt-6 text-[var(--text-muted)]">
          <p>
            <strong className="text-[var(--text-main)]">{LEGAL_COMPANY_NAME}</strong> | <strong className="text-[var(--text-main)]">CNPJ:</strong> {LEGAL_CNPJ} | <strong className="text-[var(--text-main)]">Contato:</strong>{' '}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-primary underline underline-offset-2 hover:opacity-90">{LEGAL_CONTACT_EMAIL}</a>
          </p>
          <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
            <strong className="text-[var(--text-main)]">Aviso de Isenção:</strong> A consulta de dados cadastrais de veículos por meio da placa é realizada de forma estritamente privada por meio de APIs parceiras para fins de preenchimento automatizado da Identidade do Veículo, não possuindo qualquer vínculo, representação ou convênio com o DETRAN, Denatran, órgãos governamentais ou entidades públicas.
          </p>
          <p className="mt-2 text-[var(--text-muted)]">© 2026 Danos Aparentes</p>
        </div>
      </footer>
    </div>
    </DirectionalTransition>
  )
}
