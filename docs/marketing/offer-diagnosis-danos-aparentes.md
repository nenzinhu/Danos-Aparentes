# Offer Diagnosis — Danos Aparentes

> Gerado em 2026-07-25 | Skill: `guimkt-offer-diagnosis` v1.0.0  
> Fontes: briefing + site live + repo (`PricingCards`, FAQ home/`planos`, landings, `chatSupportKnowledge`) + `docs/message-mining-danos-aparentes.md`  
> **VoC B2B:** insuficiente (~13 verbatims públicos de terceiros; 0 calls/CRM/depoimentos). Hipóteses marcadas como tal.

---

## Intake compilado (Etapa 0)

| # | Pergunta | Resposta (evidência) |
|---|----------|----------------------|
| 1 | O que vende? | SaaS de vistoria veicular digital: diagrama de avarias → fotos com GPS/timestamp → assinaturas na tela → PDF com hash SHA-256 + QR de verificação pública; white-label (logo/nome no PDF). |
| 2 | Para quem? | Hipótese de ICP (produto): locadoras/frotistas (primário), oficinas, gestão de frotas, seguradoras/corretoras. **Não há VoC de comprador B2B** confirmando prioridade. |
| 3 | Problema principal? | Disputa *“já estava assim”* / cobrança sem prova comparável (entrega × devolução); papel/WhatsApp/fotos soltas sem integridade. Eco jurídico (ConJur/TJDFT) + copy do produto. |
| 4 | Como resolve? | Checklist padronizado no celular (offline), metadados GPS, assinatura vistoriador+cliente no ato, laudo selado (hash+QR). |
| 5 | Resultado concreto? | Laudo verificável em minutos; comparação retirada×devolução. **Sem métricas de clientes** (R$ recuperado, % menos disputa, tempo médio). |
| 6 | Quanto custa? | Starter R$ 29,90 (20 laudos); Pro R$ 49,90 (80 + marca); Corporativo Start R$ 299 / Growth R$ 699 / Enterprise a partir de R$ 1.490. PIX Starter/Pro ativo; Stripe cartão depende de Price IDs live na Vercel. 7 dias grátis sem cartão; cancelamento pelo portal. |
| 7 | Por que você? | Mecanismo demonstrável: *laudo que se verifica* (hash+QR) + prova no ato (GPS+assinatura) + offline + white-label. |
| 8 | Provas? | **Gap crítico:** 0 depoimentos/cases públicos. Landings admitem app novo. Prova de *produto* = PDF demo / QR. Prova de *problema* = VoC jurídico/consumidor (não comprador SaaS). |
| 9 | Objeções frequentes? | Antecipadas no FAQ: validade jurídica, offline, preço/Corporativo, treinamento, WhatsApp vs laudo, ERP. **Objeções reais de vendas não documentadas** (sem CRM). |
| 10 | Por que NÃO compra? | **Hipótese (H9 mining):** marca desconhecida / sem cases. Também: checkout cartão incompleto; Corporativo “fale conosco”; dúvida de valor probatório. |

---

## Resumo Executivo

- **Veredicto: Oferta precisa de ajuste (score 106/150).** Mecanismo e preço SME são fortes o suficiente para avançar o pipeline **com ressalvas** — não reconstruir do zero.
- **Força principal:** promessa operacional clara (*“já estava assim”*) + mecanismo verificável (hash SHA-256 + QR + GPS + assinatura) alinhado a decisões judiciais sobre falta de vistoria prévia.
- **Fragilidade crítica:** **prova social / cases = 2/5.** Sem VoC de comprador B2B; claims de resultado no blog (“empresas relatam…”) não são evidência — não usar em ads/LP como prova.
- **Risco assimétrico:** Starter/Pro (baixo ticket + trial 7 dias + cancelamento) está ok; Corporativo (R$ 299–1.490+) exige confiança que o site ainda não entrega.
- **Próximo movimento de oferta (antes de escalar tráfego pago B2B):** 3 cases nomeados OU bloco honesto “app novo + laudo real verificável” + fechar Stripe live + 5–8 calls de discovery (ver message mining §7).

---

