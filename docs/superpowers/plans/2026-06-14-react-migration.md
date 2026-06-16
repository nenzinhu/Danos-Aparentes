# AvariasAPARENTES — React Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o app standalone `index.html` (vanilla JS) para React + Vite, mantendo design e todas as features idênticos ou melhores.

**Architecture:** O `index.html` raiz é restaurado como entry point Vite padrão. Todo o código vai em `src/`. Os 24 SVGs são extraídos do `index.html` original (que fica intacto como referência) e viram componentes React tipados. Estado global no `App.tsx`, persistência via IndexedDB.

**Tech Stack:** Vite 5, React 18, TypeScript, Tailwind CSS, Framer Motion, html2pdf.js, Web Speech API, IndexedDB

**Referência SVG:** O arquivo `index.html` na raiz do projeto contém os SVGs originais. NÃO apague esse arquivo — ele é a referência de design. As linhas de cada container SVG são:
- car-lateral-left: 2216 | car-lateral-right: 2334 | car-frontal: 2432 | car-traseira: 2516
- moto-lateral-left: 2598 | moto-lateral-right: 2743 | moto-frontal: 2886 | moto-traseira: 2980
- truck-lateral-left: 3050 | truck-lateral-right: 3178 | truck-frontal: 3302 | truck-traseira: 3393
- bus-lateral-left: 3470 | bus-lateral-right: 3620 | bus-frontal: 3757 | bus-traseira: 3877
- van-lateral-left: 3968 | van-lateral-right: 4071 | van-frontal: 4174 | van-traseira: 4251
- custom-lateral-left: 4348 | custom-lateral-right: 4368 | custom-frontal: 4388 | custom-traseira: 4400

---

## Task 1: Restaurar entry point Vite + limpar src/

**Files:**
- Modify: `index.html` (raiz)
- Delete: todo conteúdo de `src/`

- [ ] **Step 1: Fazer backup do index.html standalone**

```bash
copy index.html index.standalone.html
```

- [ ] **Step 2: Substituir index.html pelo entry point Vite padrão**

Escrever em `index.html`:
```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="/logo.jpg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vistoria de Danos Veiculares</title>
    <meta name="theme-color" content="#0f172a" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Apagar todo conteúdo de src/**

```bash
Remove-Item -Recurse -Force src\*
```

- [ ] **Step 4: Criar estrutura de pastas**

```bash
New-Item -ItemType Directory -Force src\components\vehicles
New-Item -ItemType Directory -Force src\hooks
New-Item -ItemType Directory -Force src\lib
```

---

## Task 2: types.ts

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Criar src/types.ts**

```typescript
export type VehicleType = 'car' | 'moto' | 'truck' | 'van' | 'bus' | 'custom'
export type ViewType = 'lateral-left' | 'lateral-right' | 'frontal' | 'traseira'
export type DamageType = 'scratch' | 'dent' | 'broken'
export type Severity = 'low' | 'medium' | 'high'

export interface Damage {
  id: string
  vehicle: VehicleType
  view: ViewType
  partId: string
  partName: string
  type: DamageType
  typeName: string
  severity: Severity
  notes: string
  photos: string[]
}

export interface VehicleInfo {
  owner: string
  phone: string
  brand: string
  plate: string
  generalNotes: string
}

export interface SavedReport {
  id: string
  savedAt: number
  vehicleInfo: VehicleInfo
  damages: Damage[]
}

export interface TtsConfig {
  active: boolean
  hoverActive: boolean
  engine: 'native' | 'google-tts'
  gender: 'male' | 'female'
  rate: number
  pitch: number
  volume: number
}

export interface VehicleProps {
  damages: Damage[]
  selectedPartId: string | null
  onPartClick: (id: string, name: string) => void
  onPartHover: (id: string, name: string) => void
}
```

---

## Task 3: src/index.css — tema neon

**Files:**
- Create: `src/index.css`

- [ ] **Step 1: Criar src/index.css copiando as variáveis CSS do index.standalone.html**

Abrir `index.standalone.html`, localizar a seção `:root { ... }` (linhas 17–61) e `body.light-mode { ... }` (linhas 63–97). Portar para `src/index.css` substituindo `body.light-mode` por `html.light`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

:root {
  --bg-gradient: radial-gradient(ellipse 120% 80% at 50% -10%, #0d1f3c 0%, #060d1a 50%, #020408 100%);
  --card-bg: rgba(10, 20, 40, 0.72);
  --card-border: rgba(0, 190, 255, 0.12);
  --glass-shadow: 0 8px 40px 0 rgba(0,0,0,0.6), 0 0 0 1px rgba(0,190,255,0.06);
  --text-main: #e8f4ff;
  --text-muted: #7a9bbf;
  --primary: #00aaff;
  --primary-hover: #0080d4;
  --primary-glow: rgba(0,170,255,0.4);
  --color-clean: #1e3a5a;
  --color-hover: #2a4f7a;
  --severity-low: #f59e0b;
  --severity-medium: #f97316;
  --severity-high: #ef4444;
  --whatsapp-color: #22c55e;
  --whatsapp-hover: #16a34a;
  --input-bg: rgba(5,15,35,0.75);
  --input-border: rgba(0,170,255,0.15);
  --input-color: #e8f4ff;
  --panel-bg: rgba(5,15,30,0.5);
  --panel-border: rgba(0,170,255,0.05);
  --tooltip-bg: rgba(5,15,35,0.92);
  --tooltip-border: rgba(0,170,255,0.25);
  --tooltip-color: #e8f4ff;
  --part-stroke: #050c1a;
  --btn-secondary-bg: rgba(0,170,255,0.07);
  --btn-secondary-border: rgba(0,170,255,0.18);
  --btn-secondary-hover: rgba(0,170,255,0.14);
  --scrollbar-track: rgba(0,0,0,0.2);
  --scrollbar-thumb: rgba(0,170,255,0.18);
  --neon-blue: #00aaff;
  --neon-cyan: #00d4ff;
  --neon-purple: #7c3aed;
  --neon-glow-sm: 0 0 12px rgba(0,170,255,0.5);
  --neon-glow-lg: 0 0 30px rgba(0,170,255,0.3), 0 0 60px rgba(0,170,255,0.1);
}

html.light {
  --bg-gradient: radial-gradient(ellipse 120% 80% at 50% -10%, #e8f4ff 0%, #f0f7ff 50%, #f8faff 100%);
  --card-bg: rgba(255,255,255,0.82);
  --card-border: rgba(0,120,220,0.12);
  --glass-shadow: 0 8px 40px 0 rgba(0,80,160,0.1), 0 0 0 1px rgba(0,120,220,0.06);
  --text-main: #0a1628;
  --text-muted: #4a6080;
  --primary: #0077cc;
  --primary-hover: #005fa3;
  --primary-glow: rgba(0,119,204,0.25);
  --neon-blue: #0077cc;
  --neon-cyan: #0099ee;
  --neon-glow-sm: 0 0 10px rgba(0,119,204,0.3);
  --color-clean: #bfd8f0;
  --color-hover: #92b8d8;
  --input-bg: rgba(255,255,255,0.95);
  --input-border: rgba(0,120,220,0.18);
  --input-color: #0a1628;
  --panel-bg: rgba(0,100,200,0.03);
  --panel-border: rgba(0,120,220,0.06);
  --tooltip-bg: rgba(255,255,255,0.97);
  --tooltip-border: rgba(0,120,220,0.2);
  --tooltip-color: #0a1628;
  --part-stroke: #90b8d0;
  --btn-secondary-bg: rgba(0,120,220,0.06);
  --btn-secondary-border: rgba(0,120,220,0.15);
  --btn-secondary-hover: rgba(0,120,220,0.1);
  --scrollbar-track: rgba(0,80,160,0.05);
  --scrollbar-thumb: rgba(0,100,200,0.2);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg-gradient);
  color: var(--text-main);
  font-family: 'Outfit', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
  transition: background 0.3s, color 0.3s;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,170,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,170,255,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
}

body > * { position: relative; z-index: 1; }

/* Glass card */
.glass-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  box-shadow: var(--glass-shadow);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* SVG parts */
.part {
  cursor: pointer;
  transition: fill 0.2s, filter 0.2s;
  fill: var(--color-clean);
  stroke: var(--part-stroke);
  stroke-width: 1;
}
.part:hover { fill: var(--color-hover) !important; filter: var(--neon-glow-sm); }

.part.damage-low   { fill: var(--severity-low)    !important; filter: drop-shadow(0 0 5px rgba(234,179,8,0.6)); }
.part.damage-medium{ fill: var(--severity-medium) !important; filter: drop-shadow(0 0 5px rgba(249,115,22,0.6)); }
.part.damage-high  { fill: var(--severity-high)   !important; filter: drop-shadow(0 0 5px rgba(239,68,68,0.6)); }
.part.selected     { fill: var(--primary)         !important; filter: var(--neon-glow-sm); }

[id^="container-car-"]    .part { --color-clean: url(#metal-car-blue); }
[id^="container-moto-"]   .part { --color-clean: url(#metal-moto-dark); }
[id^="container-truck-"]  .part { --color-clean: url(#metal-truck-gradient); }
[id^="container-bus-"]    .part { --color-clean: url(#metal-bus-gradient); }
[id^="container-van-"]    .part { --color-clean: url(#metal-van-gradient); }

.wheel-pneu  { fill: #121824; stroke: #020617; stroke-width: 2.5; pointer-events: none; }
.glass-light { fill: #fef08a; opacity: 0.85; stroke: #eab308; stroke-width: 1.5; pointer-events: none; }
.glass-light-red { fill: #f87171; opacity: 0.85; stroke: #dc2626; stroke-width: 1.5; pointer-events: none; }
.shadow-ground { fill: rgba(2,6,23,0.55); filter: blur(8px); pointer-events: none; }
.aesthetic-line { fill: none; stroke: rgba(15,23,42,0.65); stroke-width: 1.8; pointer-events: none; }

/* Scrollbar */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--scrollbar-track); }
::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 3px; }

/* Inputs */
.form-input {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--input-color);
  border-radius: 8px;
  padding: 8px 12px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus { border-color: var(--primary); }
```

