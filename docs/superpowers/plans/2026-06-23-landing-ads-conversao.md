# Landing Ads Conversão (Meta + TikTok) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Otimizar a landing para tráfego pago Meta/TikTok, medir cadastros com pixels de conversão e reduzir fricção mobile até o signup em `/app?mode=signup`.

**Architecture:** Módulo `src/lib/analytics/` centraliza UTMs (`sessionStorage`) e eventos Meta/TikTok. Banner LGPD gateia carregamento dos pixels. Landing usa hero fixo + CTA único + sticky bar mobile; `Login.tsx` abre signup via query param e dispara `CompleteRegistration`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Supabase Auth, Meta Pixel (fbq), TikTok Pixel (ttq).

## Global Constraints

- Escopo B apenas: landing + pixels + cadastro medível — sem Google Ads, A/B landings, SEO/blog.
- Pixels só carregam com `NEXT_PUBLIC_META_PIXEL_ID` ou `NEXT_PUBLIC_TIKTOK_PIXEL_ID` definidos **e** consentimento marketing aceito.
- Produção: carregar pixels quando `process.env.NODE_ENV === 'production'`; dev pode usar `NEXT_PUBLIC_ANALYTICS_ENABLED=true`.
- Headline fixa: “Laudo de avarias no celular em minutos — offline, com PDF e assinatura digital.”
- Subtexto: “Teste grátis por 7 dias. Para vistoriadores, oficinas e frotas.”
- CTA unificado: “Criar conta grátis” → `/app?mode=signup` (+ UTMs preservados).
- UTMs padrão: `utm_source=meta|tiktok`, `utm_medium=paid`, `utm_campaign={nome}`.
- Com qualquer `utm_*` na URL: não exibir `IntroVideo`.
- Manter `gtag` Google (`AW-18259031185`) existente — não remover.
- Spec: `docs/superpowers/specs/2026-06-23-landing-ads-conversao-design.md`

---

## File Structure

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/lib/analytics/consent.ts` | Ler/gravar `cookie_consent_marketing` em localStorage |
| `src/lib/analytics/utm.ts` | Capturar UTMs da URL → sessionStorage; append em hrefs |
| `src/lib/analytics/pixels.ts` | Init condicional Meta/TikTok; `trackPageView`, `trackLead`, `trackCompleteRegistration` |
| `src/components/CookieConsentBanner.tsx` | UI LGPD aceitar/recusar |
| `src/components/AnalyticsScripts.tsx` | Client component: init pixels após consent |
| `src/components/LandingCtaLink.tsx` | Link `/app?mode=signup` + `trackLead` no clique |
| `src/components/MobileStickyCta.tsx` | Barra fixa mobile com IntersectionObserver |
| `src/app/layout.tsx` | Montar `CookieConsentBanner` + `AnalyticsScripts` |
| `src/app/page.tsx` | Hero fixo, modo paid, integrar CTAs |
| `src/views/Login.tsx` | `mode=signup`, evento CompleteRegistration |
| `src/components/PricingSection.tsx` | CTA alinhado + Lead |
| `src/components/LegalContent.tsx` | Parágrafo Meta/TikTok pixels |
| `.env.example` | Novas env vars |

---

### Task 1: Consent + UTM helpers

**Files:**
- Create: `src/lib/analytics/consent.ts`
- Create: `src/lib/analytics/utm.ts`

**Interfaces:**
- Produces:
  ```ts
  // consent.ts
  export type MarketingConsent = 'accepted' | 'rejected' | 'unknown'
  export function getMarketingConsent(): MarketingConsent
  export function setMarketingConsent(value: 'accepted' | 'rejected'): void
  export function hasMarketingConsent(): boolean

  // utm.ts
  export type UtmParams = { source?: string; medium?: string; campaign?: string; content?: string }
  export function captureUtmParamsFromUrl(): void
  export function getStoredUtms(): UtmParams
  export function appendUtmsToPath(path: string): string
  export function hasPaidTrafficParams(): boolean
  ```

- [ ] **Step 1: Criar `consent.ts`**

```ts
const KEY = 'cookie_consent_marketing'