## Veredicto: ⚠️ Oferta Precisa de Ajuste

**Score: 106/150**

| Dimensão | Nota | Peso | Pontos |
|----------|:----:|:----:|:------:|
| 1. Clareza da Promessa | 4/5 | ×5 | 20 |
| 2. Especificidade | 4/5 | ×4 | 16 |
| 3. Prova e Credibilidade | 2/5 | ×4 | 8 |
| 4. Mecanismo Único | 4/5 | ×4 | 16 |
| 5. Risco Percebido | 3/5 | ×3 | 9 |
| 6. Objeções Mapeadas | 4/5 | ×3 | 12 |
| 7. Diferenciais Reais | 4/5 | ×4 | 16 |
| 8. Ângulo de Aquisição | 3/5 | ×3 | 9 |
| **Total** | | | **106** |

**Ação:** Pipeline `/esc-start` pode avançar (ICP → wireframe → ads) **com ressalvas**. Não escalar budget alto em Corporativo/mid-market até fechar gap de prova. Lead gen SME (Starter/Pro) é o caminho de menor risco de oferta.

---

## Diagnóstico por Dimensão

### 1. Clareza da Promessa — 4/5

**Lente:** Em 5 segundos, o ICP entende o que ganha? (Sistema 1)

**Achado:** A linha *“Chega de discutir amassado que já existia no carro”* + subhead operacional (diagrama, foto, GPS, assinatura, PDF com hash/QR) é compreensível sem jargão de SaaS. Message match produto→entrega é alto: o app de fato gera o laudo descrito. Brand line *“Vistoria veicular digital que prova a si mesma”* reforça o benefício em uma frase.

**Limite:** Clareza dilui quando a home fala “todo mundo” (autônomo + locadora + oficina + seguradora). Para locadora, é 4–5; como oferta única multi-ICP, fica em 4.

**Cruzamento VoC:** Tema *“já estava assim”* ecoa reclamações/decisões públicas — relevância alta para o *problema*, ainda que não venha da boca do comprador B2B.

---

### 2. Especificidade — 4/5

**Lente:** Hopkins — generalidades escorrem; números e claims verificáveis ficam.

**Achado (forte):** Preços literais (R$ 29,90 / 49,90; ≈ R$ 1,50 e R$ 0,62/laudo); quotas (20/80); Corporativo com faixas (5 / 15 / 15+ usuários); stack técnico nomeado (SHA-256, QR, GPS, offline, white-label, 6 categorias de veículo). Teste de troca de marca: “PDF com hash SHA-256 + QR + diagrama SVG” não é copy genérico de “gestão inteligente”.

**Achado (fraco):** Resultados de negócio sem número (*“reduz disputa”*, *“força para cobrar”*) — corretos como direção, fracos como oferta. FAQ de validade jurídica já nuanceia bem; não prometer “100% incontestável”.

---

### 3. Prova e Credibilidade — 2/5

**Lente:** Cialdini (Social Proof + Authority) — cético verifica em 2 minutos?

**Achado:**
- **Social proof de cliente:** 0. Landings (`/locadoras`, `/oficinas`, `/frotas`, `/seguradoras`): *“Ainda não temos histórico público de clientes — o app é novo.”*
- **Authority de produto:** PDF real + QR de verificação pública — prova *do mecanismo*, não *do ROI*.
- **Authority de problema:** ConJur (2024) e TJDFT (2022) sobre vistoria prévia / cobrança unilateral — úteis como prova do *mercado*, **não** como depoimento de usuário do Danos Aparentes.
- **Anti-prova no corpus editorial:** frases tipo *“Empresas que migraram… relatam redução drástica…”* (blog) sem case nomeado → **não usar** no pipeline (já flagado no message mining §6).

**Conclusão:** Gap crítico. Nota 2 = produto demonstrável + zero prova de comprador. Não inventar depoimentos.

---

### 4. Mecanismo Único — 4/5

**Lente:** “Por que isso funciona?” — explicável ao chefe.

**Achado:** Cadeia causal clara e crível:

1. Padroniza o registro (mesmo diagrama entre vistoriadores)  
2. Amarra evidência no tempo/espaço (foto + GPS + timestamp)  
3. Fecha o ato com duas assinaturas na tela  
4. Sela o artefato (hash SHA-256 + QR → página pública; alteração quebra o hash)  
5. Opera no pátio sem sinal (offline → sync)

Isso cria subcategoria mental: **laudo de avarias aparentes que se verifica**, vs. prancheta / WhatsApp / PDF editável. Não depende de “IA mágica” nem blockchain.

**Limite:** Mecanismo é copiável por concorrente técnico; barreira hoje é execução + foco de categoria, não moat jurídico. White-label sozinho é diferencial cosmético de mercado; no pacote com hash+QR, é reforço B2B legítimo.

---

### 5. Risco Percebido — 3/5

**Lente:** Confiança proporcional ao investimento (Kahneman).

| Faixa | Investimento | Reversão de risco atual | Avaliação |
|-------|--------------|-------------------------|-----------|
| Starter/Pro | R$ 29,90–49,90/mês | 7 dias grátis **sem cartão**; cancelar no portal sem multa; PIX nativo | Adequado para Sistema 1 |
| Corporativo | R$ 299–1.490+/mês | WhatsApp comercial; sem POC publicado; sem cases; API só Enterprise | Insuficiente |

**Fricção extra (repo/ops):** Stripe cartão precisa de Price IDs live na Vercel — checkout incompleto aumenta ansiedade (*“paguei e não liberou?”*). PIX ativo mitiga para quem paga assim.

**FAQ jurídico:** resposta honesta (registro documental forte; valor probatório depende do contrato) — reduz ansiedade correta; não inventa garantia legal falsa.

---

### 6. Objeções Mapeadas — 4/5

**Lente:** MECLABS Anxiety — objeções identificadas + respostas estratégicas.

FAQ home, `/planos`, landings e `chatSupportKnowledge` cobrem bem: preço, hash/assinatura, offline, placa, white-label, tipos de veículo, WhatsApp, validade jurídica (nuance), ERP (Corporativo), treinamento.

**Gap:** mapa vem do **produto antecipando**, não de CRM/calls. Objeção #1 de conversão mid-market (**hipótese H9**: “não compro sem case”) está admitida nas landings mas ainda não tratada com ativo de prova.

---

### 7. Diferenciais Reais vs. Cosméticos — 4/5

**Reais (verificáveis):** hash SHA-256 + verificação pública; GPS/timestamp; assinatura dual na tela; offline PWA; white-label no PDF; diagrama padronizado multi-veículo; preço transparente SME.

**Cosméticos a evitar no copy:** “atendimento personalizado”, “solução completa”, “qualidade”, absolutos tipo “eliminam 100% das contestações” (título de post — já marcado no mining).

**Relevância ao decisor:** Locadora/frota liga para *cobrar / defender cobrança*; oficina liga para *profissionalismo + menos briga*; seguradora liga para *integridade do documento*. Um diferencial central (integridade + comparação entrega×devolução) serve os três — bom. Não espalhar “também somos dashboard de frota” como valor #1.

---

### 8. Ângulo Principal de Aquisição — 3/5

**Lente:** Trindade Relevância × Valor × Clareza + nível de consciência (Schwartz).

**Ângulo mais forte (hipótese validada pelo problema público, não pelo comprador SaaS):**  
*Prova comparável entrega × devolução — pare de discutir “já estava assim”.*  
Nível: **Problem-Aware → Solution-Aware**. Funciona em ad + LP de locadora.

**Por que não 4–5:** (1) VoC B2B ausente — ângulo ainda não confirmado na boca do ICP; (2) home multi-segmento dilui o gancho; (3) “por que agora” fraco (sem custo de inação quantificado com dados reais); (4) concorrência de categoria (papel/WhatsApp) é clara, mas concorrência SaaS de vistoria veicular pouco mapeada publicamente.

---

## Recomendações de Fortalecimento

Prioridade pela fórmula **C = 4m + 3v + 2(i−f) − 2a** (maior impacto primeiro).

### P1 — Prova e Credibilidade (nota 2) → reduz **a**, sobe **v**