---

## Task 4: lib/db.ts — IndexedDB wrapper

**Files:**
- Create: `src/lib/db.ts`

- [ ] **Step 1: Criar src/lib/db.ts**

```typescript
const DB_NAME = 'avarias-pwa'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('damages'))
        db.createObjectStore('damages', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('metadata'))
        db.createObjectStore('metadata')
      if (!db.objectStoreNames.contains('saved_reports'))
        db.createObjectStore('saved_reports', { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode)
    const s = t.objectStore(store)
    const req = fn(s)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export const db = {
  async getAllDamages() {
    return tx<import('../types').Damage[]>('damages', 'readonly', s => s.getAll())
  },
  async putDamage(d: import('../types').Damage) {
    return tx('damages', 'readwrite', s => s.put(d))
  },
  async deleteDamage(id: string) {
    return tx('damages', 'readwrite', s => s.delete(id))
  },
  async clearDamages() {
    return tx('damages', 'readwrite', s => s.clear())
  },
  async getMeta<T>(key: string): Promise<T | undefined> {
    return tx<T>('metadata', 'readonly', s => s.get(key))
  },
  async setMeta(key: string, value: unknown) {
    return tx('metadata', 'readwrite', s => s.put(value, key))
  },
  async getAllSaved() {
    return tx<import('../types').SavedReport[]>('saved_reports', 'readonly', s => s.getAll())
  },
  async putSaved(r: import('../types').SavedReport) {
    return tx('saved_reports', 'readwrite', s => s.put(r))
  },
  async deleteSaved(id: string) {
    return tx('saved_reports', 'readwrite', s => s.delete(id))
  },
}
```

---

## Task 5: lib/imageUtils.ts — compressão de foto

**Files:**
- Create: `src/lib/imageUtils.ts`

- [ ] **Step 1: Criar src/lib/imageUtils.ts**

```typescript
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function compressImage(dataUrl: string, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataUrl
  })
}
```

---

## Task 6: hooks/useDamages.ts

**Files:**
- Create: `src/hooks/useDamages.ts`

- [ ] **Step 1: Criar src/hooks/useDamages.ts**

```typescript
import { useState, useEffect } from 'react'
import { Damage } from '../types'
import { db } from '../lib/db'

export function useDamages() {
  const [damages, setDamages] = useState<Damage[]>([])

  useEffect(() => {
    db.getAllDamages().then(setDamages)
  }, [])

  async function addDamage(d: Damage) {
    await db.putDamage(d)
    setDamages(prev => [...prev, d])
  }

  async function removeDamage(id: string) {
    await db.deleteDamage(id)
    setDamages(prev => prev.filter(d => d.id !== id))
  }

  async function updateDamage(id: string, patch: Partial<Damage>) {
    setDamages(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, ...patch } : d)
      const target = updated.find(d => d.id === id)
      if (target) db.putDamage(target)
      return updated
    })
  }

  async function clearDamages() {
    await db.clearDamages()
    setDamages([])
  }

  return { damages, addDamage, removeDamage, updateDamage, clearDamages }
}
```

---

## Task 7: hooks/useZoomPan.ts

**Files:**
- Create: `src/hooks/useZoomPan.ts`

- [ ] **Step 1: Criar src/hooks/useZoomPan.ts**

```typescript
import { useRef, useState, useEffect, RefObject } from 'react'

export function useZoomPan(containerRef: RefObject<HTMLDivElement>) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const pinchDist = useRef<number | null>(null)

  function reset() { setScale(1); setOffset({ x: 0, y: 0 }) }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      setScale(s => Math.min(4, Math.max(0.5, s - e.deltaY * 0.001)))
    }

    function onMouseDown(e: MouseEvent) {
      dragging.current = true
      last.current = { x: e.clientX, y: e.clientY }
    }

    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      setOffset(o => ({ x: o.x + e.clientX - last.current.x, y: o.y + e.clientY - last.current.y }))
      last.current = { x: e.clientX, y: e.clientY }
    }

    function onMouseUp() { dragging.current = false }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        pinchDist.current = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
      } else if (e.touches.length === 1) {
        dragging.current = true
        last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && pinchDist.current !== null) {
        e.preventDefault()
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        setScale(s => Math.min(4, Math.max(0.5, s * (dist / pinchDist.current!))))
        pinchDist.current = dist
      } else if (e.touches.length === 1 && dragging.current) {
        setOffset(o => ({
          x: o.x + e.touches[0].clientX - last.current.x,
          y: o.y + e.touches[0].clientY - last.current.y
        }))
        last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }

    function onTouchEnd() { dragging.current = false; pinchDist.current = null }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [containerRef])

  return { scale, offset, reset }
}
```

---

## Task 8: hooks/useTts.ts

**Files:**
- Create: `src/hooks/useTts.ts`

- [ ] **Step 1: Criar src/hooks/useTts.ts**

