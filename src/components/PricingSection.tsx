'use client';
import React from 'react';
import LandingCtaLink from './LandingCtaLink';

export default function PricingSection() {
  return (
    <section id="pricing" className="w-full max-w-5xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black tracking-widest text-primary uppercase mb-3">
          Planos e Preços
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-[var(--text-main)] to-[var(--text-muted)] bg-clip-text text-transparent">
          Escolha o Plano Ideal
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          7 dias grátis, sem cartão. Depois, menos de R$ 1,70 por dia no plano Pro.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
        {/* Plano Pro */}
        <div className="glass-card flex flex-col justify-between p-8 relative overflow-hidden group border border-[var(--primary)]/20 hover:border-[var(--primary)]/40 transition-all duration-300 shadow-[0_0_30px_var(--primary-glow)]">
          {/* Top decorative badge */}
          <div className="absolute top-0 right-0 bg-[var(--primary)] text-[var(--bg-main)] text-[10px] font-black tracking-wider uppercase px-4 py-1.5 rounded-bl-xl">
            Mais Popular
          </div>
          
          <div>
            <h3 className="text-xl font-extrabold text-[var(--text-main)] tracking-wide">Plano Pro</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Perfeito para vistoriadores autônomos e oficinas.</p>
            
            <div className="my-6">
              <span className="text-4xl font-black text-[var(--primary)] tracking-tight">R$ 49,90</span>
              <span className="text-sm text-[var(--text-muted)] ml-1">/ mês</span>
              <p className="text-[11px] text-[var(--text-muted)] mt-2 font-semibold">
                ≈ R$ 1,66/dia · custo de um único laudo terceirizado
              </p>
            </div>
            
            <ul className="space-y-3 border-t border-[var(--card-border)]/40 pt-6">
              {[
                'Vistorias offline e online ilimitadas',
                'PDF profissional com Hash SHA-256 de segurança',
                'Assinatura digital na tela do vistoriador e cliente',
                'Envio do laudo direto por WhatsApp com 1 clique',
                'Consulta automática de placas integrada',
                'Personalização de marca própria (Nome e Logotipo)',
                'Acesso ao painel de estatísticas e dashboard'
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-xs text-[var(--text-main)]">
                  <span className="text-[var(--primary)] mt-0.5">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-8">
            <LandingCtaLink className="block w-full py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--bg-main)] font-black text-center rounded-xl shadow-xl shadow-primary/10 transition-all active:scale-[0.99] outline-none">
              Testar 7 dias grátis
            </LandingCtaLink>
          </div>
        </div>

        {/* Plano Corporativo */}
        <div className="glass-card flex flex-col justify-between p-8 relative overflow-hidden group border border-[var(--card-border)]/50 hover:border-[var(--primary)]/20 transition-all duration-300">
          <div>
            <h3 className="text-xl font-extrabold text-[var(--text-main)] tracking-wide">Corporativo</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Para grandes frotistas, locadoras e concessionárias.</p>
            
            <div className="my-6">
              <span className="text-3xl font-black text-[var(--text-main)] tracking-tight">Consulte Conosco</span>
              <span className="text-sm text-[var(--text-muted)] block mt-1">Planos personalizados por volume</span>
            </div>
            
            <ul className="space-y-3 border-t border-[var(--card-border)]/40 pt-6">
              {[
                'Tudo do Plano Pro incluído',
                'Acesso para múltiplos vistoriadores e usuários',
                'Painel de gestão centralizado de equipes e laudos',
                'Estatísticas consolidadas por filial e vistoriador',
                'Integração via API com seu sistema ERP/CRM',
                'Customizações avançadas sob medida',
                'Suporte prioritário 24/7 com gerente de conta'
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-xs text-[var(--text-main)]">
                  <span className="text-[var(--primary)] mt-0.5">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-8">
            <a
              href="https://wa.me/5551999999999?text=Olá! Gostaria de saber mais sobre o plano Corporativo (Empresas) do app Danos Aparentes."
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3.5 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-main)] font-bold text-center rounded-xl transition-all active:scale-[0.99] outline-none"
            >
              Consulte Conosco
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