**Problema:** Oferta sem cases; mid-market não confia.  
**Recomendação:** Em 14 dias: (a) 3 laudos demo públicos com QR funcionando; (b) 1–3 betas com logo (mesmo sem métrica — “em uso por X”); (c) se sem nome, bloco honesto já usado nas landings + CTA “verificar laudo”. Remover/suavizar claims “empresas relatam” sem fonte.  
**Exemplo:** *“App novo. Sem depoimentos inventados — escaneie o QR deste laudo real e confira o hash.”*  
**Impacto:** −a, +v.

### P2 — Ângulo de Aquisição (nota 3) → sobe **m**

**Problema:** Ângulo bom diluído em 4 ICPs.  
**Recomendação:** Escolher **um** wedge para tráfego pago: locadoras/devolução. Oficinas/seguradoras ficam em SEO/landings orgânicas. Headline única de campanha: *“Chega de discutir amassado que já existia.”* + prova jurídica citada (ConJur) no rodapé do criativo — sem fingir que é cliente.  
**Impacto:** +m, +clareza.

### P3 — Risco Corporativo (nota 3) → reduz **a** e **f**

**Problema:** Ticket R$ 299+ sem POC/cases; Stripe cartão incompleto.  
**Recomendação:** Publicar POC de 14 dias / piloto 1 base; fechar Price IDs Stripe live; na LP Corporativo, mostrar faixas (já existem) + checklist de onboarding (“primeira vistoria em X minutos” — só se medido).  
**Impacto:** −a, −f.

### P4 — Especificidade de resultado (nota 4 → 5) → sobe **v**

**Problema:** Oferta específica em *features*, vaga em *outcomes*.  
**Recomendação:** Após 5 calls, extrair 1 número real (ex.: tempo médio de laudo; % de devoluções com assinatura dual). Até lá, não inventar. Usar ancoragem de preço já existente (R$/laudo).  
**Impacto:** +v, −a.

### Dimensões ≥ 4 (manter)

Clareza, Mecanismo, Objeções mapeadas no FAQ, Diferenciais reais — **não diluir** com feature soup. Manter nuance jurídica do FAQ em toda a comunicação paga.

---

## Mapa de Objeções

| Objeção | Tipo | Origem | Resposta estratégica |
|---------|------|--------|----------------------|
| “O laudo tem validade jurídica?” | Confiança / Risco | FAQ produto | Registro documental forte (hash, QR, GPS, assinaturas). Valor probatório depende do contrato/jurídico — **não** prometer sentença ganha. |
| “Foto no WhatsApp / só na devolução basta?” | Comparação | VoC jurídico + produto | Sem vistoria de entrada comparável, cobrança cai (ConJur). Oferta = par entrega×devolução. |
| “Vistoria depois, sem o cliente” | Risco | VoC consumidor | Assinatura na tela **no ato** + laudo selado no mesmo momento. |
| “Parece complicado / treinar equipe” | Complexidade | FAQ segmentos | Diagrama guia; primeira vistoria em minutos (claim de produto — validar em onboarding). |
| “Quanto custa? Corporativo?” | Preço | FAQ | Transparência Starter/Pro; Corporativo com faixas publicadas + WhatsApp. |
| “Funciona no pátio sem sinal?” | Risco operacional | FAQ / frotas | Offline 100% + sync — demoar. |
| “Por que não planilha / papel / galeria?” | Comparação | Blog/produto | Sem hash, foto desvinculada, redigitação. |
| “Já tenho laudo cautelar” | Comparação | Blog | Cautelar ≠ laudo de avarias aparentes (entrega/devolução/entrada oficina). |
| **H** “Não conheço a marca / sem cases” | Confiança | Gap real | PDF demo + QR público + honestidade “app novo”; coletar 3 cases. |
| **H** “Integra com meu ERP?” | Comparação | FAQ Corp | API na faixa Enterprise; discovery call — não overpromise no Starter. |
| **H** “Cartão não funciona / Stripe” | Fricção | Ops | Priorizar PIX na UX até Price IDs live; comunicar métodos ativos. |

*H = hipótese (sem verbatim de comprador B2B).*

---