export type MarketingConsent = 'accepted' | 'rejected' | 'unknown'

export function getMarketingConsent(): MarketingConsent {
  if (typeof window === 'undefined') return 'unknown'
  const v = localStorage.getItem(KEY)
  if (v === 'accepted' || v === 'rejected') return v
  return 'unknown'
}

export function setMarketingConsent(value: 'accepted' | 'rejected'): void {
  localStorage.setItem(KEY, value)
  window.dispatchEvent(new CustomEvent('marketing-consent-changed', { detail: value }))
}

export function hasMarketingConsent(): boolean {
  return getMarketingConsent() === 'accepted'
}
```

- [ ] **Step 2: Criar `utm.ts`**

```ts
const STORAGE_KEY = 'utm_attribution'

export type UtmParams = {
  source?: string
  medium?: string
  campaign?: string
  content?: string
}

export function captureUtmParamsFromUrl(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const next: UtmParams = {}
  if (params.get('utm_source')) next.source = params.get('utm_source')!
  if (params.get('utm_medium')) next.medium = params.get('utm_medium')!
  if (params.get('utm_campaign')) next.campaign = params.get('utm_campaign')!
  if (params.get('utm_content')) next.content = params.get('utm_content')!
  if (Object.keys(next).length > 0) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
}

export function getStoredUtms(): UtmParams {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function appendUtmsToPath(path: string): string {
  const utms = getStoredUtms()
  const url = new URL(path, window.location.origin)
  if (utms.source) url.searchParams.set('utm_source', utms.source)
  if (utms.medium) url.searchParams.set('utm_medium', utms.medium)
  if (utms.campaign) url.searchParams.set('utm_campaign', utms.campaign)
  if (utms.content) url.searchParams.set('utm_content', utms.content)
  return url.pathname + url.search
}

export function hasPaidTrafficParams(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  if (params.has('utm_source') || params.has('utm_medium') || params.has('utm_campaign')) return true
  const stored = getStoredUtms()
  return Boolean(stored.source || stored.medium || stored.campaign)
}
```

- [ ] **Step 3: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS (sem erros nos novos arquivos)

---

### Task 2: Pixel tracking module

**Files:**
- Create: `src/lib/analytics/pixels.ts`

**Interfaces:**
- Consumes: `hasMarketingConsent`, `getStoredUtms` from Task 1
- Produces:
  ```ts
  export function analyticsEnabled(): boolean
  export function initPixels(): void
  export function trackPageView(): void
  export function trackLead(): void
  export function trackCompleteRegistration(): void
  ```

- [ ] **Step 1: Criar `pixels.ts`**

```ts
import { hasMarketingConsent } from './consent'
import { getStoredUtms } from './utm'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
    ttq?: { track: (event: string, payload?: Record<string, unknown>) => void; page: () => void; load: (id: string) => void }
  }
}

const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const TIKTOK_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

export function analyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (!hasMarketingConsent()) return false
  const force = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'
  const isProd = process.env.NODE_ENV === 'production'
  if (!force && !isProd) return false
  return Boolean(META_ID || TIKTOK_ID)
}

function utmPayload() {
  const u = getStoredUtms()
  return {
    utm_source: u.source,
    utm_medium: u.medium,
    utm_campaign: u.campaign,
    utm_content: u.content,
  }
}

