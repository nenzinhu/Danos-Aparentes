# Content Strategy — Danos Aparentes (2026-07-19)

Skill: `content-strategy` (upstream Corey Haines / marketingskills)  
Grounding: inventário de 42 posts em `src/content/blog.tsx`, landings `/locadoras|/oficinas|/frotas|/seguradoras|/planos`, e `seo-keyword-research.md` (2026-07-11).

## Assumptions

- **Produto:** app de vistoria de avarias (não cautelar DETRAN)
- **ICP:** locadoras, frotas, oficinas, despachantes, concessionárias (seminovos)
- **Meta primária do conteúdo:** leads qualificados (trial Pro / Corporativo) + autoridade orgânica
- **Formato disponível:** blog + landings + vídeo curto; sem case study publicado ainda
- **Volumes/dificuldade:** estimativas do keyword research (sem GSC/Ahrefs nesta sessão)

---

## 1. Diagnóstico do estado atual

### O que já está forte (searchable / awareness–implementation)

| Pilares cobertos | Posts (aprox.) | Status |
|---|---|---|
| Como fazer laudo / por veículo | 8+ | Forte — topo de funil bem servido |
| Prova / disputa (preexistente, cobrança) | 5 | Forte — dor central do produto |
| Operação digital (sem papel, chuva, redigitação) | 6 | Forte |
| Validade (hash, QR, assinatura, PDF oficial) | 5 | Forte / diferencial |
| Frota (padronizar, offline, prejuízo) | 6 | Bom |
| Features (placa, CNH, voz, modelos PDF) | 6 | Long-tail útil |

### Gaps críticos (ainda)

1. **Comparação / fundo de funil** — zero posts “alternativa a X”, “melhor app”, “offline vs concorrente”
2. **Preço / decisão** — pouco conteúdo searchável sobre “quanto custa sistema de vistoria”
3. **Shareable / prova social** — sem case studies, dados anonimizados, before/after operacionais reais
4. **Concessionária** — só 1 post (`vistoria-de-seminovos-para-concessionarias`)
5. **Internal linking** — vários posts de alta intenção ainda não apontam para `/locadoras`, `/oficinas`, `/frotas`

### Atualização vs keyword research (jul/11)

- `/locadoras` **já existe** e está otimizada para “sistema de vistoria veicular para locadora” — Cluster 1 comercial saiu de “criar landing” para **alimentar com spokes + links internos**.
- Landings `/oficinas`, `/frotas`, `/seguradoras` existem — precisam do mesmo tratamento de hub.

---

## 2. Content pillars (5)

### P1 — Prova e cobrança de avarias *(hub comercial mais próximo da compra)*
**Produto:** laudo com foto, GPS, assinatura, hash/QR  
**ICP:** locadoras, frotas  
**Clusters:** preexistente · cobrança na devolução · amassado · sinistro

### P2 — Operação de vistoria sem atrito
**Produto:** offline, autofill placa/CNH, sem papel, produtividade  
**ICP:** vistoriadores, gestores de pátio  
**Clusters:** sem papel · chuva · redigitação · mais vistorias/dia · offline

### P3 — Laudo profissional e validade
**Produto:** white-label, modelos PDF, assinatura, hash/QR  
**ICP:** locadoras, oficinas, seguradoras, despachantes  
**Clusters:** logo · white-label · QR · relatório oficial · cautelar vs avarias *(desambiguação)*

### P4 — Por ICP / vertical
**Landings como hubs:** `/locadoras` · `/oficinas` · `/frotas` · `/seguradoras`  
**Spokes:** posts de dor específicos + links CTA para a landing

### P5 — Decisão e comparação *(GAP — prioridade #1 de produção nova)*
**Intent:** consideration → decision  
**Clusters:** alternativa a concorrentes · offline como diferencial · preço · melhores apps *(ângulo honesto)*

---

## 3. Topic cluster map

```
Danos Aparentes — Vistoria de avarias digital
│
├── P1 Prova & cobrança
│   ├── [hub soft] posts preexistente / cobrança / amassado
│   └── → CTA /locadoras + /planos
│
├── P2 Operação sem atrito
│   ├── sem papel · placa · CNH · chuva · offline
│   └── → CTA /frotas + /app
│
├── P3 Laudo & validade
│   ├── hash/QR · assinatura · white-label · PDF oficial
│   └── → CTA /seguradoras + /planos
│
├── P4 Verticais (landings = hubs)
│   ├── /locadoras ← checklist, cobrança, white-label, amassado
│   ├── /oficinas  ← orçamento, digitalizar oficina
│   ├── /frotas    ← entrada/saída, offline, prejuízo
│   └── /seguradoras ← QR, sinistro
│
└── P5 Decisão & comparação (A PRODUZIR)
    ├── alternativas / comparativo apps de vistoria
    ├── app de vistoria offline (ângulo diferencial)
    └── quanto custa sistema de vistoria para locadora
```

