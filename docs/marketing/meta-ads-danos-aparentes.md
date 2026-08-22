# Conceitos Criativos Meta Ads — Danos Aparentes

> Gerado em 2026-07-25 | Skill: `guimkt-meta-ads` v3.6.0  
> Pasta do lote: `entregas/Danos-Aparentes/05-criativos-meta-ads/lote-01/`  
> Design system: `entregas/Danos-Aparentes/05-criativos-meta-ads/design-system-danos-aparentes.md`  
> Formato padrão: Feed 4:5 (1080×1350px)  
> **Prova social:** 0 cases — sem depoimentos inventados, sem ROAS falso, sem “empresas relatam”. Prova = mecanismo (QR/hash) + evidência pública do *problema* (com fonte) + trial.

**HTML:** `docs/meta-ads-danos-aparentes.html` · `lote-01/conceitos-meta-danos-aparentes.html`  
**Prompts:** `lote-01/prompts-imagens-danos-aparentes.md`

---

## Destino de tráfego (obrigatório)

| Destino | Uso |
|---------|-----|
| **Recomendado (live):** `https://danosaparentes.com.br/locadoras` | Message match wedge locadoras; já existe no site |
| **Quando shipar LP do pipeline:** `/locadoras` ou path dedicado da LP focada (`docs/landing-page-danos-aparentes.html`) | Deep-link da LP P.A.S.T.O.R., não home multi-ICP |
| **Evitar em ads de conversão:** `https://danosaparentes.com.br/` (home) | Dilui ICP (oficina + frota + seguradora) |
| **UTM base sugerida:** `?utm_source=meta&utm_medium=paid_social&utm_campaign=locadoras_trial&utm_content={{conceito}}` | + `utm_term` = hook A/B |

CTA nativo preferido: **Cadastre-se** ou **Obter oferta** (trial). Evitar “Saiba mais” em BOF.

---

## Briefing Sintetizado

- **Produto:** SaaS vistoria veicular digital — diagrama, foto+GPS, assinaturas, PDF com hash SHA-256 + QR, offline, white-label
- **Público:** Dono/ops de **locadora** (wedge) — disputa na devolução
- **Dor principal:** “Já estava assim” / cobrança sem par entrega×devolução comparável
- **Diferencial:** Laudo que se verifica (hash+QR) + prova no ato (GPS+assinatura dual)
- **Objetivo:** Cadastros / trial SME (Starter R$29,90 · Pro R$49,90)
- **Oferta:** Trial **7 dias grátis sem cartão** (evergreen)
- **Restrições:** Sem fake testimonials; sem ROI inventado; sem “100% incontestável”; jurídico só com nuance + fonte

## Customer Avatar Hooks

- **Why want:** (1) Cobrar só dano novo com prova comparável (2) Padronizar vistoriadores (3) Laudo com logo da locadora (white-label Pro)
- **Why NOT want:** (1) “Sem cases / marca nova” (2) Dúvida de validade jurídica (3) “WhatsApp já resolve”
- **Why watch:** (1) Demo QR verificável em 2 min (2) Contraste WhatsApp/prancheta vs laudo selado (3) Citação jurídica do *problema* (fonte), não depoimento de cliente

## Customer Journey Map

- **Cold (TOF):** Sick of Problem · Search pain screenshot · Old vs New · Industry problem (jurídico)
- **Warm (MOF):** Pain+Solution · Before/After · How-to · Product FAQ
- **Hot (BOF):** Offer highlight (trial) · Direct response (preço SME)

### Pré-seleção final (Etapa 2.5)

| # | Creative Type | Hook | Ângulo | Emoção | Funil |
|---|--------------|------|--------|--------|-------|
| 1 | Sick of {{Problem}} | Problem/Solution | Cansaço do “já estava assim” | Anger | Cold |
| 2 | Search results pain | Fact/Stat | Busca que todo gestor já fez | Curiosity | Cold |
| 3 | Old way vs New way | Us/Them | WhatsApp/prancheta vs laudo | Curiosity | Cold |
| 4 | Common industry problem | Fact/Stat | Cobrança sem vistoria prévia (fonte jurídica) | Shock | Cold |
| 5 | Pain point & Solution | Problem/Solution | Absorver prejuízo sem prova | Relation | Warm |
| 6 | Before vs After | Before/After | Caos no balcão → PDF selado | Awe | Warm |
| 7 | How-to / unboxing | Problem/Solution | 4 passos até o laudo verificável | Surprise | Warm |
| 8 | Product FAQs | Credibility | Validade jurídica — resposta honesta | Trust | Warm |
| 9 | Offer highlight | Offer | 7 dias sem cartão | Joy | Hot |
| 10 | Direct response | Offer | Starter R$29,90 / Pro R$49,90 | Excitement | Hot |

**Diversidade:** 10 Creative Types · 4 hooks · 4+ emoções · 4 Cold / 4 Warm / 2 Hot · 0 pieces dependem de depoimento falso.

---

## Conceito 1 — Cansado do “Já Estava Assim”

### Estratégia

