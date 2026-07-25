'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import LandingCtaLink from './LandingCtaLink';
import { buttonVariants } from './ui/Button';
import { trackPixCtaClick } from '@/src/lib/analytics/events';
import { whatsappLink } from '../lib/whatsapp';

type PaymentMethod = 'cartao' | 'pix';

const STARTER_BASE_PRICE = 29.9;
const PRO_BASE_PRICE = 49.9;

function formatPrice(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

// Cartões de plano (Starter + Pro + Corporativo) — usados na home (resumo) e em
// /planos (página completa). Conteúdo único, sem duplicar entre os dois.
export default function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
      <PlanCard
        name="Starter"
        planId="starter"
        tagline="Para quem está começando ou faz vistorias esporádicas."
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
        name="Pro"
        planId="pro"
        tagline="Perfeito para vistoriadores autônomos e oficinas com volume maior."
        basePrice={PRO_BASE_PRICE}
        laudosLimit={80}
        popular
        features={[
          'Até 80 laudos em PDF por mês',
          'Tudo do plano Starter incluído',
          'Personalização de marca própria (Nome e Logotipo)',
          'Acesso ao painel de estatísticas e dashboard',
          'Modelos de layout de PDF adicionais',
          'Suporte com prioridade',
        ]}
      />

      {/* Plano Corporativo */}
      <div className="glass-card flex flex-col justify-between p-8 relative overflow-hidden group border border-[var(--card-border)]/50 hover:border-[var(--primary)]/20 transition-all duration-300">
        <div>
          <h3 className="text-xl font-extrabold text-[var(--text-main)] tracking-wide">Corporativo</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">Para grandes frotistas, locadoras e concessionárias.</p>

          <div className="my-6 min-h-[92px] flex flex-col justify-center">
            <span className="text-3xl font-black text-[var(--text-main)] tracking-tight">Consulte agora mesmo</span>
            <span className="text-sm text-[var(--text-muted)] block mt-1">Laudos ilimitados · planos personalizados por volume</span>
          </div>

          <ul className="space-y-3 border-t border-[var(--card-border)]/40 pt-6">
            {[
              'Laudos em PDF ilimitados',
              'Tudo do Plano Pro incluído',
              'Acesso para múltiplos vistoriadores e usuários',
              'Painel de gestão centralizado de equipes e laudos',
              'Estatísticas consolidadas por filial e vistoriador',
              'Integração via API com seu sistema ERP/CRM',
              'Customizações avançadas sob medida',
              'Suporte prioritário 24/7 com gerente de conta',
            ].map((feat) => (
              <li key={feat} className="flex items-start gap-3 text-xs text-[var(--text-main)]">
                <span className="text-[var(--signal-bright)] mt-0.5">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <a
            href={whatsappLink('Olá! Gostaria de saber mais sobre o plano Corporativo (Empresas) do app Danos Aparentes.')}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'secondary', size: 'md', className: 'w-full' })}
          >
            Consulte agora mesmo
          </a>
          <p className="text-center text-[11px] text-[var(--text-muted)] mt-3">
            Preço sob consulta porque varia por volume e integrações — resposta em minutos.
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
  name,
  planId,
  tagline,
  basePrice,
  laudosLimit,
  popular,
  features,
}: {
  name: string;
  planId: 'starter' | 'pro';
  tagline: string;
  basePrice: number;
  laudosLimit: number;
  popular: boolean;
  features: string[];
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cartao');
  const [durationMonths, setDurationMonths] = useState<number>(1);

  const price = paymentMethod === 'pix' ? basePrice * durationMonths : basePrice;
  const priceLabel = formatPrice(price);
  const perDay = basePrice / 30;

  return (
    <div
      className={`glass-card flex flex-col justify-between p-8 relative overflow-hidden group border transition-all duration-300 ${
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
        <h3 className="text-xl font-extrabold text-[var(--text-main)] tracking-wide">Plano {name}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">{tagline}</p>

        <div className="my-6 min-h-[92px]">
          <div className="text-4xl font-black text-[var(--primary)] tracking-tight">{priceLabel}</div>
          <span className="text-sm text-[var(--text-muted)] ml-1">
            {paymentMethod === 'pix' ? `/ ${durationMonths} mês${durationMonths > 1 ? 'es' : ''}` : '/ mês'}
          </span>
          <p className="text-[11px] text-[var(--text-muted)] mt-2 font-semibold">
            ≈ {formatPrice(perDay)}/dia · até {laudosLimit} laudos em PDF por mês
          </p>
        </div>

        <ul className="space-y-3 border-t border-[var(--card-border)]/40 pt-6">
          {features.map((feat) => (
            <li key={feat} className="flex items-start gap-3 text-xs text-[var(--text-main)]">
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
            className={`text-xs font-bold py-2 rounded-md transition-colors ${
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
            className={`text-xs font-bold py-2 rounded-md transition-colors ${
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
                  className={`rounded-lg border py-2 text-xs font-bold transition-colors ${
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
            <LandingCtaLink className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })}>
              Testar 7 dias grátis
            </LandingCtaLink>
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
  );
}
