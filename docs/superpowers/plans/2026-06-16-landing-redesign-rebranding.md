# Landing Redesign + "Danos Aparentes" Rebranding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the landing page (pricing section + visual polish), rebrand the product to "Danos Aparentes" app-wide, and add a new logo with a glow-reveal opening animation on the landing page.

**Architecture:** Pure frontend changes to the existing Vite + React SPA. No new dependencies, no backend changes. Brand assets are pre-generated static PNGs already committed to `public/brand/`. New `IntroAnimation` component plays once per landing page load using a CSS `@keyframes` animation (same pattern already used in `src/index.css` for the `pulse` animation), then unmounts.

**Tech Stack:** React 18 + TypeScript (existing), CSS keyframes in `src/index.css` (existing pattern), no new packages.

**Pre-existing assets (already generated and committed, do not regenerate):**
- `public/brand/logo-full.png` — full logo image (vehicles + "DANOS APARENTES" text), used by the opening animation.
- `public/brand/logo-icon.png` — cropped version (vehicles only, no text), 1850×1080px, used by the small header `Logo` component.

---

## Task 1: Rebrand strings to "Danos Aparentes"

**Files:**
- Modify: `src/components/Header.tsx:30`
- Modify: `src/components/Paywall.tsx:26-27`
- Modify: `src/lib/pdf.ts:363,365,433`
- Modify: `src/pages/Landing.tsx:155`

- [ ] **Step 1: Update the Header title**

In `src/components/Header.tsx`, find:

```tsx
        Avarias Aparentes
```

Replace with:

```tsx
        Danos Aparentes
```

- [ ] **Step 2: Update the Paywall copy**

In `src/components/Paywall.tsx`, find:

```tsx
  const title = status === 'past_due'
    ? 'Seu pagamento falhou'
    : 'Seu teste grátis de 7 dias acabou'

  const description = status === 'past_due'
    ? 'Não conseguimos confirmar o pagamento da sua assinatura. Atualize seu cartão para continuar usando o Vistoria+.'
    : 'Assine o Vistoria+ para continuar registrando vistorias, gerando laudos em PDF e usando a sincronização em nuvem.'
```

Replace with:

```tsx
  const title = status === 'past_due'
    ? 'Seu pagamento falhou'
    : 'Seu teste grátis de 7 dias acabou'

  const description = status === 'past_due'
    ? 'Não conseguimos confirmar o pagamento da sua assinatura. Atualize seu cartão para continuar usando o Danos Aparentes.'
    : 'Assine o Danos Aparentes para continuar registrando vistorias, gerando laudos em PDF e usando a sincronização em nuvem.'
```

- [ ] **Step 3: Update the PDF report branding**

In `src/lib/pdf.ts`, find (line 363):

```ts
          <p style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.42);letter-spacing:0.16em;text-transform:uppercase;margin-bottom:5px;">AvariasAPARENTES PWA • Sistema de Vistoria Veicular</p>
```

Replace with:

```ts
          <p style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.42);letter-spacing:0.16em;text-transform:uppercase;margin-bottom:5px;">Danos Aparentes • Sistema de Vistoria Veicular</p>
```

Find (line 365):

```ts
          <p style="font-size:10px;color:rgba(255,255,255,0.62);margin-bottom:12px;">Documento Técnico de Mapeamento de Avarias Aparentes</p>
```

Replace with:

```ts
          <p style="font-size:10px;color:rgba(255,255,255,0.62);margin-bottom:12px;">Documento Técnico de Mapeamento de Danos Aparentes</p>
```

Find (line 433):

```ts
          <p style="font-size:8px;color:#94a3b8;margin-bottom:2px;">AvariasAPARENTES PWA • Sistema de Vistoria Veicular</p>
```

Replace with:

```ts
          <p style="font-size:8px;color:#94a3b8;margin-bottom:2px;">Danos Aparentes • Sistema de Vistoria Veicular</p>
```