## Ângulos de Aquisição Recomendados

### 1. Primário — “Já estava assim” (locadoras / devolução)
- **Promessa:** Pare de absorver avaria que você não consegue provar.  
- **Mecanismo em 1 linha:** Mesmo padrão na retirada e na devolução — foto+GPS+assinatura+hash.  
- **Prova disponível hoje:** Citação ConJur/TJDFT (problema) + laudo demo (produto).  
- **Consciência:** Problem-Aware.

### 2. Secundário — “Laudo que se verifica” (seguradoras / jurídico interno)
- **Promessa:** PDF que expõe adulteração (hash quebra se editado) + QR público.  
- **Evitar:** “à prova de tribunal” absoluto.  
- **Consciência:** Solution-Aware (já busca documento forte).

### 3. Terciário — Offline no pátio (frotas)
- **Promessa:** Sem sinal, a vistoria continua; o padrão também.  
- **Usar quando:** ICP confirma dor de conectividade (H5 mining — validar).  
- **Não** como ângulo #1 de marca.

**Não priorizar agora:** ângulo “produtividade / redigitação” em ads caros — só linguagem de produto, sem VoC B2B.

---

## Espectro da Proposta de Valor (4 níveis)

| Nível | Status | Nota |
|-------|--------|------|
| Empresa | Fraco — marca nova, sem cases | Por que *esta* empresa? Ainda não respondido com prova |
| Persona | Médio — landings por segmento existem | Falta confirmar persona compradora com calls |
| Produto | Forte — mecanismo vs. papel/WhatsApp | Claro |
| Aquisição | Fraco–médio — trial ajuda SME; “por que agora” sem urgência crível | Sem custo de inação medido |

---

## Cruzamento com Message Mining

| Insight do mining | Implicação no diagnosis |
|-------------------|-------------------------|
| VoC B2B insuficiente | Dimensão Prova capped em ≤2; Ângulo capped até validação |
| Dor #1 disputa “já estava” | Ângulo primário confirmado no *problema de mercado* |
| Objeção validade jurídica bem tratada no FAQ | Manter nuance; não “melhorar” com absolutos |
| Claims “100%” / “empresas relatam” | Explicitamente fora da oferta aprovada para ads |
| Próximos passos coleta (calls, RA, survey) | Bloqueiam nota 4–5 em Prova — executar em paralelo ao ICP |

---

## Próximos Passos

1. **Avançar pipeline com ressalvas** (Etapas ICP / wireframe / ads SME), usando ângulo #1 e prova = demo QR + citação jurídica (com fonte), **nunca** depoimento fictício.  
2. **Não** escalar campanha Corporativo/mid-market até P1 (cases ou bloco honesto + piloto).  
3. **Ops oferta:** ativar Stripe Price IDs live; manter PIX como caminho feliz.  
4. **Coleta VoC (paralelo, 1–2 semanas):** 5–8 discovery calls (roteiro no message mining); 1 entrevista com fundador rotulada “staff”, não cliente.  
5. **Revisar este diagnosis** quando houver ≥3 verbatims de comprador ou 1 case nomeado com permissão.

**Não bloquear:** veredicto é ajuste, não reconstrução. A oferta tem mecanismo e preço SME; falta prova e foco de aquisição.

---

## Apêndice — Fontes de produto usadas

| Path | Uso |
|------|-----|
| `src/components/PricingCards.tsx` | Preços, features, faixas Corp, trial CTA |
| `src/app/page.tsx` (`FAQ_ITEMS`, carousel) | Promessa + FAQ comercial |
| `src/app/planos/page.tsx` | Validade jurídica, trial sem cartão, cancelamento |
| `src/app/*/page.tsx` (locadoras, oficinas, frotas, seguradoras) | Dores, FAQ, disclaimer sem depoimentos |
| `src/content/chatSupportKnowledge.ts` | Mecanismo + dores por segmento |
| `docs/message-mining-danos-aparentes.md` | VoC, gaps, ângulos, hipóteses H1–H10 |

---

*Fim do Offer Diagnosis. HTML companheiro: `docs/offer-diagnosis-danos-aparentes.html`.*
