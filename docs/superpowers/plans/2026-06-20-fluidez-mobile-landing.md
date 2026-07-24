# Fluidez da Landing no Celular — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar o engasgo/jank ao rolar a landing page em dispositivos móveis, mantendo o visual do desktop intacto.

**Architecture:** Mudanças exclusivamente de CSS em dois arquivos. Removemos os combos caros de repaint no mobile (`backdrop-filter` + animação infinita, grid `position: fixed`, sombras com `blur`) trocando-os por equivalentes baratos (fundo sólido semitransparente, animações desligadas). Desktop preserva o visual rico.

**Tech Stack:** Next.js (App Router), CSS puro (bloco `<style>` em `src/views/Landing.tsx` + `src/app/globals.css`). Validação opcional com Playwright headless.

## Global Constraints

- **Somente CSS.** Não alterar HTML/JSX nem lógica React.
- **Desktop inalterado:** todas as mudanças de aparência ficam dentro de `@media (max-width: 900px)` (mesmo breakpoint já usado na landing) ou do bloco `prefers-reduced-motion`.
- **Arquivos afetados (apenas estes dois):** `src/views/Landing.tsx`, `src/app/globals.css`.
- **Reversível:** cada mudança é aditiva/escopada por media query.
- **Valores de tokens existentes:** `--card-bg` (dark) = `rgba(10, 20, 40, 0.72)`; `--card-bg` (light, em `html.light`) = `rgba(232, 230, 220, 0.85)`.

---

## File Structure

- `src/app/globals.css` — tokens globais (`:root`, `html.light`), `.glass-card`, `body::before` (grid), `.shadow-ground`, bloco `prefers-reduced-motion`. Recebe: novo token sólido + overrides mobile globais.
- `src/views/Landing.tsx` — bloco `<style>` interno da landing: `.floating-ui`, `.ui-top`/`.ui-bottom` (animação `float`), `.visualizer-bg-glow`, media query `max-width: 900px`. Recebe: overrides mobile específicos da landing.

---

### Task 1: Token de fundo sólido para mobile

Cria um token `--card-bg-solid` (quase opaco) nos dois temas, para substituir o vidro com `backdrop-filter` no mobile sem quebrar o light mode.

**Files:**
- Modify: `src/app/globals.css` (`:root` perto da linha 9; `html.light` perto da linha 159)

**Interfaces:**
- Produces: variável CSS `--card-bg-solid` disponível globalmente nos temas dark e light.

- [ ] **Step 1: Adicionar token no tema dark (`:root`)**

Em `src/app/globals.css`, logo após a linha `--card-bg: rgba(10, 20, 40, 0.72);` (linha 9), adicionar:

```css
  --card-bg-solid: rgba(12, 22, 42, 0.96);
```

- [ ] **Step 2: Adicionar token no tema light (`html.light`)**

Em `src/app/globals.css`, logo após a linha `--card-bg: rgba(232, 230, 220, 0.85);` (linha ~159, dentro do bloco `html.light`), adicionar:

```css
  --card-bg-solid: rgba(238, 236, 227, 0.97);
```

- [ ] **Step 3: Verificar que o token existe nos dois temas**

