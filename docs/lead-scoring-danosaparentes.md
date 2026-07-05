# Lead Scoring Architecture — Danos Aparentes

## Resumo Executivo
* **Foco no Tráfego Orgânico (SEO/GSC):** Como a aquisição atual é 100% orgânica através do blog e do Google Search Console, a arquitetura foi desenhada para conectar a origem do tráfego (UTMs do blog) diretamente ao perfil do lead.
* **Modelo Híbrido Evolutivo:** Iniciamos com um modelo simplificado operacionalizável via **WhatsApp Business + Google Sheets** (sem custo e sem complexidade de CRM), mas já especificamos a arquitetura técnica de **Transição de Lifecycle e GTM/Ads** para quando campanhas pagas forem ativadas.
* **Trilhas Estruturadas (B2B vs. Self-Service):** Divisão clara entre leads de alto valor (Frotas/Locadoras - Trilha B2B) que exigem contato humano em menos de 1 hora, e leads individuais (Oficinas/Autônomos - Trilha Self-Service) que seguem fluxo 100% automatizado.
* **Value-Based Bidding (VBB) Fundacional:** Mesmo sem anúncios ativos, definimos os valores monetários de cada etapa do funil (com base em LTV estimado) para que, assim que campanhas de Google/Meta forem iniciadas, o algoritmo aprenda a otimizar para receita, não para volume.

---

## 1. Lifecycle Stages

### Diagrama de Estados
```
[ VISITANTE ] ──(Form/WhatsApp)──> [ LEAD ] ──(Qualificação)──> [ QUALIFICADO (MQL) ]
                                                                      │
      ┌─────────────────────────────── Trilhas ───────────────────────┤
      ▼                                                               ▼
[ TRILHA SELF-SERVICE ]                                       [ TRILHA B2B / CORPORATIVO ]
  • Conversão direta no Stripe                                  • Venda consultiva (SDR/Closer)
  • Trial do PWA liberado                                       • Demonstração customizada
      │                                                               │
      └─────────────────────────► [ CLIENTE (LTV) ] ◄─────────────────┘
                                         │
                                         ▼
                                   [ PROMOTOR ]
```

### Definição de Cada Estágio

1. **Visitante (Visitor):** Usuário anônimo navegando no blog ou na Landing Page.
   * *Critério de Entrada:* Acesso rastreado via Google Search Console/Analytics.
   * *Ação:* Rastreamento de termos de busca e páginas populares.
2. **Lead:** Usuário que preencheu o formulário de contato ou iniciou uma conversa no WhatsApp.
   * *Critério de Entrada:* Disparo do evento `generate_lead` (via clique no WhatsApp da LP ou submissão do formulário).
   * *Ação:* Envio de mensagem automática de qualificação rápida (3 perguntas).
3. **MQL (Marketing Qualified Lead / Qualificado):** Lead cuja resposta indica fit com uma das duas trilhas (Self-Service ou B2B).
   * *Critério de Entrada:* Resposta às 3 perguntas básicas no WhatsApp ou preenchimento de campos qualificadores no formulário.
   * *Ação:* Direcionamento para a trilha correspondente.
4. **Oportunidade (SQL):** Aplicado à trilha B2B corporativa.
   * *Critério de Entrada:* Reunião/Demonstração agendada ou proposta comercial de plano Corporativo enviada.
   * *Ação:* Acompanhamento comercial (follow-up).
5. **Cliente (Customer):** Assinatura ativa no Stripe (plano Pro) ou contrato B2B assinado (plano Corporativo).
   * *Critério de Entrada:* Confirmação de pagamento no Stripe (`invoice.payment_succeeded`) ou contrato assinado.
   * *Ação:* Onboarding no app PWA, liberação de acessos avançados.
6. **Promotor (Evangelist):** Cliente que indicou novos usuários ou forneceu depoimento positivo.
   * *Critério de Entrada:* Uso ativo frequente do app ou indicação confirmada.

### Estágios de Descarte/Reciclagem
* **Disqualified (Descartado):** Leads sem fit mínimo (ex: usuários querendo tirar dúvidas pessoais sem relação com o mercado automotivo). São etiquetados como `Descartado` e arquivados no WhatsApp.
* **Recycled (Reciclado):** Leads qualificados que iniciaram o trial mas não assinaram após os 7 dias grátis. Entram na lista de transmissão de reengajamento a cada 30 dias.

---

## 2. Modelo de Scoring

Como a operação atual não utiliza um CRM robusto, o modelo de score é traduzido em um sistema visual de **Semáforo** (Quente, Morno, Frio, Fora), facilitando a triagem manual no WhatsApp.

### Fit Score (Explícito) — Dimensões e Pesos
Avalia o perfil do lead em relação ao ICP do Danos Aparentes.

