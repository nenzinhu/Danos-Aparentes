# Landing Pages por Segmento + Blog de Apoio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar 3 landing pages de segmento (`/oficinas`, `/seguradoras`, `/frotas`) seguindo o padrão de `/locadoras`, mais 4 posts de blog de apoio que linkam para elas, para gerar descoberta 100% orgânica via Google (sem tráfego pago, sem prospecção ativa).

**Architecture:** Cada landing page é uma rota estática do App Router (`src/app/<segmento>/page.tsx`) com `metadata` (title/description/canonical/OG) e um JSON-LD `FAQPage`, seguindo exatamente a estrutura de `src/app/locadoras/page.tsx`: hero com CTAs, seção de dor, seção de diferenciais, prova (via `<LaudoSheet />`), ponte para `/planos`, FAQ, CTA final. Cada página tem seu próprio arquivo de CTAs (`src/components/<Segmento>Ctas.tsx`) espelhando `LocadorasCtas.tsx`. As páginas entram no `ROUTES` de `src/app/sitemap.ts`. Os posts de blog são adicionados como um novo bloco `BLOG_POSTS.push([...])` no fim de `src/content/blog.tsx`, reaproveitando o componente `<RecursosLaudo />` já existente e linkando para a landing de segmento correspondente.

**Tech Stack:** Next.js (App Router), React (Server Components para as páginas, `'use client'` só nos componentes de CTA com `LandingCtaLink`/WhatsApp), Tailwind (classes utilitárias + tokens CSS `var(--...)` já usados no projeto).

## Global Constraints

- Sem tráfego pago e sem prospecção ativa/porta a porta — todo CTA é para conversão inbound (WhatsApp iniciado pelo visitante, ou teste grátis via `LandingCtaLink`)
- Prova social usa o PDF de exemplo real (`<LaudoSheet />`) no lugar de depoimentos, já que ainda não há clientes
- Cadência de blog: os 4 posts desta fase fazem parte do ritmo de 2-3 posts/semana já em andamento — não introduz infraestrutura nova de blog
- Cada nova landing e cada novo post deve entrar no sitemap (`src/app/sitemap.ts` já lista posts/categorias automaticamente; as landings entram manualmente no array `ROUTES`)
- Autoria de posts: `author: { name: 'Jeferson', role: 'Vistoria digital' }` (padrão já estabelecido em toda a base, ver [[2026-07-05-blog-seo-fase1-design]])

---

## File Structure

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/components/OficinasCtas.tsx` | Criar | CTAs (hero, ponte planos, final) da landing de oficinas |
| `src/app/oficinas/page.tsx` | Criar | Landing page de oficinas |
| `src/components/SeguradorasCtas.tsx` | Criar | CTAs da landing de seguradoras |
| `src/app/seguradoras/page.tsx` | Criar | Landing page de seguradoras |
| `src/components/FrotasCtas.tsx` | Criar | CTAs da landing de frotas |
| `src/app/frotas/page.tsx` | Criar | Landing page de frotas |
| `src/app/sitemap.ts` | Modificar | Adiciona as 3 novas rotas ao array `ROUTES` |
| `src/app/page.tsx:454` | Modificar | Adiciona links para as 3 novas landings no rodapé de navegação, ao lado de "Para Locadoras" |
| `src/content/blog.tsx` | Modificar | Novo bloco `BLOG_POSTS.push([...])` no fim do arquivo, com os 4 posts de apoio |

Cada componente de CTA e cada página de segmento é isolado e não depende dos outros dois segmentos — podem ser implementados e revisados de forma independente.

---

## Task 1: Landing page de Oficinas

**Files:**
- Create: `src/components/OficinasCtas.tsx`
- Create: `src/app/oficinas/page.tsx`
- Modify: `src/app/sitemap.ts`
- Test: verificação manual via build + navegador (sem framework de teste automatizado para páginas de marketing neste projeto — ver Task 4)

**Interfaces:**
- Consome: `whatsappLink` de `src/lib/whatsapp.ts` (`whatsappLink(message: string): string`); `buttonVariants` de `src/components/ui/Button.tsx` (`buttonVariants(opts?: { variant?: 'primary'|'secondary'|'ghost'|'success'; size?: 'sm'|'md'|'lg'; className?: string }): string`); `LandingCtaLink` default export de `src/components/LandingCtaLink.tsx` (`{ id?, className?, style?, children, transitionTypes? }`); `LaudoSheet` named export de `src/components/LaudoSheet.tsx` (sem props); `BlogVideo` named export de `src/components/blog/BlogVideo.tsx` (`{ src, poster, title, description, duration, uploadDate, caption }`, todas strings)
- Produz: rota pública `/oficinas`; componentes `OficinasHeroCtas`, `OficinasPlanosLink`, `OficinasFinalCta` (usados só dentro de `oficinas/page.tsx`)

- [ ] **Step 1: Criar o arquivo de CTAs de Oficinas**

Crie `src/components/OficinasCtas.tsx`:

```tsx
'use client';
import Link from 'next/link';
import LandingCtaLink from './LandingCtaLink';
import { buttonVariants } from './ui/Button';
import { whatsappLink } from '../lib/whatsapp';

const WHATSAPP_MESSAGE = 'Olá! Gostaria de saber mais sobre o sistema de vistoria digital para oficina do Danos Aparentes.'

function WhatsappButton({ className }: { className: string }) {
  return (
    <a
      href={whatsappLink(WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      Falar com o time comercial
    </a>
  );
}

export function OficinasHeroCtas() {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-7">
      <WhatsappButton className={buttonVariants({ variant: 'primary', size: 'md' })} />
      <LandingCtaLink className={buttonVariants({ variant: 'secondary', size: 'md' })}>
        Testar o plano Pro grátis
      </LandingCtaLink>
    </div>
  );
}

export function OficinasPlanosLink() {
  return (
    <Link href="/planos" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
      Ver planos e preços →
    </Link>
  );
}

export function OficinasFinalCta() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center glass-card p-8">
      <h2 className="text-lg font-bold mb-1.5">Pronto para digitalizar o laudo da sua oficina?</h2>
      <p className="text-sm text-[var(--text-muted)] mb-5">
        Resposta em minutos pelo WhatsApp, sem compromisso.
      </p>
      <WhatsappButton className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })} />
    </div>
  );
}
```

- [ ] **Step 2: Criar a landing page de Oficinas**

Crie `src/app/oficinas/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import { OficinasHeroCtas, OficinasPlanosLink, OficinasFinalCta } from '@/src/components/OficinasCtas'
import { BlogVideo } from '@/src/components/blog/BlogVideo'

