# Message Mining — Danos Aparentes

> Gerado em 2026-07-25 | Fontes: blog/FAQ/landings do repo + VoC público (ConJur, TJDFT, Reclame Aqui/snippet, Portal da Queixa, PROTESTE) | Total de verbatims **de cliente/terceiro**: ~13 | Total de frases **do produto/FAQ** (não VoC): 25+  
> **Status da mineração: INSUFICIENTE para VoC de comprador B2B** (meta da skill: 20+ verbatims de cliente). Ver inventário e gaps abaixo.

---

## 0. Inventário de fontes (Fase 0)

| # | Fonte | Tipo | Volume estimado | Status | Notas |
|---|--------|------|:---------------:|:------:|-------|
| 1 | Reviews próprios (G2, Capterra, Google, Trustpilot) | Público | **0** | ❌ Ausente | App novo; landings admitem ausência de depoimentos |
| 2 | Reviews de concorrentes (vistoria **veicular** SaaS) | Público | ~0 úteis | ⚠️ Fraco | Achados são apps de **vistoria de imóveis** (Pleno, Vistoria.me) — domínio adjacente, não ICP |
| 3 | Reddit / fóruns BR | Público | ~0 threads densas | ⚠️ Fraco | Pouco material indexável; disputa vive mais em Reclame Aqui / Justiça |
| 4 | Calls de vendas / discovery | Privado | **0** no repo | ❌ Ausente | Prioridade #1 para próxima coleta |
| 5 | Transcrições CS / suporte | Privado | **0** | ❌ Ausente | — |
| 6 | Surveys / NPS / polls | Privado | **0** | ❌ Ausente | — |
| 7 | Depoimentos / cases | Privado/público | **0** | ❌ Ausente | Copy explícito: *“Ainda não temos histórico público de clientes — o app é novo”* (`/locadoras`, `/oficinas`, `/frotas`, `/seguradoras`) |
| 8 | CRM (motivos de perda, notas) | Privado | **0** no repo | ❌ Ausente | — |
| 9 | Redes sociais (comentários) | Público | Não minerado em volume | 🟢 Baixa | Não priorizado nesta rodada |
| 10 | **Blog** `src/content/blog.tsx` (~40 posts) | Produto | Alto | ✅ Minado | Linguagem de dor **editorial** — **não é VoC** |
| 11 | FAQ home `FAQ_ITEMS` + `faqData.tsx` | Produto | ~25 Q&A | ✅ Minado | Objeções antecipadas pelo produto |
| 12 | Landings `/locadoras`, `/oficinas`, `/frotas`, `/seguradoras` | Produto | 4× pain points + FAQ | ✅ Minado | Hipótese de ICP por segmento |
| 13 | `chatSupportKnowledge.ts` | Produto | 4 segmentos | ✅ Minado | Condensa dores “oficiais” do produto |
| 14 | Hero / carousel home | Produto | 3 slides | ✅ Minado | Ex.: *“Chega de discutir amassado que já existia”* |
| 15 | Decisões / notícias jurídicas (ConJur, TJDFT) | Público (terceiros) | 2 casos ricos | ✅ Minado | Linguagem de **locatário + juízo**, não de comprador SaaS |
| 16 | Reclamações consumidor (Reclame Aqui snippet, Portal da Queixa, PROTESTE) | Público | 4–6 trechos | ✅ Minado (parcial) | Cloudflare bloqueou fetch completo do RA; snippet + fontes PT/EU com linguagem similar |

### Lacunas críticas (honestidade)

- **Zero** verbatim de **comprador B2B** (gerente de frota, dono de locadora, corretora) dizendo por que compraria / não compraria o Danos Aparentes.
- **Zero** depoimento próprio; produto ainda não tem prova social citada.
- Blog contém frases como *“Empresas que migraram… relatam redução drástica…”* **sem case nomeado** → **não usar como VoC**.
- VoC público disponível é majoritariamente do **lado do consumidor** (locatário contestando cobrança) — valida a **dor de disputa**, mas o ICP B2B precisa ser coletado à parte.

---

## Resumo Executivo

