'use client';

import { useState } from 'react';
import Image from 'next/image';
import Reveal from './Reveal';
import { IconCar, IconCamera, IconShieldCheck, IconSignature, IconBolt } from './ui/AnimatedIcons';

const REPORT_PAGES = [
  {
    id: 'page-1',
    pageNum: '01',
    title: 'Laudo Pericial & Diagrama de Avarias',
    subtitle: 'Dados do veículo, mapa vetorial com apontamento dos danos e tabela pericial detalhada.',
    src: '/Laudo/vistoria-XXXXXXX-_1_.png',
    width: 1240,
    height: 1754,
    badge: 'Laudo Principal',
  },
  {
    id: 'page-2',
    pageNum: '02',
    title: 'Anexo Fotográfico & Validação Digital',
    subtitle: 'Fotos em alta resolução do dano com coordenadas GPS, carimbo de data/hora e QR Code.',
    src: '/Laudo/verificao.png',
    width: 1240,
    height: 1754,
    badge: 'Evidências & Hash SHA-256',
  },
];

export default function PdfPreviewSection() {
  const [activeTab, setActiveTab] = useState<'all' | 'page-1' | 'page-2'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const visiblePages = activeTab === 'all'
    ? REPORT_PAGES
    : REPORT_PAGES.filter(p => p.id === activeTab);

  return (
    <section id="laudo" className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 z-10 relative border-t border-[var(--card-border)]/40 text-left scroll-mt-24">
      {/* Lightbox / Modal para Ampliar Imagem */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 transition-opacity animate-in fade-in"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-label="Visualização ampliada do laudo"
        >
          <div className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center bg-slate-900/90 text-white px-4 py-3 rounded-t-xl border-b border-slate-700">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--signal-bright)]">
                Relatório Oficial Danos Aparentes — Visualização em Alta Resolução
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold rounded-lg transition-colors cursor-pointer"
              >
                ✕ Fechar [Esc]
              </button>
            </div>
            <div className="bg-slate-950 p-2 sm:p-4 rounded-b-xl border border-slate-800 w-full flex justify-center">
              <img
                src={selectedImage}
                alt="Visualização ampliada do laudo de vistoria"
                className="max-h-[82vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho da Seção */}
      <Reveal className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-3">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Modelo Oficial de Laudo
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] max-w-4xl">
          Laudo Pericial Inviolável: <span className="text-[var(--signal-bright)]">Transparência Total em 2 Páginas</span>
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-muted)] mt-4 max-w-2xl leading-relaxed">
          Veja a estrutura real gerada pelo aplicativo. Documentação técnica aceita por seguradoras, frotistas e locadoras — pronta para envio por WhatsApp ou e-mail.
        </p>

        {/* Seleção de Abas / Páginas */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-[var(--panel-bg)] border border-[var(--card-border)] rounded-2xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-lg shadow-[var(--primary)]/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
          >
            Ver 2 Páginas Lado a Lado
          </button>
          <button
            onClick={() => setActiveTab('page-1')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'page-1'
                ? 'bg-primary text-white shadow-lg shadow-[var(--primary)]/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
          >
            Página 1 · Laudo & Diagrama
          </button>
          <button
            onClick={() => setActiveTab('page-2')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'page-2'
                ? 'bg-primary text-white shadow-lg shadow-[var(--primary)]/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
          >
            Página 2 · Evidências & QR Code
          </button>
        </div>
      </Reveal>

      {/* Grid Principal: Imagens dos 2 PNGs + Texto Impactante */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Coluna de Exibição das Imagens (PNGs do Laudo) */}
        <div className="lg:col-span-7 space-y-8">
          <div className={`grid gap-6 ${activeTab === 'all' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-xl mx-auto'}`}>
            {visiblePages.map((page) => (
              <div
                key={page.id}
                onClick={() => setSelectedImage(page.src)}
                className="group relative bg-[var(--panel-bg)] border border-[var(--card-border)] hover:border-[var(--signal-bright)]/60 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-[0_12px_40px_-10px_var(--signal-glow)] cursor-pointer flex flex-col"
              >
                {/* Header da Carta */}
                <div className="px-4 py-3 bg-[var(--bg-main)] border-b border-[var(--card-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data text-xs font-bold text-[var(--signal-bright)] px-2 py-0.5 rounded bg-[var(--signal-bright)]/10 border border-[var(--signal-bright)]/20">
                      PÁG. {page.pageNum}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-main)] truncate max-w-[180px] sm:max-w-none">
                      {page.badge}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-data text-[var(--text-muted)] group-hover:text-[var(--signal-bright)] transition-colors">
                    🔍 Ampliar
                  </span>
                </div>

                {/* Container da Imagem com Efeito Hover e Scanner Laser */}
                <div className="pdf-scan-container relative w-full aspect-[1/1.41] bg-slate-900/50 overflow-hidden flex items-center justify-center p-2">
                  <div className="pdf-scan-line" />
                  <img
                    src={page.src}
                    alt={page.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain rounded transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {/* Badge Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-4 py-2 bg-slate-950/90 text-white font-bold text-xs rounded-xl border border-slate-700 shadow-2xl flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                      Clique para expandir em HD
                    </span>
                  </div>
                </div>

                {/* Rodapé da Carta */}
                <div className="p-4 bg-[var(--panel-bg)] border-t border-[var(--card-border)] flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-tight">{page.title}</h4>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{page.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Botões de Acesso aos PDFs de Exemplo */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="/exemplos/modelo-relatorio-vistoria-veicular.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 hover:border-sky-500/50 transition-all shadow-md focus-visible:ring-2 ring-[var(--primary)] outline-none"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>
              Baixar Modelo PDF 1 (Relatório Pericial)
            </a>
            <a
              href="/exemplos/modelo-verificacao-autenticidade.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all shadow-md focus-visible:ring-2 ring-emerald-500 outline-none"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>
              Baixar Modelo PDF 2 (Certificado de Autenticidade)
            </a>
          </div>
        </div>

        {/* Coluna Direita: Texto Impactante mostrando a força do laudo */}
        <div className="lg:col-span-5 space-y-6">
          <Reveal className="space-y-4">
            <span className="text-[11px] font-mono-data uppercase tracking-widest text-[var(--signal-bright)] font-bold">
              Por que este laudo transforma sua operação?
            </span>
            <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight leading-[1.05] text-[var(--text-main)]">
              Chega de Discussões: <span className="text-[var(--signal-bright)]">Prova Pericial Irrefutável</span> na Mão do Cliente
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              O relatório do <strong className="text-[var(--text-main)]">Danos Aparentes</strong> substitui as antigas planilhas e fichas de papel por um certificado digital de alto padrão. Cada laudo é gerado em segundos e traz tudo o que você precisa para respaldar cobranças e proteger seu patrimônio.
            </p>
          </Reveal>

          {/* Lista de Diferenciais Impactantes */}
          <div className="space-y-4 pt-2">
            {[
              {
                icon: <IconCar size={22} className="text-sky-400" />,
                title: 'Mapeamento Visual por Diagrama Interativo',
                desc: 'Identificação cirúrgica de cada avaria (riscos, amassados, quebras) marcada diretamente na área vetorial do veículo. Impossível haver ambiguidade sobre onde o dano ocorreu.',
              },
              {
                icon: <IconCamera size={22} className="text-emerald-400" />,
                title: 'Fotos HD com Carimbo Temporal e GPS Inalterável',
                desc: 'Cada imagem anexada recebe automaticamente marca d’água com data, hora exata e coordenadas geográficas de onde a vistoria foi realizada, garantindo veracidade absoluta.',
              },
              {
                icon: <IconShieldCheck size={22} className="text-purple-400" />,
                title: 'Assinatura Criptográfica SHA-256 e QR Code',
                desc: 'Garantia total contra adulterações. O QR Code permite que clientes, parceiros e seguradoras validem a autenticidade do laudo original na nuvem em qualquer smartphone.',
              },
              {
                icon: <IconSignature size={22} className="text-amber-400" />,
                title: 'Coleta de Assinatura Digital na Tela',
                desc: 'Vistoriador e cliente assinam diretamente no celular antes da entrega ou devolução do veículo, formalizando a concordância mútua sem imprimir uma única folha de papel.',
              },
              {
                icon: <IconBolt size={22} className="text-yellow-400" />,
                title: 'Envio Instantâneo via WhatsApp em PDF',
                desc: 'Assim que finalizado, o laudo em PDF de alta qualidade é formatado e pode ser enviado com um único toque diretamente no WhatsApp do cliente.',
              },
            ].map((item, idx) => (
              <Reveal key={idx} delay={idx * 60}>
                <div className="p-4 rounded-xl bg-[var(--panel-bg)] border border-[var(--card-border)] hover:border-[var(--sheet-line)] transition-colors duration-200 flex items-start gap-3.5">
                  <span className="shrink-0 p-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--card-border)] flex items-center justify-center">{item.icon}</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--text-main)] tracking-tight">{item.title}</h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Destaque do Call to Action curto */}
          <Reveal delay={300} className="pt-4">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-sky-500/10 to-transparent border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase text-[var(--text-main)]">Quer ver seu logotipo neste laudo?</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Personalize o cabeçalho com a sua marca e cores institucionais.</p>
              </div>
              <a
                href="/app"
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 transition-all shrink-0 cursor-pointer"
              >
                Gerar Meu Primeiro Laudo
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

