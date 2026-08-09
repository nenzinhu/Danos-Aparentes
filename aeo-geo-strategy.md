# AEO / GEO Strategy — Danos Aparentes

**Site:** danosaparentes.com.br
**Data da auditoria:** 2026-07-11
**Escopo:** Home, /planos, /faq, /blog (33 posts), páginas legais

---

## 1. Auditoria atual de visibilidade em IA

Esta auditoria é **estrutural** (inspeção de código/HTML/schema), não uma consulta ao vivo nos produtos de IA — o site é novo, tem baixo volume histórico de indexação, e ainda não há dados de citação para comparar. Ela substitui o passo 3 do workflow ("testar visibilidade atual") por uma leitura de prontidão técnica: **o site está estruturalmente pronto para ser rastreado e citado, mas hoje deixa sinais valiosos na mesa.**

Achados-chave:

- ✅ Renderização **server-side / estática** em todas as páginas relevantes (`generateStaticParams` no blog, App Router com metadata server-rendered) — não depende de JS client-side para conteúdo crítico. Isso é uma vantagem real: muitos crawlers de IA renderizam JS de forma não confiável, e aqui não é necessário.
- ✅ `robots.txt` usa `userAgent: '*', allow: '/'` sem bloqueio a bots de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended passam por padrão).
- ✅ Schema.org já presente: `Organization` (site-wide), `BlogPosting` + `BreadcrumbList` (todo post), `FAQPage` (home, /planos, /faq).
- ❌ **Não existe `llms.txt`** na raiz do site.
- ❌ **Nenhum schema `Person` com `sameAs`** — os autores dos posts (`author.name`) viram uma string em `BlogPosting`, sem entidade própria, sem perfil verificável.
- ❌ **Nenhum link para perfil social/profissional** em lugar nenhum do site (nem footer, nem TrustSection, nem schema).
- ❌ **Nenhum schema `HowTo`** — vários posts do blog são procedurais ("passo a passo de vistoria") e hoje só têm `BlogPosting`.
- ❌ `dateModified` no schema de cada post **é sempre igual a `datePublished`** (`src/content/blog.tsx` não versiona atualizações) — nenhum sinal real de frescor.
- ⚠️ Conteúdo é bem estruturado em prosa mas **sub-utiliza tabelas** (formato que IA extrai com mais confiança que parágrafos) para conteúdos comparativos (ex: "6 modelos de PDF", "laudo cautelar vs laudo de avarias").

---

## 2. Scorecard — 5 camadas

| Camada | Nota (0–5) | Resumo |
|---|---|---|
| 1. Estrutura extraível | 3.5 | Boa estrutura de H2/H3, listas, TOC por post. Falta resposta direta logo na abertura de cada seção e mais uso de tabelas. |
| 2. Citabilidade | 2.5 | Sem dados originais/pesquisa própria, sem metodologia declarada, `dateModified` não confiável, autoria fraca (sem credenciais/link verificável). |
| 3. Profundidade de dados estruturados | 3 | `Organization`, `BlogPosting`, `BreadcrumbList`, `FAQPage` presentes. Faltam `Person` com `sameAs`, `HowTo`, `dateModified` real. |
| 4. Acessibilidade para IA | 3.5 | SSR/SSG forte, `robots.txt` permissivo, sitemap presente. Falta `llms.txt`. |
| 5. Sinais de entidade no mundo real | 1 | Nenhum perfil social vinculado, nenhuma menção de marca fora do próprio site, sem Wikidata (não se qualifica ainda), NAP não padronizado em schema. |

**Média geral: 2.7 / 5** — base técnica é sólida (SSR, schema básico, robots permissivo), mas os sinais de *confiança e entidade* — exatamente o que separa "indexado" de "citado" — estão fracos. Isso é consistente com o que a própria `TrustSection` do site já assume: "ainda não temos histórico público".

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
19. "Danos Aparentes é confiável / quem está por trás" → home (`TrustSection`) — hoje sem entidade verificável fora do site
20. "Software de vistoria veicular white label" → `/blog/laudo-white-label-para-locadoras`

---

## 4. Plano de remediação por camada

### Camada 1 — Estrutura extraível
- Adicionar um **parágrafo de resposta direta (1–3 frases)** logo abaixo de cada H2 nos 33 posts, antes de expandir o raciocínio. Hoje os posts já abrem contextualizando, mas nem sempre com a resposta definitiva na primeira frase.
- Converter para **tabela** os conteúdos comparativos: `laudo-cautelar-vs-laudo-de-avarias` (tabela lado a lado), `6-modelos-de-pdf-para-o-laudo-de-vistoria` (tabela de modelos x campos).
- Onde já há passo a passo em `<ul>`, considerar `<ol>` numerado explícito — reforça o padrão "procedural" que HowTo schema também vai usar.