- **VoC de cliente B2B é insuficiente** (~0 verbatims de comprador). O documento abaixo mistura (A) linguagem real de disputas públicas e (B) linguagem do produto, **sempre rotulada**.
- **Dor #1 mais frequente no corpus disponível:** disputa *“já estava assim / não estava assim”* + ausência de **vistoria comparável na entrega e na devolução**.
- **Objeção #1 implícita (produto + jurídico):** *“o laudo / a foto / a cobrança não prova”* — ônus da prova, vistoria unilateral, PDF/papel sem integridade.
- **Ângulo mais promissor (hipótese):** *prova comparável (entrega × devolução) com foto+GPS+assinatura+hash* — alinhado a decisões judiciais e a reclamações de “vistoria depois, sem o cliente”.
- **Próximo passo:** coletar 2–4 fontes reais de VoC B2B na próxima semana (ver §7 e §Hipóteses).

---

## 1. Mapa de Dores

### 1.A Dores com linguagem real de terceiros (VoC público — não é comprador SaaS)

| # | Dor (verbatim / quase-verbatim) | Frequência* | Intensidade | Fontes |
|---|-------------------------------|:-----------:|:-----------:|--------|
| 1 | “isso já estava aí” / “já estava assim” (cliente nega dano novo) | Alta no **produto**; Baixa–Média em VoC externo (tema recorrente) | 🔴 Severa | Blog `avarias-preexistentes-como-provar`; eco em Budget / Green Motion |
| 2 | Cobrança após devolução **sem o cliente presente** na inspeção | Média (casos jurídicos + RA) | 🔴 Severa | TJDFT; Reclame Aqui (LM — snippet); Budget |
| 3 | Ausência de **vistoria prévia** inviabiliza comparação e cobrança | Baixa–Média (casos) | 🔴 Severa | ConJur (MA, 2024) |
| 4 | “vistoria não constatou qualquer avaria” e depois veio cobrança | Baixa (1–2 casos ricos) | 🔴 Severa | TJDFT (Unidas) |
| 5 | Fotos/metadados EXIF ignorados; check-out tratado como “verdade absoluta” | Baixa | 🟡 Moderada–🔴 | Portal da Queixa — Green Motion |
| 6 | “outra avaliação onde não consta a minha assinatura” | Baixa | 🔴 Severa | PROTESTE (reclamação pública) |

\*Frequência relativa ao corpus **encontrado**; não é pesquisa amostral de mercado.

### 1.B Dores em linguagem do produto / FAQ / landings (**NÃO é VoC de cliente**)

| # | Dor (frase do produto) | Frequência no site | Intensidade (editorial) | Fontes |
|---|------------------------|:------------------:|:-----------------------:|--------|
| 1 | “Chega de discutir amassado que já existia no carro.” | Alta (hero) | 🔴 | `page.tsx` carousel |
| 2 | “Cada vistoriador registra do seu jeito” → perde argumento na cobrança | Alta (locadoras/frotas) | 🔴 | `/locadoras`, `/frotas`, chat knowledge |
| 3 | Foto solta / WhatsApp sem GPS/timestamp “só gera discussão no balcão” | Alta | 🔴 | `/locadoras`, blog contestação |
| 4 | Prancheta / papel / redigitação / retrabalho | Alta (vários posts) | 🟡–🔴 | blog `vistoria-sem-papel`, `como-eliminar-redigitacao…` |
| 5 | Laudo em papel some / ilegível; cliente desconfia | Média (oficinas) | 🟡 | `/oficinas` PAIN_POINTS |
| 6 | Disputa de avaria pré-existente no sinistro; PDF alterável | Média (seguradoras) | 🔴 | `/seguradoras` PAIN_POINTS |
| 7 | Pátio sem sinal de internet | Média (frotas) | 🟡 | `/frotas`, chat knowledge |
| 8 | “recebi limpo” sem prova → cliente questiona orçamento | Baixa–Média | 🟡 | blog `laudo-sem-danos-aparentes` |

---

## 2. Mapa de Objeções