- [ ] **Step 4: Update the Landing footer**

In `src/pages/Landing.tsx`, find:

```tsx
        © {new Date().getFullYear()} Vistoria+ — Vistoria de Danos Aparentes
```

Replace with:

```tsx
        © {new Date().getFullYear()} Danos Aparentes — App de Inspeção e Registro
```

- [ ] **Step 5: Verify no unintended renames slipped through**

Run:

```bash
grep -rn "Vistoria+\|VISTORIA+\|AvariasAPARENTES PWA" src/
```

Expected: no output (all renamed). Note: generic phrases like "Sistema de Vistoria PRO" (Header badge) and "RELATÓRIO DE VISTORIA VEICULAR" (report title) are intentionally left as-is — they're not the product name.

- [ ] **Step 6: Build and commit**

```bash
npm run build
```

Expected: build succeeds with no new errors.

```bash
git add src/components/Header.tsx src/components/Paywall.tsx src/lib/pdf.ts src/pages/Landing.tsx
git commit -m "rebrand: rename product to Danos Aparentes"
```

---

## Task 2: Rewrite `Logo` component to use the new icon asset

**Files:**
- Modify: `src/components/Logo.tsx`

- [ ] **Step 1: Replace the hand-drawn SVG logo with the cropped PNG asset**

Replace the entire contents of `src/components/Logo.tsx` with:

```tsx
interface Props {
  size?: number
  showText?: boolean
}

export default function Logo({ size = 36, showText = true }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/brand/logo-icon.png"
        alt="Danos Aparentes"
        width={size}
        height={size}
        style={{ borderRadius: size * 0.22, objectFit: 'cover', flexShrink: 0 }}
      />
      {showText && (
        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: size * 0.5, color: '#e8f4ff', letterSpacing: 0.3 }}>
          Danos Aparentes
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify the asset is reachable**

```bash
npm run dev
```

In another terminal:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/brand/logo-icon.png
```

Expected: `200`. Stop the dev server (Ctrl+C) when done.

- [ ] **Step 3: Build and commit**

```bash
npm run build
```

Expected: build succeeds.

```bash
git add src/components/Logo.tsx
git commit -m "feat: replace Logo component with new icon asset"
```

---

## Task 3: Add the opening animation component

**Files:**
- Modify: `src/index.css`
- Create: `src/components/IntroAnimation.tsx`

- [ ] **Step 1: Add the keyframes**

In `src/index.css`, find:

```css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.7); }
}
```

Add immediately after it:

```css

@keyframes intro-glow-reveal {
  0% { opacity: 0; filter: drop-shadow(0 0 0px #00aaff); transform: scale(0.9); }
  40% { opacity: 1; filter: drop-shadow(0 0 40px #00aaff); }
  100% { opacity: 1; filter: drop-shadow(0 0 12px rgba(0,170,255,0.4)); transform: scale(1); }
}
```

- [ ] **Step 2: Create the `IntroAnimation` component**

Create `src/components/IntroAnimation.tsx`:

```tsx
import { useEffect, useState } from 'react'

const GLOW_DURATION_MS = 1400
const HOLD_MS = 300
const FADE_MS = 350

type Phase = 'playing' | 'fading' | 'done'

export default function IntroAnimation() {
  const [phase, setPhase] = useState<Phase>('playing')

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setPhase('done')
      return
    }
    const fadeTimer = setTimeout(() => setPhase('fading'), GLOW_DURATION_MS + HOLD_MS)
    const doneTimer = setTimeout(() => setPhase('done'), GLOW_DURATION_MS + HOLD_MS + FADE_MS)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  if (phase === 'done') return null

  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#02060d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'fading' ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: 'none',
      }}
    >
      <img
        src="/brand/logo-full.png"
        alt=""
        width={220}
        height={220}
        style={{ animation: 'intro-glow-reveal 1.4s ease-out both' }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Build and commit**

```bash
npm run build
```

Expected: build succeeds (component isn't used anywhere yet).

```bash
git add src/index.css src/components/IntroAnimation.tsx
git commit -m "feat: add IntroAnimation component with glow-reveal keyframes"
```

---

## Task 4: Wire the opening animation into the Landing page

**Files:**
- Modify: `src/pages/Landing.tsx`

- [ ] **Step 1: Import the component**

In `src/pages/Landing.tsx`, find:

```tsx
import Logo from '../components/Logo'
import VehicleDefs from '../components/vehicles/VehicleDefs'
import CarLateralLeft from '../components/vehicles/CarLateralLeft'
```

Replace with:

```tsx
import Logo from '../components/Logo'
import IntroAnimation from '../components/IntroAnimation'
import VehicleDefs from '../components/vehicles/VehicleDefs'
import CarLateralLeft from '../components/vehicles/CarLateralLeft'
```

- [ ] **Step 2: Render it at the top of the page**

Find:

```tsx
export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', color: 'var(--text-main)', fontFamily: 'Outfit,sans-serif', overflowX: 'hidden' }}>
      <VehicleDefs />
```

Replace with:

```tsx
export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', color: 'var(--text-main)', fontFamily: 'Outfit,sans-serif', overflowX: 'hidden' }}>
      <IntroAnimation />
      <VehicleDefs />
```

- [ ] **Step 3: Verify manually**

```bash
npm run dev
```

Open `http://localhost:5173/` in a browser. Expected: the full logo briefly appears centered on a dark background with a blue glow effect (~1.4s), then fades out revealing the landing page underneath. Reload the page — the animation should play again every time (it is not suppressed on repeat visits, per spec). Stop the dev server when done.

- [ ] **Step 4: Build and commit**

```bash
npm run build
```

Expected: build succeeds.

```bash
git add src/pages/Landing.tsx
git commit -m "feat: play intro animation on landing page load"
```

---

## Task 5: Add the pricing section

**Files:**
- Modify: `src/pages/Landing.tsx`

- [ ] **Step 1: Add the pricing section between "Como funciona" and the final CTA**

In `src/pages/Landing.tsx`, find the end of the "Como funciona" section and the start of the "CTA final" section:

```tsx
      {/* CTA final */}
      <section style={{ ...sectionStyle, textAlign: 'center', paddingBottom: 100 }}>
```

Replace with:

```tsx
      {/* Preço */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, marginBottom: 40 }}>
          Um plano <span style={{ color: '#00aaff' }}>simples</span>, sem pegadinha
        </h2>
        <div style={{
          maxWidth: 360, margin: '0 auto', background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: 20, padding: '32px 28px', textAlign: 'center', backdropFilter: 'blur(14px)',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            Plano único
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: 2 }}>
            R$ 49,90<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/mês</span>
          </div>
          <div style={{ color: '#00d4ff', fontSize: '0.8rem', fontWeight: 700, marginBottom: 22 }}>7 dias grátis pra testar</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Vistorias ilimitadas', 'Laudo em PDF com QR Code', 'Sincronização em nuvem', '7 dias grátis pra testar'].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                <span style={{ color: '#00aaff', fontWeight: 800 }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <a href="/app.html" style={{ ...ctaButton, width: '100%' }}>Criar conta grátis</a>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ ...sectionStyle, textAlign: 'center', paddingBottom: 100 }}>
```

- [ ] **Step 2: Verify manually**

```bash
npm run dev
```

Open `http://localhost:5173/` and scroll to confirm the pricing card appears between "Como funciona" and the final CTA, showing "R$ 49,90/mês", the 4-item checklist, and a working "Criar conta grátis" button. Stop the dev server when done.

- [ ] **Step 3: Build and commit**

```bash
npm run build
```

Expected: build succeeds.

```bash
git add src/pages/Landing.tsx
git commit -m "feat: add pricing section to landing page"
```

---

## Task 6: Visual polish (neon refinado)