```yaml
conceito: "Cansado do “Já Estava Assim”"
objetivo_da_peca: "cadastro"
creative_type: "Sick of {{Problem}}"
linha_criativa: "conceito"
formato: "Feed 4:5 (1080x1350px)"
funnel_stage: "Cold (TOF)"
hook_type: "Problem/Solution"
angulo_comunicacao: "frustração recorrente na devolução — loss aversion"
emotion_triggers: ["Anger", "Relation"]
copy_type: "Direct Response"
trabalha: "dor"
descricao_trabalha: "identifica a frase que trava a cobrança e aponta saída sem fake proof"
entity_id: "EID-01-balcao-confrontation"
destino: "https://danosaparentes.com.br/locadoras"
```

### Resumo Executivo da Peça

| Campo | Definição |
|-------|-----------|
| Objetivo | Trial / cadastro SME |
| Ângulo | Cansaço da disputa verbal na devolução |
| Headline/Gancho | Cansado do “já estava assim” na devolução? |
| CTA | Cadastre-se |
| Direção visual | Close balcão: balão de fala “já estava assim” riscado; celular com diagrama de avaria |
| Formato | Feed 4:5 |
| Trabalha | Dor — absorver avaria sem prova |
| Entity ID | EID-01-balcao-confrontation |

### Hook → Hold → Offer

| Fase | Elemento | Detalhe |
|------|----------|---------|
| **HOOK** | Balão “JÁ ESTAVA ASSIM” riscado em vermelho | Identificação imediata do gestor de locadora |
| **HOLD** | Diagrama + chip “Porta diant. · amassado” + badge GPS | Mostra registro padronizado no ato |
| **OFFER** | CTA “7 dias grátis · sem cartão” | Risco baixo para testar |

### Copy

| Elemento | Conteúdo | Limite |
|----------|----------|--------|
| **Headline** | Cansado do “já estava assim” na devolução? | 52 |
| **Texto-legenda** | Cansado de ouvir “já estava assim” e sair sem argumento?\n\nSem par entrega×devolução, a cobrança vira discussão no balcão — não comparação.\n\n👇 No Danos Aparentes você registra no celular:\n🔴 Diagrama padronizado\n📍 Foto com GPS + horário\n✍️ Assinatura no ato\n🔐 PDF com hash SHA-256 + QR\n\nApp novo. Sem depoimento inventado. Prova = o laudo que você verifica.\n\n↳ 7 dias grátis, sem cartão. Feito pra locadora. | ~520 |
| **Texto principal** | Cansado de ouvir “já estava assim” e sair sem argumento? | 72 |
| **Descrição** | Trial 7 dias sem cartão | 24 |
| **CTA** | Cadastre-se | — |

### Conceito Visual

```yaml
estilo: "misto — foto editorial + UI"
mood: "urgente / provocativo"
direcao_visual: "mão no balcão + balão tipográfico riscado; canto inferior com mock celular mostrando diagrama"
linha_criativa: "conceito"
minimalismo_informacional: "uma ideia: a frase que trava a cobrança"
entity_id:
  id: "EID-01-balcao-confrontation"
  layout_family: "close-up editorial"
  camera_perspective: "over-the-shoulder balcão"
  color_world: "navy #020617 + vermelho alerta no riscado + ciano UI"
  human_presence: "mãos / torso, sem rosto celebrity"
  hero_element: "balão de fala riscado"
  texture_or_medium: "foto real + tipografia overlay"
  composition_signature: "speech bubble diagonal riscado ocupa terço superior"
visual_message:
  problem_or_opportunity: "disputa verbal na devolução"
  value_proposition: "registro digital no celular"
  action_signal: "botão Cadastre-se + 7 dias"
ad_layout:
  hook_visual: "balão JÁ ESTAVA ASSIM riscado"
  value_prop_visual: "preview diagrama no phone"
  social_proof_visual: "nenhum depoimento — só UI do produto"
  cta_visual: "pill ciano inferior"
visual_storytelling:
  narrative_type: "problem→solution"
  information_hierarchy: "1° balão → 2° phone → 3° CTA"
  value_without_text: "PARCIAL — balão + phone carregam; overlay ≤6 palavras"
overlay:
  text_on_image: "Chega de discutir."
  visual_elements_on_image: "riscado vermelho, GPS chip, CTA"
regra_20_texto: "✅"
```

### Variações A/B

| Variação | Hook | O que muda |
|----------|------|------------|
| **A (base)** | “Cansado do já estava assim?” | Balão riscado |
| **B** | “Quanto você absorveu este mês?” | Número em branco (sem inventar %); pergunta aberta |
| **C** | “Foto no WhatsApp não compara.” | Substitui balão por print WhatsApp borrado vs diagrama |

### Por que vai converter

Loss aversion: o gestor se vê na frase. Oferta trial remove fricção. Zero dependência de prova social falsa.

---

## Conceito 2 — O Que Você Já Digitou no Google

### Estratégia

```yaml
conceito: "O Que Você Já Digitou no Google"
objetivo_da_peca: "cadastro"
creative_type: "Search results of pain point screenshot"
linha_criativa: "conceito"
formato: "Feed 4:5 (1080x1350px)"
funnel_stage: "Cold (TOF)"
hook_type: "Fact/Stat"
angulo_comunicacao: "curiosidade — a busca revela a dor"
emotion_triggers: ["Curiosity", "Anger"]
copy_type: "Direct Response"
trabalha: "percepção"
descricao_trabalha: "mostra que a dor é comum o suficiente pra virar busca — sem inventar volume de busca"
entity_id: "EID-02-serp-pain"
destino: "https://danosaparentes.com.br/locadoras"
```