---

## 4. Priority topics (próximos a produzir)

Score: Customer Impact 40% · Content-Market Fit 30% · Search Potential 20% · Resources 10%

| # | Título sugerido | Tipo | Keyword | Stage | Score | Por quê |
|---|---|---|---|---|---|---|
| 1 | App de vistoria veicular offline: por que isso muda o pátio | Searchable + shareable | app de vistoria veicular offline | Consideration | **8.6** | Diferencial real; baixa disputa; liga a `/frotas` e `/locadoras` |
| 2 | Quanto custa um sistema de vistoria para locadora | Searchable | quanto custa sistema de vistoria para locadora | Decision | **8.4** | Intent transacional; FAQ já existe em `/locadoras` — expandir como post |
| 3 | Melhores apps de vistoria veicular em 2026 (comparativo honesto) | Searchable | melhor app de vistoria veicular / comparativo | Consideration | **7.8** | Fundo de funil; **exigir tabela verificável**, sem inventar features de concorrentes |
| 4 | Alternativas a sistemas de checklist de frota (sem naming bait se não houver dados) | Searchable | alternativa ao vexsoft *(só se pesquisa primaria OK)* | Consideration | **7.2** | Alto risco reputacional — só publicar com pesquisa real |
| 5 | Case study: como uma locadora padronizou retirada × devolução | Shareable | — | Decision | **8.0** | Maior alavanca de conversão; depende de cliente real |
| 6 | Checklist de entrada de seminovos na concessionária | Searchable use-case | inspeção seminovos concessionária | Awareness→Consideration | **7.0** | Expande vertical fraca |
| 7 | Vistoria de entrada na oficina: modelo de aceite do cliente | Template / use-case | vistoria entrada oficina | Implementation | **7.4** | Complementa `/oficinas` + post orçamento |
| 8 | Como ler o hash e o QR do laudo (tutorial) | Implementation | hash QR laudo avarias | Implementation | **6.8** | Reforça P3; já tem posts — unificar em tutorial curto |

### Não produzir (deferred)

- Keywords de **vistoria cautelar / DETRAN / Uber** — tráfego desalinhado
- “Modelo de laudo grátis” isolado — intent de download, não de software
- “Top 10 apps” genérico sem pesquisa — risco de spam / perda de confiança

---

## 5. Roadmap editorial (90 dias)

### Semanas 1–2 — Quick wins (sem posts novos)
- [x] Capas editoriais em todos os 42 posts *(feito)*
- [ ] Internal linking: posts P1/P2/P4 → landings (esta PR)
- [ ] Reforçar CTAs `/planos` nos posts de decisão
- [ ] Atualizar `seo-keyword-research.md` nota: `/locadoras` já existe

### Semanas 3–6 — Produção P5 + preço
1. Publicar **#1 offline**
2. Publicar **#2 preço locadora**
3. Começar pesquisa primária para comparativo (#3/#4)

### Semanas 7–12 — Vertical + shareable
4. Checklist seminovos concessionária (#6)
5. Template aceite oficina (#7)
6. 1 case study real (#5) — bloquear até ter cliente

### Ritmo sugerido
- **2 posts/mês** novos (searchable) + **1 refresh/mês** de post existente (internal links, FAQ, HowTo schema)
- **Trimestral:** revalidar SERP concorrentes (Vexsoft, Infovist, etc.)

---

## 6. Regras de produção

1. Todo post searchable deve ter: keyword no H1, FAQ se couber, CTA para landing vertical + `/planos` ou trial.
2. Posts de comparação: **zero claims inventados** sobre concorrentes; preferir critérios objetivos (offline, white-label, hash, preço público).
3. Não perseguir “cautelar” sem desambiguação explícita (já existe post de diferenciação).
4. Capas: foto full-bleed em `/blog/{slug}.jpg` alinhada ao ângulo (padrão atual).
5. Após GSC: recalibrar scores com posições 5–20 (quick wins reais).

---

## 7. Métricas de sucesso

| Métrica | Meta 90 dias |
|---|---|
| Sessões orgânicas blog | +tendência (baseline GSC) |
| Cliques internos blog → `/locadoras|/oficinas|/frotas` | subir vs. período anterior |
| Signups trial atribuídos a blog/landing | rastrear UTM `utm_medium=blog` |
| Posts P5 publicados | ≥ 2 |
| Case study | 1 (se houver cliente) |

---

## 8. Próxima ação imediata

1. Fechar internal linking dos posts prioritários → landings *(esta PR)*.
2. Escrever outline do post **“App de vistoria veicular offline”**.
3. Pedir acesso GSC para recalibrar o roadmap.