**Files:**
- Modify: `src/index.css`
- Modify: `src/pages/Landing.tsx`

- [ ] **Step 1: Add a feature-card hover glow class**

In `src/index.css`, find:

```css
@media (max-width: 768px) {
  .main-grid { grid-template-columns: 1fr !important; }
}
```

Add immediately after it:

```css

.feature-card {
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}
.feature-card:hover {
  border-color: rgba(0,170,255,0.4);
  box-shadow: 0 0 24px rgba(0,170,255,0.15);
  transform: translateY(-2px);
}
```

- [ ] **Step 2: Apply the class to feature cards and add a second hero glow layer**

In `src/pages/Landing.tsx`, find:

```tsx
      {/* Hero — full-bleed com veículo 3D de fundo */}
      <section style={{ position: 'relative', padding: '28px 20px 90px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
          width: 'min(900px, 140vw)', opacity: 0.16, pointerEvents: 'none',
        }}>
          <CarLateralLeft damages={[]} selectedPartId={null} onPartClick={noop} onPartHover={noop} />
        </div>
```

Replace with:

```tsx
      {/* Hero — full-bleed com veículo 3D de fundo */}
      <section style={{ position: 'relative', padding: '28px 20px 90px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 'min(1400px, 200vw)', height: 700, opacity: 0.08, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, #00d4ff 0%, transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
          width: 'min(900px, 140vw)', opacity: 0.16, pointerEvents: 'none',
        }}>
          <CarLateralLeft damages={[]} selectedPartId={null} onPartClick={noop} onPartHover={noop} />
        </div>
```

Then find the feature card div:

```tsx
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14,
              padding: 22, backdropFilter: 'blur(12px)',
            }}>
```

Replace with:

```tsx
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card" style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14,
              padding: 22, backdropFilter: 'blur(12px)',
            }}>
```

Then find the step-number circle:

```tsx
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,170,255,0.12)',
                border: '1px solid rgba(0,170,255,0.3)', color: '#00aaff', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.1rem',
              }}>{i + 1}</div>
```

Replace with:

```tsx
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,170,255,0.12)',
                border: '1px solid rgba(0,170,255,0.3)', color: '#00aaff', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.1rem',
                boxShadow: '0 0 16px rgba(0,170,255,0.25)',
              }}>{i + 1}</div>
```

- [ ] **Step 3: Verify manually**

```bash
npm run dev
```

Open `http://localhost:5173/` and confirm: a softer secondary glow is visible behind the hero illustration, hovering over a feature card lifts it slightly with a blue glow border, and the numbered step circles in "Como funciona" have a subtle glow. Stop the dev server when done.

- [ ] **Step 4: Build and commit**

```bash
npm run build
```

Expected: build succeeds.

```bash
git add src/index.css src/pages/Landing.tsx
git commit -m "style: add neon glow polish to landing page sections"
```

---

## Task 7: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full rebrand grep check**

```bash
grep -rn "Vistoria+\|VISTORIA+\|AvariasAPARENTES PWA\|Avarias Aparentes" src/
```

Expected: no output. (If anything other than the intentionally-left generic phrases shows up, fix it before continuing.)

- [ ] **Step 2: Full build**

```bash
npm run build
```

Expected: build succeeds with no new errors or warnings beyond the pre-existing chunk-size warning.

- [ ] **Step 3: Manual responsive check**

```bash
npm run dev
```

Open `http://localhost:5173/` in a browser, then use devtools to switch to a mobile viewport (e.g. 375×812). Confirm: the intro animation, hero, feature grid, steps, pricing card, and footer all remain readable and don't overflow horizontally. Stop the dev server when done.

- [ ] **Step 4: Commit any final fixes**

If Step 1 or Step 3 surfaced issues, fix them and commit:

```bash
git add -A
git commit -m "fix: address final verification issues from landing redesign"
```

If no issues were found, no commit is needed for this task.