Run: `grep -n "card-bg-solid" src/app/globals.css`
Expected: exatamente 2 linhas (uma em `:root`, uma em `html.light`).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(css): add --card-bg-solid token for mobile glass fallback"
```

---

### Task 2: Overrides mobile globais (globals.css)

No mobile: desliga o `backdrop-filter` do `.glass-card` (trocando por fundo sólido), remove o grid `position: fixed` (repaint caro no scroll), e remove o blur da sombra de chão do SVG **apenas dentro da landing**.

**Files:**
- Modify: `src/app/globals.css` (acrescentar bloco no fim do arquivo)

**Interfaces:**
- Consumes: `--card-bg-solid` (Task 1).
- Produces: regras dentro de `@media (max-width: 900px)` que neutralizam `backdrop-filter` em `.glass-card`, `body::before` e `.landing-container .shadow-ground`.

- [ ] **Step 1: Acrescentar o bloco mobile ao final de `src/app/globals.css`**

```css
/* ── Mobile performance: trocar efeitos caros por equivalentes baratos ── */
@media (max-width: 900px) {
  /* Vidro embaçado -> fundo sólido (backdrop-filter repinta a cada frame no scroll) */
  .glass-card {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--card-bg-solid);
  }

  /* Grid de fundo fixo força repaint da tela inteira ao rolar */
  body::before {
    display: none;
  }

  /* Sombra de chão com blur custa pintura; remover só na landing */
  .landing-container .shadow-ground {
    filter: none;
  }
}
```

- [ ] **Step 2: Verificar que as três regras foram adicionadas**

Run: `grep -nE "card-bg-solid|body::before|landing-container .shadow-ground" src/app/globals.css | tail -5`
Expected: aparece o uso de `var(--card-bg-solid)` dentro do novo bloco, mais `body::before` e `.landing-container .shadow-ground`.

- [ ] **Step 3: Build para garantir que o CSS é válido**

Run: `npm run build`
Expected: build conclui sem erro de CSS/sintaxe.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "perf(css): drop backdrop-filter, fixed grid and blur shadow on mobile"
```

---

### Task 3: Overrides mobile da landing (Landing.tsx)

No bloco `<style>` da landing, dentro do `@media (max-width: 900px)` já existente (linhas 264-274): desliga as animações `float infinite`, troca o vidro dos balões por fundo sólido e reduz o glow radial.

**Files:**
- Modify: `src/views/Landing.tsx` (dentro do `@media (max-width: 900px)`, linhas 264-274)

**Interfaces:**
- Consumes: `--card-bg-solid` (Task 1).
- Produces: regras mobile que zeram `animation` em `.ui-top`/`.ui-bottom`, removem `backdrop-filter` de `.floating-ui` e reduzem `.visualizer-bg-glow`.

- [ ] **Step 1: Adicionar as regras dentro do bloco mobile existente**

Em `src/views/Landing.tsx`, localizar o fim do bloco `@media (max-width: 900px)` — a linha 273 (`.footer-content { ... }`), imediatamente antes do `}` de fechamento na linha 274. Inserir, logo após a linha do `.footer-content`:

```css
          /* Perf mobile: matar animação infinita sobre vidro (pior caso de repaint) */
          .ui-top, .ui-bottom { animation: none; }
          /* Balões: vidro embaçado -> fundo sólido */
          .floating-ui {
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            background: var(--card-bg-solid);
          }
          /* Glow radial menor (menos área de pintura) */
          .visualizer-bg-glow { width: 90%; height: 90%; }
```

- [ ] **Step 2: Verificar que as regras estão dentro do bloco mobile**

Run: `grep -nE "animation: none|visualizer-bg-glow \{ width: 90" src/views/Landing.tsx`
Expected: ambas as linhas aparecem (números entre ~273 e ~282).

- [ ] **Step 3: Build para garantir que o JSX/CSS continua válido**

Run: `npm run build`
Expected: build conclui sem erro.

- [ ] **Step 4: Commit**

```bash
git add src/views/Landing.tsx
git commit -m "perf(css): disable float animation and glass blur on mobile landing"
```

---

### Task 4: Respeitar prefers-reduced-motion na landing

Garante que usuários com "reduzir movimento" não disparem as animações `float` (a `IntroAnimation` já trata isso em JS via `matchMedia`).

**Files:**
- Modify: `src/views/Landing.tsx` (bloco `<style>`, perto do `@keyframes float`, linha 246)

**Interfaces:**
- Produces: regra `@media (prefers-reduced-motion: reduce)` que zera as animações `float` da landing.

- [ ] **Step 1: Adicionar regra reduced-motion após o `@keyframes float`**

Em `src/views/Landing.tsx`, logo após a linha 246 (`@keyframes float { ... }`), inserir:

```css
        @media (prefers-reduced-motion: reduce) {
          .ui-top, .ui-bottom { animation: none; }
        }
```

- [ ] **Step 2: Verificar**

Run: `grep -n "prefers-reduced-motion" src/views/Landing.tsx`
Expected: 1 linha dentro do bloco `<style>` da landing.

- [ ] **Step 3: Commit**