| # | Objeção | Origem | Frequência | Tipo | Resposta sugerida (LP/FAQ) |
|---|---------|--------|:----------:|------|----------------------------|
| 1 | “O laudo tem validade jurídica?” | FAQ produto | Alta (antecipada) | Confiança / Risco | Manter resposta honesta: registro documental forte (hash, QR, GPS, assinaturas); valor probatório depende do contrato/jurídico — **não prometer “100% incontestável” em tribunal** |
| 2 | “Foto no WhatsApp / relatório só na devolução basta?” | VoC jurídico + produto | Alta (tema) | Confiança | ConJur: sem vistoria prévia, cobrança cai; copy: comparação entrega×devolução |
| 3 | “Vistoria depois, sem minha presença” | VoC consumidor | Média | Risco / Confiança | Para B2B: *assinatura na hora + laudo selado no ato* reduz esse ataque |
| 4 | “Preciso de treinamento / parece complicado” | FAQ segmentos | Média (antecipada) | Complexidade | “Diagrama guia; primeira vistoria em minutos” |
| 5 | “Quanto custa? Corporativo sob consulta?” | FAQ home/planos | Alta (antecipada) | Preço | Transparência Starter/Pro; Corporativo = WhatsApp rápido |
| 6 | “Funciona offline / no pátio sem sinal?” | FAQ | Alta (antecipada) | Complexidade / Risco | PWA offline + sync |
| 7 | “Por que não planilha / papel / fotos na galeria?” | Blog/produto | Alta (editorial) | Comparação | Redigitação, foto desvinculada, sem hash |
| 8 | “Já tenho laudo cautelar” | Blog cautelar vs avarias | Média | Comparação | Separar: cautelar ≠ laudo de avarias aparentes |
| 9 | *(hipótese B2B)* “Não conheço a marca / sem cases” | Gap real | — | Confiança | Coletar 3 cases; até lá: PDF demo + verificação QR pública |
| 10 | *(hipótese B2B)* “Integra com meu ERP?” | FAQ Corporativo | Baixa–Média | Comparação | API no Corporativo; discovery call |

---

## 3. Swipe File — Verbatims Copiáveis

### 3.A Verbatims reais (terceiros) — usar com citação de fonte

