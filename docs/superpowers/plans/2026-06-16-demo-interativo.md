# Demo Interativo de Página Única Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new route `/demo.html` — a single-screen, no-scroll page where a visitor can click on a car's SVG parts to mark damages (with voice feedback), without needing an account, ending in a CTA to sign up.

**Architecture:** New Vite multi-page entry (`demo.html` + `src/demo-main.tsx`), mounting a new `src/pages/Demo.tsx` page. Reuses the existing `VehicleViewer` component and `useTts` hook unmodified. Damages are tracked in local `useState` only (no IndexedDB, no Supabase, no login) — mirrors the add/remove logic already used in `App.tsx` but without persistence.

**Tech Stack:** React 18 + TypeScript (existing), Vite multi-page build (existing pattern — see `index.html`/`app.html`/`verify.html`), no new dependencies.

---

## Task 1: Vite entry point for the new route

**Files:**
- Create: `demo.html`
- Modify: `vite.config.ts`

- [ ] **Step 1: Create `demo.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="/logo.jpg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Demo Interativo — Danos Aparentes</title>
    <meta name="description" content="Experimente o Danos Aparentes: clique nas peças do carro, marque avarias e ouça a voz do sistema — sem precisar criar conta." />
    <meta name="theme-color" content="#0f172a" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/demo-main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Add the `demo` entry to the Vite build config**

In `vite.config.ts`, find:

```ts
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app.html'),
        verify: resolve(__dirname, 'verify.html'),
      },
    },
  },
```

Replace with:

```ts
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app.html'),
        verify: resolve(__dirname, 'verify.html'),
        demo: resolve(__dirname, 'demo.html'),
      },
    },
  },
```

- [ ] **Step 3: Verify**

```bash
npm run build
```

Expected: build succeeds (it will fail at this point because `src/demo-main.tsx` doesn't exist yet — that's expected; if the error is anything other than "Could not resolve ./src/demo-main.tsx" or similar module-not-found, stop and investigate). This step just confirms the `demo.html` file itself is well-formed and picked up by the build.

- [ ] **Step 4: Commit**

```bash
git add demo.html vite.config.ts
git commit -m "feat: add demo.html Vite entry point for interactive demo page"
```

---

## Task 2: Demo page entry script

**Files:**
- Create: `src/demo-main.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Demo from './pages/Demo'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Demo />
  </StrictMode>
)
```

(This mirrors `src/landing-main.tsx` exactly, just pointing at a `Demo` page instead of `Landing`. `src/pages/Demo.tsx` is created in Task 3 — this file won't compile until then, that's expected.)

- [ ] **Step 2: Commit**

```bash
git add src/demo-main.tsx
git commit -m "feat: add demo page entry script"
```

---

## Task 3: The `Demo` page component

**Files:**
- Create: `src/pages/Demo.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useState } from 'react'
import { Damage, DamageType } from '../types'
import { useTts } from '../hooks/useTts'
import VehicleViewer from '../components/VehicleViewer'
import Logo from '../components/Logo'