```typescript
import { useState, useEffect, useRef } from 'react'
import { TtsConfig } from '../types'

const DEFAULT_CONFIG: TtsConfig = {
  active: true,
  hoverActive: false,
  engine: 'native',
  gender: 'male',
  rate: 0.9,
  pitch: 0.75,
  volume: 1,
}

export function useTts() {
  const [config, setConfig] = useState<TtsConfig>(() => {
    try {
      const saved = localStorage.getItem('tts-config')
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG
    } catch { return DEFAULT_CONFIG }
  })

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const load = () => setVoices(speechSynthesis.getVoices().filter(v => v.lang.startsWith('pt')))
    load()
    speechSynthesis.addEventListener('voiceschanged', load)
    return () => speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  useEffect(() => {
    localStorage.setItem('tts-config', JSON.stringify(config))
  }, [config])

  function speak(text: string) {
    if (!config.active || !('speechSynthesis' in window)) return
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pt-BR'
    u.rate = config.rate
    u.pitch = config.pitch
    u.volume = config.volume
    const ptVoices = voices.filter(v => v.lang.startsWith('pt'))
    if (ptVoices.length > 0) {
      const gendered = ptVoices.find(v =>
        config.gender === 'female' ? /female|f\b/i.test(v.name) : !/female|f\b/i.test(v.name)
      )
      u.voice = gendered || ptVoices[0]
    }
    utterRef.current = u
    speechSynthesis.speak(u)
  }

  function speakHover(text: string) {
    if (config.hoverActive) speak(text)
  }

  return { config, setConfig, speak, speakHover, voices }
}
```

---

## Task 9: hooks/useSavedReports.ts

**Files:**
- Create: `src/hooks/useSavedReports.ts`

- [ ] **Step 1: Criar src/hooks/useSavedReports.ts**

```typescript
import { useState, useEffect } from 'react'
import { SavedReport, VehicleInfo, Damage } from '../types'
import { db } from '../lib/db'

export function useSavedReports() {
  const [saved, setSaved] = useState<SavedReport[]>([])

  useEffect(() => {
    db.getAllSaved().then(setSaved)
  }, [])

  async function saveReport(vehicleInfo: VehicleInfo, damages: Damage[]) {
    const report: SavedReport = {
      id: Date.now().toString(),
      savedAt: Date.now(),
      vehicleInfo,
      damages,
    }
    await db.putSaved(report)
    setSaved(prev => [report, ...prev])
    return report
  }

  async function deleteReport(id: string) {
    await db.deleteSaved(id)
    setSaved(prev => prev.filter(r => r.id !== id))
  }

  return { saved, saveReport, deleteReport }
}
```

---

## Task 10: Componentes SVG — VehicleDefs (gradientes compartilhados)

**Files:**
- Create: `src/components/vehicles/VehicleDefs.tsx`

- [ ] **Step 1: Criar VehicleDefs.tsx**

Abrir `index.standalone.html`, localizar a tag `<defs>` dentro do primeiro SVG (por volta da linha 2050) e extrair todo o conteúdo entre `<defs>` e `</defs>`. Criar o componente:

```tsx
export default function VehicleDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {/* COLAR AQUI TODO O CONTEÚDO DAS <defs> DO index.standalone.html */}
        {/* Inclui: radial-wheel, radial-calota, metal-car-blue, metal-glass,  */}
        {/* metal-moto-dark, metal-truck-gradient, metal-bus-gradient,          */}
        {/* metal-van-gradient, shadow-filter, etc.                             */}
      </defs>
    </svg>
  )
}
```

> **Como localizar as defs:** No `index.standalone.html`, buscar por `<defs>` — a primeira ocorrência contém todos os gradientes globais (aprox. linhas 2050–2210). Copiar o conteúdo interno integralmente.

---

## Task 11: Componentes SVG — Veículo Car (4 vistas)

**Files:**
- Create: `src/components/vehicles/CarLateralLeft.tsx`
- Create: `src/components/vehicles/CarLateralRight.tsx`
- Create: `src/components/vehicles/CarFrontal.tsx`
- Create: `src/components/vehicles/CarTraseira.tsx`

**Padrão de componente SVG** (usar este mesmo padrão para TODOS os 24 componentes):

- [ ] **Step 1: Criar CarLateralLeft.tsx**

Abrir `index.standalone.html`, ir para linha 2216. Copiar o conteúdo do `<svg>` até o `</svg>` correspondente (antes da linha 2334). Criar:

```tsx
import { VehicleProps } from '../../types'
import { getDamageClass } from './utils'

export default function CarLateralLeft({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  function partProps(id: string) {
    const dmg = damages.find(d => d.partId === id)
    return {
      className: `part ${dmg ? `damage-${dmg.severity}` : ''} ${selectedPartId === id ? 'selected' : ''}`.trim(),
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation()
        const name = (e.currentTarget as SVGElement).dataset.name || id
        onPartClick(id, name)
      },
      onMouseEnter: (e: React.MouseEvent) => {
        const name = (e.currentTarget as SVGElement).dataset.name || id
        onPartHover(id, name)
      },
    }
  }

  return (
    <svg viewBox="0 0 520 220" width="100%">
      {/* COLAR AQUI O CONTEÚDO DO SVG DA LINHA 2217 ATÉ A LINHA 2333 DO index.standalone.html */}
      {/* SUBSTITUIR: class="part" id="xxx" data-name="yyy"                                    */}
      {/* POR:        {...partProps('xxx')} data-name="yyy"                                    */}
    </svg>
  )
}
```

- [ ] **Step 2: Criar CarLateralRight.tsx** — mesmo padrão, SVG da linha 2334–2431
- [ ] **Step 3: Criar CarFrontal.tsx** — mesmo padrão, SVG da linha 2432–2515
- [ ] **Step 4: Criar CarTraseira.tsx** — mesmo padrão, SVG da linha 2516–2597

---

## Task 12: Componentes SVG — Moto (4 vistas)

**Files:**
- Create: `src/components/vehicles/MotoLateralLeft.tsx` (linha 2598–2742)
- Create: `src/components/vehicles/MotoLateralRight.tsx` (linha 2743–2885)
- Create: `src/components/vehicles/MotoFrontal.tsx` (linha 2886–2979)
- Create: `src/components/vehicles/MotoTraseira.tsx` (linha 2980–3049)

- [ ] **Step 1: Criar os 4 componentes** usando o mesmo padrão da Task 11

---

## Task 13: Componentes SVG — Truck (4 vistas)

**Files:**
- Create: `src/components/vehicles/TruckLateralLeft.tsx` (linha 3050–3177)
- Create: `src/components/vehicles/TruckLateralRight.tsx` (linha 3178–3301)
- Create: `src/components/vehicles/TruckFrontal.tsx` (linha 3302–3392)
- Create: `src/components/vehicles/TruckTraseira.tsx` (linha 3393–3469)

- [ ] **Step 1: Criar os 4 componentes** usando o mesmo padrão da Task 11

---

## Task 14: Componentes SVG — Bus (4 vistas)

**Files:**
- Create: `src/components/vehicles/BusLateralLeft.tsx` (linha 3470–3619)
- Create: `src/components/vehicles/BusLateralRight.tsx` (linha 3620–3756)
- Create: `src/components/vehicles/BusFrontal.tsx` (linha 3757–3876)
- Create: `src/components/vehicles/BusTraseira.tsx` (linha 3877–3967)

- [ ] **Step 1: Criar os 4 componentes** usando o mesmo padrão da Task 11

---

## Task 15: Componentes SVG — Van (4 vistas)

**Files:**
- Create: `src/components/vehicles/VanLateralLeft.tsx` (linha 3968–4070)
- Create: `src/components/vehicles/VanLateralRight.tsx` (linha 4071–4173)
- Create: `src/components/vehicles/VanFrontal.tsx` (linha 4174–4250)
- Create: `src/components/vehicles/VanTraseira.tsx` (linha 4251–4345)

- [ ] **Step 1: Criar os 4 componentes** usando o mesmo padrão da Task 11

---

## Task 16: Componentes SVG — Custom (4 vistas) + utils + registry