| # | Verbatim | Uso sugerido | Tom | Fonte |
|---|----------|-------------|-----|-------|
| 1 | “A ausência de uma checagem feita pela locadora antes da entrega do veículo ao cliente impossibilita que se faça a necessária comparação entre o estado do carro antes e depois da locação.” | Proof / seção “por que entrega importa” | Autoridade jurídica | [ConJur, 07/03/2024](https://www.conjur.com.br/2024-mar-07/sem-vistoria-previa-locadora-nao-pode-cobrar-multa-por-dano-em-veiculo/) |
| 2 | “…por falta absoluta de qualquer prova de suas alegações” | Ads B2B (medo de perder cobrança) | Frustração institucional | ConJur (citação da juíza) |
| 3 | “…a vistoria não constatou qualquer avaria ou sinistro. Contudo, a empresa começou a realizar cobranças…” | Ângulo “vistoria no ato vs. depois” | Indignação | [TJDFT, 26/01/2022](https://www.tjdft.jus.br/institucional/imprensa/noticias/2022/janeiro/locadora-e-condenada-a-devolver-valores-pagos-indevidamente) |
| 4 | “…não pode o estabelecimento, de forma unilateral, simplesmente imputar a responsabilidade por suposta avaria ao consumidor… quando este não esteve presente…” | FAQ / whitepaper jurídico | Formal | TJDFT (juíza) |
| 5 | “…podem ter sido provocados por terceiros ou mesmo por funcionários da requerida.” | Por que GPS+timestamp+assinatura no ato | Ceticismo | TJDFT |
| 6 | “Colocar em letras miúdas no contrato que haverá vistoria posterior sem a sua presença… no nosso caso foi depois de 12 dias…” | Criativo “vistoria 12 dias depois” | Revolta | Reclame Aqui — LM Frotas (snippet de busca; página com Cloudflare) |
| 7 | “A Green Motion recusou-se a aceitar fotografias com metadados EXIF comprovando que um dano no pára-brisas já existia…” | Feature GPS/EXIF / prova | Técnica + frustração | [Portal da Queixa — Green Motion](https://portaldaqueixa.com/brands/green-motion/complaints/green-motion-cobranca-indevida-por-danos-151423926) *(PT/EU — marcar geografia)* |
| 8 | “…o relatório de check-out assinado é ‘verdade absoluta’…” | Headline irônica / contraste com verificação QR | Sarcasmo | Idem Green Motion |
| 9 | “…nao foi realizada nenhuma vistoria em minha presença na entrega do carro…” | CTA “assine na tela, no ato” | Frustração | [Portal da Queixa — Budget](https://portaldaqueixa.com/brands/budget/complaints/budget-cobranca-indevida-2-139004325) *(PT/EU)* |
| 10 | “Aleguei… que o veiculo ja tinha essas e outras avarias…” | Eco da frase “já estava” | Defesa | Idem Budget |
| 11 | “…estão querendo cobrar uma avaria no vidro que não existe…” | Pain social | Indignação | [PROTESTE reclamação pública](https://www.proteste.org.br/reclame/lista-de-reclamacoes-publicas/reclamacoes-publicas?referenceid=CPTBR01627371-02) |
| 12 | “…assinei a avaliacao… apresentando outra avaliacao onde nao vonsta a minha assinatira…” | Assinatura digital + hash (integridade) | Desconfiança | Idem PROTESTE (ortografia original do reclamante) |

### 3.B Frases do produto — **não são VoC**; só copy interno já publicado

| # | Frase | Uso sugerido | Tom | Fonte |
|---|-------|-------------|-----|-------|
| 1 | “Chega de discutir amassado que já existia no carro.” | Headline LP | Direto | Home carousel |
| 2 | “Faça a vistoria veicular digital no pátio: marque avarias no diagrama, prove com foto, GPS e assinatura.” | Subhead | Operacional | Home |
| 3 | “o dano só é cobrável se você consegue provar que é novo” | Bullet / manifesto | Princípio | Blog checklist devolução |
| 4 | “você não compara — você discute” | Headline curta | Afiação | Blog laudo sem danos |
| 5 | “Redigitar laudo é pagar duas vezes pelo mesmo trabalho.” | Ads operação | Frustração operacional | Blog redigitação |
| 6 | “fotos avulsas enviadas no WhatsApp… não possuem validade técnica suficiente” | Comparação | Técnico | Blog GPS+hash |
| 7 | “essa foto foi tirada depois que eu entreguei o carro” *(como argumento a bloquear)* | Objection crush | Antagonista | Blog GPS+hash |
| 8 | “arranhado lateral” *(como anti-padrão de descrição)* | Educação de checklist | Neutro | Blog erros / preexistentes |
| 9 | “Sem um checklist padronizado, a devolução… vira uma prancheta diferente por pessoa” | Locadoras | Operacional | `/locadoras` |
| 10 | “isso não estava assim quando entrou” | Oficinas | Disputa | `/oficinas` FEATURES |
| 11 | “Laudo em papel some ou fica ilegível” | Oficinas | Dor | `/oficinas` |
| 12 | “PDF comum ou papel escaneado pode ser editado sem deixar rastro” | Seguradoras | Risco | `/seguradoras` |
| 13 | “Discussão de avaria ‘que já existia’ na devolução” | Chat/LP locadoras | Dor | `chatSupportKnowledge.ts` |
| 14 | “Vistoria veicular digital que prova a si mesma.” | Brand line | Posicionamento | Home H1 support |
| 15 | “Não anotei nada” no papel não prova o estado zerado. | Laudo vazio | Pedagógico | Blog FAQ laudo sem danos |

> **Regra de uso:** 3.A pode ir para ads/LP como citação (com fonte). 3.B só como copy próprio — **não** apresentar como “o que o cliente disse”.

---

## 4. Glossário de Mercado

| Palavra/Expressão do mercado (preferir) | O que NÃO usar (marketing genérico) | Notas |
|----------------------------------------|-------------------------------------|-------|
| avaria / danos aparentes | “incidente visual” | Jargão do setor; marca alinhada |
| devolução / entrega / retirada | “check-in/check-out” (só se ICP internacional) | BR operacional |
| “já estava assim” / “não estava assim” | “assimetria informacional” | Linguagem de balcão |
| laudo / vistoria | “report / inspection workflow” | PT-BR |
| prancheta / papel carbonado | “legado analógico” | Imagem concreta |
| redigitação / retrabalho | “otimizar throughput” | Dor operacional |
| foto solta / WhatsApp | “assets não estruturados” | Anti-padrão real |
| hash / QR / selo | “blockchain” (evitar) | Hash SHA-256 é crível; blockchain soa exagero |
| cobrança de avaria | “monetização de claims” | Locadora fala cobrança |
| sinistro / pré-existente | “pre-loss condition” | Seguradora |
| white-label / marca no PDF | “branded experience” | B2B quer logo no laudo |
| pátio / sem sinal | “edge connectivity” | Frota/campo |
| diagrama / peça / vista | “UI mapping” | Vistoriador |

---

## 5. Ângulos por Segmento

| Segmento | Dor principal (fonte) | Desejo principal | Tom | Ângulo de copy |
|----------|----------------------|------------------|-----|----------------|
| **Locadoras / frotistas** | Disputa na devolução; vistoriadores inconsistentes (produto + VoC jurídico) | Cobrar só dano **novo** com prova | Direto, operacional | “Entrega e devolução no mesmo padrão — prova, não discussão” |
| **Oficinas** | Papel some; cliente desconfia do que entrou (produto) | Laudo com marca própria em minutos | Prático, profissionalismo | “Estado de entrada assinado — menos briga na saída” |
| **Seguradoras / corretoras** | Pré-existência + laudo adulterável (produto) | Documento verificável (hash/QR) | Técnico-jurídico | “Laudo que se verifica — não PDF que se edita” |
| **Gestão de frotas** | Offline + padronização multi-vistoriador (produto) | Um padrão em todos os pátios | Operacional | “Sem sinal no pátio? A vistoria continua; o padrão também” |
| **Locatário / consumidor** *(não é ICP de compra, mas alimenta prova social do problema)* | Cobrança unilateral / vistoria posterior | Transparência no ato | Indignado | Usar só em conteúdo educativo / PR — não como “cliente do app” |

---

## 6. Mapa de Credibilidade

| Promessa | Parece crível? | Por quê? | Recomendação |
|----------|:--------------:|----------|--------------|
| “Eliminam 100% das contestações” (título de post) | ❌ | Absoluto; sem case público | Suavizar: “reduz margem de contestação” + prova (hash/QR) |
| “Empresas que migraram… relatam redução drástica…” | ❌ como VoC | Sem nome/número | Ou citar case real, ou remover |
| “Laudo com validade jurídica” sem nuance | ⚠️ | FAQ já nuanceia bem | Manter nuance do FAQ na LP/ads |
| Hash SHA-256 + QR de verificação pública | ✅ | Mecanismo verificável | Demo ao vivo / link de verificação |
| GPS + timestamp nas fotos | ✅ | Responde argumento “foto depois” | Mostrar metadados no PDF preview |
| Assinatura vistoriador + cliente na tela | ✅ | Ecoa falha “sem presença / sem assinatura” (VoC) | Destacar no hero de locadoras |
| Offline 100% | ✅ se demoável | Dor de pátio | Teste de campo no onboarding |
| “Força para cobrar avaria” | ⚠️ | Depende de contrato/CDC | Copy: “registro documental forte para comparar retirada e devolução” |
| Preço Starter R$ 29,90 / Pro R$ 49,90 | ✅ | Específico | Manter transparência |
| White-label no PDF | ✅ para B2B | Pedido natural de marca | Mostrar mock com logo do cliente |

---

## 7. Recomendações para o Pipeline

### Para Offer Diagnosis
- Dimensão **risco/prova** (comparação entrega×devolução, integridade do PDF) é a mais respaldada por VoC externo.
- Dimensão **produtividade** (prancheta, redigitação) está só em linguagem de produto — validar em calls.
- **Não** usar claims de “100%” ou “empresas relatam” no diagnosis sem evidência.

### Para ICP
- Hipótese forte: **locadoras / frotas** com volume de devolução e prejuízo por avaria não cobrada.
- Secundário: oficinas (entrada/saída) e corretoras (prévia/sinistro).
- Separar persona **comprador B2B** vs. **locatário reclamante** (este último não compra o SaaS).

### Para Wireframe / LP
- Headline candidate (produto, já testável): *“Chega de discutir amassado que já existia.”*
- Seção de prova: mock do PDF + QR + “como a Justiça trata falta de vistoria prévia” (link ConJur/TJDFT) — sem fingir que são depoimentos de clientes.
- FAQ: validade jurídica (nuance), offline, preço, white-label, treinamento.
- Bloco honesto: “App novo — ainda sem cases públicos; veja um laudo real / verificação.”

### Para Anúncios
- Ângulos: (1) “já estava assim”, (2) vistoria 12 dias depois, (3) foto no WhatsApp vs. laudo com GPS, (4) redigitação/prancheta.
- Criativos com citação jurídica curta + CTA demo — citar fonte no rodapé do anúncio quando usar trecho de decisão.

### Para Criativos
- Visual: balcão de locadora / pátio / celular com diagrama — evitar stock genérico de “dashboard SaaS”.
- Antagonistas visuais: prancheta molhada, print de WhatsApp com fotos soltas, PDF “editável”.
- Protagonista: PDF com hash/QR e assinatura na tela.

### Coleta VoC — próximas 2–4 fontes (próxima semana)

1. **5–8 calls** de discovery (locadora + frota + oficina) com roteiro: “Conte a última disputa de avaria”; gravar/transcrever.
2. **Survey de 5 perguntas** para trial users / leads WhatsApp (“O que quase te impediu de assinar?”).
3. **Mineração Reclame Aqui** manual (sem bot) em Localiza/Unidas/Movida + estacionamentos — 20 reclamações com quotes.
4. **1 entrevista CS/Sales interna** (mesmo que fundador) listando objeções reais ouvidas — rotular como “staff”, não cliente.

---

## Hipóteses de VoC

> **NÃO são fala verificada de cliente.** São hipóteses para validar em calls/surveys. Não usar em LP como citação.

| # | Hipótese (como o comprador B2B *pode* falar) | Segmento | Como validar |
|---|-----------------------------------------------|----------|--------------|
| H1 | “Toda devolução vira discussão no balcão; a gente acaba absorvendo o risco.” | Locadora | Call discovery |
| H2 | “Cada filial tem um jeito; não dá para comparar laudo com laudo.” | Frota multi-unidade | Call + pedir exemplo de planilha |
| H3 | “Meu vistoriador manda foto no grupo do WhatsApp e some.” | Locadora/oficina | Observação de processo |
| H4 | “Preciso que o laudo saia com a logo da minha empresa.” | Todos B2B | Pergunta em trial |
| H5 | “Pátio sem rede — se o app depender de internet, não rola.” | Frota/pátio | Teste offline |
| H6 | “Já perdi cobrança porque não tinha vistoria de entrada.” | Locadora | Eco ConJur — perguntar se aconteceu com eles |
| H7 | “Seguradora / jurídico pediu prova mais forte que papel.” | Seguradora/corretora | Call |
| H8 | “R$ 50/mês ok; Corporativo sem preço na página me trava.” | SME → mid-market | Poll pós-pricing |
| H9 | “Não compro sem ver um laudo de outro cliente / case.” | Todos | Gap atual admitido nas landings |
| H10 | “Integra com meu sistema de locação / ERP?” | Locadora maior | FAQ Corporativo |

---

## Apêndice — Inventário rápido do repo (paths)

| Path | O que contém |
|------|----------------|
| `src/content/blog.tsx` | ~40 artigos com linguagem de dor/operação |
| `src/app/page.tsx` (`FAQ_ITEMS`, carousel) | FAQ comercial + slogans |
| `src/components/faqData.tsx` | FAQ produto/técnico |
| `src/content/chatSupportKnowledge.ts` | Dores por segmento para chatbot |
| `src/app/locadoras/page.tsx` | Pain points + FAQ + disclaimer sem depoimentos |
| `src/app/oficinas/page.tsx` | Idem |
| `src/app/frotas/page.tsx` | Idem |
| `src/app/seguradoras/page.tsx` | Idem |
| Depoimentos / CRM / calls | **Não encontrados** |

---

*Fim do documento. Próxima atualização recomendada após ≥20 verbatims B2B reais.*