export function initPixels(): void {
  if (!analyticsEnabled()) return

  if (META_ID && !window.fbq) {
    ;(function (f: Window, b: Document, e: string, v: string, n?: any, t?: HTMLScriptElement, s?: Element) {
      if (f.fbq) return
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = true
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e) as HTMLScriptElement
      t.async = true
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode!.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    window.fbq!('init', META_ID)
  }

  if (TIKTOK_ID && !window.ttq) {
    window.ttq = {
      load: (id: string) => {
        const s = document.createElement('script')
        s.src = 'https://analytics.tiktok.com/i18n/pixel/events.js'
        s.async = true
        s.onload = () => {
          ;(window as any).ttq.instance = (window as any).TiktokAnalyticsObject
        }
        document.head.appendChild(s)
        ;(window as any).TiktokAnalyticsObject = 'ttq'
        ;(window as any).ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']
        ;(window as any).ttq.setAndDefer = function (t: any, e: string) {
          t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) }
        }
        const t = (window as any).ttq
        for (const m of t.methods) t.setAndDefer(t, m)
        t.load(id)
      },
      page: () => {},
      track: () => {},
    }
    window.ttq.load(TIKTOK_ID)
  }
}

export function trackPageView(): void {
  if (!analyticsEnabled()) return
  const payload = utmPayload()
  window.fbq?.('track', 'PageView', payload)
  window.ttq?.page?.()
}

export function trackLead(): void {
  if (!analyticsEnabled()) return
  const payload = utmPayload()
  window.fbq?.('track', 'Lead', payload)
  window.ttq?.track?.('SubmitForm', payload)
}