### Camada 2 — Citabilidade
- Adicionar **`dateModified` real** por post (campo novo em `BlogPost`, default = `date`, atualizado manualmente quando o conteúdo é revisado) — hoje `articleJsonLd.dateModified` mente ao repetir `date`.
- Expandir a bio do autor nos posts: hoje é só `{ name, role }`. Adicionar credencial curta (ex: "Jeferson da Silva — desenvolvedor e responsável legal do Danos Aparentes, Florianópolis/SC") consistente com o que já existe na `TrustSection`.
- Declarar metodologia quando o post afirma algo prático (ex: "testamos X vistorias e cronometramos" só se for verdade — não inventar dado que não existe, seguindo o próprio tom de transparência que a marca já adota).

### Camada 3 — Dados estruturados
- Adicionar **`Person` schema com `sameAs`** para o autor (hoje só existe como texto solto dentro de `BlogPosting.author`). Requer primeiro resolver a Camada 5 (ter um perfil público para linkar).
- Adicionar **`HowTo` schema** nos posts procedurais (passo a passo de vistoria, como fotografar avarias, checklist de devolução) — schema adicional ao `BlogPosting` já existente, não substituto.
- Corrigir `dateModified` no `articleJsonLd` de `src/app/blog/[slug]/page.tsx` para refletir o campo real do post (depende da mudança de Camada 2).

### Camada 4 — Acessibilidade para IA
- Criar **`/llms.txt`** na raiz (`public/llms.txt`, servido em `danosaparentes.com.br/llms.txt`) descrevendo: o que é o produto, público-alvo, e uma lista curada dos principais posts/páginas (home, /planos, /faq e os ~20 posts mais estratégicos da lista da Seção 3). Ver `references/llms-txt-guide.md` da skill para o formato.
- Manter o `robots.txt` permissivo como está — não há necessidade de mudança aqui, já é o comportamento certo.

### Camada 5 — Sinais de entidade (o gargalo real)
Esta é a camada mais fraca e a que mais trava as demais (schema `Person.sameAs` depende dela).
- Criar/vincular ao menos um **perfil profissional verificável** (LinkedIn do Jeferson da Silva, ou perfil da empresa) e referenciá-lo via `sameAs` no schema `Organization` e `Person`.
- Padronizar **NAP** (nome, e-mail de contato, cidade) de forma idêntica em: footer, `TrustSection`, schema `Organization`, páginas legais — hoje o e-mail e "Florianópolis/SC" aparecem em `TrustSection`, mas não estão espelhados em schema.
- Buscar **menções de marca em fontes externas** (diretórios de SaaS brasileiros, grupos de locadoras/frotistas, imprensa de nicho) — isso é trabalho de off-page, fora do escopo de código; registrar como ação de marketing, não de engenharia.
- Não perseguir Wikipedia/Wikidata agora — o produto é novo demais para notabilidade; reavaliar em 12+ meses.

---

## 5. Roadmap de implementação

| Prioridade | Ação | Camada | Esforço |
|---|---|---|---|
| P0 | Corrigir `dateModified` real por post | 2, 3 | Baixo |
| P0 | Criar `/llms.txt` | 4 | Baixo |
| P1 | Adicionar `HowTo` schema aos posts procedurais (5–6 posts) | 3 | Médio |
| P1 | Resposta direta no topo de cada H2 (33 posts) | 1 | Médio-Alto |
| P1 | Vincular 1 perfil profissional verificável + `sameAs` em `Organization`/`Person` | 5, 3 | Baixo (depende de decisão de negócio) |
| P2 | Converter conteúdo comparativo em tabelas (2 posts) | 1 | Baixo |
| P2 | Padronizar NAP em schema | 5 | Baixo |
| P3 | Buscar menções externas de marca | 5 | Alto (fora do código) |

---

## 6. Cadência de reteste

- **Trimestral**: reexecutar a auditoria estrutural (schema, llms.txt, dateModified) e, assim que houver volume de tráfego/indexação suficiente, testar as 20 priority queries diretamente em ChatGPT, Perplexity, Google AI Overviews e Claude, registrando quais fontes são citadas.
- **A cada novo post do blog**: checklist de publicação deve incluir resposta direta no topo, `dateModified` inicial = `date`, e considerar `HowTo` se o conteúdo for procedural.
- **Gatilho fora do ciclo**: se a Camada 5 mudar (perfil social criado, menção externa relevante conquistada), reauditar imediatamente essa camada.
