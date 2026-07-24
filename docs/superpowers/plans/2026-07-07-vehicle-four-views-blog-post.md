# Vehicle Four Views Blog Post Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a new blog post that demonstrates, with the real SVG diagrams, how the app covers the 4 vehicle views (Lateral Esquerda, Lateral Direita, Frontal, Traseira), and explains photo attachment per damage.

**Architecture:** A self-contained client component (`VehicleViewsDemo`) renders the 4 real `Car*` SVG diagrams with fixed mock damages (no click handlers — illustrative, not editable), driven by a tab switcher that mirrors the app's real UI (progress label, per-view damage list). This component is embedded directly in a new `BlogPost.content` entry in `src/content/blog.tsx`, reusing the blog's existing cover/SEO/sitemap machinery with zero changes to that infrastructure.

**Tech Stack:** Next.js App Router, React 19 (client component), TypeScript, existing `src/components/vehicles/Car*` SVG components, existing `src/types.ts` (`Damage`, `VehicleProps`).

## Global Constraints

- This repo has **no automated test runner** (0% test coverage, confirmed in prior audit). Every task's "test" step below is manual verification via the running dev server (`npm run dev`, already running on port 3000) plus `npm run typecheck` — not `pytest`/`jest`. Do not introduce a test framework as part of this plan; that's out of scope.
- Follow existing code conventions: no comments explaining *what* code does, only non-obvious *why*; 2-space indent; single quotes; matches the style already in `src/content/blog.tsx` and `src/components/vehicles/*`.
- No changes to `src/app/page.tsx`, `VehicleShowcaseSection.tsx`, `sitemap.ts`, or `robots.ts` — those are explicitly out of scope per the approved spec (`docs/superpowers/specs/2026-07-07-vehicle-four-views-blog-post-design.md`).
- The 4 SVG components (`CarLateralLeft`, `CarLateralRight`, `CarFrontal`, `CarTraseira`) require `damages: Damage[]`, `selectedPartId: string | null`, `onPartClick: (id, name) => void`, `onPartHover: (id, name) => void` — all four props are **required** (`VehicleProps` in `src/types.ts:90-97`), even though this demo never calls the click/hover handlers.
- `DamageId` is `Brand<string, 'DamageId'>` where `__brand` is optional (`src/types.ts:1`), so a plain string literal satisfies it — no cast needed.

---

### Task 1: `VehicleViewsDemo` component

**Files:**
- Create: `src/components/blog/VehicleViewsDemo.tsx`

**Interfaces:**
- Produces: `export default function VehicleViewsDemo(): JSX.Element` — a self-contained component with no props, safe to drop into any blog post `content`.

- [ ] **Step 1: Create the component file**