const TITLE = 'Laudo de Vistoria Digital para Oficina Mecânica | Danos Aparentes'
const DESCRIPTION =
  'Sistema de vistoria digital para oficina: laudo profissional em minutos, com a marca da sua oficina, hash e QR Code de validação, sem papel e sem retrabalho.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/oficinas' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/oficinas', type: 'website', images: ['/og-image.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

const PAIN_POINTS = [
  {
    title: 'Laudo em papel some ou fica ilegível',
    desc: 'Prancheta e ficha impressa se perdem ou rasgam — quando o cliente questiona uma avaria depois, não sobra prova nenhuma.',
  },
  {
    title: 'Cliente desconfia do que foi registrado',
    desc: 'Sem assinatura digital e sem validação, fica a palavra da oficina contra a palavra do cliente na hora da entrega do veículo.',
  },
  {
    title: 'Cada mecânico anota do seu jeito',
    desc: 'Sem um diagrama padrão do veículo, um funcionário anota no capô, outro na porta — o laudo final fica inconsistente.',
  },
]

const FEATURES = [
  { title: 'Diagrama do veículo por tipo', desc: 'Marque a avaria direto no diagrama certo — carro, moto, van, caminhão — em vez de descrever de improviso.' },
  { title: 'Laudo pronto em minutos', desc: 'Fotos, observações e assinatura direto no celular; o PDF sai formatado, sem precisar digitar depois.' },
  { title: 'Laudo com hash SHA-256 e QR Code', desc: 'O documento comprova a si mesmo — reduz a discussão de "isso não estava assim quando entrou".' },
  { title: 'Marca própria no laudo (white-label)', desc: 'O PDF sai com a logo e o nome da sua oficina, reforçando profissionalismo com o cliente.' },
  { title: 'Funciona 100% offline', desc: 'Sem sinal na oficina? A vistoria continua e sincroniza sozinha quando a conexão voltar.' },
  { title: 'Envio direto por WhatsApp', desc: 'O laudo em PDF vai pro cliente com 1 clique, no mesmo momento da entrega ou devolução.' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Preciso de treinamento para minha equipe usar?',
    a: 'Não. O diagrama do veículo guia o processo — o mecânico só toca no ponto do dano, escolhe o tipo e a gravidade. A primeira vistoria já sai pronta em minutos.',
  },
  {
    q: 'Dá para colocar a logo da minha oficina no laudo?',
    a: 'Sim — o PDF é white-label: a logo e o nome que aparecem no cabeçalho são os da sua oficina, configuráveis nas opções do perfil.',
  },
  {
    q: 'Funciona para qualquer tipo de veículo que a oficina atende?',
    a: 'Sim — carro (2 ou 4 portas), moto, van, caminhão, ônibus, microônibus e um modelo genérico, cada um com diagrama próprio em 4 vistas.',
  },
  {
    q: 'O laudo serve para eu me proteger de reclamação depois do serviço?',
    a: 'O laudo registra o estado do veículo na entrada com hash SHA-256, QR Code de verificação, fotos com GPS/data e assinatura do cliente — um registro documental forte para comparar entrada e saída.',
  },
  {
    q: 'Quanto custa para uma oficina pequena?',
    a: 'O plano Pro (R$ 49,90/mês) já cobre vistorias ilimitadas, laudo personalizado e busca de placa. Para múltiplas unidades, o Corporativo é sob consulta.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function OficinasPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="w-full max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <header className="text-center mb-12 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-3">
            <span aria-hidden="true" className="w-5 h-px bg-[var(--sheet-line)]" />
            Oficinas Mecânicas
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
            Laudo de vistoria digital para oficina mecânica
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-3 max-w-lg">
            Laudo profissional em minutos, com a marca da sua oficina — sem papel, sem retrabalho e
            sem discussão sobre o que já estava avariado na entrada.
          </p>
          <OficinasHeroCtas />
        </header>

        <section className="mt-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Vistoria digital para oficina em poucos segundos
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Registre o estado do veículo na entrada e na saída direto do celular, com laudo pronto
            para entregar ao cliente.
          </p>
          <BlogVideo
            src="/videos/vistoria-locadoras.mp4"
            poster="/videos/vistoria-locadoras-poster.jpg"
            title="Vistoria digital para oficinas — Danos Aparentes"
            description="Registre o estado do veículo na entrada e na saída, com laudo pronto para entregar ao cliente."
            duration="PT8S"
            uploadDate="2026-07-13"
            caption="8 segundos · play quando quiser"
          />
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que acontece sem um laudo digital
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map(item => (
              <div key={item.title} className="glass-card p-6 border border-[var(--card-border)]/50">
                <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que muda com o laudo digital
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-[var(--signal-bright)] text-base mt-0.5">✓</span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-main)]">{item.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Com a marca da sua oficina, não a nossa
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Ainda não temos histórico público de clientes — o app é novo. Em vez de depoimento, veja o
            laudo real gerado pelo app: a logo do topo é configurável para a sua oficina.
          </p>
          <LaudoSheet />
        </section>

        <section className="mt-16 max-w-2xl mx-auto text-center glass-card p-8">
          <h2 className="text-lg font-bold mb-1.5">Pro para oficina pequena, Corporativo para rede</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Se for uma oficina só, o plano Pro (R$ 49,90/mês) já cobre. Para múltiplas unidades e
            integrações, o Corporativo é sob consulta.
          </p>
          <OficinasPlanosLink />
        </section>

        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            Perguntas de quem gerencia oficina
          </h2>
          <div className="flex flex-col gap-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--card-border)]/40 pb-6">
                <p className="text-sm font-bold text-[var(--text-main)]">{q}</p>
                <p className="text-[0.8rem] text-[var(--text-muted)] mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[var(--text-muted)] mt-8">
            Quer ver o passo a passo completo do laudo?{' '}
            <Link href="/blog/como-digitalizar-a-vistoria-da-sua-oficina" className="font-bold text-[var(--primary)] hover:underline">
              Veja o guia completo no blog
            </Link>
          </p>
        </div>

        <OficinasFinalCta />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Adicionar `/oficinas` ao sitemap**

Em `src/app/sitemap.ts`, modifique o array `ROUTES` adicionando a linha logo depois de `/locadoras`:

```ts
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/planos', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/locadoras', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/oficinas', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.8, changeFrequency: 'monthly' },
```

- [ ] **Step 4: Build e verificação manual**

Rode:
```bash
npm run build
```
Esperado: build conclui sem erro, e a rota `/oficinas` aparece no output do Next como página estática gerada.

Depois, com `npm run dev` rodando, abra `http://localhost:3000/oficinas` no navegador e confirme:
- Título da aba mostra "Laudo de Vistoria Digital para Oficina Mecânica | Danos Aparentes"
- O botão "Testar o plano Pro grátis" leva para `/app?mode=signup`
- O botão "Falar com o time comercial" abre o WhatsApp com a mensagem específica de oficina
- A seção de FAQ renderiza as 5 perguntas
- `view-source:` da página contém o `<script type="application/ld+json">` com `FAQPage`

- [ ] **Step 5: Commit**

```bash
git add src/components/OficinasCtas.tsx src/app/oficinas/page.tsx src/app/sitemap.ts
git commit -m "feat(oficinas): landing page de segmento para oficinas mecânicas"
```

---

## Task 2: Landing page de Seguradoras

**Files:**
- Create: `src/components/SeguradorasCtas.tsx`
- Create: `src/app/seguradoras/page.tsx`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consome: mesmas interfaces da Task 1 (`whatsappLink`, `buttonVariants`, `LandingCtaLink`, `LaudoSheet`, `BlogVideo`)
- Produz: rota pública `/seguradoras`; componentes `SeguradorasHeroCtas`, `SeguradorasPlanosLink`, `SeguradorasFinalCta`

- [ ] **Step 1: Criar o arquivo de CTAs de Seguradoras**

Crie `src/components/SeguradorasCtas.tsx`:

```tsx
'use client';
import Link from 'next/link';
import LandingCtaLink from './LandingCtaLink';
import { buttonVariants } from './ui/Button';
import { whatsappLink } from '../lib/whatsapp';

const WHATSAPP_MESSAGE = 'Olá! Gostaria de saber mais sobre o laudo de vistoria com validação anti-fraude do Danos Aparentes.'

function WhatsappButton({ className }: { className: string }) {
  return (
    <a
      href={whatsappLink(WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      Falar com o time comercial
    </a>
  );
}

export function SeguradorasHeroCtas() {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-7">
      <WhatsappButton className={buttonVariants({ variant: 'primary', size: 'md' })} />
      <LandingCtaLink className={buttonVariants({ variant: 'secondary', size: 'md' })}>
        Testar o plano Pro grátis
      </LandingCtaLink>
    </div>
  );
}

export function SeguradorasPlanosLink() {
  return (
    <Link href="/planos" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
      Ver planos e preços →
    </Link>
  );
}

export function SeguradorasFinalCta() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center glass-card p-8">
      <h2 className="text-lg font-bold mb-1.5">Pronto para reduzir disputas de sinistro?</h2>
      <p className="text-sm text-[var(--text-muted)] mb-5">
        Resposta em minutos pelo WhatsApp, sem compromisso.
      </p>
      <WhatsappButton className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })} />
    </div>
  );
}
```

- [ ] **Step 2: Criar a landing page de Seguradoras**

Crie `src/app/seguradoras/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import { SeguradorasHeroCtas, SeguradorasPlanosLink, SeguradorasFinalCta } from '@/src/components/SeguradorasCtas'
import { BlogVideo } from '@/src/components/blog/BlogVideo'

const TITLE = 'Laudo de Vistoria com QR Code Anti-Fraude para Seguradora | Danos Aparentes'
const DESCRIPTION =
  'Vistoria digital com laudo à prova de adulteração: hash SHA-256, QR Code de verificação pública e assinaturas digitais — reduza disputas de sinistro por avaria pré-existente.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/seguradoras' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/seguradoras', type: 'website', images: ['/og-image.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

const PAIN_POINTS = [
  {
    title: 'Disputa sobre avaria pré-existente',
    desc: 'Sem um laudo confiável no momento da contratação, fica difícil provar se um dano já existia antes do sinistro reportado.',
  },
  {
    title: 'Laudo fácil de alterar depois',
    desc: 'PDF comum ou papel escaneado pode ser editado sem deixar rastro — o que enfraquece o documento numa contestação.',
  },
  {
    title: 'Sem registro de local e hora da vistoria',
    desc: 'Fotos soltas do celular do vistoriador não têm GPS nem timestamp confiável, dificultando a checagem posterior.',
  },
]

const FEATURES = [
  { title: 'Hash SHA-256 em cada laudo', desc: 'Qualquer alteração no PDF depois de gerado quebra o hash — o documento comprova a si mesmo.' },
  { title: 'QR Code de verificação pública', desc: 'Qualquer pessoa pode escanear o QR e conferir o laudo original em uma página de verificação, a qualquer momento.' },
  { title: 'GPS e timestamp em cada foto', desc: 'Cada foto de avaria é registrada com local e data/hora exatos do momento da vistoria.' },
  { title: 'Assinaturas digitais na tela', desc: 'Vistoriador e segurado assinam no próprio aparelho, no momento da vistoria.' },
  { title: 'Funciona 100% offline', desc: 'A vistoria continua mesmo sem sinal e sincroniza sozinha assim que a conexão voltar.' },
  { title: 'Marca própria no laudo (white-label)', desc: 'O PDF sai com a logo e o nome da corretora ou seguradora, não com uma marca genérica.' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Como o QR Code ajuda a evitar fraude?',
    a: 'O QR Code leva a uma página pública onde qualquer pessoa confere o hash do laudo original. Se o PDF em mãos foi alterado, o hash não confere — expõe a adulteração na hora.',
  },
  {
    q: 'O laudo tem validade jurídica?',
    a: 'O laudo reúne hash SHA-256, QR Code de verificação, GPS, timestamp e assinaturas digitais — um conjunto de evidências forte para uma contestação. O valor probatório específico depende do contrato entre as partes.',
  },
  {
    q: 'Dá para integrar com o sistema da seguradora/corretora?',
    a: 'O plano Corporativo inclui integração via API. Fale com o time comercial para avaliar o seu caso específico.',
  },
  {
    q: 'Funciona para vistoria prévia de qualquer tipo de veículo?',
    a: 'Sim — carro, moto, caminhão, van, ônibus e um modelo genérico, cada um com diagrama próprio em 4 vistas.',
  },
  {
    q: 'Quanto custa para uma corretora pequena começar?',
    a: 'O plano Pro (R$ 49,90/mês) já cobre vistorias ilimitadas e laudo personalizado. Para volume maior e integrações, o Corporativo é sob consulta.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function SeguradorasPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="w-full max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <header className="text-center mb-12 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-3">
            <span aria-hidden="true" className="w-5 h-px bg-[var(--sheet-line)]" />
            Seguradoras e Corretoras
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
            Laudo de vistoria com QR Code anti-fraude
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-3 max-w-lg">
            Reduza disputas de sinistro por avaria pré-existente com um laudo que comprova a si
            mesmo — hash SHA-256, QR Code público e assinaturas digitais.
          </p>
          <SeguradorasHeroCtas />
        </header>

        <section className="mt-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Vistoria digital com prova criptográfica em poucos segundos
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Registre o estado do veículo na contratação com laudo verificável publicamente a
            qualquer momento.
          </p>
          <BlogVideo
            src="/videos/vistoria-locadoras.mp4"
            poster="/videos/vistoria-locadoras-poster.jpg"
            title="Laudo com QR Code anti-fraude — Danos Aparentes"
            description="Registre o estado do veículo com laudo verificável publicamente, reduzindo disputas de sinistro."
            duration="PT8S"
            uploadDate="2026-07-13"
            caption="8 segundos · play quando quiser"
          />
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que acontece sem um laudo verificável
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map(item => (
              <div key={item.title} className="glass-card p-6 border border-[var(--card-border)]/50">
                <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que muda com o laudo à prova de adulteração
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-[var(--signal-bright)] text-base mt-0.5">✓</span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-main)]">{item.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Veja o laudo real, com QR de verificação
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Ainda não temos histórico público de clientes — o app é novo. Em vez de depoimento, veja o
            laudo real gerado pelo app, com o QR Code de verificação no rodapé.
          </p>
          <LaudoSheet />
        </section>

        <section className="mt-16 max-w-2xl mx-auto text-center glass-card p-8">
          <h2 className="text-lg font-bold mb-1.5">Pro para corretora autônoma, Corporativo para seguradora</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Se for uma corretora pequena, o plano Pro (R$ 49,90/mês) já cobre. Para volume alto e
            integração com sistemas próprios, o Corporativo é sob consulta.
          </p>
          <SeguradorasPlanosLink />
        </section>

        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            Perguntas de quem avalia risco de sinistro
          </h2>
          <div className="flex flex-col gap-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--card-border)]/40 pb-6">
                <p className="text-sm font-bold text-[var(--text-main)]">{q}</p>
                <p className="text-[0.8rem] text-[var(--text-muted)] mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[var(--text-muted)] mt-8">
            Quer entender como funciona o QR Code de verificação?{' '}
            <Link href="/blog/laudo-de-avaria-com-qr-code" className="font-bold text-[var(--primary)] hover:underline">
              Veja a explicação completa no blog
            </Link>
          </p>
        </div>

        <SeguradorasFinalCta />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Adicionar `/seguradoras` ao sitemap**

Em `src/app/sitemap.ts`, adicione a linha logo depois de `/oficinas`:

```ts
  { path: '/oficinas', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/seguradoras', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.8, changeFrequency: 'monthly' },
```

- [ ] **Step 4: Build e verificação manual**

Rode:
```bash
npm run build
```
Esperado: build conclui sem erro, rota `/seguradoras` gerada.

Com `npm run dev`, abra `http://localhost:3000/seguradoras` e confirme:
- Título da aba mostra "Laudo de Vistoria com QR Code Anti-Fraude para Seguradora | Danos Aparentes"
- Botão de WhatsApp abre com a mensagem específica de seguradora
- FAQ renderiza as 5 perguntas
- JSON-LD `FAQPage` presente no `view-source:`

- [ ] **Step 5: Commit**

```bash
git add src/components/SeguradorasCtas.tsx src/app/seguradoras/page.tsx src/app/sitemap.ts
git commit -m "feat(seguradoras): landing page de segmento para seguradoras e corretoras"
```

---

## Task 3: Landing page de Frotas

**Files:**
- Create: `src/components/FrotasCtas.tsx`
- Create: `src/app/frotas/page.tsx`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consome: mesmas interfaces da Task 1
- Produz: rota pública `/frotas`; componentes `FrotasHeroCtas`, `FrotasPlanosLink`, `FrotasFinalCta`

- [ ] **Step 1: Criar o arquivo de CTAs de Frotas**

Crie `src/components/FrotasCtas.tsx`:

```tsx
'use client';
import Link from 'next/link';
import LandingCtaLink from './LandingCtaLink';
import { buttonVariants } from './ui/Button';
import { whatsappLink } from '../lib/whatsapp';

const WHATSAPP_MESSAGE = 'Olá! Gostaria de saber mais sobre o sistema de vistoria digital para frota do Danos Aparentes.'

function WhatsappButton({ className }: { className: string }) {
  return (
    <a
      href={whatsappLink(WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      Falar com o time comercial
    </a>
  );
}

export function FrotasHeroCtas() {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-7">
      <WhatsappButton className={buttonVariants({ variant: 'primary', size: 'md' })} />
      <LandingCtaLink className={buttonVariants({ variant: 'secondary', size: 'md' })}>
        Testar o plano Pro grátis
      </LandingCtaLink>
    </div>
  );
}

export function FrotasPlanosLink() {
  return (
    <Link href="/planos" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
      Ver planos e preços →
    </Link>
  );
}

export function FrotasFinalCta() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center glass-card p-8">
      <h2 className="text-lg font-bold mb-1.5">Pronto para vistoriar sua frota sem depender de sinal?</h2>
      <p className="text-sm text-[var(--text-muted)] mb-5">
        Resposta em minutos pelo WhatsApp, sem compromisso.
      </p>
      <WhatsappButton className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })} />
    </div>
  );
}
```

- [ ] **Step 2: Criar a landing page de Frotas**

Crie `src/app/frotas/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import { FrotasHeroCtas, FrotasPlanosLink, FrotasFinalCta } from '@/src/components/FrotasCtas'
import { BlogVideo } from '@/src/components/blog/BlogVideo'

const TITLE = 'App de Vistoria de Frota Offline | Danos Aparentes'
const DESCRIPTION =
  'Vistoria digital de frota que funciona sem internet: registre avarias em pátios sem sinal, sincronize depois e saia com laudo padronizado entre todos os veículos.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/frotas' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/frotas', type: 'website', images: ['/og-image.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

const PAIN_POINTS = [
  {
    title: 'Pátio ou galpão sem sinal de internet',
    desc: 'Apps que dependem de conexão travam ou perdem dados justamente onde a frota costuma ficar estacionada.',
  },
  {
    title: 'Frota grande, formatos de vistoria diferentes',
    desc: 'Cada motorista ou vistoriador registra do seu jeito, dificultando comparar avarias entre veículos da mesma frota.',
  },
  {
    title: 'Sem visão consolidada de todos os veículos',
    desc: 'Planilhas soltas por veículo tornam impossível enxergar, num único lugar, o estado geral da frota no mês.',
  },
]

const FEATURES = [
  { title: 'Funciona 100% offline', desc: 'Registre a vistoria sem sinal — os dados ficam salvos no aparelho e sincronizam sozinhos assim que a conexão voltar.' },
  { title: 'Checklist padronizado entre veículos', desc: 'Todo vistoriador segue o mesmo diagrama por tipo de veículo (carro, van, caminhão, ônibus), sem depender de experiência individual.' },
  { title: 'Laudo com hash SHA-256 e QR Code', desc: 'Cada laudo comprova a si mesmo — reduz disputa de avaria não declarada entre uma vistoria e outra da mesma frota.' },
  { title: 'Busca automática por placa', desc: 'Marca, modelo, cor e ano preenchidos automaticamente ao digitar a placa, agilizando frotas com muitos veículos.' },
  { title: 'Marca própria no laudo (white-label)', desc: 'O PDF sai com a logo e o nome da sua empresa de frota, não com uma marca genérica.' },
  { title: 'Envio direto por WhatsApp', desc: 'O laudo em PDF vai pro responsável pelo veículo com 1 clique, assim que a vistoria termina.' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'O app realmente funciona sem internet no pátio?',
    a: 'Sim — a vistoria (fotos, marcações no diagrama, assinaturas) é salva no próprio aparelho e sincroniza automaticamente com o servidor assim que houver conexão novamente.',
  },
  {
    q: 'Dá para vistoriar vários tipos de veículo da mesma frota?',
    a: 'Sim — carro (2 ou 4 portas), moto, van, caminhão, ônibus, microônibus e um modelo genérico, cada um com diagrama próprio em 4 vistas.',
  },
  {
    q: 'Como funciona a gestão de múltiplos vistoriadores numa frota grande?',
    a: 'O plano Corporativo traz um painel consolidado por filial e por vistoriador, permitindo acompanhar o volume e o estado da frota num único lugar.',
  },
  {
    q: 'Dá para integrar com o sistema de gestão de frota que já usamos?',
    a: 'O plano Corporativo inclui integração via API com ERP/CRM. Fale com o time comercial para avaliar o seu caso.',
  },
  {
    q: 'Quanto custa para uma frota pequena começar?',
    a: 'O plano Pro (R$ 49,90/mês) já cobre vistorias ilimitadas e laudo personalizado. Para múltiplos vistoriadores e integrações, o Corporativo é sob consulta.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function FrotasPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="w-full max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <header className="text-center mb-12 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-3">
            <span aria-hidden="true" className="w-5 h-px bg-[var(--sheet-line)]" />
            Gestão de Frotas
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
            App de vistoria de frota que funciona offline
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-3 max-w-lg">
            Registre avarias em qualquer pátio, com ou sem sinal, e mantenha um checklist
            padronizado entre todos os veículos da frota.
          </p>
          <FrotasHeroCtas />
        </header>

        <section className="mt-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Vistoria digital de frota em poucos segundos
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Faça a vistoria rápida no celular, mesmo sem internet no local, e saia com laudo pronto
            para cada veículo da frota.
          </p>
          <BlogVideo
            src="/videos/vistoria-locadoras.mp4"
            poster="/videos/vistoria-locadoras-poster.jpg"
            title="Vistoria digital de frota — Danos Aparentes"
            description="Faça a vistoria rápida no celular, mesmo sem internet no local, com laudo pronto para cada veículo."
            duration="PT8S"
            uploadDate="2026-07-13"
            caption="8 segundos · play quando quiser"
          />
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que acontece sem um processo padronizado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map(item => (
              <div key={item.title} className="glass-card p-6 border border-[var(--card-border)]/50">
                <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que muda com a vistoria digital offline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-[var(--signal-bright)] text-base mt-0.5">✓</span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-main)]">{item.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Com a marca da sua empresa, não a nossa
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Ainda não temos histórico público de clientes — o app é novo. Em vez de depoimento, veja o
            laudo real gerado pelo app: a logo do topo é configurável para a sua empresa.
          </p>
          <LaudoSheet />
        </section>

        <section className="mt-16 max-w-2xl mx-auto text-center glass-card p-8">
          <h2 className="text-lg font-bold mb-1.5">Pro para frota pequena, Corporativo para frota grande</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Se forem poucos veículos, o plano Pro (R$ 49,90/mês) já cobre. Para múltiplos
            vistoriadores, filiais e integrações, o Corporativo é sob consulta.
          </p>
          <FrotasPlanosLink />
        </section>

        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            Perguntas de quem gerencia frota
          </h2>
          <div className="flex flex-col gap-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--card-border)]/40 pb-6">
                <p className="text-sm font-bold text-[var(--text-main)]">{q}</p>
                <p className="text-[0.8rem] text-[var(--text-muted)] mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[var(--text-muted)] mt-8">
            Quer entender como funciona a vistoria sem internet?{' '}
            <Link href="/blog/vistoria-de-frota-sem-internet" className="font-bold text-[var(--primary)] hover:underline">
              Veja a explicação completa no blog
            </Link>
          </p>
        </div>

        <FrotasFinalCta />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Adicionar `/frotas` ao sitemap**

Em `src/app/sitemap.ts`, adicione a linha logo depois de `/seguradoras`:

```ts
  { path: '/seguradoras', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/frotas', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.8, changeFrequency: 'monthly' },
```

- [ ] **Step 4: Build e verificação manual**

Rode:
```bash
npm run build
```
Esperado: build conclui sem erro, rota `/frotas` gerada.

Com `npm run dev`, abra `http://localhost:3000/frotas` e confirme:
- Título da aba mostra "App de Vistoria de Frota Offline | Danos Aparentes"
- Botão de WhatsApp abre com a mensagem específica de frota
- FAQ renderiza as 5 perguntas
- JSON-LD `FAQPage` presente no `view-source:`

- [ ] **Step 5: Commit**

```bash
git add src/components/FrotasCtas.tsx src/app/frotas/page.tsx src/app/sitemap.ts
git commit -m "feat(frotas): landing page de segmento para gestão de frotas"
```

---

## Task 4: Navegação — linkar as novas landings a partir da home

**Files:**
- Modify: `src/app/page.tsx:454`

**Interfaces:**
- Consome: rotas `/oficinas`, `/seguradoras`, `/frotas` criadas nas Tasks 1-3
- Produz: nenhuma interface nova — apenas 3 links adicionais na barra de navegação existente

- [ ] **Step 1: Adicionar os 3 links na barra de navegação da home**

Em `src/app/page.tsx`, localize a linha (atualmente linha 454):

```tsx
            <a href="/locadoras" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Para Locadoras</a>
```

Substitua por:

```tsx
            <a href="/locadoras" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Para Locadoras</a>
            <a href="/oficinas" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Para Oficinas</a>
            <a href="/seguradoras" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Para Seguradoras</a>
            <a href="/frotas" className="hover:text-[var(--text-main)] transition-colors focus-visible:outline-white">Para Frotas</a>
```

- [ ] **Step 2: Build e verificação manual**

Rode:
```bash
npm run build
```
Esperado: build conclui sem erro.

Com `npm run dev`, abra `http://localhost:3000/` e confirme que os 4 links ("Para Locadoras", "Para Oficinas", "Para Seguradoras", "Para Frotas") aparecem na barra e cada um navega para a página correta.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): adiciona links de navegação para as novas landings de segmento"
```

---

## Task 5: Posts de blog de apoio (cauda longa)

**Files:**
- Modify: `src/content/blog.tsx` (novo bloco `BLOG_POSTS.push([...])` inserido logo antes da linha `export function getRelatedPosts` — atualmente linha 3078, imediatamente após o fechamento do bloco anterior na linha 3072)

**Interfaces:**
- Consome: `BlogPost` interface (já definida em `src/content/blog.tsx`); componente `RecursosLaudo` (função interna do mesmo arquivo, sem export — já usada por outros posts via JSX direto, sem import necessário pois está no mesmo módulo)
- Produz: 4 novos posts em `BLOG_POSTS`, cada um linkando para a landing de segmento correspondente. Esses 4 slugs (`como-provar-amassado-pre-existente-locacao`, `como-digitalizar-a-vistoria-da-sua-oficina`, `laudo-de-avaria-com-qr-code`, `vistoria-de-frota-sem-internet`) já são referenciados pelas Tasks 1-3 nos links de "leia mais" de cada landing — **por isso esta task deve rodar antes ou depois das Tasks 1-3 sem problema, mas o build final (Task 6) só passa a validar os links reais depois que ambos os lados existem**

- [ ] **Step 1: Adicionar o novo bloco de posts**

Em `src/content/blog.tsx`, logo após o fechamento `)` da linha 3072 (o último `BLOG_POSTS.push(...)` existente) e antes de `export function getRelatedPosts` (linha 3078), insira:

```tsx
BLOG_POSTS.push(
  {
    slug: 'como-provar-amassado-pre-existente-locacao',
    title: 'Como provar que um amassado no carro já existia antes da locação',
    excerpt:
      'Sem vistoria de entrada bem documentada, é a palavra do cliente contra a da locadora. Veja como um laudo com foto, GPS e hash resolve essa disputa.',
    category: 'Locadora',
    tags: ['locadora', 'avarias', 'laudo de vistoria', 'checklist'],
    date: '2026-07-13',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 45%,#1FB6FF 100%)', emoji: '🔍', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'o-problema', label: 'O problema da avaria pré-existente' },
      { id: 'como-provar', label: 'Como provar com a vistoria digital' },
      { id: 'perfil', label: 'Perfil e campos' },
      { id: 'logo', label: 'Logo no PDF' },
      { id: 'validacao', label: 'QR Code e hash' },
    ],
    content: (
      <>
        <p>
          Um dos conflitos mais comuns entre locadora e cliente acontece na devolução: um risco ou
          amassado é apontado, e o cliente alega que "já estava assim" na retirada. Sem um registro
          confiável do estado do veículo na entrega, a locadora não tem como provar o contrário.
        </p>

        <h2 id="o-problema">O problema da avaria pré-existente</h2>
        <p>
          Uma ficha de papel preenchida às pressas no balcão, sem foto ou com fotos sem data, não
          resiste a uma contestação. O resultado é a locadora perder a cobrança de um dano real, ou
          o cliente pagar por um dano que não causou.
        </p>

        <h2 id="como-provar">Como provar com a vistoria digital</h2>
        <p>
          A vistoria digital resolve isso registrando, no momento da retirada, fotos com{' '}
          <strong>GPS e timestamp automáticos</strong> de cada parte do veículo marcada num diagrama
          padronizado. Na devolução, o mesmo processo se repete — e agora há dois laudos, com data e
          local, para comparar lado a lado.
        </p>

        <RecursosLaudo />

        <p>
          Trabalha com frota inteira, não só locação avulsa? Veja também o{' '}
          <a href="/frotas">app de vistoria de frota que funciona offline</a>.
        </p>
      </>
    ),
    faq: [
      {
        question: 'Como provar que um amassado no carro já existia antes da locação?',
        answer:
          'Com uma vistoria de entrada registrada em laudo digital: fotos com GPS e data/hora de cada parte do veículo, marcadas num diagrama padronizado e seladas com hash SHA-256, permitindo comparar o estado exato na retirada e na devolução.',
      },
    ],
  },
  {
    slug: 'como-digitalizar-a-vistoria-da-sua-oficina',
    title: 'Como digitalizar a vistoria da sua oficina',
    excerpt:
      'Troque a prancheta de papel por um laudo digital em minutos: diagrama do veículo, fotos com GPS, assinatura na tela e PDF com a marca da sua oficina.',
    category: 'Vistoria',
    tags: ['oficina', 'laudo de vistoria', 'checklist', 'avarias'],
    date: '2026-07-13',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 45%,#fb923c 100%)', emoji: '🔧', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'por-que-digitalizar', label: 'Por que digitalizar a vistoria' },
      { id: 'passo-a-passo', label: 'Passo a passo na oficina' },
      { id: 'perfil', label: 'Perfil e campos' },
      { id: 'logo', label: 'Logo no PDF' },
      { id: 'validacao', label: 'QR Code e hash' },
    ],
    content: (
      <>
        <p>
          Toda oficina que recebe veículo de cliente enfrenta o mesmo risco: sem um registro claro do
          estado do carro na entrada, qualquer arranhão notado na retirada vira discussão. Digitalizar
          esse processo resolve isso em poucos minutos por veículo.
        </p>

        <h2 id="por-que-digitalizar">Por que digitalizar a vistoria</h2>
        <p>
          Papel se perde, rasga ou fica ilegível. Um laudo digital fica salvo, é fácil de enviar por
          WhatsApp e — com hash e QR Code — não pode ser alterado depois de gerado sem que isso seja
          detectável.
        </p>

        <h2 id="passo-a-passo">Passo a passo na oficina</h2>
        <ol>
          <li>Digite a placa do veículo — marca, modelo e cor preenchem automaticamente.</li>
          <li>Marque cada avaria no diagrama do tipo de veículo (carro, van, caminhão etc).</li>
          <li>Anexe fotos e, se preferir, descreva por voz em vez de digitar.</li>
          <li>Colete a assinatura do cliente na própria tela.</li>
          <li>Envie o PDF com a marca da sua oficina direto pelo WhatsApp.</li>
        </ol>

        <RecursosLaudo />
      </>
    ),
    howTo: {
      name: 'Como digitalizar a vistoria da sua oficina',
      steps: [
        { name: 'Buscar a placa', text: 'Digite a placa do veículo — marca, modelo e cor preenchem automaticamente.' },
        { name: 'Marcar as avarias', text: 'Marque cada avaria no diagrama do tipo de veículo (carro, van, caminhão etc).' },
        { name: 'Anexar fotos', text: 'Anexe fotos e, se preferir, descreva por voz em vez de digitar.' },
        { name: 'Coletar assinatura', text: 'Colete a assinatura do cliente na própria tela.' },
        { name: 'Enviar o laudo', text: 'Envie o PDF com a marca da sua oficina direto pelo WhatsApp.' },
      ],
    },
  },
  {
    slug: 'laudo-de-avaria-com-qr-code',
    title: 'Laudo de avaria com QR Code: o que é e para que serve',
    excerpt:
      'Entenda como o QR Code de verificação e o hash SHA-256 tornam um laudo de vistoria à prova de adulteração — e por que isso importa para seguradoras.',
    category: 'Seguro',
    tags: ['seguradora', 'laudo de vistoria', 'avarias'],
    date: '2026-07-13',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#1e293b 0%,#334155 45%,#64748b 100%)', emoji: '🔐', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'o-que-e', label: 'O que é o QR Code do laudo' },
      { id: 'como-funciona', label: 'Como funciona a verificação' },
      { id: 'perfil', label: 'Perfil e campos' },
      { id: 'logo', label: 'Logo no PDF' },
      { id: 'validacao', label: 'QR Code e hash' },
    ],
    content: (
      <>
        <p>
          Um PDF comum pode ser editado em qualquer editor sem deixar rastro visível. Isso é um
          problema sério quando o documento é usado para sustentar uma cobrança ou contestar um
          sinistro. O QR Code de verificação existe para resolver exatamente isso.
        </p>

        <h2 id="o-que-e">O que é o QR Code do laudo</h2>
        <p>
          Ao concluir a vistoria, o app gera um <strong>hash SHA-256</strong> do conteúdo do laudo —
          uma espécie de "impressão digital" única daquele documento exato. O <strong>QR Code</strong>
          {' '}impresso no PDF leva a uma página pública onde esse hash pode ser conferido a qualquer
          momento.
        </p>

        <h2 id="como-funciona">Como funciona a verificação</h2>
        <p>
          Quem recebe o laudo escaneia o QR Code (ou acessa a página de verificação e cola o código)
          e confere se o hash bate com o do documento original. Se alguém alterou qualquer campo do
          PDF depois de gerado, o hash não confere — a adulteração fica evidente.
        </p>

        <RecursosLaudo />

        <p>
          Trabalha com seguradora ou corretora? Veja também a{' '}
          <a href="/seguradoras">página de vistoria com QR Code anti-fraude para seguradoras</a>.
        </p>
      </>
    ),
    faq: [
      {
        question: 'Para que serve o QR Code no laudo de vistoria?',
        answer:
          'O QR Code leva a uma página pública de verificação onde é possível conferir o hash SHA-256 do laudo original. Se o documento foi alterado depois de gerado, o hash não confere — expondo a adulteração e reforçando a confiança no laudo.',
      },
    ],
  },
  {
    slug: 'vistoria-de-frota-sem-internet',
    title: 'Vistoria de frota sem internet: como funciona',
    excerpt:
      'Pátios e galpões sem sinal não são desculpa para vistoria em papel. Veja como registrar avarias offline e sincronizar tudo automaticamente depois.',
    category: 'Frota',
    tags: ['frota', 'laudo de vistoria', 'checklist', 'avarias'],
    date: '2026-07-13',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#14532d 0%,#166534 45%,#4ade80 100%)', emoji: '📡', image: '/vehicles-img/truck.png' },
    toc: [
      { id: 'o-desafio', label: 'O desafio do pátio sem sinal' },
      { id: 'como-funciona', label: 'Como funciona o modo offline' },
      { id: 'perfil', label: 'Perfil e campos' },
      { id: 'logo', label: 'Logo no PDF' },
      { id: 'validacao', label: 'QR Code e hash' },
    ],
    content: (
      <>
        <p>
          Frotas costumam ficar estacionadas em pátios, galpões ou áreas afastadas — exatamente onde
          o sinal de internet costuma faltar. Um app que depende de conexão constante simplesmente
          não funciona nesse cenário.
        </p>

        <h2 id="o-desafio">O desafio do pátio sem sinal</h2>
        <p>
          Sem internet, a alternativa vira papel — e papel se perde, não tem GPS automático e não
          gera um documento com validação. Isso enfraquece justamente o controle que uma frota grande
          mais precisa: comparar o estado de cada veículo ao longo do tempo.
        </p>

        <h2 id="como-funciona">Como funciona o modo offline</h2>
        <p>
          A vistoria — fotos, marcações no diagrama, assinaturas — é salva localmente no aparelho do
          vistoriador, mesmo sem nenhuma conexão. Assim que o aparelho encontra sinal novamente
          (saindo do pátio, por exemplo), os dados sincronizam automaticamente com o servidor, sem
          nenhuma ação manual.
        </p>

        <RecursosLaudo />
      </>
    ),
  },
)
```

Nota: a inserção deve ficar **imediatamente antes** de `export function getRelatedPosts` — confira com `grep -n "^export function getRelatedPosts" src/content/blog.tsx` que a linha ainda existe logo após o novo bloco, sem nada entre eles além de uma linha em branco.

- [ ] **Step 2: Verificar que os slugs batem com os links das landings**

Rode:
```bash
grep -n "como-provar-amassado-pre-existente-locacao\|como-digitalizar-a-vistoria-da-sua-oficina\|laudo-de-avaria-com-qr-code\|vistoria-de-frota-sem-internet" src/app/oficinas/page.tsx src/app/seguradoras/page.tsx src/app/frotas/page.tsx src/content/blog.tsx
```
Esperado: cada slug aparece pelo menos duas vezes no total — uma vez como `slug:` em `blog.tsx` e uma vez em `href="/blog/<slug>"` na landing correspondente (oficinas → `como-digitalizar-a-vistoria-da-sua-oficina`, seguradoras → `laudo-de-avaria-com-qr-code`, frotas → `vistoria-de-frota-sem-internet`). O post de locadora (`como-provar-amassado-pre-existente-locacao`) não tem link de volta em `/locadoras` nesta fase — fica como entrada nova de SEO, sem exigir alteração da landing já existente.

- [ ] **Step 3: Build e verificação manual**

Rode:
```bash
npm run build
```
Esperado: build conclui sem erro; TypeScript não acusa propriedade faltando em nenhum dos 4 objetos novos de `BlogPost` (o campo `faq`/`howTo` é opcional — só 3 dos 4 posts usam).

Com `npm run dev`, abra cada uma das 4 URLs e confirme que o post renderiza, o componente `<RecursosLaudo />` aparece (com `<LaudoSheet />` embutido) e os links de "leia também" para `/frotas` e `/seguradoras` funcionam:
- `http://localhost:3000/blog/como-provar-amassado-pre-existente-locacao`
- `http://localhost:3000/blog/como-digitalizar-a-vistoria-da-sua-oficina`
- `http://localhost:3000/blog/laudo-de-avaria-com-qr-code`
- `http://localhost:3000/blog/vistoria-de-frota-sem-internet`

Abra também `http://localhost:3000/blog/categoria/locadora`, `.../seguro` e `.../frota` e confirme que os novos posts aparecem na categoria correspondente (a função `getPostsByCategorySlug` já existente deriva isso automaticamente do campo `category`).

- [ ] **Step 4: Commit**

```bash
git add src/content/blog.tsx
git commit -m "feat(blog): 4 posts de apoio linkando para as landings de segmento"
```

---

## Task 6: Verificação final integrada

**Files:**
- Nenhum arquivo novo — esta task só roda verificação de ponta a ponta depois que as Tasks 1-5 estão todas commitadas.

**Interfaces:**
- Consome: todas as rotas e posts criados nas Tasks 1-5

- [ ] **Step 1: Build completo**

```bash
npm run build
```
Esperado: build conclui sem erro, sem warnings novos de rota duplicada ou de tipo.

- [ ] **Step 2: Sitemap contém as 3 novas landings**

Com `npm run dev` (ou `npm run start` após o build), abra `http://localhost:3000/sitemap.xml` e confirme que `<loc>` inclui `https://danosaparentes.com.br/oficinas`, `.../seguradoras` e `.../frotas`, além dos 4 novos posts de blog.

- [ ] **Step 3: Navegação cruzada completa**

No navegador, percorra o fluxo completo de descoberta orgânica simulada:
1. Abra a home (`/`) e clique em cada um dos 4 links de segmento na barra de navegação
2. Em cada landing, clique no link final de blog ("Veja o guia/explicação completa no blog") e confirme que abre o post correto
3. Em cada post novo, confirme que o link de volta para a landing de segmento (`/frotas` ou `/seguradoras`, conforme o post) funciona
4. Confirme que o botão "Testar o plano Pro grátis" de cada landing leva a `/app?mode=signup`

- [ ] **Step 4: Lint e typecheck finais**

```bash
npm run lint
npm run typecheck
```
Esperado: ambos sem erros novos introduzidos pelos arquivos desta feature.

Nenhum commit nesta task — é só verificação; se algo falhar, o fix pertence à task correspondente (1-5) e deve ser corrigido e commitado lá.