### Resumo Executivo da Peça

| Campo | Definição |
|-------|-----------|
| Objetivo | Trial |
| Ângulo | Reconhecimento via SERP fictícia tipográfica (não claim de volume) |
| Headline | Como provar amassado pré-existente na locação |
| CTA | Saiba mais → Cadastre-se na LP |
| Direção visual | Mock SERP escuro com 3 resultados-dor + CTA produto |
| Entity ID | EID-02-serp-pain |

### Hook → Hold → Offer

| Fase | Elemento | Detalhe |
|------|----------|---------|
| **HOOK** | Barra de busca “provar avaria já existia locadora” | Pattern interrupt tipo screenshot |
| **HOLD** | Resultados listando disputa / vistoria prévia / cobrança | Ecoa linguagem jurídica/produto |
| **OFFER** | Card inferior “Laudo com hash + QR · 7 dias grátis” | Ponte para mecanismo |

### Copy

| Elemento | Conteúdo | Limite |
|----------|----------|--------|
| **Headline** | Como provar amassado pré-existente na locação | 52 |
| **Texto-legenda** | Se você já buscou “como provar que o amassado já existia”…\n\nO problema não é falta de foto.\nÉ falta de **par comparável**: retirada × devolução, com assinatura no ato.\n\nDanos Aparentes gera PDF com:\n① Diagrama\n② GPS + timestamp\n③ Assinaturas\n④ Hash SHA-256 + QR público\n\nSem case inventado. Escaneia o QR e confere.\n\n↳ Teste 7 dias — sem cartão. | ~480 |
| **Texto principal** | Se você já buscou “como provar que o amassado já existia”… | 70 |
| **Descrição** | Laudo verificável | 18 |
| **CTA** | Saiba mais | — |

### Conceito Visual

```yaml
estilo: "screenshot"
mood: "técnico / provocativo"
entity_id:
  id: "EID-02-serp-pain"
  layout_family: "screenshot proof"
  camera_perspective: "screen capture"
  color_world: "SERP escuro navy + links ciano"
  human_presence: "sem pessoa"
  hero_element: "search bar + 3 result rows"
  texture_or_medium: "UI screenshot"
  composition_signature: "full-bleed fake SERP com card produto no rodapé"
visual_message:
  problem_or_opportunity: "ninguém sabe como provar pré-existência"
  value_proposition: "laudo com QR"
  action_signal: "card 7 dias grátis"
overlay:
  text_on_image: "Prova no ato."
regra_20_texto: "✅"
```

### Variações A/B

| Variação | Hook | O que muda |
|----------|------|------------|
| **A** | Query “provar amassado pré-existente” | SERP clássica |
| **B** | Query “vistoria devolução locadora app” | Tom mais solução-aware |
| **C** | Query “foto WhatsApp vale como prova” | Resultado riscado + seta para laudo |

### Por que vai converter

Formato nativo de feed (parece conteúdo útil). Transfere atenção da busca para o mecanismo verificável.

---

## Conceito 3 — WhatsApp vs Laudo Selado

### Estratégia

```yaml
conceito: "WhatsApp vs Laudo Selado"
objetivo_da_peca: "cadastro"
creative_type: "Old way vs New way"
linha_criativa: "comparação"
formato: "Feed 4:5 (1080x1350px)"
funnel_stage: "Cold (TOF)"
hook_type: "Us/Them"
angulo_comunicacao: "contraste status quo vs mecanismo"
emotion_triggers: ["Curiosity", "Awe"]
copy_type: "Value Proposition"
trabalha: "objeção"
descricao_trabalha: "mata a objeção 'WhatsApp basta' sem atacar pessoa — ataca o artefato"
entity_id: "EID-03-split-whatsapp"
destino: "https://danosaparentes.com.br/locadoras"
```

### Resumo Executivo da Peça

| Campo | Definição |
|-------|-----------|
| Objetivo | Trial |
| Ângulo | Old way (chat) vs new way (PDF hash+QR) |
| Headline | Foto no WhatsApp discute. Laudo com QR compara. |
| CTA | Cadastre-se |
| Entity ID | EID-03-split-whatsapp |

### Hook → Hold → Offer

| Fase | Elemento | Detalhe |
|------|----------|---------|
| **HOOK** | Split 50/50: chat bagunçado vs PDF limpo com QR | Leitura em 1s |
| **HOLD** | Labels “SEM GPS · SEM HASH” vs “GPS · HASH · ASSINADO” | Critérios de prova |
| **OFFER** | CTA trial | |

### Copy

| Elemento | Conteúdo | Limite |
|----------|----------|--------|
| **Headline** | Foto no WhatsApp discute. Laudo com QR compara. | 55 |
| **Texto-legenda** | Lado A: print no grupo, horário perdido, “manda de novo a foto”.\n\nLado B: mesmo diagrama na retirada e na devolução + GPS + 2 assinaturas + PDF com hash e QR.\n\nNão é “mais um app”.\nÉ o artefato que você **abre e verifica**.\n\n✅ Offline no pátio\n✅ White-label no Pro\n✅ 7 dias grátis sem cartão\n\n↳ Feito pra locadora que cansa de discutir amassado. | ~490 |
| **Texto principal** | Lado A: print no grupo. Lado B: laudo com QR que você verifica. | 72 |
| **Descrição** | Pare de discutir | 16 |
| **CTA** | Cadastre-se | — |

