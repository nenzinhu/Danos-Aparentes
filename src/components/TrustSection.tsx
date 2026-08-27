'use client';
import React from 'react';
import Reveal from './Reveal';
import {
  LEGAL_CNPJ,
  LEGAL_COMPANY_NAME,
  LEGAL_CONTACT_EMAIL,
} from './LegalContent';
import { IconShieldCheck, IconSignature, IconGps, IconDocument, IconShieldCheck as IconCert } from './ui/AnimatedIcons';

const TRUST_ITEMS = [
  {
    k: 'Integridade',
    icon: <IconShieldCheck className="text-[var(--primary)]" size={24} />,
    title: 'Hash SHA-256 em cada laudo',
    desc: 'Todo PDF gerado carrega um código único de verificação. Se o arquivo for alterado depois da emissão, o hash deixa de bater — útil para conferir a integridade do documento.',
  },
  {
    k: 'Autenticação',
    icon: <IconSignature className="text-[var(--success)]" size={24} />,
    title: 'Assinatura digital na tela',
    desc: 'Vistoriador e cliente assinam com o dedo, no próprio celular, no momento da vistoria. Sem impressão, sem "assino depois".',
  },
  {
    k: 'Rastreabilidade',
    icon: <IconGps className="text-[var(--signal)]" size={24} />,
    title: 'Fotos com GPS e timestamp',
    desc: 'Cada foto anexada pode guardar local e horário de captura, adicionando contexto de quando e onde o registro foi feito.',
  },
];

function TrustCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card p-8 border border-[var(--card-border)]/50 relative group h-full flex flex-col justify-between">
      {children}
    </div>
  );
}

export default function TrustSection() {
  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-4 text-left">
      <Reveal className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Contexto e verificação
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)]">
          Documente o estado do veículo com informações{' '}
          <span className="text-[var(--signal-bright)]">organizadas e verificáveis</span>
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-3 max-w-xl">
          Mais contexto e evidências para reduzir disputas. Hash, assinatura, GPS e verificação pública
          ajudam a organizar o registro — para locadora, oficina e frota não dependerem só da memória.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TRUST_ITEMS.map((item, idx) => (
          <Reveal
            key={item.k}
            delay={idx * 70}
          >
            <TrustCard>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--signal-bright)]">
                    {item.k}
                  </span>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-[var(--text-main)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            </TrustCard>
          </Reveal>
        ))}
      </div>

      {/* Acesso rápido aos 2 modelos em PDF: Laudo + Certificado de Autenticidade */}
      <Reveal delay={180} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs font-bold font-mono-data text-[var(--text-muted)] uppercase tracking-wider">
          Exemplos em PDF para baixar:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href="/exemplos/modelo-relatorio-vistoria-veicular.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all"
          >
            <IconDocument size={14} className="text-[var(--primary)]" /> PDF 1 · Laudo de Vistoria
          </a>
          <a
            href="/exemplos/modelo-verificacao-autenticidade.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)]/20 transition-all"
          >
            <IconShieldCheck size={14} className="text-[var(--success)]" /> PDF 2 · Certificado de Autenticidade
          </a>
          <a
            href="/verify"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-main)] hover:border-[var(--sheet-line)] transition-all"
          >
            Verificar um laudo →
          </a>
        </div>
      </Reveal>

      <Reveal delay={220} className="glass-card mt-8 p-6 sm:p-8 border border-[var(--card-border)]/50 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="shrink-0 grid place-items-center w-12 h-12 rounded-full border border-[var(--sheet-line)] font-mono-data text-lg text-[var(--signal-bright)]">
          DA
        </div>
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Quem responde por este produto</p>
          <p className="text-sm text-[var(--text-main)]">
            <strong className="font-semibold">{LEGAL_COMPANY_NAME}</strong> — CNPJ {LEGAL_CNPJ}.{' '}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-primary hover:underline">{LEGAL_CONTACT_EMAIL}</a>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