export default function Demo() {
  const [damages, setDamages] = useState<Damage[]>([])
  const { speak, speakHover } = useTts()

  function handleAddDamage(partId: string, partName: string, type: DamageType, typeName: string) {
    const newDamage: Damage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      vehicle: 'car',
      view: 'lateral-left',
      partId, partName, type, typeName,
      severity: 'low', notes: '', photos: [], photoNotes: [],
    }
    setDamages(prev => [...prev, newDamage])
  }

  function handleRemoveDamageFromPart(partId: string) {
    setDamages(prev => prev.filter(d => d.partId !== partId))
  }

  return (
    <div style={{
      height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'Outfit,sans-serif', color: 'var(--text-main)', padding: '16px 20px',
      boxSizing: 'border-box',
    }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: 10 }}>
        <Logo size={30} />
        <a href="/app.html" style={{
          border: '1px solid rgba(0,170,255,0.4)', color: '#00aaff', fontWeight: 700, fontSize: '0.82rem',
          padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontFamily: 'Outfit,sans-serif',
        }}>Entrar</a>
      </header>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem', margin: '0 0 8px', flexShrink: 0 }}>
        Clique nas peças do carro pra marcar uma avaria
      </p>

      <div style={{ flex: 1, minHeight: 0, display: 'grid' }}>
        <VehicleViewer
          vehicleType="car"
          viewType="lateral-left"
          damages={damages}
          onAddDamage={handleAddDamage}
          onRemoveDamageFromPart={handleRemoveDamageFromPart}
          speak={speak}
          speakHover={speakHover}
        />
      </div>

      <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexShrink: 0, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {damages.length} avaria{damages.length !== 1 ? 's' : ''} marcada{damages.length !== 1 ? 's' : ''}
        </span>
        <a href="/app.html" style={{
          background: '#00aaff', color: '#02101e', fontWeight: 800, fontSize: '0.88rem',
          padding: '10px 22px', borderRadius: 10, textDecoration: 'none', fontFamily: 'Outfit,sans-serif',
        }}>Gostou? Criar conta grátis</a>
      </footer>
    </div>
  )
}
```

Note on the `display: 'grid'` wrapper around `<VehicleViewer />`: `VehicleViewer`'s own root element is a flex column with no explicit height, so it sizes to its content by default. CSS Grid's default `align-items`/`justify-items` is `stretch`, which forces a lone grid item to fill the height of its grid area even when the item itself has `height: auto` — this is what makes `VehicleViewer` actually expand to fill the remaining vertical space instead of just taking its minimum content height. Do not change this wrapper to `display: 'flex'` — flexbox's default stretch only applies to the cross axis, which would not give the height-filling behavior needed here.

- [ ] **Step 2: Verify the build succeeds end-to-end**

```bash
npm run build
```

Expected: build succeeds with no errors (only the pre-existing chunk-size warning for `html2pdf` is expected).

- [ ] **Step 3: Manual verification — no scroll, desktop**

```bash
npm run dev
```

Open `http://localhost:5173/demo.html` in a browser at a normal desktop window size. Expected:
- The whole page fits within the viewport — no vertical or horizontal scrollbar appears.
- The car (lateral-left view) is visible and reasonably sized in the middle of the screen.
- Header shows the "Danos Aparentes" logo and an "Entrar" link.
- Footer shows "0 avarias marcadas" and a "Gostou? Criar conta grátis" button.

- [ ] **Step 4: Manual verification — interaction**

Still in the browser at `http://localhost:5173/demo.html`:
- Click on any part of the car. Expected: the same damage-type popover used in the real app appears (risco/amassado/quebrado/sem avaria).
- Choose a damage type (e.g. "Risco"). Expected: the popover closes, and the footer counter updates to "1 avaria marcada".
- If your browser/OS has speech synthesis available, you should hear the part name spoken when you click it (this matches the existing `speak`/`speakHover` behavior already used in the main app — if you don't hear anything, check your OS's available pt-BR voices, this is not specific to the demo page).
- Reload the page (`F5`). Expected: the counter resets to "0 avarias marcadas" (nothing is persisted, as designed).

- [ ] **Step 5: Manual verification — mobile viewport**

In the browser devtools, switch to a mobile viewport (375×812). Expected: still no scrollbar, the car and all header/footer elements remain visible and usable.

- [ ] **Step 6: Manual verification — CTA links**

Click "Entrar" in the header. Expected: navigates to `/app.html`. Go back, click "Gostou? Criar conta grátis" in the footer. Expected: also navigates to `/app.html`.

Stop the dev server (Ctrl+C) once all checks pass.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Demo.tsx
git commit -m "feat: add interactive single-page car damage demo"
```

---

## Task 4: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: succeeds, all 4 HTML entry points (`index.html`, `app.html`, `verify.html`, `demo.html`) produce output under `dist/`.

```bash
ls dist/*.html
```

Expected: `dist/app.html  dist/demo.html  dist/index.html  dist/verify.html`.

- [ ] **Step 2: Confirm the existing landing page and app are unaffected**

```bash
grep -rn "demo" src/pages/Landing.tsx src/App.tsx
```

Expected: no output — neither the existing landing page nor the main app should reference the new demo page (this task explicitly does not add any cross-links from existing pages to `/demo.html`; it's a standalone route for now).

- [ ] **Step 3: Commit any fixes**

If Steps 1-2 surfaced issues, fix them and commit:

```bash
git add -A
git commit -m "fix: address final verification issues from demo page"
```

If no issues were found, no commit is needed for this task.