### Conceito Visual

```yaml
estilo: "misto — UI screenshot"
mood: "confiável / técnico"
entity_id:
  id: "EID-03-split-whatsapp"
  layout_family: "split-screen"
  camera_perspective: "screen capture dual"
  color_world: "esquerda dessaturada; direita navy+ciano+âmbar no QR"
  human_presence: "sem pessoa"
  hero_element: "antes/depois de artefato"
  composition_signature: "linha vertical âmbar no meio"
visual_storytelling:
  narrative_type: "comparison"
  value_without_text: "SIM — split comunica"
overlay:
  text_on_image: "Old way · New way"
regra_20_texto: "✅"
```

### Variações A/B

| Variação | Hook | O que muda |
|----------|------|------------|
| **A** | WhatsApp vs QR | Split clássico |
| **B** | Prancheta vs celular | Foto de prancheta real vs PWA |
| **C** | PDF editável vs hash | Ícone “editável” riscado vs hash mono |

### Por que vai converter

Contrast Effect puro. Visual-first: mesmo mudo, a mensagem passa.

---

## Conceito 4 — Sem Vistoria Prévia, a Cobrança Cai

### Estratégia

```yaml
conceito: "Sem Vistoria Prévia, a Cobrança Cai"
objetivo_da_peca: "qualificação"
creative_type: "Common industry problem with X"
linha_criativa: "prova/autoridade"
formato: "Feed 4:5 (1080x1350px)"
funnel_stage: "Cold (TOF)"
hook_type: "Fact/Stat"
angulo_comunicacao: "autoridade do PROBLEMA (jurídico público) — não case do produto"
emotion_triggers: ["Shock", "Fear"]
copy_type: "Direct Response"
trabalha: "percepção"
descricao_trabalha: "eleva urgência com evidência pública citável; NÃO afirma que o produto ganha processo"
entity_id: "EID-04-legal-problem"
destino: "https://danosaparentes.com.br/locadoras"
```

### Resumo Executivo da Peça

| Campo | Definição |
|-------|-----------|
| Objetivo | Lead qualificado / trial |
| Ângulo | Risco de cobrança sem vistoria prévia comparável |
| Headline | Sem vistoria de entrada, cobrança vira discussão |
| CTA | Saiba mais |
| Entity ID | EID-04-legal-problem |
| Compliance | Rodapé: “Fonte: decisões/notícias públicas (ex. ConJur/TJDFT). Não é depoimento de cliente Danos Aparentes.” |

### Hook → Hold → Offer

| Fase | Elemento | Detalhe |
|------|----------|---------|
| **HOOK** | Headline tipográfica forte + ícone martelo/documento (não logo de tribunal falso) | Shock |
| **HOLD** | 2 bullets: sem par comparável · vistoria só na devolução | |
| **OFFER** | “Registre retirada e devolução no mesmo padrão” + trial | |

### Copy

| Elemento | Conteúdo | Limite |
|----------|----------|--------|
| **Headline** | Sem vistoria de entrada, cobrança vira discussão | 55 |
| **Texto-legenda** | Decisões e reportagens públicas já mostraram o padrão:\nquando falta vistoria prévia comparável, a cobrança de avaria fica frágil.\n\n⚠️ Isso é prova do **problema do mercado** — não um case nosso.\n\nO que o Danos Aparentes entrega:\n📍 Par retirada × devolução\n✍️ Assinatura no ato\n🔐 Hash + QR no PDF\n\nValor probatório depende do seu contrato e do caso.\nA gente entrega o registro documental forte.\n\n↳ 7 dias grátis, sem cartão. | ~540 |
| **Texto principal** | Sem vistoria prévia comparável, a cobrança de avaria fica frágil. | 78 |
| **Descrição** | Prova no ato | 12 |
| **CTA** | Saiba mais | — |

### Conceito Visual

```yaml
estilo: "tipográfico"
mood: "urgente / sério"
entity_id:
  id: "EID-04-legal-problem"
  layout_family: "flat typographic"
  camera_perspective: "wide environmental abstract"
  color_world: "navy + âmbar headline + texto muted fonte"
  human_presence: "sem pessoa"
  hero_element: "headline tipográfica"
  texture_or_medium: "papel/print editorial"
  composition_signature: "bloco tipográfico central + fine-print fonte"
overlay:
  text_on_image: "Prova do problema. Não case nosso."
regra_20_texto: "⚠️ — tipográfico; manter ≤7 palavras no hero + fine print"
```

### Variações A/B

| Variação | Hook | O que muda |
|----------|------|------------|
| **A** | “Cobrança sem entrada vira discussão” | Tipográfico |
| **B** | “Vistoria só na devolução” | Foto pátio + overlay |
| **C** | “Ônus da prova” | Diagrama seta cliente↔locadora |

### Por que vai converter

Authority Bias calibrado: assusta com problema real, promete registro — não sentença.

---

## Conceito 5 — Pare de Absorver o Prejuízo

### Estratégia

