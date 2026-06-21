# Design: Fluidez da Landing no Celular

**Data:** 2026-06-20
**Status:** Aprovado (aguardando revisão do spec)
**Escopo:** Corrigir travamento/engasgo ("abre mas trava ao usar") da landing page ao rolar em dispositivos móveis.

## Problema

Usuário relatou que, ao acessar `www.danosaparentes.com.br` pelo celular, o site "demorou muito e não responde". Investigação descartou causas de servidor e rede:

| Item | Medição | Veredito |
|------|---------|----------|
| Servidor/CDN (`www`) | HTTP 200, TTFB 84ms, total 100ms | Rápido |
| HTML | 78 KB | OK |
| JS (12 chunks) | ~270 KB gzip | Moderado |
| CSS | 13 KB | OK |
| Imagens | favicon 3,7KB + logo 2KB | Levíssimo |
| Service Worker / PWA | `sw.js` → 404 (não há SW) | Descartado |

O sintoma confirmado pelo usuário: **a landing abre, mas engasga ao rolar** — jank de runtime (thread principal/GPU bloqueada), não problema de download nem de cache.

## Causas-raiz (priorizadas)

1. **`backdrop-filter: blur()` + animação infinita sobrepostos.** Os balões flutuantes `.ui-top` e `.ui-bottom` (`src/views/Landing.tsx`) usam `animation: float 3s ease-in-out infinite` e ficam sobre elementos com vidro/blur. Animação contínua sobre `backdrop-filter` força recálculo do desfoque a cada frame, inclusive durante a rolagem. **Maior causador.**
2. **`backdrop-filter: blur(18px)`** nos cards `.glass-card` (globals.css) e **`blur(12px)`** no `.hero-visualizer` (Landing.tsx). Repaint caro em GPU móvel.
3. **SVG do veículo** (`CarLateralLeft` + `VehicleDefs`) com gradientes e sombra de chão `.shadow-ground { filter: blur(8px) }` — custo de pintura fixo.
4. **`visualizer-bg-glow`** (radial-gradient grande) + grid de fundo cobrindo a viewport.

Confirmado que **NÃO** há `background-attachment: fixed` (que seria catastrófico), então essa causa está descartada.

## Abordagem: Equilíbrio

Otimização técnica em todos os aparelhos + simplificação apenas dos efeitos comprovadamente caros no celular. Preserva o visual rico no desktop.

### A) Técnica — todos os aparelhos
- Remover/pausar as animações `float infinite` quando estiverem sobre superfícies com `backdrop-filter` (combinação que é o pior caso de repaint).
- Aplicar `contain: paint` / `content-visibility` e `will-change` apenas nas camadas que realmente se beneficiam, para isolar repaints.
- Garantir que `@media (prefers-reduced-motion: reduce)` realmente zere as animações da landing (hoje a cobertura é parcial).

### B) Mobile (`@media max-width: 900px`) — simplificar só o caro
- Substituir `backdrop-filter: blur` por **fundo sólido semitransparente** (visual quase idêntico, custo próximo de zero) nos `.glass-card` e no `.hero-visualizer`.
- **Desligar** as animações `float` dos balões `.ui-top`/`.ui-bottom`.
- Reduzir o `visualizer-bg-glow` (raio menor ou estático) e remover a `.shadow-ground { filter: blur(8px) }` no mobile.

## Fora de escopo

- Estrutura/HTML da landing permanece igual; mudanças são **somente CSS** (no bloco `<style>` de `src/views/Landing.tsx` e em `src/app/globals.css`).
- Visual do desktop permanece intacto.
- Não inclui otimização do app interno (VehicleViewer/marcação de avarias) — o jank relatado é na landing.

## Arquivos afetados

- `src/views/Landing.tsx` (bloco `<style>` interno)
- `src/app/globals.css`

## Critério de sucesso

- Rolagem fluida (sem travadas perceptíveis) na landing em perfil de CPU "mid-tier mobile".
- Validação: abrir a landing em viewport de celular real (navegador headless), medir jank/FPS ao rolar **antes e depois** da mudança.
- Visual do desktop inalterado; visual do mobile equivalente (sem blur de vidro, mas com fundo sólido semitransparente).

## Riscos

- Baixo. Mudanças isoladas em CSS, reversíveis. Risco principal: fundo sólido no mobile destoar levemente do vidro do desktop — mitigado escolhendo opacidade/cor próximas do efeito atual.