export function trackCompleteRegistration(): void {
  if (!analyticsEnabled()) return
  const payload = utmPayload()
  window.fbq?.('track', 'CompleteRegistration', payload)
  window.ttq?.track?.('CompleteRegistration', payload)
}
```

- [ ] **Step 2: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

**Nota implementador:** Se o snippet TikTok oficial divergir, substituir `initPixels` pelo script do TikTok Events Manager mantendo as mesmas funções exportadas.

---

### Task 3: Cookie consent banner

**Files:**
- Create: `src/components/CookieConsentBanner.tsx`

**Interfaces:**
- Consumes: `getMarketingConsent`, `setMarketingConsent` from Task 1
- Produces: default export `CookieConsentBanner`

- [ ] **Step 1: Criar componente**

```tsx
'use client';
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMarketingConsent, setMarketingConsent } from '@/src/lib/analytics/consent'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getMarketingConsent() === 'unknown')
  }, [])

  if (!visible) return null

  function accept() {
    setMarketingConsent('accepted')
    setVisible(false)
    window.dispatchEvent(new Event('marketing-consent-changed'))
  }

  function reject() {
    setMarketingConsent('rejected')
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed bottom-0 inset-x-0 z-[99990] p-4 bg-slate-950/95 border-t border-slate-700 backdrop-blur-md"
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <p className="text-xs text-slate-300 leading-relaxed">
          Usamos cookies de marketing (Meta e TikTok) para medir cadastros vindos de anúncios.{' '}
          <Link href="/privacidade" className="text-sky-400 underline">Política de Privacidade</Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={reject} className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-600 text-slate-300">
            Recusar
          </button>
          <button type="button" onClick={accept} className="px-4 py-2 text-xs font-bold rounded-lg bg-sky-500 text-slate-950">
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Teste manual**

Abrir `/` em aba anônima → banner visível → Aceitar → banner some → `localStorage.cookie_consent_marketing === 'accepted'`

---

### Task 4: AnalyticsScripts + layout integration

**Files:**
- Create: `src/components/AnalyticsScripts.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `initPixels`, `trackPageView`, `analyticsEnabled`, `captureUtmParamsFromUrl`, `hasMarketingConsent`

- [ ] **Step 1: Criar `AnalyticsScripts.tsx`**

```tsx
'use client';
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { captureUtmParamsFromUrl } from '@/src/lib/analytics/utm'
import { initPixels, trackPageView, analyticsEnabled } from '@/src/lib/analytics/pixels'
import { hasMarketingConsent } from '@/src/lib/analytics/consent'

export default function AnalyticsScripts() {
  const pathname = usePathname()

  useEffect(() => {
    captureUtmParamsFromUrl()
  }, [])

  useEffect(() => {
    function sync() {
      if (!hasMarketingConsent()) return
      initPixels()
      trackPageView()
    }
    sync()
    window.addEventListener('marketing-consent-changed', sync)
    return () => window.removeEventListener('marketing-consent-changed', sync)
  }, [])

  useEffect(() => {
    if (analyticsEnabled()) trackPageView()
  }, [pathname])

  return null
}
```

- [ ] **Step 2: Modificar `layout.tsx`**

Importar e renderizar antes de `</body>`:

```tsx
import CookieConsentBanner from '@/src/components/CookieConsentBanner'
import AnalyticsScripts from '@/src/components/AnalyticsScripts'

// inside body, after {children}:
<CookieConsentBanner />
<AnalyticsScripts />
```

Manter scripts `gtag` existentes intactos.

- [ ] **Step 3: Teste manual**

Com consent aceito + env IDs fake em dev (`NEXT_PUBLIC_ANALYTICS_ENABLED=true`): network tab mostra requests para `facebook.net` / `tiktok.com` ao navegar.

---

### Task 5: LandingCtaLink + MobileStickyCta

**Files:**
- Create: `src/components/LandingCtaLink.tsx`
- Create: `src/components/MobileStickyCta.tsx`

**Interfaces:**
- Produces:
  ```tsx
  // LandingCtaLink
  interface LandingCtaLinkProps {
    className?: string
    children: React.ReactNode
  }
  // MobileStickyCta
  interface MobileStickyCtaProps { heroCtaId?: string }
  ```

- [ ] **Step 1: Criar `LandingCtaLink.tsx`**

```tsx
'use client';
import Link from 'next/link'
import { trackLead } from '@/src/lib/analytics/pixels'
import { appendUtmsToPath } from '@/src/lib/analytics/utm'

interface Props {
  className?: string
  children: React.ReactNode
}

export default function LandingCtaLink({ className, children }: Props) {
  const href = typeof window !== 'undefined'
    ? appendUtmsToPath('/app?mode=signup')
    : '/app?mode=signup'

  return (
    <Link
      href={href}
      onClick={() => trackLead()}
      className={className}
    >
      {children}
    </Link>
  )
}
```

**Nota:** Para SSR correto do href, usar padrão client-only href via `useEffect` state ou passar href calculado no parent após mount — implementador deve garantir href com UTMs no client.

- [ ] **Step 2: Criar `MobileStickyCta.tsx`**

Barra fixa `md:hidden`, `position: fixed; bottom: 0`, contém `LandingCtaLink`. Usar `IntersectionObserver` no elemento `#hero-primary-cta` para `hidden` quando hero CTA visível.

- [ ] **Step 3: Teste manual**

Mobile viewport 390px → sticky visível ao scrollar abaixo do hero → some quando hero CTA na tela.

---

### Task 6: Landing page hero + paid traffic mode

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Substituir `TextCarousel` por hero fixo**

Remover componente `TextCarousel` (ou deixar unused e deletar). Inserir:

```tsx
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.08] text-[var(--text-main)] text-balance">
  Laudo de avarias no celular em minutos —{' '}
  <span className="text-primary italic">offline, com PDF e assinatura digital.</span>
</h1>
<p className="text-base sm:text-lg text-[var(--text-muted)] max-w-lg leading-relaxed">
  Teste grátis por 7 dias. Para vistoriadores, oficinas e frotas.
</p>
```

- [ ] **Step 2: Unificar CTAs**

Substituir `Link href="/app"` primários por `LandingCtaLink` com label **“Criar conta grátis”**. Header CTA idem. Adicionar `id="hero-primary-cta"` no botão hero.

Micro-prova abaixo do CTA:

```tsx
<p className="text-xs text-[var(--text-muted)] font-semibold">
  7 dias grátis · Sem cartão · Funciona offline
</p>
```

- [ ] **Step 3: Modo tráfego pago — IntroVideo**

```tsx
const [paidTraffic, setPaidTraffic] = useState(false)
useEffect(() => {
  captureUtmParamsFromUrl()
  setPaidTraffic(hasPaidTrafficParams())
}, [])

// render:
{!paidTraffic && <IntroVideo />}
```

Import `captureUtmParamsFromUrl`, `hasPaidTrafficParams` from utm module.

- [ ] **Step 4: Montar `MobileStickyCta`**

Adicionar `<MobileStickyCta heroCtaId="hero-primary-cta" />` antes do footer.

- [ ] **Step 5: Performance mobile (hero)**

No bloco `<style>` ou `globals.css` `@media (max-width: 900px)`:
- Desligar `.animate-bounce-slow` e `.animate-bounce-slow-reverse` no hero
- `.glass-card { backdrop-filter: none; background: rgba(15,23,42,0.85); }` se ainda não aplicado

- [ ] **Step 6: Teste manual**

`/?utm_source=meta` → sem IntroVideo; CTA → `/app?mode=signup&utm_source=meta`

---

### Task 7: Login signup deep link + CompleteRegistration

**Files:**
- Modify: `src/views/Login.tsx`

- [ ] **Step 1: Ler `mode=signup` na mount**

```tsx
import { useSearchParams } from 'next/navigation'
import { trackCompleteRegistration } from '@/src/lib/analytics/pixels'

// inside component:
const searchParams = useSearchParams()
useEffect(() => {
  if (searchParams.get('mode') === 'signup') setMode('signup')
}, [searchParams])
```

Envolver export em `<Suspense>` no parent (`app/page.tsx`) se Next exigir.

- [ ] **Step 2: Disparar evento após signup**

No bloco `mode === 'signup'` após `await onSignUp` sucesso:

```tsx
trackCompleteRegistration()
setInfo('Conta criada! Seu teste de 7 dias começou. Verifique seu email se necessário.')
```

- [ ] **Step 3: Teste manual**

`/app?mode=signup` → formulário em “Começar agora” → signup → evento CompleteRegistration (Meta Events Manager / TikTok test events)

---

### Task 8: PricingSection + Legal + env

**Files:**
- Modify: `src/components/PricingSection.tsx`
- Modify: `src/components/LegalContent.tsx`
- Modify: `.env.example`

- [ ] **Step 1: Pricing CTA**

Trocar `Link href="/app"` por `LandingCtaLink` com “Começar teste grátis” (ou “Criar conta grátis” — manter copy consistente).

- [ ] **Step 2: LegalContent**

Adicionar parágrafo na seção privacidade:

> “Utilizamos pixels de conversão da Meta (Facebook/Instagram) e TikTok para medir cadastros originados de campanhas publicitárias, somente após seu consentimento.”

- [ ] **Step 3: `.env.example`**

```env
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

- [ ] **Step 4: Teste end-to-end checklist**

| # | Passo | Esperado |
|---|--------|----------|
| 1 | `/` anônimo | Banner cookies |
| 2 | Recusar | Sem requests Meta/TikTok |
| 3 | Aceitar + IDs | Pixels carregam |
| 4 | CTA landing | Lead + navega `/app?mode=signup` |
| 5 | Signup OK | CompleteRegistration |
| 6 | `?utm_source=tiktok` | IntroVideo off |

---

## Spec Coverage Checklist

| Requisito spec | Task |
|----------------|------|
| Hero fixo + copy | Task 6 |
| CTA unificado | Tasks 5, 6, 8 |
| Sticky mobile CTA | Task 5 |
| IntroVideo off com UTM | Task 6 |
| Meta + TikTok pixels | Tasks 2, 4 |
| Eventos PageView/Lead/CompleteRegistration | Tasks 2, 4, 5, 7 |
| UTMs sessionStorage | Task 1, 6 |
| Banner LGPD | Task 3 |
| `/app?mode=signup` | Tasks 5, 7 |
| Política privacidade | Task 8 |
| Performance mobile hero | Task 6 |
| Manter gtag Google | Task 4 (não remover) |

---

## Out of Scope (não implementar)

- Google Ads campaigns / otimizar AW tag
- Landings A/B separadas
- Guia de criativos Meta/TikTok
- Checkout Stripe no paywall
