# Technical SEO Audit — Danos Aparentes

**Site:** danosaparentes.com.br
**Audit date:** 2026-07-11
**Auditor:** Auditoria estrutural via inspeção de código-fonte, `robots.ts`, `sitemap.ts`, `next.config.js`, HTML servido (SSR bruto) e `curl`. Sem acesso ao Google Search Console nem a logs de servidor — itens que dependem disso estão marcados como "Verificar" em vez de "Confirmado".

---

## 1. Scope and methodology

Escopo: site inteiro (App Router Next.js) — home, `/planos`, `/faq`, `/blog` + 33 posts + categorias, `/demo` (+ 1 subpágina de ads), `/verify`, `/suporte`, `/termos`, `/privacidade`. Sem crawler externo disponível nesta sessão; a auditoria foi feita lendo o código-fonte de cada rota, `robots.ts`, `sitemap.ts`, `next.config.js`, e validando com `curl` (HTML bruto, sem execução de JS) contra o dev server local. Não cobre: dados de Search Console (indexação real, Core Web Vitals de campo), logs de servidor, nem o comportamento em produção (HSTS, certificado — dependem do domínio ao vivo na Vercel).

---

## 2. Executive summary

O site está tecnicamente bem cuidado para o tamanho que tem — sitemap dinâmico, robots.txt permissivo, canonicals corretos em toda página auditada, uma página de ads já corretamente `noindex`. Não há bloqueio crítico de rastreamento. O maior risco real é **duas páginas órfãs** (`/demo` e `/verify`) que estão no sitemap mas não são linkadas de lugar nenhum do site — o Google as descobre só pelo sitemap, o que é mais frágil do que descoberta via link interno. O segundo ponto é de página de experiência: imagens `<img>` sem `width`/`height` em duas seções da home (showcase de veículos e preview do laudo) — risco de CLS (Cumulative Layout Shift), uma das métricas de Core Web Vitals. Nada aqui bloqueia indexação; são ajustes de robustez, não resgate de tráfego perdido. Esforço estimado para os itens P1: baixo (menos de 1h de código).

---

## 3. 6-layer score

| Camada | Nota | Resumo |
|---|---|---|
| 1. Crawlability | Pass | `robots.txt` permissivo, sitemap presente e referenciado, sem crawl traps identificados. |
| 2. Indexability | Pass | Canonicals self-referencing em toda página checada, página de ads corretamente `noindex`, sem sinais conflitantes. |
| 3. Rendering | Pass (após fixes desta sessão) | Todo conteúdo comercial da home já é SSR. `/verify` é 100% client-rendered, mas é uma ferramenta utilitária, não conteúdo de busca. |
| 4. Site architecture | Needs work | `/demo` e `/verify` são páginas órfãs — no sitemap, mas sem nenhum link interno apontando para elas. |
| 5. Structured data | Pass | Schema presente e correto nas páginas centrais (`Organization`, `SoftwareApplication`, `BlogPosting`, `BreadcrumbList`, `FAQPage`). |
| 6. Page experience e segurança | Needs work / Verificar | `<img>` sem `width`/`height` em 2 seções da home (risco de CLS). HTTPS/HSTS não verificável sem acesso à produção — provavelmente OK por padrão da Vercel, mas não confirmado. |

---

## 4. Critical issues

Nenhum item bloqueando rastreamento ou indexação foi encontrado.

---

## 5. Important issues

### 5.1 Páginas órfãs: `/demo` e `/verify`
- **Onde:** `src/app/demo/page.tsx`, `src/app/verify/page.tsx` — ambas presentes em `sitemap.ts` (prioridade 0.7 e 0.5) mas sem nenhum `href="/demo"` ou `href="/verify"` encontrado em nav, footer, ou qualquer componente de página.
- **Por que importa:** páginas sem link interno só são descobertas via sitemap. Isso funciona, mas é um sinal mais fraco — a ausência de links internos apontando para elas também significa que não recebem nenhum "peso" de autoridade interna, e crawlers que não seguem sitemaps agressivamente podem levar mais tempo para (re)descobri-las.
- **Fix sugerido:** linkar `/demo` a partir de algum ponto natural da home (ex: um CTA secundário "Ver demonstração" perto do hero ou do showcase de veículos) e `/verify` a partir do rodapé ou da `TrustSection`, já que ela reforça exatamente a mensagem de "o laudo comprova a si mesmo" que a seção já comunica.

