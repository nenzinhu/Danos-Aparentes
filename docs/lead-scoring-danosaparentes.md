# Qualificação de Leads — Danos Aparentes (versão proporcional)

> Modelo **simplificado e operável sem CRM**, desenhado para a realidade atual:
> captação principalmente **orgânica** (blog/SEO) → contato por **WhatsApp / formulário**
> → assinatura **self-service via Stripe** ou **venda B2B** (plano Corporativo).
> Não exige SDR, ads pagos ou offline conversions. Roda no **WhatsApp Business + 1 planilha**.

---

## Resumo executivo

- **Não é "dar nota" — é decidir 2 coisas:** (1) por qual **trilha** o lead segue e (2) **com que pressa** você responde.
- **Duas trilhas:** 🔥 **B2B** (frota/volume → você atende e fecha) e 🌱 **Self-service** (individual → trial + Stripe sozinho).
- **Sem número de score:** usa **semáforo** (🔥🟡🔵⚫) — simples de aplicar no 1º contato.
- **Ligação com o que já existe:** a captura de UTM do site permite saber **qual blog trouxe o lead** → você descobre quais artigos geram clientes.
- **Valores de ticket marcados como `[A DEFINIR]`** — preencher com os preços reais dos seus planos.

---

## 1. Lifecycle simplificado (4 estágios + descarte)

```
VISITANTE  →  LEAD  →  QUALIFICADO  →  CLIENTE  →  (PROMOTOR)
 (anônimo)   (falou)   (trilha def.)   (assinou)    (indica)
                          │
                          └─►  DESCARTADO (fora do setor / sem fit)
```

| Estágio | Entra quando… | Sai quando… | Dono |
|---|---|---|---|
| **Visitante** | Acessa o site/blog | Chama no WhatsApp ou preenche form | — (analytics) |
| **Lead** | Manda 1ª mensagem / formulário | Você define a trilha (3 perguntas) | Você |
| **Qualificado** | Trilha definida (B2B ou self-service) | Assina (Stripe) ou esfria | Você |
| **Cliente** | Pagamento confirmado no Stripe | Cancela (→ reativação) | Você |
| **Promotor** | Indica alguém ou elogia/avalia | — | Você |
| **Descartado** | Não é do setor automotivo / sem uso real | Pode voltar se mudar contexto | Você |

---

## 2. As duas trilhas

| | 🔥 Trilha B2B (Corporativo) | 🌱 Trilha Self-service |
|---|---|---|
| **Quem** | Locadora, frota, seguradora, despachante, rede/oficina grande | Oficina individual, martelinho, vistoriador autônomo |
| **Sinal** | Volume alto, vários usuários, pergunta de preço/plano | Volume baixo, 1 usuário, curiosidade |
| **Sua ação** | Atender **pessoalmente e rápido**, mostrar plano Corporativo | Mandar **link do trial/app**, deixar assinar via Stripe |
| **Meta** | Fechar contrato (ticket maior) | Conversão automática (volume) |

---

## 3. Qualificação rápida — 3 perguntas no 1º contato WhatsApp

> Cole isto como **mensagem rápida** no WhatsApp Business:

1. **"Você é oficina/vistoriador individual ou uma empresa com frota/equipe?"** → define a trilha
2. **"Quantos laudos/vistorias você faz por mês, mais ou menos?"** → mede volume
3. **"Quantas pessoas vão usar o app?"** → individual vs. equipe

A resposta a essas 3 já te dá o semáforo abaixo.

---

## 4. Semáforo (o "score" prático)

| Cor | Critério | Trilha | SLA de resposta |
|:--:|---|---|:--:|
| 🔥 **Quente** | Empresa com frota/volume **OU** pediu preço/plano **OU** vários usuários | B2B | **≤ 1 hora** |
| 🟡 **Morno** | Individual com volume médio, claramente interessado | Self-service acompanhado | **Mesmo dia** |
| 🔵 **Frio** | Curioso, sem volume definido | Self-service automático (trial) | Manda link e segue |
| ⚫ **Fora** | Não é do setor automotivo / sem uso real | Descartado | — |

**Sinais de compra (responder na hora, vira 🔥):** pede orçamento/proposta, fala em prazo ("preciso essa semana"), pergunta de contrato/condições, ou volta a falar depois de sumir.

---

## 5. Operacionalização sem CRM — WhatsApp Business + planilha

### 5.1 Etiquetas no WhatsApp Business (crie estas)
- 🔥 `Lead Quente B2B`
- 🟡 `Avaliando`
- 🔵 `Trial enviado`
- ✅ `Cliente`
- ❌ `Descartado`
- 🔁 `Reativar` (esfriou, retomar em 30 dias)

### 5.2 Planilha de leads (Google Sheets — 1 aba)

| Data | Nome | WhatsApp | Trilha | Laudos/mês | Semáforo | Origem (blog/UTM) | Próxima ação | Status |
|---|---|---|---|---|---|---|---|---|

> **Origem:** quando o lead disser que "achou no Google", pergunte **sobre o quê** — ou peça o link.
> Isso revela qual artigo do blog converteu (ex: *checklist-vistoria-devolucao-locadora* → locadora).

---

## 6. Ligação com o que você já tem

- **Captura de UTM já existe no site** (`src/lib/analytics/utm.ts`) → leads que vierem de campanha/blog carregam a origem. Hoje isso fica no navegador; o jeito simples de aproveitar é **anotar a origem na planilha** no 1º contato.
- **Modelos de e-mail desta sessão** (funilaria, locadoras, vistoriadores) → vire **mensagens rápidas** do WhatsApp, uma por trilha.
- **Stripe** = sua confirmação de "Cliente". Quando cair o pagamento, marque ✅ na planilha/etiqueta.
- **Blog/SEO** (foco atual) = topo do funil. Cada post puxa um perfil: posts de *locadora/frota* → trilha B2B; posts de *moto/como fotografar* → self-service.

---

## 7. Calibração leve (15 min/mês)

- [ ] Quantos leads viraram **cliente** em cada trilha?
- [ ] Qual **blog/origem** trouxe os melhores leads (que assinaram)?
- [ ] Algum 🔵 frio que deveria ter sido 🔥? Ajuste as 3 perguntas.
- [ ] Reveja a lista 🔁 `Reativar` e mande 1 mensagem.

---

## 8. Quando evoluir para a arquitetura completa

Migre para lead scoring "de verdade" (CRM + score numérico + offline conversions para ads) **somente quando** dois destes forem verdade:
- Mais de ~**50 leads/mês** que você não consegue mais qualificar na mão;
- Você começar a **investir em ads pagos** com volume (aí o algoritmo precisa dos sinais de qualidade);
- Contratar alguém de **pré-vendas/SDR**.

Até lá, este modelo de 1 planilha + etiquetas dá conta — e é o que **não vira trabalho morto**.

---

## Notas

- **Valores de ticket (`[A DEFINIR]`):** preencher com os preços reais dos planos (self-service e Corporativo) para priorização — quem puxa ticket maior merece resposta mais rápida.
- **Cenário WhatsApp-first:** como não há formulário na maioria dos contatos, a "qualificação" vem da **conversa** (3 perguntas), não de campos rastreados. É o ajuste correto para a sua operação.
- Modelo deliberadamente simplificado vs. a arquitetura RevOps completa — proporcional ao estágio atual do negócio.
