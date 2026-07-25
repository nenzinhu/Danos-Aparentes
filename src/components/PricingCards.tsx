'use client';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LandingCtaLink from './LandingCtaLink';
import { buttonVariants } from './ui/Button';
import { trackPixCtaClick } from '@/src/lib/analytics/events';
import { whatsappLink } from '../lib/whatsapp';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type PaymentMethod = 'cartao' | 'pix';

const STARTER_BASE_PRICE = 29.9;
const PRO_BASE_PRICE = 49.9;

const CORP_TIERS = [
  { name: 'Start', users: 'até 5 usuários', price: 'R$ 299' },
  { name: 'Growth', users: 'até 15 usuários', price: 'R$ 699' },
  { name: 'Enterprise', users: '15+ · API · SLA', price: 'a partir de R$ 1.490' },
] as const;

function formatPrice(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatPerLaudo(basePrice: number, laudosLimit: number) {
  const per = basePrice / laudosLimit;
  return `R$ ${per.toFixed(2).replace('.', ',')}`;
}

// Cartões de plano (Starter + Pro + Corporativo) — usados na home (resumo) e em
// /planos (página completa). Conteúdo único, sem duplicar entre os dois.
//
// Animações distintas (fromTo + ScrollTrigger — evita card invisível após remount):
// Starter = entrada lateral suave | Pro = pop + brilho | Corporativo = slide firme + barra.
export default function PricingCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const starterRef = useRef<HTMLDivElement>(null);
  const proRef = useRef<HTMLDivElement>(null);
  const proGlowRef = useRef<HTMLDivElement>(null);
  const corpRef = useRef<HTMLDivElement>(null);
  const corpBarRef = useRef<HTMLDivElement>(null);
  const corpTierRefs = useRef<(HTMLLIElement | null)[]>([]);

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

      // Sempre garantir visibilidade se o usuário prefere menos movimento
      // ou se um remount matar a timeline no meio (bug clássico do .from).
      const showAll = () => {
        gsap.set(cards, { autoAlpha: 1, x: 0, y: 0, scale: 1, clearProps: 'transform' });
        if (glow) gsap.set(glow, { autoAlpha: 0.55, scale: 1 });
        if (bar) gsap.set(bar, { scaleX: 1, transformOrigin: 'left center' });
        const tiers = corpTierRefs.current.filter(Boolean);
        if (tiers.length) gsap.set(tiers, { autoAlpha: 1, y: 0 });
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
        const tiers = corpTierRefs.current.filter(Boolean) as HTMLLIElement[];
        if (tiers.length) gsap.set(tiers, { autoAlpha: 0, y: 10 });

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

        // Starter — lateral esquerda, neutro
        tl.to(starter, { autoAlpha: 1, x: 0, y: 0, duration: 0.7, ease: 'power2.out' }, 0);

        // Pro — pop + glow
        tl.to(pro, { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'back.out(1.7)' }, 0.14);

        if (glow) {
          tl.to(glow, { autoAlpha: 0.7, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.35);
          gsap.to(glow, {
            autoAlpha: 1,
            scale: 1.05,
            duration: 1.8,
            delay: 1.1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        // Corporativo — lateral direita + barra + faixas
        tl.to(corp, { autoAlpha: 1, x: 0, y: 0, duration: 0.8, ease: 'power4.out' }, 0.26);

        if (bar) {
          tl.to(bar, { scaleX: 1, duration: 0.45, ease: 'power3.out' }, 0.55);
        }

        if (tiers.length) {
          tl.to(tiers, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, 0.65);
        }

        // Textos internos — preços em destaque, métricas, features
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

        // Pulso suave nos destaques (R$/laudo, marca, faixas)
        markBits.forEach((el, i) => {
          gsap.to(el, {
            textShadow: '0 0 14px color-mix(in srgb, var(--primary) 40%, transparent)',
            duration: 1.5,
            delay: 1.4 + i * 0.12,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        });

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
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
      <PlanCard
        cardRef={starterRef}
        name="Starter"
        planId="starter"
        tagline="Porta de entrada — vistorias esporádicas sem compromisso grande."
        basePrice={STARTER_BASE_PRICE}
        laudosLimit={20}
        popular={false}
        features={[
          'Até 20 laudos em PDF por mês',
          'Vistorias offline e online',
          'PDF profissional com Hash SHA-256 de segurança',
          'Assinatura digital na tela do vistoriador e cliente',
          'Consulta automática de placas integrada',
          'Envio do laudo direto por WhatsApp com 1 clique',
        ]}
      />

      <PlanCard
        cardRef={proRef}
        glowRef={proGlowRef}
        name="Pro"
        planId="pro"
        tagline="4× mais laudos que o Starter por menos de 2× o preço — com a sua marca."
        basePrice={PRO_BASE_PRICE}
        laudosLimit={80}
        popular
        highlightNote="Mais escolhido: laudo com logo e nome da empresa"
        features={[
          'Até 80 laudos em PDF por mês',
          'Tudo do plano Starter incluído',
          'Personalização de marca própria (nome e logotipo no PDF)',
          'Acesso ao painel de estatísticas e dashboard',
          'Modelos de layout de PDF adicionais',
          'Suporte com prioridade',
        ]}
      />

      {/* Plano Corporativo — faixas âncora para não negociar do zero */}
      <div
        ref={corpRef}
        className="glass-card flex flex-col justify-between p-8 relative overflow-hidden group border border-[var(--card-border)]/50 hover:border-[var(--primary)]/20 transition-all duration-300"
      >
        <div
          ref={corpBarRef}
          aria-hidden
          className="absolute top-0 left-0 w-full h-[3px] bg-[var(--primary)]"
        />
        <div>
          <h3 className="plan-text-anim text-xl font-extrabold text-[var(--text-main)] tracking-wide">
            Corporativo
          </h3>
          <p className="plan-text-anim text-xs text-[var(--text-muted)] mt-1">
            Padronize a vistoria em todas as bases — frota, locadora e rede.
          </p>

          <div className="my-6 min-h-[92px] flex flex-col justify-center">
            <span className="plan-price-anim text-3xl font-black text-[var(--text-main)] tracking-tight">
              A partir de{' '}
              <span className="plan-mark-anim text-[var(--primary)]">R$ 299</span>
            </span>
            <span className="plan-text-anim text-sm text-[var(--text-muted)] block mt-1">
              / mês · laudos ilimitados · por volume de usuários
            </span>
          </div>

          <ul className="space-y-2.5 border-t border-[var(--card-border)]/40 pt-5 mb-5">
            {CORP_TIERS.map((tier, i) => (
              <li
                key={tier.name}
                ref={(el) => {
                  corpTierRefs.current[i] = el;
                }}
                className="flex items-center justify-between gap-3 text-xs rounded-lg border border-[var(--card-border)]/50 bg-[var(--bg-main)]/40 px-3 py-2.5"
              >
                <span>
                  <span className="font-extrabold text-[var(--text-main)]">{tier.name}</span>
                  <span className="text-[var(--text-muted)] block mt-0.5">{tier.users}</span>
                </span>
                <span className="plan-mark-anim font-black text-[var(--primary)] whitespace-nowrap shrink-0">
                  {tier.price}
                </span>
              </li>
            ))}
          </ul>

          <ul className="space-y-3 border-t border-[var(--card-border)]/40 pt-5">
            {[
              'Laudos em PDF ilimitados',
              'Tudo do Plano Pro incluído (marca no PDF)',
              'Múltiplos vistoriadores e usuários',
              'Painel centralizado de equipes e laudos',
              'Estatísticas por filial e vistoriador',
              'Integração via API (faixa Enterprise)',
              'Suporte prioritário com gerente de conta',
            ].map((feat) => (
              <li key={feat} className="plan-feature-anim flex items-start gap-3 text-xs text-[var(--text-main)]">
                <span className="text-[var(--signal-bright)] mt-0.5">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <a
            href={whatsappLink(
              'Olá! Quero o plano Corporativo do Danos Aparentes. Interesse nas faixas: Start R$ 299 (até 5), Growth R$ 699 (até 15) ou Enterprise a partir de R$ 1.490.',
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'secondary', size: 'md', className: 'w-full' })}
          >
            Falar sobre Corporativo
          </a>
          <p className="text-center text-[11px] text-[var(--text-muted)] mt-3">
            Faixas publicadas — fechamos volume e integrações em minutos no WhatsApp.
          </p>
          <p className="text-center text-[11px] mt-1.5">
            <Link href="/locadoras" className="font-bold text-[var(--primary)] hover:underline">
              Veja como funciona para locadoras e frotas →
            </Link>
          </p>
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
  tagline,
  basePrice,
  laudosLimit,
  popular,
  features,
  highlightNote,
}: {
  cardRef?: React.Ref<HTMLDivElement>;
  glowRef?: React.RefObject<HTMLDivElement | null>;
  name: string;
  planId: 'starter' | 'pro';
  tagline: string;
  basePrice: number;
  laudosLimit: number;
  popular: boolean;
  features: string[];
  highlightNote?: string;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cartao');
  const [durationMonths, setDurationMonths] = useState<number>(1);

  const price = paymentMethod === 'pix' ? basePrice * durationMonths : basePrice;
  const priceLabel = formatPrice(price);
  const perDay = basePrice / 30;
  const perLaudo = formatPerLaudo(basePrice, laudosLimit);

  return (
    <div ref={cardRef} className="relative">
      {glowRef && (
        <div
          ref={glowRef}
          aria-hidden
          className="absolute -inset-3 rounded-3xl bg-[var(--primary)] blur-2xl opacity-0 -z-10 pointer-events-none"
        />
      )}
      <div
        className={`glass-card flex flex-col justify-between p-8 relative overflow-hidden group border transition-all duration-300 h-full ${
          popular
            ? 'border-[var(--primary)]/20 hover:border-[var(--primary)]/40 shadow-[0_0_30px_var(--primary-glow)]'
            : 'border-[var(--card-border)]/50 hover:border-[var(--primary)]/20'
        }`}
      >
        {popular && (
          <div className="absolute top-0 right-0 bg-[var(--primary)] text-[var(--bg-main)] text-[10px] font-black tracking-wider uppercase px-4 py-1.5 rounded-bl-xl">
            Mais Popular
          </div>
        )}

        <div>
        <h3 className="plan-text-anim text-xl font-extrabold text-[var(--text-main)] tracking-wide">
          Plano {name}
        </h3>
        <p className="plan-text-anim text-xs text-[var(--text-muted)] mt-1">{tagline}</p>

        <div className="my-6 min-h-[92px]">
          <div className="plan-price-anim text-4xl font-black text-[var(--primary)] tracking-tight">
            {priceLabel}
          </div>
          <span className="plan-text-anim text-sm text-[var(--text-muted)] ml-1">
            {paymentMethod === 'pix' ? `/ ${durationMonths} mês${durationMonths > 1 ? 'es' : ''}` : '/ mês'}
          </span>
          <p className="plan-text-anim text-[11px] text-[var(--text-muted)] mt-2 font-semibold">
            ≈ {formatPrice(perDay)}/dia · até {laudosLimit} laudos/mês · ≈{' '}
            <span className="plan-mark-anim text-[var(--text-main)] font-extrabold">{perLaudo}/laudo</span>
          </p>
          {highlightNote && (
            <p className="plan-mark-anim text-[11px] text-[var(--signal-bright)] mt-1.5 font-bold leading-snug">
              {highlightNote}
            </p>
          )}
        </div>

        <ul className="space-y-3 border-t border-[var(--card-border)]/40 pt-6">
          {features.map((feat) => (
            <li key={feat} className="plan-feature-anim flex items-start gap-3 text-xs text-[var(--text-main)]">
              <span className="text-[var(--signal-bright)] mt-0.5">✓</span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <div
          role="tablist"
          aria-label="Forma de pagamento"
          className="grid grid-cols-2 gap-1 p-1 mb-3 rounded-lg bg-[var(--bg-main)] border border-[var(--card-border)]/40"
        >
          <button
            type="button"
            role="tab"
            aria-selected={paymentMethod === 'cartao'}
            onClick={() => setPaymentMethod('cartao')}
            className={`min-h-11 sm:min-h-9 text-xs font-bold py-2 rounded-md transition-colors ${
              paymentMethod === 'cartao'
                ? 'bg-[var(--primary)] text-[var(--bg-main)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Cartão
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={paymentMethod === 'pix'}
            onClick={() => setPaymentMethod('pix')}
            className={`min-h-11 sm:min-h-9 text-xs font-bold py-2 rounded-md transition-colors ${
              paymentMethod === 'pix'
                ? 'bg-[var(--primary)] text-[var(--bg-main)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            PIX
          </button>
        </div>

        {paymentMethod === 'pix' && (
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-2">
              Quantos meses?
            </p>
            <div className="grid grid-cols-4 gap-2" role="group" aria-label="Duração do PIX">
              {[1, 3, 6, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMonths(m)}
                  className={`min-h-11 sm:min-h-9 rounded-lg border py-2 text-xs font-bold transition-colors ${
                    durationMonths === m
                      ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]'
                      : 'border-[var(--card-border)] text-[var(--text-muted)]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {paymentMethod === 'cartao' ? (
          <>
            <Link
              href={`/pagamento-cartao?plan=${planId}&autostart=1`}
              className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })}
            >
              Assinar com cartão · {formatPrice(basePrice)}/mês
            </Link>
            <p className="text-center text-[11px] text-[var(--text-muted)] mt-3">
              <Link
                href={`/pagamento-pix?duration=1&plan=${planId}`}
                className="font-bold text-[var(--primary)] hover:underline"
                onClick={() => trackPixCtaClick({ source: 'trial_link', duration_months: 1 })}
              >
                Prefere PIX? Pague agora sem cartão
              </Link>
            </p>
            <p className="text-center text-[11px] text-[var(--text-muted)] mt-2">
              <LandingCtaLink className="font-bold text-[var(--primary)] hover:underline">
                Ou testar 7 dias grátis sem cartão
              </LandingCtaLink>
            </p>
            <p className="text-center text-[11px] text-[var(--text-muted)] mt-2">
              Cancele quando quiser, sem multa e sem burocracia.
            </p>
          </>
        ) : (
          <>
            <Link
              href={`/pagamento-pix?duration=${durationMonths}&plan=${planId}`}
              className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })}
              onClick={() =>
                trackPixCtaClick({
                  source: 'planos',
                  duration_months: durationMonths,
                  value: price,
                  currency: 'BRL',
                })
              }
            >
              Pagar com PIX · {priceLabel}
            </Link>
            <p className="text-center text-[11px] text-[var(--text-muted)] mt-3">
              Gera um QR Code na hora, sem cartão de crédito.
            </p>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