### 5.2 `<img>` sem `width`/`height` — risco de CLS
- **Onde:** `src/components/VehicleShowcaseSection.tsx:202` e `src/components/PdfPreviewSection.tsx:134` — ambas usam `<img>` nativo (não `next/image`) sem atributos `width`/`height`, só controladas por CSS (`w-full h-auto`).
- **Por que importa:** sem dimensões intrínsecas declaradas, o navegador não reserva espaço para a imagem antes dela carregar, causando deslocamento de layout (CLS) quando a imagem popula — isso é medido diretamente pelo Core Web Vitals e é sinal de ranking.
- **Fix sugerido:** adicionar `width`/`height` (as dimensões reais do PNG) a ambos os `<img>`, ou migrar para `next/image` (mais correto, já dá AVIF/WebP automaticamente — `next.config.js` já habilita esses formatos, mas eles só se aplicam a imagens passadas por `next/image`, não a `<img>` cru).

---

## 6. Nice-to-have polish

- **`sitemap.ts` usa `new Date()` para todas as páginas estáticas** (`lastModified: new Date()` em `ROUTES`, linha 21) — isso faz `/termos` e `/privacidade` (que raramente mudam) aparentarem ter sido atualizadas a cada build, o que dilui o valor do `lastmod` como sinal de frescor real. Trocar por uma data fixa por rota (semelhante ao padrão `updatedDate` já adotado no blog) seria mais preciso.
- **`/verify` é 100% client-rendered** sem nenhum fallback de conteúdo real no HTML servido (só o estado "carregando"). Não é grave — não é uma página de intenção de busca — mas vale considerar um `noindex` explícito nela, já que sem `?hash=` na URL ela sempre mostra o mesmo estado vazio ("no_hash"), o que tecnicamente é conteúdo fino (thin content) se algum dia for rastreada sem parâmetro.
- **HSTS / HTTPS**: não verificável sem acesso à produção nesta sessão. A Vercel normalmente aplica HTTPS e HSTS por padrão em domínios customizados, mas vale confirmar diretamente (`curl -I https://danosaparentes.com.br` e checar o header `Strict-Transport-Security`) na próxima auditoria com acesso à produção.
- **Core Web Vitals de campo**: o site já tem `@vercel/speed-insights` instalado (`src/app/layout.tsx`), então os dados de campo (LCP/INP/CLS reais de usuários) já estão sendo coletados — vale puxar esse relatório do dashboard da Vercel na próxima revisão, em vez de depender só de auditoria estrutural.

---

## 7. Implementation roadmap

| Prioridade | Ação | Camada | Esforço |
|---|---|---|---|
| P1 | Adicionar `width`/`height` aos `<img>` de `VehicleShowcaseSection` e `PdfPreviewSection` | 6 | Baixo |
| P1 | Linkar `/demo` e `/verify` internamente (quebrar orfandade) | 4 | Baixo |
| P2 | Trocar `lastModified: new Date()` por datas fixas por rota em `sitemap.ts` | 1 | Baixo |
| P2 | Confirmar HSTS/HTTPS em produção | 6 | Baixo (só verificação) |
| P3 | Avaliar `noindex` em `/verify` sem parâmetro `hash` | 2 | Baixo |
| P3 | Puxar relatório de Core Web Vitals de campo do dashboard Vercel Speed Insights | 6 | Baixo (não é código) |

---

## Re-audit

Reexecutar esta auditoria estrutural a cada mudança grande de arquitetura (nova seção lazy, nova rota) e, quando houver acesso ao Search Console, cruzar com o relatório de Cobertura para confirmar que a contagem de páginas indexadas bate com o sitemap.