```yaml
conceito: "Pare de Absorver o Prejuízo"
objetivo_da_peca: "cadastro"
creative_type: "Pain point & Solution highlight"
linha_criativa: "benefício direto"
formato: "Feed 4:5 (1080x1350px)"
funnel_stage: "Warm (MOF)"
hook_type: "Problem/Solution"
angulo_comunicacao: "perda financeira operacional (sem inventar R$)"
emotion_triggers: ["Relation", "Fear"]
copy_type: "Direct Response"
trabalha: "desejo"
descricao_trabalha: "desejo de cobrar só o dano novo com artefato comparável"
entity_id: "EID-05-loss-aversion-cash"
destino: "https://danosaparentes.com.br/locadoras"
```

### Resumo Executivo da Peça

| Campo | Definição |
|-------|-----------|
| Objetivo | Trial |
| Ângulo | Absorver avaria = perda evitável com prova |
| Headline | Pare de absorver avaria que você não prova |
| CTA | Cadastre-se |
| Entity ID | EID-05-loss-aversion-cash |

### Hook → Hold → Offer

| Fase | Elemento | Detalhe |
|------|----------|---------|
| **HOOK** | Ícone “prejuízo absorvido” (amassado + seta pra baixo) — sem R$ inventado | |
| **HOLD** | Fluxo 3 ícones: Retirada → Devolução → Comparar | |
| **OFFER** | Trial + preço Starter opcional no overlay | |

### Copy

| Elemento | Conteúdo | Limite |
|----------|----------|--------|
| **Headline** | Pare de absorver avaria que você não prova | 48 |
| **Texto-legenda** | Toda vez que você desiste da cobrança por falta de prova, o prejuízo não some — muda de bolso.\n\nCom Danos Aparentes:\n① Retirada padronizada\n② Devolução no mesmo diagrama\n③ PDF selado (hash + QR)\n\nVocê compara. O cliente assina. O laudo se verifica.\n\nStarter a partir de R$29,90/mês · 7 dias grátis sem cartão.\n\n↳ Começa na sua base hoje. | ~470 |
| **Texto principal** | Toda vez que você desiste da cobrança por falta de prova, o prejuízo muda de bolso. | 90 |
| **Descrição** | A partir de R$29,90 | 18 |
| **CTA** | Cadastre-se | — |

### Conceito Visual

```yaml
estilo: "misto — 3D/ícone + UI"
mood: "aspiracional resolutivo"
entity_id:
  id: "EID-05-loss-aversion-cash"
  layout_family: "process scene"
  camera_perspective: "top-down desk"
  color_world: "navy + âmbar nos 3 steps"
  human_presence: "mãos assinando tablet"
  hero_element: "fluxo 3 passos"
  composition_signature: "três cards horizontais numerados"
overlay:
  text_on_image: "Retirada → Devolução → Prova"
regra_20_texto: "✅"
```

### Variações A/B

| Variação | Hook | O que muda |
|----------|------|------------|
| **A** | Absorver avaria | Fluxo 3 passos |
| **B** | “Cobrar só o dano novo” | Before/after checklist |
| **C** | Foco white-label | PDF com logo placeholder “SUA LOCADORA” |

### Por que vai converter

Loss Aversion + caminho concreto. Preço literal só como reforço — sem ROI inventado.

---

## Conceito 6 — Do Balcão ao PDF Selado

### Estratégia

```yaml
conceito: "Do Balcão ao PDF Selado"
objetivo_da_peca: "cadastro"
creative_type: "Before vs After"
linha_criativa: "comparação"
formato: "Feed 4:5 (1080x1350px)"
funnel_stage: "Warm (MOF)"
hook_type: "Before/After"
angulo_comunicacao: "transformação do artefato de prova"
emotion_triggers: ["Awe", "Hope"]
copy_type: "Value Proposition"
trabalha: "desejo"
descricao_trabalha: "desejo de profissionalizar a devolução em minutos"
entity_id: "EID-06-before-after-laudo"
destino: "https://danosaparentes.com.br/locadoras"
```

### Resumo Executivo da Peça

| Campo | Definição |
|-------|-----------|
| Objetivo | Trial |
| Ângulo | Antes caos / depois laudo verificável |
| Headline | Antes: discussão. Depois: laudo com QR. |
| CTA | Cadastre-se |
| Entity ID | EID-06-before-after-laudo |

### Hook → Hold → Offer

| Fase | Elemento | Detalhe |
|------|----------|---------|
| **HOOK** | Split BEFORE messy notes / AFTER clean PDF+QR | |
| **HOLD** | Highlight hash mono + badge “Verificável” âmbar | |
| **OFFER** | Ver laudo demo / trial | |

### Copy

| Elemento | Conteúdo | Limite |
|----------|----------|--------|
| **Headline** | Antes: discussão. Depois: laudo com QR. | 44 |
| **Texto-legenda** | ANTES\nPapel, print, “manda no Zap”, cada vistoriador num formato.\n\nDEPOIS\nMesmo diagrama · foto com GPS · duas assinaturas · PDF com hash SHA-256 e QR público.\n\nApp novo — sem estrelinha inventada.\nA prova é o QR: abre e confere.\n\n↳ 7 dias grátis. Sem cartão. | ~420 |
| **Texto principal** | ANTES: Zap e discussão. DEPOIS: PDF com hash e QR. | 58 |
| **Descrição** | Verifique no QR | 16 |
| **CTA** | Cadastre-se | — |