```bash
git add src/views/Landing.tsx
git commit -m "a11y(css): honor prefers-reduced-motion for landing float animation"
```

---

### Task 5: Validar fluidez em viewport mobile (antes/depois)

Medir jank de forma objetiva num viewport de celular com CPU desacelerada, e confirmar no celular real.

**Files:**
- Create: `scripts/measure-landing-jank.mjs` (script temporário de medição; pode ser removido depois)

**Interfaces:**
- Consumes: o site rodando localmente (`npm run build && npm run start`).

- [ ] **Step 1: Subir o build de produção local**

Run (terminal separado): `npm run build && npm run start`
Expected: servidor em `http://localhost:3000` respondendo 200.

- [ ] **Step 2: Criar o script de medição**

Criar `scripts/measure-landing-jank.mjs`:

```js
// Mede "long tasks" (jank) ao rolar a landing num viewport mobile com CPU 4x mais lenta.
// Uso: node scripts/measure-landing-jank.mjs http://localhost:3000
import { chromium, devices } from 'playwright'

const url = process.argv[2] || 'http://localhost:3000'
const browser = await chromium.launch()
const context = await browser.newContext({ ...devices['Pixel 5'] })
const page = await context.newPage()
const client = await context.newCDPSession(page)
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 })

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500) // deixar a intro terminar

const longTasks = await page.evaluate(async () => {
  const tasks = []
  const obs = new PerformanceObserver(list => {
    for (const e of list.getEntries()) tasks.push(Math.round(e.duration))
  })
  obs.observe({ entryTypes: ['longtask'] })
  // rolar a página repetidamente por ~3s
  const end = Date.now() + 3000
  while (Date.now() < end) {
    window.scrollBy(0, 40)
    await new Promise(r => setTimeout(r, 16))
  }
  obs.disconnect()
  return tasks
})

const total = longTasks.reduce((a, b) => a + b, 0)
console.log(`long tasks: ${longTasks.length} | tempo bloqueado total: ${total}ms | maior: ${Math.max(0, ...longTasks)}ms`)
await browser.close()
```

- [ ] **Step 3: Medir DEPOIS (com as mudanças aplicadas)**

Run: `npx playwright install chromium && node scripts/measure-landing-jank.mjs http://localhost:3000`
Expected: imprime contagem de long tasks e tempo bloqueado. Anotar o valor.

- [ ] **Step 4: Comparar com ANTES (baseline)**

Para o baseline: `git stash` (guarda as mudanças desta branch que não foram commitadas — se já commitadas, usar `git checkout <commit-antes> -- src/`), repetir o Step 3, depois restaurar (`git stash pop` ou `git checkout HEAD -- src/`).
Expected: o "tempo bloqueado total" e o "maior" long task **DEPOIS** devem ser menores que ANTES. Critério de aprovação: redução perceptível (alvo: maior long task < 50ms na maioria dos frames de scroll).

- [ ] **Step 5: Confirmação no celular real**

Abrir `https://www.danosaparentes.com.br` (após deploy) no celular e rolar. Esperado: rolagem fluida, sem engasgo perceptível.

- [ ] **Step 6: Remover o script temporário e commitar**

```bash
git rm scripts/measure-landing-jank.mjs
git commit -m "chore: remove temporary jank measurement script"
```

---

## Notas de execução

- **Por que não TDD clássico:** jank de CSS não tem teste unitário vermelho/verde. Cada task usa verificação por `grep` (a regra existe), `npm run build` (CSS válido) e, na Task 5, medição objetiva de long tasks antes/depois.
- **`contain`/`content-visibility`/`will-change` omitidos de propósito (YAGNI):** o spec citava containment na parte técnica, mas removemos diretamente as causas de repaint (backdrop-filter no mobile, grid fixo, animação infinita) e a landing é uma única tela curta — `content-visibility: auto` (que ajuda páginas longas com seções fora da viewport) não traria ganho. Se a medição da Task 5 ainda mostrar jank residual, containment entra como follow-up direcionado.
- **Deploy:** após aprovar as mudanças, `vercel --prod` (ou push para a branch de produção) publica. A confirmação final é no celular real (Task 5, Step 5).