```tsx
// src/components/blog/VehicleViewsDemo.tsx
'use client';
import { useState } from 'react';
import CarLateralLeft from '../vehicles/CarLateralLeft';
import CarLateralRight from '../vehicles/CarLateralRight';
import CarFrontal from '../vehicles/CarFrontal';
import CarTraseira from '../vehicles/CarTraseira';
import type { Damage, DamageType, Severity } from '../../types';

type ViewKey = 'lateral-left' | 'lateral-right' | 'frontal' | 'traseira';

const TYPE_LABEL: Record<DamageType, string> = {
  scratch: 'Risco',
  dent: 'Amassado',
  broken: 'Quebrado',
};

const SEVERITY_LABEL: Record<Severity, string> = {
  low: 'Leve',
  medium: 'Médio',
  high: 'Grave',
};

function demoDamage(partial: {
  partId: string;
  partName: string;
  view: ViewKey;
  type: DamageType;
  severity: Severity;
}): Damage {
  return {
    id: `demo-${partial.partId}`,
    vehicle: 'car',
    view: partial.view,
    partId: partial.partId,
    partName: partial.partName,
    type: partial.type,
    typeName: TYPE_LABEL[partial.type],
    severity: partial.severity,
    notes: '',
    photos: [],
    photoNotes: [],
  };
}

const VIEWS: {
  key: ViewKey;
  label: string;
  Component: typeof CarLateralLeft;
  damage: Damage;
}[] = [
  {
    key: 'lateral-left',
    label: 'Lat. Esquerda',
    Component: CarLateralLeft,
    damage: demoDamage({
      partId: 'car-ll-fender-rear',
      partName: 'Para-lama Traseiro Esquerdo',
      view: 'lateral-left',
      type: 'scratch',
      severity: 'low',
    }),
  },
  {
    key: 'lateral-right',
    label: 'Lat. Direita',
    Component: CarLateralRight,
    damage: demoDamage({
      partId: 'car-rr-wheel-rear',
      partName: 'Roda Traseira Direita',
      view: 'lateral-right',
      type: 'scratch',
      severity: 'low',
    }),
  },
  {
    key: 'frontal',
    label: 'Frontal',
    Component: CarFrontal,
    damage: demoDamage({
      partId: 'car-f-bumper',
      partName: 'Para-choque Dianteiro',
      view: 'frontal',
      type: 'dent',
      severity: 'medium',
    }),
  },
  {
    key: 'traseira',
    label: 'Traseira',
    Component: CarTraseira,
    damage: demoDamage({
      partId: 'car-r-light-right',
      partName: 'Lanterna Traseira Direita',
      view: 'traseira',
      type: 'broken',
      severity: 'high',
    }),
  },
];

const noop = () => {};

export default function VehicleViewsDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = VIEWS[activeIndex];
  const Diagram = active.Component;

  return (
    <div className="not-prose my-10 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 backdrop-blur-md">
      <div className="flex flex-wrap gap-2 mb-2">
        {VIEWS.map((v, i) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-colors ${
              i === activeIndex
                ? 'bg-primary border-primary text-white'
                : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)]'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <div className="h-1.5 rounded-full bg-[var(--btn-secondary-bg)] overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${((activeIndex + 1) / VIEWS.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1.5">
          {activeIndex + 1} de {VIEWS.length} vistas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <Diagram
            damages={[active.damage]}
            selectedPartId={null}
            onPartClick={noop}
            onPartHover={noop}
          />
        </div>

        <div className="lg:col-span-5">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-widest text-[var(--signal-bright)] mb-2">
            Avaria registrada nesta vista
          </p>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--btn-secondary-bg)] px-4 py-3">
            <p className="text-sm font-bold text-[var(--text-main)]">{active.damage.partName}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {TYPE_LABEL[active.damage.type]} · {SEVERITY_LABEL[active.damage.severity]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors (in particular, no error about `Damage`/`VehicleProps` prop mismatches for the 4 `Car*` components, and no error about `DamageId`).

- [ ] **Step 3: Visual smoke test in isolation**

Temporarily render it on a throwaway route to check it visually before wiring into the blog post. Add a scratch file `src/app/dev-scratch/page.tsx`:

```tsx
'use client';
import VehicleViewsDemo from '@/src/components/blog/VehicleViewsDemo';

export default function DevScratchPage() {
  return (
    <div style={{ padding: 40, maxWidth: 900, margin: '0 auto' }}>
      <VehicleViewsDemo />
    </div>
  );
}
```

Open `http://localhost:3000/dev-scratch` in the browser (dev server already running). Confirm:
- The 4 tabs switch the diagram and the highlighted damaged part changes accordingly.
- The progress bar fills from 25% to 100% as you click through the 4 tabs.
- The side panel's part name/type/severity match the active tab.
- No console errors.

Then delete the scratch file — it must not be committed:

```bash
rm src/app/dev-scratch/page.tsx
rmdir src/app/dev-scratch
```

- [ ] **Step 4: Commit**

```bash
git add src/components/blog/VehicleViewsDemo.tsx
git commit -m "feat(blog): cria componente de demo das 4 vistas do veículo"
```

---

### Task 2: New blog post using `VehicleViewsDemo`

**Files:**
- Modify: `src/content/blog.tsx` (add one entry to `BLOG_POSTS`, add one `import`)

**Interfaces:**
- Consumes: `VehicleViewsDemo` from Task 1 (`src/components/blog/VehicleViewsDemo.tsx`, default export, no props).

- [ ] **Step 1: Add the import**