### Conceito Visual

```yaml
estilo: "fotografia + mock produto"
mood: "confiável"
entity_id:
  id: "EID-06-before-after-laudo"
  layout_family: "split-screen"
  camera_perspective: "wide environmental vs product close"
  color_world: "antes cinza; depois navy+ciano+âmbar selo"
  human_presence: "sem rosto"
  hero_element: "antes/depois"
  composition_signature: "BEFORE top / AFTER bottom stacked (mobile-first)"
overlay:
  text_on_image: "Antes · Depois"
regra_20_texto: "✅"
```

### Variações A/B

| Variação | Hook | O que muda |
|----------|------|------------|
| **A** | Discussão → QR | Split vertical |
| **B** | Tempo: “minutos até o PDF” | Cronômetro visual sem claim numérico falso de ROI |
| **C** | Foco assinatura dual | Close da tela de assinatura |

### Por que vai converter

Before/After clássico com payoff verificável (QR), não “felicidade do cliente”.

---

## Conceito 7 — Laudo em 4 Passos

### Estratégia

```yaml
conceito: "Laudo em 4 Passos"
objetivo_da_peca: "cadastro"
creative_type: "How-to / unboxing"
linha_criativa: "bastidor/processo"
formato: "Feed 4:5 (1080x1350px)"
funnel_stage: "Warm (MOF)"
hook_type: "Problem/Solution"
angulo_comunicacao: "reduzir esforço percebido / treino"
emotion_triggers: ["Surprise", "Hope"]
copy_type: "Direct Response"
trabalha: "objeção"
descricao_trabalha: "objeção 'parece complicado / treinar equipe'"
entity_id: "EID-07-howto-4steps"
destino: "https://danosaparentes.com.br/locadoras"
```

### Resumo Executivo da Peça

| Campo | Definição |
|-------|-----------|
| Objetivo | Trial |
| Ângulo | How-to operacional no pátio |
| Headline | 4 passos: placa → diagrama → assinatura → PDF |
| CTA | Cadastre-se |
| Entity ID | EID-07-howto-4steps |

### Hook → Hold → Offer

| Fase | Elemento | Detalhe |
|------|----------|---------|
| **HOOK** | “4 PASSOS” grande em Saira Condensed | |
| **HOLD** | Grid 2×2 com screens UI reais | |
| **OFFER** | Offline + trial | |

### Copy

| Elemento | Conteúdo | Limite |
|----------|----------|--------|
| **Headline** | 4 passos: placa → diagrama → assinatura → PDF | 52 |
| **Texto-legenda** | Parece sistema “empresarial complicado”?\nNo pátio são 4 gestos:\n\n① Consulta a placa\n② Marca avarias no diagrama\n③ Foto com GPS + assinaturas na tela\n④ Gera PDF com hash e QR\n\nFunciona offline e sincroniza depois.\n\nSem prometer que “qualquer um vira perito em 5 minutos”.\nCom caminho claro pra testar na sua base.\n\n↳ 7 dias grátis — sem cartão. | ~480 |
| **Texto principal** | Parece sistema complicado? No pátio são 4 gestos. | 55 |
| **Descrição** | Offline no pátio | 16 |
| **CTA** | Cadastre-se | — |

### Conceito Visual

```yaml
estilo: "screenshot / UI"
mood: "técnico / limpo"
entity_id:
  id: "EID-07-howto-4steps"
  layout_family: "process scene"
  camera_perspective: "first-person phone"
  color_world: "navy + numeração âmbar"
  human_presence: "mãos segurando phone"
  hero_element: "grid 4 steps"
  composition_signature: "2x2 UI tiles + número grande"
overlay:
  text_on_image: "1 · 2 · 3 · 4"
regra_20_texto: "✅"
```

### Variações A/B

| Variação | Hook | O que muda |
|----------|------|------------|
| **A** | 4 passos | Grid UI |
| **B** | “Offline no pátio” | Ícone Wi-Fi off + sync |
| **C** | Unboxing 8s Reels | Motion dos 4 taps |

### Por que vai converter

Effort heuristic: mostra simplicidade operacional sem overpromise de treinamento.

---

## Conceito 8 — “Tem Validade Jurídica?” — Resposta Honesta

### Estratégia

```yaml
conceito: "Validade Jurídica — Resposta Honesta"
objetivo_da_peca: "qualificação"
creative_type: "Product FAQs highlight"
linha_criativa: "prova/autoridade"
formato: "Feed 4:5 (1080x1350px)"
funnel_stage: "Warm (MOF)"
hook_type: "Credibility"
angulo_comunicacao: "confiança por honestidade (não por garantia absoluta)"
emotion_triggers: ["Trust", "Curiosity"]
copy_type: "Direct Response"
trabalha: "objeção"
descricao_trabalha: "objeção FAQ #1 validade jurídica — resposta alinhada ao produto"
entity_id: "EID-08-faq-legal"
destino: "https://danosaparentes.com.br/locadoras"
```

### Resumo Executivo da Peça

| Campo | Definição |
|-------|-----------|
| Objetivo | Trial qualificado |
| Ângulo | FAQ honesta = confiança |
| Headline | Validade jurídica? Registro forte. Sem milagre. |
| CTA | Saiba mais |
| Entity ID | EID-08-faq-legal |