| Dimensão | Peso | Perfil Alto (100 pts) | Perfil Médio (60 pts) | Perfil Baixo (20 pts) |
|---|:---:|---|---|---|
| **Tipo de Operação** | 40% | Locadora, Frota, Seguradora (B2B) | Oficina Mecânica, Martelinho | Vistoriador Autônomo, Particular |
| **Volume de Vistorias** | 40% | > 100 vistorias/mês | 20 a 100 vistorias/mês | < 20 vistorias/mês |
| **Equipe / Usuários** | 20% | Múltiplos vistoriadores (> 3) | 2 a 3 usuários | Apenas 1 usuário |

### Engagement Score (Implícito) — Ações e Pontos
Mede o interesse implícito com base nas ações do lead.

| Ação do Lead | Pontos | Impacto no Semáforo |
|---|:---:|---|
| Preencheu formulário de orçamento | +40 | Mapeamento inicial |
| Clicou para falar no WhatsApp | +30 | Início do contato |
| Respondeu às 3 perguntas de qualificação | +30 | Classificação automática |
| Acessou o trial gratuito do PWA | +20 | Experimentação ativa |
| Assistiu ao vídeo de demonstração na LP | +10 | Engajamento básico |

### Intent Score — Sinais de Compra
Sinais que pulam a pontuação padrão e colocam o lead imediatamente como **🔥 Quente**:
1. Solicitou orçamento para o plano Corporativo (Equipes).
2. Perguntou sobre integração do app com outros sistemas de gestão.
3. Demonstrou urgência ("preciso rodar nas minhas oficinas esta semana").
4. Questionou sobre os termos do plano Pro e faturamento via CNPJ.

### Score Composto (Fórmula do Semáforo)

```
Score Total = (Fit Score × 0.6) + (Engagement Score × 0.4)
```

| Classificação | Score | Trilha Correspondente | Ação / SLA |
|---|---|---|---|
| 🔥 **Quente (Hot)** | ≥ 75 | B2B / Corporativo | Contato pessoal e consultivo pelo WhatsApp em **≤ 1 hora**. |
| 🟡 **Morno (Warm)** | 50 - 74 | Self-Service Acompanhado | Envio de link de trial + acompanhamento no mesmo dia. |
| 🔵 **Frio (Cool)** | 20 - 49 | Self-Service Automático | Envio automático do link do app (trial de 7 dias). |
| ⚫ **Fora (Unfit)** | < 20 | Descartado | Sem envio de mensagens ou arquivamento imediato. |

---

## 3. Conversion Value Mapping & GTM Implementation

### Tabela de Valores por Estágio (Value-Based Bidding)
Valores calculados com base no LTV (Lifetime Value) estimado para o Danos Aparentes.
* **LTV Médio Self-Service (Pro):** R$ 49,90/mês × 12 meses = R$ 600,00
* **LTV Médio B2B (Corporativo):** R$ 500,00/mês × 12 meses = R$ 6.000,00

#### Matriz de Valores Dinâmicos:

| Estágio do Funil | Conversão B2B | Valor B2B | Conversão Self-Service | Valor Self-Service | Evento GA4 Recomendado |
|---|:---:|---:|:---:|---:|---|
| **Lead (Contato)** | 2,5% | **R$ 150,00** | 4% | **R$ 24,00** | `generate_lead` |
| **MQL (Trial Ativo)** | 10% | **R$ 600,00** | 10% | **R$ 60,00** | `trial_start` |
| **SQL (Proposta/Demo)** | 20% | **R$ 1.200,00** | — | — | `proposal_sent` |
| **Customer (Assinatura)** | 100% | **R$ 6.000,00** | 100% | **R$ 600,00** | `purchase` |

### Eventos de Conversão Client-Side (GTM Web)
Disparados no momento em que o usuário preenche o formulário ou clica no botão de WhatsApp na LP:

```javascript
// dataLayer push disparado no formulário da LP
window.dataLayer.push({
  event: 'generate_lead',
  lead_type: 'form_submit',
  conversion_value: 24.00, // Valor padrão de entrada
  conversion_currency: 'BRL',
  lead_source: 'google_search_console', // Captura da UTM ou referer
  lead_campaign: 'seo_blog_post'
});
```

### Eventos de Conversão Offline (CRM / Planilha → Ads)
Quando o lead for qualificado na planilha de controle, a automação envia a conversão offline para as redes de anúncios:
* **MQL B2B:** Dispara sinal de conversão de R$ 600,00 para o Google/Meta Ads.
* **SQL B2B (Proposta enviada):** Dispara sinal de conversão de R$ 1.200,00.
* **Assinatura Stripe:** O webhook do Stripe dispara automaticamente a conversão de `purchase` com valor de R$ 600,00 (Self-Service) ou R$ 6.000,00 (B2B).

### Configuração Google Ads (Conversion Actions)
Configurações a serem criadas no Google Ads assim que os anúncios forem ativados:

1. **Lead - Formulário (Primary):** Otimiza para conversões gerais (Valor dinâmico, padrão R$ 24).
2. **MQL - Qualificado (Primary):** Upload offline via planilha/Make (Valor dinâmico, padrão R$ 60 ou R$ 600).
3. **Venda Fechada (Primary):** Disparado via webhook do Stripe ou planilha (Valor dinâmico, R$ 600 ou R$ 6.000).

