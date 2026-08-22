# ICP — Danos Aparentes

> Gerado em 2026-07-25 | Skill: `guimkt-icp-ideal-customer-profile` v1.0.0  
> Fontes: `docs/message-mining-danos-aparentes.md` + `docs/offer-diagnosis-danos-aparentes.md` + landings (`/locadoras`, `/oficinas`, `/frotas`, `/seguradoras`) + site live  
> **VoC B2B:** insuficiente (0 verbatims de comprador). Firmografia e cargos sem calls = **hipótese**. Não inventar quotes.

**HTML companheiro:** `docs/icp-danos-aparentes.html`

---

## Status de evidência

| Camada | Status | Uso permitido |
|--------|--------|---------------|
| Dor de mercado (disputa entrega×devolução) | Evidência pública (ConJur, TJDFT, reclamações de locatários) | Ads/LP com citação de fonte — prova do *problema*, não do comprador |
| Dores/ângulos por segmento no site | Linguagem de produto | Hipótese de ICP — landings = sinais, não ICPs validados |
| Decisor, porte, formação, canais % | Sem CRM/calls | Hipótese — validar em discovery |
| Cases / ROI / “empresas relatam” | Ausente / anti-prova editorial | **Proibido** como prova social |

**Wedge de aquisição (offer diagnosis):** locadoras primeiro. SME Starter/Pro (R$ 29,90–49,90) = menor risco de oferta. Corporativo (R$ 299+) = aspiracional até cases.

---

## Intake compilado (Etapa 0)

```yaml
briefing:
  cliente: Danos Aparentes
  marcas: [Danos Aparentes]
  produto_servico: SaaS vistoria veicular digital (diagrama, foto+GPS, assinaturas, PDF hash SHA-256 + QR, offline, white-label)
  mercado: B2B (SME → mid-market); consumidor/locatário NÃO é comprador
  publico_declarado: "locadoras, oficinas, frotas, seguradoras" (produto) — não validado por VoC B2B
  diferenciais: laudo verificável (hash+QR); prova no ato (GPS+assinatura dual); offline PWA; white-label; preço transparente SME
  provas_sociais: 0 cases públicos; landings admitem app novo; prova de mecanismo = PDF/QR demo; prova de problema = jurídico/consumidor
  tom_de_voz: direto, operacional, balcão ("já estava assim"); nuance jurídica no FAQ
  site_url: https://danosaparentes.com.br
  concorrentes: "substitutos status quo (papel, WhatsApp, planilha, PDF editável); SaaS vistoria veicular pouco mapeado publicamente; apps de vistoria de imóveis são domínio adjacente, não ICP"
  setor_atuacao: SaaS / proptech-mobility / laudo de avarias aparentes veiculares
  porte_empresas_alvo: "HIPÓTESE — SME locadora/oficina (Starter/Pro); frota multi-vistoriador e mid-market (Corp Start/Growth); Enterprise sob consultoria"
  setores_prioritarios: "1) Locadoras/frotistas (wedge pago) 2) Oficinas (SEO/orgânico) 3) Gestão de frotas 4) Seguradoras/corretoras (aspiracional até prova)"
  modelo_contratacao: mensalidade — Starter R$29,90 (20 laudos) / Pro R$49,90 (80+marca) / Corp Start R$299 / Growth R$699 / Enterprise from R$1.490; trial 7 dias sem cartão; PIX SME
  proposta_valor: "Vistoria veicular digital que prova a si mesma — pare de discutir amassado que já existia (comparação entrega×devolução)"
  processo_vendas: "HIPÓTESE — self-serve SME (site/PIX); Corporativo via WhatsApp; sem SDR/CRM documentado no repo"
  objecoes_frequentes: validade jurídica; WhatsApp vs laudo; offline; preço/Corp; treinamento; "sem cases" (H9); ERP (H)
  motivos_nao_fechar: "HIPÓTESE — marca desconhecida/sem cases; dúvida valor probatório; checkout cartão incompleto; Corporativo sem POC"
  objetivo_marketing: leads/SQLs qualificados (ênfase vendas SME); não branding genérico
  cases_sucesso: nenhum publicável hoje
```

---

## 📊 9 Dimensões

Colunas = segmentos de campanha (1 marca). **[H]** = hipótese; **[E]** = evidência de corpus (produto ou VoC público de *problema*).