### Hook → Hold → Offer

| Fase | Elemento | Detalhe |
|------|----------|---------|
| **HOOK** | Card FAQ “O laudo tem validade jurídica?” | |
| **HOLD** | Resposta em 3 bullets honestos | |
| **OFFER** | “Veja o QR do laudo demo” | |

### Copy

| Elemento | Conteúdo | Limite |
|----------|----------|--------|
| **Headline** | Validade jurídica? Registro forte. Sem milagre. | 52 |
| **Texto-legenda** | Pergunta que todo gestor faz:\n“Esse laudo vale na Justiça?”\n\nResposta direta:\n✅ É registro documental forte (GPS, assinaturas, hash, QR)\n⚠️ Valor probatório depende do contrato e do caso concreto\n❌ A gente **não** promete sentença favorável\n\nSe alguém te vender “100% incontestável”, desconfie.\n\nQuer ver o mecanismo? Escaneia o QR do laudo demo.\n\n↳ 7 dias grátis, sem cartão. | ~500 |
| **Texto principal** | “Esse laudo vale na Justiça?” Resposta direta — sem milagre. | 62 |
| **Descrição** | Veja o QR demo | 15 |
| **CTA** | Saiba mais | — |

### Conceito Visual

```yaml
estilo: "tipográfico + card UI"
mood: "confiável"
entity_id:
  id: "EID-08-faq-legal"
  layout_family: "data card"
  camera_perspective: "flat card"
  color_world: "navy card + check ciano + warning âmbar"
  human_presence: "sem pessoa"
  hero_element: "FAQ card"
  composition_signature: "pergunta no topo, 3 bullets, QR canto"
overlay:
  text_on_image: "Sem milagre. Com registro."
regra_20_texto: "✅"
```

### Variações A/B

| Variação | Hook | O que muda |
|----------|------|------------|
| **A** | FAQ validade | Card clássico |
| **B** | FAQ WhatsApp vs laudo | Comparativo curto |
| **C** | FAQ offline | Ícone pátio |

### Por que vai converter

Trust Calibration: honestidade diferencia em mercado cheio de overclaim. Qualifica lead.

---

## Conceito 9 — 7 Dias. Sem Cartão.

### Estratégia

```yaml
conceito: "7 Dias. Sem Cartão."
objetivo_da_peca: "cadastro"
creative_type: "Offer highlight (BOGO, bundle, guarantee)"
linha_criativa: "benefício direto"
formato: "Feed 4:5 (1080x1350px)"
funnel_stage: "Hot (BOF)"
hook_type: "Offer"
angulo_comunicacao: "risk reversal SME"
emotion_triggers: ["Joy", "Excitement"]
copy_type: "Direct Response"
trabalha: "objeção"
descricao_trabalha: "medo de cartão preso / compromisso — trial sem cartão"
entity_id: "EID-09-trial-offer"
destino: "https://danosaparentes.com.br/locadoras"
```

### Resumo Executivo da Peça

| Campo | Definição |
|-------|-----------|
| Objetivo | Conversão trial |
| Ângulo | Oferta evergreen de risco zero relativo |
| Headline | 7 dias grátis. Sem cartão. Feito pra locadora. |
| CTA | Obter oferta |
| Entity ID | EID-09-trial-offer |

### Hook → Hold → Offer

| Fase | Elemento | Detalhe |
|------|----------|---------|
| **HOOK** | “7 DIAS” tipografia gigante + “SEM CARTÃO” badge âmbar | |
| **HOLD** | 3 bullets mecanismo | |
| **OFFER** | CTA Obter oferta | |

### Copy

| Elemento | Conteúdo | Limite |
|----------|----------|--------|
| **Headline** | 7 dias grátis. Sem cartão. Feito pra locadora. | 52 |
| **Texto-legenda** | Sem cartão na entrada.\nSem teatro de depoimento inventado.\n\nNo trial você testa o que importa:\n📍 Vistoria na retirada e na devolução\n🔐 PDF com hash + QR\n✍️ Assinaturas no ato\n\nDepois: Starter R$29,90 ou Pro R$49,90 (white-label).\nCancela pelo portal se não fizer sentido.\n\n↳ Começar teste grátis agora. | ~430 |
| **Texto principal** | Sem cartão na entrada. Sem depoimento inventado. Só o teste do laudo. | 78 |
| **Descrição** | 7 dias sem cartão | 18 |
| **CTA** | Obter oferta | — |

### Conceito Visual

```yaml
estilo: "tipográfico"
mood: "urgente positivo"
entity_id:
  id: "EID-09-trial-offer"
  layout_family: "flat typographic"
  camera_perspective: "centered type"
  color_world: "navy + âmbar hero number + CTA ciano"
  human_presence: "sem pessoa"
  hero_element: "número 7"
  composition_signature: "número 7 ocupa 40% do frame"
overlay:
  text_on_image: "7 dias · Sem cartão"
regra_20_texto: "✅"
```

### Variações A/B

| Variação | Hook | O que muda |
|----------|------|------------|
| **A** | 7 dias sem cartão | Número gigante |
| **B** | “Testa o QR antes de pagar” | QR hero |
| **C** | “Cancela no portal” | Risk reverse copy |

