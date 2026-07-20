# AEO / GEO Strategy — Danos Aparentes

**Site:** danosaparentes.com.br
**Data da auditoria original:** 2026-07-11
**Reauditoria:** 2026-07-20
**Escopo:** Home, /planos, /faq, /sobre, /blog (42 posts), páginas legais

---

## 1. Reauditoria 2026-07-20 — veredicto

**Produção já está estruturalmente pronta para GEO** (llms.txt, Organization+Person com `sameAs`, NAP, HowTo, dateModified). O risco crítico encontrado nesta verificação: **parte desse trabalho existia só no deploy Vercel (CLI dirty) e não no `main` do GitHub** — um deploy a partir do repo regrediria Organization/Person/`/sobre`.

Esta rodada **sincroniza o código do repositório com a produção** e documenta o scorecard atualizado.

### Checklist vivo (produção + repo após este PR)

| Sinal GEO | Status |
|---|---|
| SSR/SSG do conteúdo indexável | ✅ |
| `robots.txt` permissivo (bots de IA não bloqueados) | ✅ |
| `llms.txt` em `/llms.txt` | ✅ (200, content-type text/plain) |
| Schema `Organization` com NAP + `sameAs` (LinkedIn empresa) | ✅ |
| Schema `Person` com `sameAs` (LinkedIn fundador) + `@id` estável | ✅ |
| Schema `WebSite` + `SoftwareApplication` com `@id` | ✅ |
| `HowTo` na home + em posts procedurais | ✅ (home + 8 posts) |
| `FAQPage` (home + /faq + posts com FAQ) | ✅ |
| `dateModified` real via `updatedDate` | ⚠️ parcial (7/42 posts têm `updatedDate`) |
| Página `/sobre` (entidade humana verificável) | ✅ |
| HSTS em produção | ✅ (`max-age=63072000`) |
| Tabelas em posts comparativos | ❌ ainda ausentes |
| Menções externas de marca (off-page) | ❌ fora do código |

---

## 2. Scorecard — 5 camadas (atualizado)

| Camada | Nota (0–5) jul/11 | Nota (0–5) jul/20 | Resumo |
|---|---|---|---|
| 1. Estrutura extraível | 3.5 | 3.5 | H2/H3/TOC bons; HowTo na home ajuda. Ainda faltam tabelas nos posts comparativos e resposta direta mais consistente no topo dos H2. |
| 2. Citabilidade | 2.5 | 3.5 | `dateModified` real existe; bio/`/sobre` + LinkedIn dão autoria verificável. Ainda falta cobertura de `updatedDate` na maioria dos posts e dados originais/metodologia. |
| 3. Profundidade de dados estruturados | 3 | 4.5 | `Organization`, `Person`, `WebSite`, `SoftwareApplication`, `BlogPosting`, `BreadcrumbList`, `FAQPage`, `HowTo`, `AboutPage`, `VideoObject`. Falta expandir HowTo além dos 8 posts. |
| 4. Acessibilidade para IA | 3.5 | 4.5 | `llms.txt` no ar, robots permissivo, sitemap com `/sobre`, SSR nas seções comerciais da home. `BlogTeaserSection` ainda é `ssr: false` (baixo impacto). |
| 5. Sinais de entidade no mundo real | 1 | 3.5 | LinkedIn empresa + fundador em `sameAs`, NAP padronizado (e-mail, telefone, Florianópolis/SC, CNPJ), página `/sobre`. Menções externas ainda fracos. |

**Média geral: 3.9 / 5** (antes 2.7) — o gargalo deixou de ser “schema básico” e passou a ser **frescor de conteúdo (`updatedDate` em escala), tabelas extraíveis e autoridade off-page**.

---

## 3. Priority queries (10–20)

Perguntas que o site deveria ser citado ao responder, mapeadas para conteúdo existente:

1. "Como fazer um laudo de vistoria veicular" → `/blog/como-fazer-laudo-de-vistoria-veicular`
2. "O que é laudo cautelar e qual a diferença para laudo de avarias" → `/blog/laudo-cautelar-vs-laudo-de-avarias`
3. "Como provar que uma avaria já existia no carro" → `/blog/avarias-preexistentes-como-provar`
4. "Checklist de vistoria de devolução de locadora" → `/blog/checklist-vistoria-devolucao-locadora`
5. "Como fotografar avarias de veículo corretamente" → `/blog/como-fotografar-avarias`
6. "Como fazer vistoria de moto / caminhão / ônibus" → `/blog/vistoria-de-moto`, `/vistoria-de-caminhao`, `/vistoria-de-onibus`
7. "Vistoria digital sem papel, como funciona" → `/blog/vistoria-sem-papel`
8. "O que é hash SHA-256 e QR Code num laudo de vistoria" → `/blog/qr-code-e-hash-no-laudo-de-avarias`
9. "Como assinar digitalmente um laudo de vistoria" → `/blog/laudo-de-vistoria-com-assinatura-digital`
10. "Como padronizar vistoria entre vistoriadores de uma frota" → `/blog/vistoria-de-frota-padronizar-equipe`
11. "App de vistoria veicular que funciona offline" → home + `/blog/vistoria-na-chuva-sem-retrabalho`
12. "Quanto custa um sistema de vistoria digital para locadora" → `/planos`
13. "Melhores apps de vistoria para concessionária de seminovos" → `/blog/vistoria-de-seminovos-para-concessionarias`
14. "Como reduzir prejuízo com avarias não cobradas na frota" → `/blog/como-reduzir-prejuizo-com-avarias-na-frota`
15. "Consulta automática de placa para vistoria" → `/blog/consulta-automatica-de-placa`
16. "Modelo de PDF de laudo de vistoria com logo da empresa" → `/blog/laudo-com-logo-da-empresa-no-pdf`, `/blog/6-modelos-de-pdf-para-o-laudo-de-vistoria`
17. "Como treinar um vistoriador novo rapidamente" → `/blog/como-treinar-um-novo-vistoriador-rapidamente`
18. "Vistoria em quantas vistas do veículo é necessária" → `/blog/vistoria-nas-4-vistas-do-veiculo`
19. "Danos Aparentes é confiável / quem está por trás" → `/sobre` + home (`TrustSection`)
20. "Software de vistoria veicular white label" → `/blog/laudo-white-label-para-locadoras`

---

## 4. Plano de remediação restante

### Feito nesta reauditoria (código)
- Fonte única de entidades em `src/lib/seo/entity.ts` (Organization / Person / WebSite / NAP / LinkedIn).
- Schema site-wide no `layout.tsx` alinhado à produção.
- Página `/sobre` + entrada no sitemap + links no footer/TrustSection.
- `BlogPosting.author` aponta para o mesmo `@id` do Person + `sameAs`.
- HowTo da home + HowTo de posts com `position`/`inLanguage`.
- `llms.txt` referencia `/sobre`.

### Ainda aberto
- **Camada 1:** tabelas em `laudo-cautelar-vs-laudo-de-avarias` e `6-modelos-de-pdf-para-o-laudo-de-vistoria`; resposta direta no topo dos H2 nos posts restantes.
- **Camada 2:** popular `updatedDate` nos ~35 posts sem revisão explícita (só quando o conteúdo for de fato revisado — não inventar frescor).
- **Camada 3:** HowTo nos demais posts procedurais (checklist devolução, fotografar avarias, etc.).
- **Camada 4:** remover `ssr: false` de `BlogTeaserSection` se não houver dependência real de `window`.
- **Camada 5:** menções externas (diretórios SaaS BR, grupos de locadoras) — marketing, não engenharia.

---

## 5. Roadmap de implementação (pós-sincronização)

| Prioridade | Ação | Camada | Esforço |
|---|---|---|---|
| P1 | Tabelas nos 2 posts comparativos | 1 | Baixo |
| P1 | HowTo nos posts procedurais restantes | 3 | Médio |
| P2 | SSR do `BlogTeaserSection` | 4 | Baixo |
| P2 | `updatedDate` só quando houver revisão real | 2 | Contínuo |
| P3 | Menções externas de marca | 5 | Alto (fora do código) |

---

## 6. Cadência de reteste

- **Trimestral**: reexecutar a auditoria estrutural (schema, llms.txt, dateModified) e, assim que houver volume de tráfego/indexação suficiente, testar as 20 priority queries diretamente em ChatGPT, Perplexity, Google AI Overviews e Claude, registrando quais fontes são citadas.
- **A cada novo post do blog**: checklist de publicação deve incluir resposta direta no topo, `dateModified` inicial = `date`, e considerar `HowTo` se o conteúdo for procedural.
- **Gatilho fora do ciclo**: se a Camada 5 mudar (nova menção externa relevante), reauditar imediatamente essa camada.
- **Regra de deploy**: mudanças GEO devem ir para o GitHub antes/junto do deploy Vercel — evitar “só CLI dirty” (causa da divergência encontrada em 2026-07-20).