| Dimensão | Locadoras (wedge / ICP Real) | Oficinas (secundário SME) | Frotas (secundário operacional) |
|----------|------------------------------|---------------------------|----------------------------------|
| **Faixa Etária** | **[H]** 30–55 (decisor operacional/dono) | **[H]** 28–55 (dono/gerente) | **[H]** 32–55 (gestor de frota/ops) |
| **Profissão** | Locação de veículos / operações de frota de aluguel | Oficina mecânica / funilaria / estética automotiva | Gestão de frota corporativa ou logística |
| **Cargo (Decisor)** | **[H]** Dono / sócio de locadora; Gerente de operações / pátio; Coordenador de vistoria / atendimento | **[H]** Dono de oficina; Gerente de recepção/oficina; Responsável por laudos de entrada | **[H]** Gestor de frota; Coordenador de pátios/filiais; Supervisor de vistoriadores |
| **Setor** | Locadoras e frotistas de aluguel (volume de devolução) **[E-produto]** | Oficinas e serviços automotivos **[E-produto]** | Frotas próprias / multi-pátio **[E-produto]** |
| **Formação** | **[H]** Adm/ops/técnico automotivo — não é filtro de mídia; priorizar dor de cobrança | **[H]** Técnico mecânico / empreendedor — filtro fraco | **[H]** Logística/engenharia/ops — filtro fraco |
| **Objetivos** | Cobrar só dano **novo** com prova **[E-problema+produto]**; Padronizar vistoria entre vistoriadores **[E-produto]**; Reduzir absorção de prejuízo na devolução **[H]** | Estado de entrada assinado e profissional **[E-produto]**; Laudo com marca própria em minutos **[E-produto]**; Menos briga na saída **[E-produto]** | Um padrão em todos os pátios **[E-produto]**; Operar sem sinal **[E-produto]**; Comparar laudos entre veículos/filiais **[E-produto]** |
| **Dores** | “Já estava assim” na devolução **[E]**; Vistoriadores inconsistentes / prancheta **[E-produto]**; Foto WhatsApp sem GPS **[E-produto]**; Cobrança sem vistoria prévia cai na Justiça **[E-jurídico]** | Papel some / ilegível **[E-produto]**; Cliente desconfia do que entrou **[E-produto]**; “Isso não estava assim quando entrou” **[E-produto]** | Pátio sem internet **[E-produto]**; Formatos diferentes por vistoriador **[E-produto]**; Sem visão consolidada **[E-produto]** |
| **Necessidades** | Par entrega×devolução comparável; Assinatura no ato; Hash/QR no PDF; Offline no pátio | Laudo digital white-label rápido; Assinatura na entrada; Menos prancheta | Offline+sync; Checklist multi-veículo; Painel multi-vistoriador (Corp) |
| **Tópicos de Interesse** | Cobrança de avaria; CDC/vistoria prévia; Checklist devolução; Hash/QR laudo | Laudo entrada oficina; White-label PDF; Profissionalismo digital | PWA offline; Padronização multi-filial; API/ERP (Corp) **[H]** |

**Fora da tabela (aspiracional / não priorizar em ads pagos agora):** Seguradoras/corretoras — dor de pré-existência + PDF adulterável é **[E-produto]**; ticket e ciclo longos exigem cases. Locatário reclamante **não compra** o SaaS (só alimenta prova do problema).

---

## 🧠 Perfil Psicográfico

### Critérios de Decisão

1. **Prova comparável entrega×devolução** — Loss Aversion: perder cobrança / absorver avaria dói mais que “ganhar produtividade”. **[E-problema]**
2. **Mecanismo verificável (hash+QR+GPS+assinatura)** — Trust Calibration: cético verifica em 2 minutos no QR. **[E-produto]**
3. **Risco de adesão baixo (SME)** — Trial 7 dias sem cartão + preço literal R$/mês. Adequado a Starter/Pro; insuficiente para Corp sem POC. **[E-oferta]**
4. **White-label no PDF** — Endowment / identidade B2B: laudo com logo da locadora. **[E-produto]** · pedido real **[H-H4 mining]**
5. **“Sem cases” como filtro negativo** — Authority gap: mid-market trava sem prova social. **[H-H9]** admitido nas landings

### Consciência do Problema

- **ICP Real (Problem → Solution Aware):** já vive disputa no balcão / já perdeu cobrança por falta de prova; busca “sistema de vistoria” ou “laudo com GPS/hash”. Gatilho: devolução contestada, cobrança judicial, padronizar equipe.
- **ICP Aspiracional (Unaware → Problem Aware):** ainda acha que “foto no WhatsApp basta”; curiosidade por “app de laudo” sem dor aguda. Gatilho de transição: citação ConJur/TJDFT + demo QR (problema + mecanismo), **sem** fingir depoimento.
- **Não mirar Unaware puro em Meta/Google de conversão** até VoC B2B — budget dilui.

### Objeções Comuns