### Por que vai converter

Risk Reversal no ticket SME. Oferta clara, evergreen, sem urgência falsa de “últimas vagas”.

---

## Conceito 10 — Starter R$29,90 · Começa Hoje

### Estratégia

```yaml
conceito: "Starter R$29,90 · Começa Hoje"
objetivo_da_peca: "venda"
creative_type: "Direct response — Buy Now / Shop the Sale"
linha_criativa: "benefício direto"
formato: "Feed 4:5 (1080x1350px)"
funnel_stage: "Hot (BOF)"
hook_type: "Offer"
angulo_comunicacao: "preço literal + quota (Hopkins)"
emotion_triggers: ["Excitement", "Trust"]
copy_type: "Direct Response"
trabalha: "desejo"
descricao_trabalha: "decisor SME pronto — preço transparente vs Corporativo"
entity_id: "EID-10-price-direct"
destino: "https://danosaparentes.com.br/locadoras"
```

### Resumo Executivo da Peça

| Campo | Definição |
|-------|-----------|
| Objetivo | Trial → Starter/Pro |
| Ângulo | Preço específico + o que cabe no plano |
| Headline | Starter R$29,90 · 20 laudos · 7 dias grátis |
| CTA | Cadastre-se |
| Entity ID | EID-10-price-direct |

### Hook → Hold → Offer

| Fase | Elemento | Detalhe |
|------|----------|---------|
| **HOOK** | Preço R$29,90 em destaque tipográfico | |
| **HOLD** | Comparativo mínimo Starter vs Pro (80 laudos + marca) | |
| **OFFER** | Trial sem cartão | |

### Copy

| Elemento | Conteúdo | Limite |
|----------|----------|--------|
| **Headline** | Starter R$29,90 · 20 laudos · 7 dias grátis | 48 |
| **Texto-legenda** | Preço na lata — sem “a partir de” escondido:\n\n📦 Starter — R$29,90/mês · 20 laudos\n📦 Pro — R$49,90/mês · 80 laudos + white-label\n\nInclui o que fecha a disputa no balcão:\ndiagrama · GPS · assinaturas · hash SHA-256 · QR\n\nApp novo. Sem case inventado.\nComeça com 7 dias grátis **sem cartão**.\n\n↳ Cadastre sua locadora agora. | ~460 |
| **Texto principal** | Preço na lata: Starter R$29,90 · 20 laudos. 7 dias sem cartão. | 72 |
| **Descrição** | PIX · sem cartão no trial | 24 |
| **CTA** | Cadastre-se | — |

### Conceito Visual

```yaml
estilo: "tipográfico + card pricing"
mood: "confiável / direto"
entity_id:
  id: "EID-10-price-direct"
  layout_family: "data card"
  camera_perspective: "flat product card"
  color_world: "navy + preço ciano + badge âmbar trial"
  human_presence: "sem pessoa"
  hero_element: "número de preço"
  composition_signature: "price card centrado estilo plano do site"
overlay:
  text_on_image: "R$29,90/mês"
regra_20_texto: "✅"
```

### Variações A/B

| Variação | Hook | O que muda |
|----------|------|------------|
| **A** | Starter R$29,90 | Card Starter |
| **B** | Pro R$49,90 + marca | Ênfase white-label |
| **C** | “≈ R$1,50 por laudo” (Starter 20) | Ângulo unitário — só se mantiver matemática correta |

### Por que vai converter

Especificidade Hopkins: preço + quota + trial. Ideal remarketing após TOF/MOF.

---

## Análise Comparativa

| Prioridade de teste | Conceitos | Motivo |
|---------------------|-----------|--------|
| **1ª onda (TOF)** | 1, 3, 2 | Dor balcão + contraste WhatsApp + SERP — maior hook rate esperado |
| **2ª onda (MOF)** | 5, 6, 7 | Loss aversion + before/after + how-to |
| **3ª onda (BOF / retarget)** | 9, 10 | Trial + preço — só após engajamento LP/QR |
| **Qualificação** | 4, 8 | Jurídico + FAQ — CPL pode ser mais alto, lead mais consciente |

**Não escalar:** qualquer peça que comece a depender de “empresas relatam” ou estrelas inventadas.

**Setup sugerido (hipótese):** 1 campanha Conversion → Trial; ad sets separados TOF / MOF / BOF; todos os formatos no mesmo ad set quando possível; deep-link `/locadoras` + UTM.

## Métricas de Referência

- Hook Rate target: 30–50%
- Atenção média: 1,7s
- A/B: buscar ≥25% improvement para declarar vencedor
- Mínimo de teste: 5 dias; spend ≥3× ticket médio do plano testado (Starter/Pro)
- **Prova social gap:** monitorar comentários; responder com link do QR demo — não inventar cases no reply

## Checklist de validação (lote)

- [x] Visual-first + Entity IDs distintos (10 assinaturas)
- [x] 10 Creative Types · 4 Cold / 4 Warm / 2 Hot
- [x] 3 variações A/B por conceito
- [x] Headlines ≤90 · descrições ≤30
- [x] Zero fake testimonials / ROAS / “empresas relatam”
- [x] Design system tema escuro produção
- [x] Destino `/locadoras` (não home multi-ICP)