### Variáveis GTM Necessárias
Devem ser configuradas no container conforme padrão `guimarketing`:
* `{{DLV - conversion_value}}`: Captura o valor dinâmico da conversão.
* `{{DLV - conversion_currency}}`: Moeda (`BRL`).
* `{{DLV - lead_type}}`: Identifica se foi formulário ou clique de WhatsApp.
* `{{DLV - lead_source}}`: Origem do tráfego (Analytics/UTM).

---

## 4. Routing & Automação

Como a operação está iniciando, a automação baseia-se em rotinas práticas do **WhatsApp Business** integradas com o **Google Sheets**.

### Routing Rules por Score
* **Leads 🔥 Quentes (B2B):** Notificação direta via push ou alerta sonoro. O atendimento comercial deve abrir a conversa e oferecer a apresentação institucional imediatamente (SLA < 1h).
* **Leads 🟡 e 🔵 (Self-Service):** Direcionados à automação padrão do WhatsApp Business que entrega o link direto do app com o cupom de 7 dias de avaliação gratuita.

### Automações por Transição de Lifecycle
```
[ Lead Iniciado ] 
       │
       ▼
[ Disparo de Mensagem de Qualificação Rápida ]
       │
       ├─► Se B2B: Mover contato para etiqueta "🔥 Lead Quente B2B" e registrar na Planilha.
       │
       └─► Se Self-Service: Mover contato para etiqueta "🔵 Trial Enviado" e mandar link do app.
```

### Planilha de Controle de Leads (Google Sheets)
A aba principal da planilha deve conter os seguintes campos para qualificação rápida:

| Data | Nome do Lead | WhatsApp | Origem (Blog/UTM) | Resposta Qualificação | Semáforo | Trilha | Status do Trial | Assinatura |
|---|---|---|---|---|---|---|---|---|
| 04/07/2026 | João Locadora | (48) 99999-9999 | /blog/checklist-devolucao | "Empresa, 150 laudos/mês" | 🔥 Quente | B2B | Iniciado | Aprovada (Stripe) |

---

## 5. Decay & Calibração

### Score Decay Rules (Regras de Esfriamento)
* **Lead Inativo por > 7 dias:** O semáforo é rebaixado em 1 nível (ex: 🔥 Quente vira 🟡 Morno).
* **Lead Inativo por > 15 dias:** O semáforo vira 🔵 Frio. Uma mensagem rápida de recall é enviada ("Ainda precisa simplificar seus laudos de vistoria?").
* **Lead Inativo por > 30 dias:** Mover para **Recycled** (etiqueta `🔁 Reativar`). Entra na fila de broadcast mensal do WhatsApp.

### Checklist de Calibração Mensal (15 minutos)
- [ ] Quantos leads foram qualificados como 🔥 Quentes (B2B) e quantos realmente fecharam contrato?
- [ ] Qual post do blog ou termo do Search Console gerou os leads que mais interagiram no WhatsApp?
- [ ] O valor cobrado na assinatura Pro mudou? (Se sim, atualizar os valores das conversões no GTM).
- [ ] As 3 perguntas rápidas do WhatsApp estão sendo fáceis de responder pelos leads? Se houver muita desistência, simplificar.

---

## 6. CRM Integration

Embora não seja utilizado um CRM no momento, assim que a operação atingir **> 50 leads/mês** ou iniciar **anúncios pagos**, a transição deve ser feita para o **HubSpot CRM (plano gratuito)** ou **RD Station**.

### Campos a criar no CRM futuro:
1. `fit_score` (numérico)
2. `engagement_score` (numérico)
3. `lifecycle_stage` (Lead, MQL, SQL, Customer, Lost)
4. `semaforo_grade` (Quente, Morno, Frio, Fora)
5. `gclid_valido` (campo de texto para salvar o ID de clique do Google Ads para fins de offline conversion upload)

---

## 7. Implementação

### Fase 1 — Fundação (Semana 1)
* Configuração das **Etiquetas no WhatsApp Business** e criação das **Mensagens Rápidas** de qualificação (3 perguntas).
* Criação e formatação da **Planilha de Controle de Leads** no Google Sheets.

### Fase 2 — GTM & Rastreamento (Semana 2)
* Validação do script de captura de UTMs e referer orgânico em [.env](file:///C:/Users/Nei/Desktop/Pastas/vercel-backup-2026-06-27/danosaparentes/AvariasAPARENTES-PWA-main/.env) e nos arquivos do site.
* Configuração das tags de conversão base no Google Tag Manager para mapear o clique de abertura do WhatsApp.

### Fase 3 — Calibração (Mês 2+)
* Revisão dos dados da planilha de leads e calibração das perguntas conforme o volume de novos visitantes vindos do Google Search Console.

---

## Notas Especiais
* **Abordagem Sem CRM:** Por ser um projeto novo e sem verba de tráfego pago ativo, forçar o uso de um CRM caro adicionaria atrito desnecessário à operação. A planilha compartilhada associada às etiquetas do WhatsApp Business é a solução proporcional e de custo zero mais indicada para esta fase.