**Files:**
- Create: `src/components/vehicles/CustomLateralLeft.tsx` (linha 4348–4365)
- Create: `src/components/vehicles/CustomLateralRight.tsx` (linha 4368–4385)
- Create: `src/components/vehicles/CustomFrontal.tsx` (linha 4388–4409)
- Create: `src/components/vehicles/CustomTraseira.tsx` (linha 4400–4410)
- Create: `src/components/vehicles/utils.ts`
- Create: `src/components/vehicles/registry.ts`

- [ ] **Step 1: Criar os 4 componentes Custom** usando o mesmo padrão da Task 11

- [ ] **Step 2: Criar src/components/vehicles/utils.ts**

```typescript
import { Severity } from '../../types'

export function getDamageClass(severity: Severity | undefined): string {
  if (!severity) return ''
  return `damage-${severity}`
}
```

- [ ] **Step 3: Criar src/components/vehicles/registry.ts**

```typescript
import { VehicleType, ViewType } from '../../types'
import { ComponentType } from 'react'
import { VehicleProps } from '../../types'

import CarLateralLeft from './CarLateralLeft'
import CarLateralRight from './CarLateralRight'
import CarFrontal from './CarFrontal'
import CarTraseira from './CarTraseira'
import MotoLateralLeft from './MotoLateralLeft'
import MotoLateralRight from './MotoLateralRight'
import MotoFrontal from './MotoFrontal'
import MotoTraseira from './MotoTraseira'
import TruckLateralLeft from './TruckLateralLeft'
import TruckLateralRight from './TruckLateralRight'
import TruckFrontal from './TruckFrontal'
import TruckTraseira from './TruckTraseira'
import BusLateralLeft from './BusLateralLeft'
import BusLateralRight from './BusLateralRight'
import BusFrontal from './BusFrontal'
import BusTraseira from './BusTraseira'
import VanLateralLeft from './VanLateralLeft'
import VanLateralRight from './VanLateralRight'
import VanFrontal from './VanFrontal'
import VanTraseira from './VanTraseira'
import CustomLateralLeft from './CustomLateralLeft'
import CustomLateralRight from './CustomLateralRight'
import CustomFrontal from './CustomFrontal'
import CustomTraseira from './CustomTraseira'

export type VehicleRegistry = Record<VehicleType, Record<ViewType, ComponentType<VehicleProps>>>

export const vehicleRegistry: VehicleRegistry = {
  car:    { 'lateral-left': CarLateralLeft,    'lateral-right': CarLateralRight,    frontal: CarFrontal,    traseira: CarTraseira },
  moto:   { 'lateral-left': MotoLateralLeft,   'lateral-right': MotoLateralRight,   frontal: MotoFrontal,   traseira: MotoTraseira },
  truck:  { 'lateral-left': TruckLateralLeft,  'lateral-right': TruckLateralRight,  frontal: TruckFrontal,  traseira: TruckTraseira },
  bus:    { 'lateral-left': BusLateralLeft,    'lateral-right': BusLateralRight,    frontal: BusFrontal,    traseira: BusTraseira },
  van:    { 'lateral-left': VanLateralLeft,    'lateral-right': VanLateralRight,    frontal: VanFrontal,    traseira: VanTraseira },
  custom: { 'lateral-left': CustomLateralLeft, 'lateral-right': CustomLateralRight, frontal: CustomFrontal, traseira: CustomTraseira },
}
```

- [ ] **Step 4: Verificar tipos**

```bash
npx tsc --noEmit
```

---

## Task 17: VehicleViewer + DamageFloat

**Files:**
- Create: `src/components/VehicleViewer.tsx`
- Create: `src/components/DamageFloat.tsx`

- [ ] **Step 1: Criar src/components/DamageFloat.tsx**

```tsx
import { useEffect, useRef } from 'react'
import { DamageType } from '../types'

interface Props {
  partName: string
  position: { x: number; y: number }
  onChoose: (type: DamageType, typeName: string) => void
  onClear: () => void
  onClose: () => void
}

export default function DamageFloat({ partName, position, onChoose, onClear, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [onClose])

  const types: { type: DamageType; label: string; emoji: string }[] = [
    { type: 'scratch', label: 'Arranhado', emoji: '✏️' },
    { type: 'dent',    label: 'Amassado',  emoji: '🔨' },
    { type: 'broken',  label: 'Quebrado',  emoji: '💥' },
  ]

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 250),
    top: Math.min(position.y, window.innerHeight - 220),
    zIndex: 10000,
    minWidth: 220,
    background: 'rgba(15,23,42,0.97)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14,
    boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
    padding: 12,
  }

  return (
    <div ref={ref} style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#e8f4ff' }}>
          {partName}
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
            color: '#7a9bbf', cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem' }}
        >✖</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
        {types.map(t => (
          <button
            key={t.type}
            onClick={() => onChoose(t.type, t.label)}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '10px 4px', cursor: 'pointer', color: '#e8f4ff',
              fontFamily: 'Outfit,sans-serif', fontSize: '0.82rem', fontWeight: 800,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: '1.3rem' }}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>
      <button
        onClick={onClear}
        style={{ marginTop: 8, width: '100%', background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '8px',
          color: '#ef4444', cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
          fontSize: '0.82rem', fontWeight: 800 }}
      >
        🧽 Sem avaria
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Criar src/components/VehicleViewer.tsx**

```tsx
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VehicleType, ViewType, Damage, DamageType } from '../types'
import { vehicleRegistry } from './vehicles/registry'
import { useZoomPan } from '../hooks/useZoomPan'
import DamageFloat from './DamageFloat'
import VehicleDefs from './vehicles/VehicleDefs'

interface Props {
  vehicleType: VehicleType
  viewType: ViewType
  damages: Damage[]
  onAddDamage: (partId: string, partName: string, type: DamageType, typeName: string) => void
  onRemoveDamageFromPart: (partId: string) => void
  speak: (text: string) => void
  speakHover: (text: string) => void
}

export default function VehicleViewer({
  vehicleType, viewType, damages, onAddDamage, onRemoveDamageFromPart, speak, speakHover
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scale, offset, reset } = useZoomPan(containerRef)
  const [selectedPart, setSelectedPart] = useState<{ id: string; name: string; pos: { x: number; y: number } } | null>(null)

  const VehicleComp = vehicleRegistry[vehicleType][viewType]

  function handlePartClick(id: string, name: string, e?: React.MouseEvent) {
    speak(name)
    const pos = e ? { x: e.clientX + 10, y: e.clientY + 10 } : { x: 200, y: 200 }
    setSelectedPart({ id, name, pos })
  }

  function handleChoose(type: DamageType, typeName: string) {
    if (!selectedPart) return
    onAddDamage(selectedPart.id, selectedPart.name, type, typeName)
    setSelectedPart(null)
  }

  function handleClear() {
    if (!selectedPart) return
    onRemoveDamageFromPart(selectedPart.id)
    setSelectedPart(null)
  }

  const selectedPartId = selectedPart?.id ?? null

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <VehicleDefs />

      {/* Controles zoom */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: 4 }}>
        {[
          { label: '−', action: () => {} },
          { label: `${Math.round(scale * 100)}%`, action: reset },
          { label: '+', action: () => {} },
        ].map((b, i) => (
          <button key={i} onClick={b.action}
            style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, color: '#e8f4ff', cursor: 'pointer', padding: '4px 10px',
              fontFamily: 'Outfit,sans-serif', fontSize: '0.75rem', fontWeight: 700 }}>
            {b.label}
          </button>
        ))}
        <button onClick={reset}
          style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, color: '#7a9bbf', cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem' }}>
          ↺
        </button>
      </div>

      <div ref={containerRef} style={{ overflow: 'hidden', borderRadius: 16, cursor: 'grab', minHeight: 220 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${vehicleType}-${viewType}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.18 }}
            style={{ transform: `translate(${offset.x}px,${offset.y}px) scale(${scale})`, transformOrigin: 'center' }}
          >
            <VehicleComp
              damages={damages}
              selectedPartId={selectedPartId}
              onPartClick={(id, name) => handlePartClick(id, name)}
              onPartHover={(_, name) => speakHover(name)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Clique em uma peça para registrar avaria • Scroll ou pinch para zoom
      </div>

      {selectedPart && (
        <DamageFloat
          partName={selectedPart.name}
          position={selectedPart.pos}
          onChoose={handleChoose}
          onClear={handleClear}
          onClose={() => setSelectedPart(null)}
        />
      )}
    </div>
  )
}
```

---

## Task 18: VehicleSelector + ViewSelector

**Files:**
- Create: `src/components/VehicleSelector.tsx`
- Create: `src/components/ViewSelector.tsx`

- [ ] **Step 1: Criar src/components/VehicleSelector.tsx**

```tsx
import { VehicleType } from '../types'