| Objeção | Origem | Modelo | Resposta estratégica |
|---------|--------|--------|----------------------|
| “O laudo tem validade jurídica?” | FAQ **[E]** | Anxiety / Authority | Registro documental forte; valor probatório depende do contrato — **não** prometer sentença |
| “Foto no WhatsApp / só na devolução basta?” | Jurídico+produto **[E]** | Contrast | Sem vistoria prévia, cobrança cai (ConJur); oferta = par comparável |
| “Não conheço a marca / sem cases” | Gap **[H→quase-E]** | Social Proof deficit | Bloco honesto + laudo demo verificável; coletar 3 betas |
| “Parece complicado / treinar” | FAQ **[E]** | Effort heuristic | Diagrama guia; validar tempo real no onboarding |
| “Funciona offline?” | FAQ/frotas **[E]** | Risk | Demo PWA no pátio |
| “Integra com meu ERP?” | FAQ Corp **[H]** | Switching cost | API Enterprise; não overpromise no Starter |

### Canais de Aquisição

| Canal | % budget sugerido (hipótese) | Estratégia |
|-------|:----------------------------:|------------|
| Google Ads (Search) — termos vistoria/locadora/laudo avaria | 40% | Message match LP `/locadoras`; ângulo “já estava assim” |
| Meta Ads — criativos balcão/pátio + citação jurídica (fonte) | 25% | Retargeting LP + demo QR; evitar claim “empresas relatam” |
| Orgânico / SEO landings + blog | 20% | Oficinas/seguradoras; conteúdo jurídico educativo |
| WhatsApp / outbound discovery (Corp) | 15% | Só após lead SME ou inbound Corp; piloto 14 dias |

*% é hipótese operacional para testar — sem histórico de CAC no repo.*

---

## 🎯 ICP Real vs. Aspiracional

| Critério | ✅ ICP Real | ❌ ICP Aspiracional |
|----------|------------|---------------------|
| Cargo | Dono/ops de locadora ou gestor de pátio com poder de comprar ferramenta de vistoria **[H]** | Locatário/consumidor; estagiário; “interessado em apps” sem frota |
| Dor Principal | Disputa recorrente na devolução / cobrança sem prova **[E-problema]** | Curiosidade por PDF bonito / “digitalizar por digitalizar” |
| Maturidade | Pergunta validade, offline, comparação entrega×devolução, white-label | Só “quanto custa o mais barato?” sem volume de laudos |
| Porte | SME com devoluções regulares (Starter/Pro) ou 1 base piloto Corp **[H]** | Enterprise multi-filial pedindo API+cases no dia 1 **sem** POC |
| Sinal Comportamental | Abre `/locadoras`, pede demo/QR, inicia trial, manda WhatsApp com caso de disputa | Bounce genérico na home multi-ICP; download sem dor |
| Setor | Locadora / frota de aluguel (wedge) | Seguradora grande / corretora sem projeto de laudo (ciclo longo) |
| Ação Após Score | → Trial SME ou piloto 1 base + follow-up WhatsApp | → Nurture SEO/conteúdo; **não** escalar CPL Corp |

---

## 💡 Modelos Mentais

### 1. Loss Aversion
- Aplicação: frame “absorver avaria que você não prova” > “ganhar eficiência”.
- Copy: “Pare de absorver o prejuízo do ‘já estava assim’.”

### 2. Authority Bias (com honestidade)
- Aplicação: autoridade do *problema* (ConJur/TJDFT) + autoridade do *mecanismo* (QR/hash). Nunca autoridade falsa de cliente.
- Copy: citação curta com fonte no rodapé do anúncio + “escaneie o QR deste laudo”.

### 3. Contrast Effect
- Aplicação: antagonista WhatsApp/prancheta vs. laudo selado no ato.
- Copy: “Foto solta discute. Laudo com GPS e assinatura compara.”

### 4. Risk Reversal (calibrado ao ticket)
- Aplicação: trial 7 dias + PIX SME; Corp precisa de POC explícito.
- Copy SME: “7 dias grátis, sem cartão.” Copy Corp: “Piloto em 1 base — sem case inventado.”

---

## Notas estratégicas (limitações)

1. ICP **ainda é hipótese de segmento** priorizada por offer diagnosis + evidência de *problema* de mercado — não por win/loss.
2. Não usar este documento para justificar claims de ROI ou depoimentos.
3. Atualizar cargos/porte após 5–8 calls (roteiro no message mining §7).
4. Seguradoras: manter landing orgânica; não wedge de mídia paga até P1 de prova (offer diagnosis).
5. Home multi-segmento dilui — campanhas devem deep-link `/locadoras`.

---

*Fim do ICP. Próxima revisão: após ≥3 verbatims B2B ou 1 case nomeado.*
