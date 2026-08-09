'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LandingCtaLink from './LandingCtaLink';
import { buttonVariants } from './ui/Button';
import { trackPixCtaClick } from '@/src/lib/analytics/events';
import { PLANS } from '@/src/lib/billing/plans';
import { whatsappLink } from '../lib/whatsapp';
import { openChatSupport } from '../lib/chatSupportWhatsapp';

function PlanCover({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="plan-text-anim relative -mx-8 -mt-8 mb-6 aspect-[16/9] overflow-hidden border-b border-[var(--card-border)]/40">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
        priority={false}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--card-bg,var(--bg-main))] via-transparent to-transparent opacity-80"
      />
    </div>
  );
}

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STARTER_BASE_PRICE = PLANS.starter.amountBrl;
const PRO_BASE_PRICE = PLANS.pro.amountBrl;

function formatPrice(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

// Cartões de plano (Starter + Pro + Corporativo) — usados na home (resumo) e em
// /planos (página completa). Conteúdo único, sem duplicar entre os dois.
//
// Animações distintas (fromTo + ScrollTrigger — evita card invisível após remount):
// Starter = entrada lateral suave | Pro = pop + brilho | Corporativo = slide firme + barra.
export default function PricingCards({ salesViaChat = false }: { salesViaChat?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const starterRef = useRef<HTMLDivElement>(null);
  const proRef = useRef<HTMLDivElement>(null);
  const proGlowRef = useRef<HTMLDivElement>(null);
  const corpRef = useRef<HTMLDivElement>(null);
  const corpBarRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const starter = starterRef.current;
      const pro = proRef.current;
      const corp = corpRef.current;
      const glow = proGlowRef.current;
      const bar = corpBarRef.current;
      const root = containerRef.current;
      if (!starter || !pro || !corp || !root) return;

      const cards = [starter, pro, corp];
      const mm = gsap.matchMedia();

      const showAll = () => {
        gsap.set(cards, { autoAlpha: 1, x: 0, y: 0, scale: 1, clearProps: 'transform' });
        if (glow) gsap.set(glow, { autoAlpha: 0.55, scale: 1 });
        if (bar) gsap.set(bar, { scaleX: 1, transformOrigin: 'left center' });
        gsap.set(root.querySelectorAll('.plan-text-anim'), { autoAlpha: 1, y: 0, scale: 1 });
      };

      mm.add('(prefers-reduced-motion: reduce)', () => {
        showAll();
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(starter, { autoAlpha: 0, x: -36, y: 8 });
        gsap.set(pro, { autoAlpha: 0, y: 32, scale: 0.9 });
        gsap.set(corp, { autoAlpha: 0, x: 36, y: 8 });
        if (glow) gsap.set(glow, { autoAlpha: 0, scale: 0.92 });
        if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });

        const textBits = root.querySelectorAll<HTMLElement>('.plan-text-anim');
        gsap.set(textBits, { autoAlpha: 0, y: 12 });
        const priceBits = root.querySelectorAll<HTMLElement>('.plan-price-anim');
        gsap.set(priceBits, { autoAlpha: 0, y: 16, scale: 0.92 });
        const markBits = root.querySelectorAll<HTMLElement>('.plan-mark-anim');
        gsap.set(markBits, { autoAlpha: 0, y: 8, scale: 0.96 });
        const featureBits = root.querySelectorAll<HTMLElement>('.plan-feature-anim');
        gsap.set(featureBits, { autoAlpha: 0, x: -8 });

        const failSafe = gsap.delayedCall(3.2, showAll);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top 85%',
            once: true,
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            failSafe.kill();
            gsap.set(cards, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
            gsap.set(textBits, { autoAlpha: 1, y: 0 });
            gsap.set(priceBits, { autoAlpha: 1, y: 0, scale: 1 });
            gsap.set(markBits, { autoAlpha: 1, y: 0, scale: 1 });
            gsap.set(featureBits, { autoAlpha: 1, x: 0 });
          },
        });

        tl.to(starter, { autoAlpha: 1, x: 0, y: 0, duration: 0.7, ease: 'power2.out' }, 0);
        tl.to(pro, { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'back.out(1.7)' }, 0.14);
        if (glow) {
          tl.to(glow, { autoAlpha: 0.55, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.35);
        }
        tl.to(corp, { autoAlpha: 1, x: 0, y: 0, duration: 0.8, ease: 'power4.out' }, 0.26);
        if (bar) {
          tl.to(bar, { scaleX: 1, duration: 0.45, ease: 'power3.out' }, 0.55);
        }
        tl.to(
          priceBits,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(1.4)' },
          0.45,
        );
        tl.to(textBits, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.04 }, 0.55);
        tl.to(
          markBits,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(1.5)' },
          0.7,
        );
        tl.to(
          featureBits,
          { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.035, ease: 'power2.out' },
          0.75,
        );

        return () => {
          failSafe.kill();
          tl.kill();
          showAll();
        };
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );
  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto overflow-x-clip">
      <PlanCard
        cardRef={starterRef}
        name="Starter"
        planId="starter"
        headline="Autônomo / Pequenas frotas"
        tagline="Ideal para quem está começando e quer organizar o pátio."
        basePrice={STARTER_BASE_PRICE}
        vistoriasLimit={PLANS.starter.laudosPerMonth!}
        popular={false}
        trialCtaLabel="Começar Teste Grátis"
        features={[
          `Até ${PLANS.starter.laudosPerMonth} vistorias por mês`,
          'Diagrama visual + Fotos',
          'Assinatura digital & GPS',
          'Funcionamento offline',
        ]}
      />

      <PlanCard
        cardRef={proRef}
        glowRef={proGlowRef}
        name="Pro"
        planId="pro"
        headline="Mais escolhido"
        tagline="Sua marca em destaque com vistorias ampliadas."
        basePrice={PRO_BASE_PRICE}
        vistoriasLimit={PLANS.pro.laudosPerMonth!}
        popular
        popularBadge="🏆 Melhor Custo-Benefício"
        trialCtaLabel="Testar Plano Pro Grátis"
        features={[
          'Tudo do Starter +',
          `Até ${PLANS.pro.laudosPerMonth} vistorias por mês`,
          'Sua logo e marca personalizada no PDF',
          'IA para descrição de avarias',
        ]}
      />

      <div
        ref={corpRef}
        className="glass-card flex flex-col justify-between p-8 relative overflow-hidden group border border-[var(--card-border)]/50 hover:border-[var(--primary)]/20 transition-all duration-300"
      >
        <div
          ref={corpBarRef}
          aria-hidden
          className="absolute top-0 left-0 w-full h-[3px] bg-[var(--primary)] z-10"
        />
        <div>
          <PlanCover src={PLANS.corporativo.imageSrc} alt={PLANS.corporativo.imageAlt} />
          <h3 className="plan-text-anim text-xl font-extrabold text-[var(--text-main)] tracking-wide">
            Frotas / Enterprise
          </h3>
          <p className="plan-text-anim text-xs font-extrabold uppercase tracking-wide text-[var(--signal-bright)] mt-1">
            Frotas e locadoras
          </p>
          <p className="plan-text-anim text-sm text-[var(--text-muted)] mt-1">
            Para grandes volumes, múltiplos usuários e integração.
          </p>

          <div className="my-6 min-h-[72px] flex flex-col justify-center">
            <span className="plan-price-anim text-3xl font-black text-[var(--text-main)] tracking-tight">
              Sob Consulta
            </span>
          </div>

          <ul className="space-y-3 border-t border-[var(--card-border)]/40 pt-5">
            {[
              'Vistorias ilimitadas / Usuários múltiplos',
              'Acesso via API & Suporte Dedicado',
              'SLA de atendimento prioritário',
            ].map((feat) => (
              <li key={feat} className="plan-feature-anim flex items-start gap-3 text-sm text-[var(--text-main)]">
                <span className="text-[var(--signal-bright)] mt-0.5" aria-hidden>
                  ✓
                </span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 space-y-3">
          {salesViaChat ? (
            <button
              type="button"
              onClick={() => openChatSupport({ intent: 'vendas', segment: 'home' })}
              className={buttonVariants({ variant: 'primary', size: 'lg', className: 'w-full shadow-lg shadow-[var(--primary)]/25' })}
            >
              Falar com Consultor
            </button>
          ) : (
            <a
              href={whatsappLink(
                'Olá! Quero falar com um consultor sobre o plano Frotas / Enterprise do Danos Aparentes.',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'primary', size: 'lg', className: 'w-full shadow-lg shadow-[var(--primary)]/25' })}
            >
              Falar com Consultor
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  cardRef,
  glowRef,
  name,
  planId,
  headline,
  tagline,
  basePrice,
  vistoriasLimit: _vistoriasLimit,
  popular,
  features,
  popularBadge,
  trialCtaLabel,
}: {
  cardRef?: React.Ref<HTMLDivElement>;
  glowRef?: React.RefObject<HTMLDivElement | null>;
  name: string;
  planId: 'starter' | 'pro';
  headline: string;
  tagline: string;
  basePrice: number;
  vistoriasLimit: number;
  popular: boolean;
  features: string[];
  popularBadge?: string;
  trialCtaLabel: string;
}) {
  const priceLabel = formatPrice(basePrice);
  void _vistoriasLimit;

  return (
    <div ref={cardRef} className="relative">
      {glowRef && (
        <div
          ref={glowRef}
          aria-hidden
          className="absolute -inset-3 rounded-2xl bg-[var(--primary)] blur-2xl opacity-0 -z-10 pointer-events-none"
        />
      )}
      <div
        className={`glass-card flex flex-col justify-between p-8 relative overflow-hidden group border transition-all duration-300 h-full ${
          popular
            ? 'border-[var(--primary)] border-2 shadow-[0_0_40px_var(--primary-glow)] ring-2 ring-[var(--primary)]/35'
            : 'border-[var(--card-border)]/50 hover:border-[var(--primary)]/20'
        }`}
      >
        {popular && (
          <div className="absolute top-0 right-0 z-10 bg-[var(--signal)] text-[#0a1628] text-[11px] font-black tracking-wider uppercase px-4 py-2 rounded-bl-xl shadow-lg shadow-[var(--signal-glow)] ring-2 ring-[var(--signal-bright)]">
            {popularBadge || 'Mais Popular'}
          </div>
        )}

        <div>
        <PlanCover src={PLANS[planId].imageSrc} alt={PLANS[planId].imageAlt} />
        <h3 className="plan-text-anim text-xl font-extrabold text-[var(--text-main)] tracking-wide">
          {name}
        </h3>
        <p className="plan-text-anim text-xs font-extrabold uppercase tracking-wide text-[var(--signal-bright)] mt-1">
          {headline}
        </p>
        <p className="plan-text-anim text-sm text-[var(--text-muted)] mt-1">{tagline}</p>

        <div className="my-6 min-h-[72px]">
          <div className="plan-price-anim text-4xl font-black text-[var(--primary)] tracking-tight">
            {priceLabel}
          </div>
          <span className="plan-text-anim text-sm text-[var(--text-muted)] ml-1">/mês</span>
        </div>

        <ul className="space-y-3 border-t border-[var(--card-border)]/40 pt-6">
          {features.map((feat) => (
            <li key={feat} className="plan-feature-anim flex items-start gap-3 text-sm text-[var(--text-main)]">
              <span className="text-[var(--signal-bright)] mt-0.5" aria-hidden>
                ✓
              </span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <LandingCtaLink
          id={`plan-${planId}-trial-cta`}
          eventSource="planos"
          className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })}
        >
          {trialCtaLabel}
        </LandingCtaLink>
        <p className="text-center text-sm text-[var(--text-muted)] mt-2">
          Sem cartão · cancele quando quiser
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/pagamento-cartao?plan=${planId}&autostart=1`}
            className={buttonVariants({ variant: 'secondary', size: 'md', className: 'w-full' })}
          >
            Assinar · {priceLabel}/mês
          </Link>
          <Link
            href={`/pagamento-pix?duration=1&plan=${planId}`}
            className="text-center text-xs font-bold text-[var(--text-muted)] hover:text-[var(--primary)] underline underline-offset-2 py-1"
            onClick={() =>
              trackPixCtaClick({
                source: 'planos',
                duration_months: 1,
                value: basePrice,
                currency: 'BRL',
              })
            }
          >
            Preferir PIX?
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