const VEHICLES: { id: VehicleType; label: string; emoji: string }[] = [
  { id: 'car',    label: 'Automóvel',  emoji: '🚗' },
  { id: 'moto',   label: 'Moto',       emoji: '🏍️' },
  { id: 'truck',  label: 'Caminhão',   emoji: '🚛' },
  { id: 'van',    label: 'Van',        emoji: '🚐' },
  { id: 'bus',    label: 'Ônibus',     emoji: '🚌' },
  { id: 'custom', label: 'Genérico',   emoji: '🔧' },
]

interface Props {
  current: VehicleType
  onChange: (v: VehicleType) => void
}

export default function VehicleSelector({ current, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      {VEHICLES.map(v => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          style={{
            background: current === v.id ? 'var(--primary)' : 'var(--btn-secondary-bg)',
            border: `1px solid ${current === v.id ? 'var(--primary)' : 'var(--btn-secondary-border)'}`,
            borderRadius: 12, padding: '8px 16px', cursor: 'pointer',
            color: current === v.id ? '#fff' : 'var(--text-muted)',
            fontFamily: 'Outfit,sans-serif', fontSize: '0.85rem', fontWeight: 700,
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: current === v.id ? 'var(--neon-glow-sm)' : 'none',
          }}
        >
          <span>{v.emoji}</span> {v.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Criar src/components/ViewSelector.tsx**

```tsx
import { ViewType } from '../types'

const VIEWS: { id: ViewType; label: string }[] = [
  { id: 'lateral-left',  label: 'Lat. Esquerda' },
  { id: 'lateral-right', label: 'Lat. Direita' },
  { id: 'frontal',       label: 'Frontal' },
  { id: 'traseira',      label: 'Traseira' },
]

interface Props {
  current: ViewType
  onChange: (v: ViewType) => void
}

export default function ViewSelector({ current, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {VIEWS.map(v => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          style={{
            background: current === v.id ? 'rgba(0,170,255,0.15)' : 'transparent',
            border: `1px solid ${current === v.id ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
            color: current === v.id ? 'var(--primary)' : 'var(--text-muted)',
            fontFamily: 'Outfit,sans-serif', fontSize: '0.78rem', fontWeight: 700,
            transition: 'all 0.2s',
          }}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}
```

---

## Task 19: DamageList

**Files:**
- Create: `src/components/DamageList.tsx`

- [ ] **Step 1: Criar src/components/DamageList.tsx**

```tsx
import { useState } from 'react'
import { Damage } from '../types'
import { compressImage, fileToDataUrl } from '../lib/imageUtils'

interface Props {
  damages: Damage[]
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Partial<Damage>) => void
}

const SEVERITY_LABEL = { low: 'Leve', medium: 'Média', high: 'Grave' }
const SEVERITY_COLOR = { low: '#f59e0b', medium: '#f97316', high: '#ef4444' }

export default function DamageList({ damages, onRemove, onUpdate }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function handlePhoto(id: string, file: File) {
    const raw = await fileToDataUrl(file)
    const compressed = await compressImage(raw)
    const dmg = damages.find(d => d.id === id)
    if (dmg) onUpdate(id, { photos: [...dmg.photos, compressed] })
  }

  if (damages.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0', fontSize: '0.9rem' }}>
        Nenhuma avaria registrada.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {damages.map(d => (
        <div key={d.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer' }}
            onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_COLOR[d.severity], flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {d.partName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {d.typeName} • {SEVERITY_LABEL[d.severity]} • {d.view}
              </div>
            </div>
            {d.photos.length > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📷 {d.photos.length}</span>}
            <button onClick={e => { e.stopPropagation(); onRemove(d.id) }}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', padding: '2px 6px' }}>
              ✕
            </button>
          </div>

          {expandedId === d.id && (
            <div style={{ padding: '0 12px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <textarea
                value={d.notes}
                onChange={e => onUpdate(d.id, { notes: e.target.value })}
                placeholder="Observação..."
                className="form-input"
                style={{ marginTop: 8, resize: 'vertical', minHeight: 52 }}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {d.photos.map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={p} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                    <button
                      onClick={() => onUpdate(d.id, { photos: d.photos.filter((_, pi) => pi !== i) })}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', width: 18, height: 18, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✕
                    </button>
                  </div>
                ))}
                <label style={{ width: 64, height: 64, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.3rem' }}>
                  📷
                  <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                    onChange={e => { if (e.target.files?.[0]) handlePhoto(d.id, e.target.files[0]) }} />
                </label>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## Task 20: VehicleInfoForm + GeneralNotes

**Files:**
- Create: `src/components/VehicleInfoForm.tsx`
- Create: `src/components/GeneralNotes.tsx`

- [ ] **Step 1: Criar src/components/VehicleInfoForm.tsx**

```tsx
import { VehicleInfo } from '../types'

interface Props {
  info: VehicleInfo
  onChange: (info: VehicleInfo) => void
}

export default function VehicleInfoForm({ info, onChange }: Props) {
  function set(field: keyof VehicleInfo, value: string) {
    onChange({ ...info, [field]: value })
  }

  const fields: { key: keyof VehicleInfo; label: string; placeholder: string }[] = [
    { key: 'owner', label: 'Proprietário', placeholder: 'Nome completo' },
    { key: 'phone', label: 'Telefone', placeholder: '(11) 99999-9999' },
    { key: 'brand', label: 'Marca / Modelo', placeholder: 'Ex: Toyota Corolla' },
    { key: 'plate', label: 'Placa', placeholder: 'ABC1D23' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
      {fields.map(f => (
        <div key={f.key}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
            {f.label}
          </label>
          <input
            className="form-input"
            value={info[f.key] as string}
            onChange={e => set(f.key, e.target.value)}
            placeholder={f.placeholder}
          />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Criar src/components/GeneralNotes.tsx**

```tsx
interface Props {
  value: string
  onChange: (v: string) => void
}

export default function GeneralNotes({ value, onChange }: Props) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
        📝 Observações Gerais
      </label>
      <textarea
        className="form-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Observações adicionais sobre o veículo..."
        style={{ minHeight: 60, resize: 'vertical' }}
      />
    </div>
  )
}
```

---

## Task 21: TtsSettings

**Files:**
- Create: `src/components/TtsSettings.tsx`

- [ ] **Step 1: Criar src/components/TtsSettings.tsx**

```tsx
import { TtsConfig } from '../types'

interface Props {
  config: TtsConfig
  onChange: (c: TtsConfig) => void
  onTest: () => void
  voices: SpeechSynthesisVoice[]
}

export default function TtsSettings({ config, onChange, onTest, voices }: Props) {
  function set<K extends keyof TtsConfig>(key: K, value: TtsConfig[K]) {
    onChange({ ...config, [key]: value })
  }

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 8 }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        🗣️ Configurações de Voz
        <span style={{ fontSize: '0.72rem', background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.2)', color: 'var(--neon-cyan)', padding: '2px 8px', borderRadius: 100 }}>
          Gratuita
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
            Motor
          </label>
          <select className="form-input" value={config.engine} onChange={e => set('engine', e.target.value as TtsConfig['engine'])}>
            <option value="native">🎙️ Navegador</option>
            <option value="google-tts">☁️ Google TTS</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
            Gênero
          </label>
          <select className="form-input" value={config.gender} onChange={e => set('gender', e.target.value as TtsConfig['gender'])}>
            <option value="male">👨 Masculina</option>
            <option value="female">👩 Feminina</option>
          </select>
        </div>

        {[
          { key: 'rate' as const,   label: 'Velocidade', min: 0.5, max: 2,   step: 0.1,  fmt: (v: number) => `${v}x` },
          { key: 'pitch' as const,  label: 'Tom',        min: 0.5, max: 1.5,  step: 0.05, fmt: (v: number) => `${v}` },
          { key: 'volume' as const, label: 'Volume',     min: 0,   max: 1,    step: 0.05, fmt: (v: number) => `${Math.round(v*100)}%` },
        ].map(s => (
          <div key={s.key}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              <span>{s.label}</span>
              <span style={{ color: 'var(--primary)' }}>{s.fmt(config[s.key])}</span>
            </label>
            <input type="range" min={s.min} max={s.max} step={s.step} value={config[s.key]}
              onChange={e => set(s.key, parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', height: 5, cursor: 'pointer' }}
            />
          </div>
        ))}

        <button onClick={onTest}
          style={{ background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', borderRadius: 8, padding: '8px', color: 'var(--text-main)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: '0.8rem', fontWeight: 700, alignSelf: 'end' }}>
          🔊 Testar
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { key: 'active' as const,      label: 'Falar ao clicar' },
          { key: 'hoverActive' as const, label: 'Falar ao passar o mouse' },
        ].map(c => (
          <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <input type="checkbox" checked={config[c.key]} onChange={e => set(c.key, e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }} />
            {c.label}
          </label>
        ))}
      </div>
    </div>
  )
}
```

---

## Task 22: lib/report.ts + lib/pdf.ts

**Files:**
- Create: `src/lib/report.ts`
- Create: `src/lib/pdf.ts`

- [ ] **Step 1: Criar src/lib/report.ts**

```typescript
import { Damage, VehicleInfo } from '../types'

const VIEW_LABEL: Record<string, string> = {
  'lateral-left': 'Lat. Esq.', 'lateral-right': 'Lat. Dir.', frontal: 'Frontal', traseira: 'Traseira'
}
const SEV_LABEL: Record<string, string> = { low: 'Leve', medium: 'Média', high: 'Grave' }

export function formatReport(info: VehicleInfo, damages: Damage[]): string {
  const date = new Date().toLocaleString('pt-BR')
  let txt = `🔍 RELATÓRIO DE VISTORIA VEICULAR\n`
  txt += `📅 ${date}\n`
  txt += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  txt += `👤 Proprietário: ${info.owner || 'N/I'}\n`
  txt += `📞 Telefone: ${info.phone || 'N/I'}\n`
  txt += `🚗 Veículo: ${info.brand || 'N/I'}\n`
  txt += `🔤 Placa: ${info.plate || 'N/I'}\n`
  if (info.generalNotes) txt += `📝 Obs.: ${info.generalNotes}\n`
  txt += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  if (damages.length === 0) {
    txt += `✅ Nenhuma avaria registrada.\n`
  } else {
    txt += `⚠️ AVARIAS (${damages.length}):\n\n`
    damages.forEach((d, i) => {
      txt += `${i + 1}. ${d.partName} [${VIEW_LABEL[d.view] || d.view}]\n`
      txt += `   Tipo: ${d.typeName} | Grau: ${SEV_LABEL[d.severity]}\n`
      if (d.notes) txt += `   Obs: ${d.notes}\n`
      txt += '\n'
    })
  }
  txt += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  txt += `Gerado por AvariasAPARENTES PWA`
  return txt
}

export function copyReport(info: VehicleInfo, damages: Damage[]): Promise<void> {
  return navigator.clipboard.writeText(formatReport(info, damages))
}

export function downloadTxt(info: VehicleInfo, damages: Damage[]) {
  const txt = formatReport(info, damages)
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vistoria-${info.plate || 'sem-placa'}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function sendWhatsApp(info: VehicleInfo, damages: Damage[]) {
  const phone = info.phone.replace(/\D/g, '')
  const text = encodeURIComponent(formatReport(info, damages))
  const url = phone ? `https://wa.me/55${phone}?text=${text}` : `https://wa.me/?text=${text}`
  window.open(url, '_blank')
}
```

- [ ] **Step 2: Criar src/lib/pdf.ts**

```typescript
import { Damage, VehicleInfo } from '../types'

const SEV_LABEL: Record<string, string> = { low: 'Leve', medium: 'Média', high: 'Grave' }
const SEV_COLOR: Record<string, string> = { low: '#f59e0b', medium: '#f97316', high: '#ef4444' }
const VIEW_LABEL: Record<string, string> = {
  'lateral-left': 'Lat. Esq.', 'lateral-right': 'Lat. Dir.', frontal: 'Frontal', traseira: 'Traseira'
}

function buildHtml(info: VehicleInfo, damages: Damage[]): string {
  const date = new Date().toLocaleString('pt-BR')
  const rows = damages.length === 0
    ? '<tr><td colspan="5" style="text-align:center;color:#64748b;font-style:italic;">Nenhuma avaria registrada.</td></tr>'
    : damages.map(d => `
        <tr>
          <td>${d.partName}</td>
          <td>${d.typeName}</td>
          <td>${VIEW_LABEL[d.view] || d.view}</td>
          <td style="text-align:center;">
            <span style="background:${SEV_COLOR[d.severity]}20;color:${SEV_COLOR[d.severity]};border:1px solid ${SEV_COLOR[d.severity]}40;padding:2px 8px;border-radius:4px;font-weight:700;font-size:0.75rem;">
              ${SEV_LABEL[d.severity]}
            </span>
          </td>
          <td style="color:#475569;font-style:italic;">${d.notes || '—'}</td>
        </tr>`).join('')

  const photos = damages.flatMap(d => d.photos.map(p => ({
    part: d.partName, type: d.typeName, src: p
  })))

  const photoSection = photos.length === 0 ? '' : `
    <h3 style="margin:20px 0 10px;color:#1e293b;">📷 Fotos das Avarias</h3>
    <div style="display:flex;flex-wrap:wrap;gap:10px;">
      ${photos.map(p => `
        <div style="text-align:center;">
          <img src="${p.src}" style="width:120px;height:90px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;" />
          <div style="font-size:0.65rem;color:#64748b;margin-top:3px;">${p.part} — ${p.type}</div>
        </div>`).join('')}
    </div>`

  return `
    <!DOCTYPE html>
    <html><head><meta charset="UTF-8">
    <style>
      body{font-family:Arial,sans-serif;color:#1e293b;padding:30px;font-size:13px;}
      h1{color:#0077cc;margin:0 0 4px;}
      .meta{color:#64748b;margin-bottom:20px;font-size:0.85rem;}
      .info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:20px;}
      .info-item label{font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;}
      .info-item span{display:block;font-weight:600;color:#1e293b;}
      table{width:100%;border-collapse:collapse;margin-bottom:20px;}
      th{background:#0077cc;color:#fff;padding:8px 10px;text-align:left;font-size:0.8rem;}
      td{padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:0.82rem;}
      tr:nth-child(even) td{background:#f8fafc;}
    </style>
    </head><body>
    <h1>🔍 Relatório de Vistoria Veicular</h1>
    <div class="meta">Gerado em ${date} • AvariasAPARENTES PWA</div>
    <div class="info-grid">
      <div class="info-item"><label>Proprietário</label><span>${info.owner || '—'}</span></div>
      <div class="info-item"><label>Telefone</label><span>${info.phone || '—'}</span></div>
      <div class="info-item"><label>Veículo</label><span>${info.brand || '—'}</span></div>
      <div class="info-item"><label>Placa</label><span>${info.plate || '—'}</span></div>
      ${info.generalNotes ? `<div class="info-item" style="grid-column:span 2"><label>Observações</label><span>${info.generalNotes}</span></div>` : ''}
    </div>
    <h3 style="margin:0 0 8px;color:#1e293b;">⚠️ Avarias Registradas (${damages.length})</h3>
    <table>
      <thead><tr><th>Peça</th><th>Tipo</th><th>Vista</th><th>Gravidade</th><th>Observações</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${photoSection}
    </body></html>`
}

export async function generatePdf(info: VehicleInfo, damages: Damage[]) {
  const html2pdf = (await import('html2pdf.js')).default
  const container = document.createElement('div')
  container.innerHTML = buildHtml(info, damages)
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;'
  document.body.appendChild(container)
  try {
    await html2pdf().set({
      margin: 10,
      filename: `vistoria-${info.plate || 'sem-placa'}.pdf`,
      image: { type: 'jpeg', quality: 0.92 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(container).save()
  } finally {
    document.body.removeChild(container)
  }
}

export async function generatePdfBlob(info: VehicleInfo, damages: Damage[]): Promise<Blob> {
  const html2pdf = (await import('html2pdf.js')).default
  const container = document.createElement('div')
  container.innerHTML = buildHtml(info, damages)
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;'
  document.body.appendChild(container)
  try {
    return await html2pdf().set({
      margin: 10,
      filename: `vistoria-${info.plate || 'sem-placa'}.pdf`,
      image: { type: 'jpeg', quality: 0.92 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(container).outputPdf('blob')
  } finally {
    document.body.removeChild(container)
  }
}
```

---

## Task 23: ReportActions + SavedReportsModal

**Files:**
- Create: `src/components/ReportActions.tsx`
- Create: `src/components/SavedReportsModal.tsx`

- [ ] **Step 1: Criar src/components/ReportActions.tsx**

```tsx
import { useState } from 'react'
import { Damage, VehicleInfo } from '../types'
import { generatePdf, generatePdfBlob } from '../lib/pdf'
import { copyReport, downloadTxt, sendWhatsApp } from '../lib/report'

interface Props {
  vehicleInfo: VehicleInfo
  damages: Damage[]
}

export default function ReportActions({ vehicleInfo, damages }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handle(key: string, fn: () => Promise<void>) {
    setLoading(key)
    try { await fn() } catch (e) { console.error(e) } finally { setLoading(null) }
  }

  async function whatsappPdf() {
    const blob = await generatePdfBlob(vehicleInfo, damages)
    const file = new File([blob], `vistoria-${vehicleInfo.plate || 'sem-placa'}.pdf`, { type: 'application/pdf' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Relatório de Vistoria' })
    } else {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }
  }

  const btn = (key: string, emoji: string, label: string, fn: () => Promise<void>, extra?: React.CSSProperties) => (
    <button
      onClick={() => handle(key, fn)}
      disabled={loading !== null}
      style={{
        background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)',
        borderRadius: 10, padding: '10px 14px', cursor: 'pointer', color: 'var(--text-main)',
        fontFamily: 'Outfit,sans-serif', fontSize: '0.85rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
        opacity: loading !== null ? 0.6 : 1, ...extra
      }}
    >
      <span>{loading === key ? '⏳' : emoji}</span>
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {btn('wp', '💬', 'Enviar via WhatsApp', async () => sendWhatsApp(vehicleInfo, damages),
        { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' })}
      {btn('wp-pdf', '📱', 'WhatsApp (PDF)', whatsappPdf,
        { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' })}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
        {btn('pdf', '📄', 'Gerar PDF', () => generatePdf(vehicleInfo, damages),
          { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', justifyContent: 'center' })}
        {btn('copy', '📋', 'Copiar', async () => { await copyReport(vehicleInfo, damages) },
          { justifyContent: 'center' })}
        {btn('txt', '📝', 'TXT', async () => downloadTxt(vehicleInfo, damages),
          { justifyContent: 'center' })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Criar src/components/SavedReportsModal.tsx**

```tsx
import { SavedReport, VehicleInfo, Damage } from '../types'

interface Props {
  isOpen: boolean
  saved: SavedReport[]
  onClose: () => void
  onSave: () => void
  onLoad: (r: SavedReport) => void
  onDelete: (id: string) => void
}

export default function SavedReportsModal({ isOpen, saved, onClose, onSave, onLoad, onDelete }: Props) {
  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.72)', zIndex: 9999, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', maxWidth: 700, background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>📦 Vistorias Salvas</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Armazenadas localmente (IndexedDB)</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onSave}
              style={{ background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.2)', borderRadius: 8, padding: '8px 14px', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem' }}>
              💾 Salvar Atual
            </button>
            <button onClick={onClose}
              style={{ background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem' }}>
              ✖ Fechar
            </button>
          </div>
        </div>
        <div style={{ padding: '12px 18px', maxHeight: '60vh', overflowY: 'auto' }}>
          {saved.length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>Nenhuma vistoria salva.</div>
            : saved.map(r => (
              <div key={r.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {r.vehicleInfo.brand || 'Veículo'} — {r.vehicleInfo.plate || 'S/P'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {r.vehicleInfo.owner || 'Proprietário não informado'} • {r.damages.length} avaria(s) • {new Date(r.savedAt).toLocaleString('pt-BR')}
                  </div>
                </div>
                <button onClick={() => onLoad(r)}
                  style={{ background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.2)', borderRadius: 8, padding: '6px 12px', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.78rem' }}>
                  Carregar
                </button>
                <button onClick={() => onDelete(r.id)}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 10px', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem' }}>
                  🗑️
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
```

---

## Task 24: Header

**Files:**
- Create: `src/components/Header.tsx`

- [ ] **Step 1: Criar src/components/Header.tsx**

```tsx
interface Props {
  darkMode: boolean
  onToggleDark: () => void
  onOpenSaved: () => void
  damagesCount: number
}

export default function Header({ darkMode, onToggleDark, onOpenSaved, damagesCount }: Props) {
  return (
    <header style={{ textAlign: 'center', width: '100%', maxWidth: 1250, padding: '40px 20px 28px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse at center top, rgba(0,170,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,170,255,0.08)', border: '1px solid rgba(0,170,255,0.22)', borderRadius: 100, padding: '5px 16px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--neon-cyan)', marginBottom: 20 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan)', animation: 'pulse 2s ease-in-out infinite' }} />
        Sistema de Vistoria PRO
      </div>

      <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, background: 'linear-gradient(135deg,#fff 0%,#a8d8ff 40%,#00aaff 70%,#00d4ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12 }}>
        Avarias Aparentes
      </h1>

      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, margin: '0 auto 20px' }}>
        Inspeção veicular interativa — registre danos com precisão
      </p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { label: '🛡️ Offline', desc: 'PWA' },
          { label: '💾 IndexedDB', desc: 'Local' },
          { label: '📄 PDF', desc: 'Profissional' },
          { label: '🗣️ TTS', desc: 'Gratuito' },
        ].map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {b.label} <span style={{ opacity: 0.6 }}>{b.desc}</span>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
        <button onClick={onOpenSaved}
          style={{ background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', borderRadius: 10, padding: '8px 14px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: '0.82rem', fontWeight: 700 }}>
          📦 Salvas
        </button>
        <button onClick={onToggleDark}
          style={{ background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', borderRadius: 10, padding: '8px 12px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
```

---

## Task 25: App.tsx + main.tsx

**Files:**
- Create: `src/App.tsx`
- Create: `src/main.tsx`

- [ ] **Step 1: Criar src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 2: Criar src/App.tsx**

```tsx
import { useState, useEffect, useMemo } from 'react'
import { VehicleType, ViewType, Damage, DamageType, Severity, VehicleInfo } from './types'
import { useDamages } from './hooks/useDamages'
import { useTts } from './hooks/useTts'
import { useSavedReports } from './hooks/useSavedReports'
import { db } from './lib/db'

import Header from './components/Header'
import VehicleSelector from './components/VehicleSelector'
import ViewSelector from './components/ViewSelector'
import VehicleViewer from './components/VehicleViewer'
import DamageList from './components/DamageList'
import VehicleInfoForm from './components/VehicleInfoForm'
import GeneralNotes from './components/GeneralNotes'
import ReportActions from './components/ReportActions'
import TtsSettings from './components/TtsSettings'
import SavedReportsModal from './components/SavedReportsModal'

const SEV_MAP: Record<DamageType, Severity> = { scratch: 'low', dent: 'medium', broken: 'high' }

export default function App() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('car')
  const [viewType, setViewType] = useState<ViewType>('lateral-left')
  const [darkMode, setDarkMode] = useState(true)
  const [savedModalOpen, setSavedModalOpen] = useState(false)
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    owner: '', phone: '', brand: '', plate: '', generalNotes: ''
  })

  const { damages, addDamage, removeDamage, updateDamage, clearDamages } = useDamages()
  const { config: ttsConfig, setConfig: setTtsConfig, speak, speakHover, voices } = useTts()
  const { saved, saveReport, deleteReport } = useSavedReports()

  // Dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  // Persist vehicleInfo
  useEffect(() => { db.getMeta<VehicleInfo>('vehicle_info').then(v => { if (v) setVehicleInfo(v) }) }, [])
  useEffect(() => { db.setMeta('vehicle_info', vehicleInfo) }, [vehicleInfo])

  const currentDamages = useMemo(
    () => damages.filter(d => d.vehicle === vehicleType),
    [damages, vehicleType]
  )

  function handleAddDamage(partId: string, partName: string, type: DamageType, typeName: string) {
    const damage: Damage = {
      id: Date.now().toString(),
      vehicle: vehicleType,
      view: viewType,
      partId,
      partName,
      type,
      typeName,
      severity: SEV_MAP[type],
      notes: '',
      photos: [],
    }
    addDamage(damage)
    speak(`${partName} registrado como ${typeName}`)
  }

  function handleRemoveDamageFromPart(partId: string) {
    const existing = currentDamages.filter(d => d.partId === partId)
    existing.forEach(d => removeDamage(d.id))
  }

  function handleLoadReport(r: { vehicleInfo: VehicleInfo; damages: Damage[] }) {
    setVehicleInfo(r.vehicleInfo)
    clearDamages().then(() => r.damages.forEach(addDamage))
    setSavedModalOpen(false)
  }

  const infoWithNotes: VehicleInfo = { ...vehicleInfo, generalNotes: vehicleInfo.generalNotes }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '0 15px 60px' }}>
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onOpenSaved={() => setSavedModalOpen(true)}
        damagesCount={currentDamages.length}
      />

      <main style={{ width: '100%', maxWidth: 1250, display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* Info form */}
        <div className="glass-card" style={{ padding: '20px 24px' }}>
          <VehicleInfoForm info={vehicleInfo} onChange={setVehicleInfo} />
        </div>

        {/* Vehicle + damages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20 }}>
          {/* Left: viewer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <VehicleSelector current={vehicleType} onChange={v => { setVehicleType(v); setViewType('lateral-left') }} />
            <ViewSelector current={viewType} onChange={setViewType} />
            <div className="glass-card" style={{ padding: 20 }}>
              <VehicleViewer
                vehicleType={vehicleType}
                viewType={viewType}
                damages={currentDamages}
                onAddDamage={handleAddDamage}
                onRemoveDamageFromPart={handleRemoveDamageFromPart}
                speak={speak}
                speakHover={speakHover}
              />
            </div>
            <div className="glass-card" style={{ padding: '16px 20px' }}>
              <TtsSettings
                config={ttsConfig}
                onChange={setTtsConfig}
                onTest={() => speak('Testando o sistema de voz do AvariasAPARENTES.')}
                voices={voices}
              />
            </div>
          </div>

          {/* Right: damages + actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="glass-card" style={{ padding: '16px 20px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                  ⚠️ Avarias ({currentDamages.length})
                </span>
                {currentDamages.length > 0 && (
                  <button onClick={() => { if (confirm('Limpar todas as avarias?')) clearDamages() }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                    Limpar
                  </button>
                )}
              </div>
              <DamageList damages={currentDamages} onRemove={removeDamage} onUpdate={updateDamage} />
            </div>

            <div className="glass-card" style={{ padding: '16px 20px' }}>
              <GeneralNotes value={vehicleInfo.generalNotes} onChange={v => setVehicleInfo(i => ({ ...i, generalNotes: v }))} />
            </div>

            <div className="glass-card" style={{ padding: '16px 20px' }}>
              <ReportActions vehicleInfo={infoWithNotes} damages={currentDamages} />
            </div>
          </div>
        </div>
      </main>

      <SavedReportsModal
        isOpen={savedModalOpen}
        saved={saved}
        onClose={() => setSavedModalOpen(false)}
        onSave={() => saveReport(vehicleInfo, damages)}
        onLoad={handleLoadReport}
        onDelete={deleteReport}
      />
    </div>
  )
}
```

---

## Task 26: Verificação final e ajustes responsivos

**Files:**
- Modify: `src/App.tsx` (breakpoint mobile)

- [ ] **Step 1: Build e verificação de tipos**

```bash
npm run build
```

Esperado: build sem erros TypeScript.

- [ ] **Step 2: Iniciar servidor de desenvolvimento**

```bash
npm run dev
```

Abrir `http://localhost:5173` no browser.

- [ ] **Step 3: Checklist de verificação manual**

Testar cada item:
- [ ] Todos os 6 tipos de veículo carregam SVG
- [ ] Todas as 4 vistas de cada veículo funcionam
- [ ] Clicar numa peça abre o popover DamageFloat
- [ ] Registrar dano colore a peça corretamente (amarelo/laranja/vermelho)
- [ ] "Sem avaria" remove o dano da peça
- [ ] Adicionar foto a um dano funciona
- [ ] Editar nota de um dano funciona
- [ ] Formulário de info persiste ao recarregar (IndexedDB)
- [ ] Avarias persistem ao recarregar
- [ ] Botão TTS testa a voz
- [ ] Gerar PDF baixa o arquivo
- [ ] Copiar relatório copia para clipboard
- [ ] Dark/light mode alterna corretamente
- [ ] Salvar vistoria → modal mostra a vistoria → carregar restaura dados
- [ ] Mobile: layout responsivo

- [ ] **Step 4: Ajuste de responsividade mobile**

Em `src/App.tsx`, adicionar breakpoint para mobile — o grid de 2 colunas deve virar 1 coluna em telas menores:

```tsx
// Substituir o grid de veículo+danos por:
<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20,
  // Em telas estreitas (≤768px) usar 1 coluna — aplique via CSS em index.css
}}>
```

Adicionar em `src/index.css`:
```css
@media (max-width: 768px) {
  .main-grid { grid-template-columns: 1fr !important; }
}
```

E aplicar a classe `.main-grid` na div do grid.

- [ ] **Step 5: Commit final**

```bash
git add src/ index.html
git commit -m "feat: migrar app para React + Vite (zero a fundo)"
```
