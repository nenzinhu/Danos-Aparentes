import React from 'react'
import Image from 'next/image'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import VehicleViewsDemo from '@/src/components/blog/VehicleViewsDemo'
import { BlogVideo } from '@/src/components/blog/BlogVideo'
import LandingCtaLink from '@/src/components/LandingCtaLink'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  /** ISO date (YYYY-MM-DD) */
  date: string
  /** ISO date (YYYY-MM-DD) da última revisão de conteúdo. Se ausente, usa `date`. */
  updatedDate?: string
  readingMinutes: number
  author: { name: string; role: string }
  cover: { gradient: string; emoji: string; image?: string }
  /** Sumário navegável — cada id deve existir como <h2 id> no conteúdo. */
  toc: { id: string; label: string }[]
  content: React.ReactNode
  /**
   * Passos numerados visíveis no artigo (schema HowTo). Só preencher quando o
   * post tem uma lista "1. 2. 3." real no conteúdo — o texto aqui deve
   * espelhar exatamente o que aparece na página, sem parafrasear.
   */
  howTo?: { name: string; steps: { name: string; text: string }[] }
  /**
   * Perguntas/respostas para featured snippet + schema FAQPage.
   * Respostas devem ter ~40–60 palavras, diretas, com a keyword no começo.
   */
  faq?: { question: string; answer: string }[]
}

export function Cta() {
  return (
    <aside className="blog-cta not-prose my-10 rounded-2xl border border-sky-400/25 bg-slate-950 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
      <p className="blog-cta-eyebrow text-[0.7rem] font-extrabold uppercase tracking-widest text-amber-400 mb-2">
        Faça na prática
      </p>
      <h3 className="blog-cta-title font-display text-xl font-bold text-white mb-2">
        Gere um laudo de vistoria em minutos
      </h3>
      <p className="blog-cta-body text-sm text-slate-300 leading-relaxed mb-4">
        Marque as avarias num diagrama do veículo, anexe fotos com GPS e exporte um PDF com hash de
        validação e QR Code. Sem papel, sem retrabalho.
      </p>
      <LandingCtaLink
        id="blog-cta"
        eventSource="blog"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 transition-[transform,background-color] motion-safe:hover:-translate-y-0.5"
      >
        Testar 7 dias grátis →
      </LandingCtaLink>
    </aside>
  )
}

// Bloco reutilizável: recursos do laudo (perfil/campos, logo, QR/hash) +
// imagem real do PDF. Usado nos artigos por tipo de veículo.
export function RecursosLaudo() {
  return (
    <>
      <h2 id="perfil">Perfil e campos: o laudo se adapta a você</h2>
      <p>
        No <strong>perfil da vistoria</strong> você define o nome do vistoriador e da empresa e decide
        exatamente o que entra no documento. Dá para <strong>adicionar campos próprios</strong> (apólice,
        contrato, nº do box, KM, centro de custo), <strong>remover</strong> os que não usa e até{' '}
        <strong>reordenar</strong> as seções — perfil, cliente, documentos, veículo, local e assinaturas
        — para o laudo ficar com a cara da sua operação.
      </p>

      <h2 id="logo">Sua logo e o nome da empresa no PDF</h2>
      <p>
        O laudo sai com a <strong>logo e o nome da sua empresa</strong> no cabeçalho — concessionária,
        locadora ou despachante. É um documento <em>white-label</em>: você configura uma vez e passa a
        usar em todas as vistorias. Veja como fica:
      </p>

      <LaudoSheet />

      <h2 id="validacao">Assinatura, QR Code e hash de validação</h2>
      <p>
        Ao concluir, o vistoriador e o proprietário/responsável <strong>assinam na própria tela</strong>
        {' '}(dedo ou caneta). O PDF é então selado com um <strong>hash SHA-256</strong> — que prova que o
        arquivo não foi adulterado — e um <strong>QR Code</strong> que permite conferir o laudo original
        online a qualquer momento. É o que dá força ao documento numa contestação.
      </p>

      <Cta />
    </>
  )
}