At the top of `src/content/blog.tsx`, alongside the existing `LaudoSheet` import:

```tsx
import { LaudoSheet } from '@/src/components/LaudoSheet'
import VehicleViewsDemo from '@/src/components/blog/VehicleViewsDemo'
```

- [ ] **Step 2: Add the new post entry**

Add this object as a new entry in the `BLOG_POSTS` array (anywhere in the array — order doesn't affect the site, `sitemap.ts` and `/blog` both read the whole array):

```tsx
  {
    slug: 'vistoria-nas-4-vistas-do-veiculo',
    title: 'Como a vistoria cobre as 4 vistas do veículo (com fotos por avaria)',
    excerpt:
      'Veja como o app guia a vistoria pelas 4 vistas do veículo — lateral esquerda, lateral direita, frontal e traseira — e como cada avaria pode levar suas próprias fotos.',
    category: 'Vistoria',
    tags: ['diagrama do veículo', 'avarias', 'fotos', 'vistoria'],
    date: '2026-07-07',
    readingMinutes: 4,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 45%,#1FB6FF 100%)', emoji: '🚗', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'as-4-vistas', label: 'As 4 vistas do veículo' },
      { id: 'fotos-por-avaria', label: 'Uma foto por avaria' },
    ],
    content: (
      <>
        <p>
          Uma vistoria completa não olha o carro só de um ângulo. O app guia você pelas{' '}
          <strong>4 vistas do veículo</strong> — lateral esquerda, lateral direita, frontal e
          traseira — para que nenhuma avaria fique de fora do laudo.
        </p>

        <h2 id="as-4-vistas">As 4 vistas do veículo</h2>
        <p>
          Em cada vista, você toca diretamente na peça avariada no diagrama — para-lama, porta,
          para-choque, farol, lanterna — e registra o tipo de dano (risco, amassado ou quebrado) e a
          severidade. Veja abaixo um exemplo real de cada uma das 4 vistas, cada uma com uma avaria
          já registrada:
        </p>

        <VehicleViewsDemo />

        <h2 id="fotos-por-avaria">Uma foto por avaria</h2>
        <p>
          Cada avaria registrada pode receber <strong>suas próprias fotos</strong> — não é uma galeria
          genérica do veículo, é a foto anexada exatamente àquele risco ou amassado, na peça certa.
          Isso elimina a dúvida clássica de laudo em papel: qual foto era de qual dano. Quando o
          aparelho tem GPS disponível, a localização da vistoria também fica registrada.
        </p>

        <Cta />
      </>
    ),
  },
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Verify in the browser**

Dev server is already running on port 3000. Navigate to `http://localhost:3000/blog/vistoria-nas-4-vistas-do-veiculo` and confirm:
- Page renders with title, cover, table of contents.
- The `VehicleViewsDemo` block renders between the two `<h2>` sections, tabs work.
- No console errors.
- Navigate to `http://localhost:3000/blog` and confirm the new post's card appears in the listing.

- [ ] **Step 5: Production build check**

Run: `npm run build`
Expected: build succeeds, and the output route list includes `/blog/vistoria-nas-4-vistas-do-veiculo` as a prerendered (`●`) page (same pattern as the other blog posts, via `generateStaticParams` in `src/app/blog/[slug]/page.tsx`).

- [ ] **Step 6: Commit**

```bash
git add src/content/blog.tsx
git commit -m "feat(blog): novo post sobre as 4 vistas do veículo e fotos por avaria"
```

---

## Self-Review Notes

- **Spec coverage:** Spec calls for (a) a component reusing the real 4 SVG views with mock damages, non-clickable — Task 1. (b) A new blog post embedding it plus a paragraph on photo attachment — Task 2. (c) No changes to landing page/sitemap/robots — respected (not touched anywhere in this plan). All covered.
- **Type consistency:** `Damage`, `DamageType`, `Severity`, `VehicleProps` names and shapes match `src/types.ts` exactly (verified against the file, not assumed). `VehicleViewsDemo` export name matches its only consumer (Task 2's import).
- **No placeholders:** every step has complete, runnable code — no TBD/TODO.
