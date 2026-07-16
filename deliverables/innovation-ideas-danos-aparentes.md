# Innovation Ideas — Danos Aparentes

**Sessão:** Tech Innovation Mentor  
**Data:** 2026-07-16  
**Objetivo:** gerar ideias adjacentes ao produto atual com destaque + white space real  
**Fonte de contexto:** README, docs de concorrência, pricing, vision API, LPs de segmento

---

## Intake (extraído do projeto)

| # | Resposta |
|---|----------|
| Domínio | Vistoria veicular digital / prova de avarias (Brasil) |
| O que já tem | PWA live: SVG interativo, offline-first, PDF + hash/QR, assinatura, Gemini vision, PIX/Stripe, LPs B2B |
| Comprador | Locadoras/frotas (ICP quente), oficinas, vistoriadores, seguradoras |
| Restrições | Early-stage, prova social fraca, mercado de checklist lotado (Vexsoft etc.), Ads friccionado |
| Objetivo | Ideias de inovação no território do produto |

---

## Mapa de White Space

### 1. Job-to-be-Done
- **Locadora/frota:** provar avaria na devolução e cobrar sem briga / prejuízo invisível
- **Vistoriador:** fazer laudo rápido no pátio, offline, sem retrabalho
- **Seguradora/oficina:** receber dano estruturado (peça + severidade + foto) para orçar/indenizar

### 2. Solução atual
| Nível | Quem |
|-------|------|
| Diretos | Vexsoft, Checklist Fácil, Produttivo, Nottun, Infovist… |
| Indiretos | Módulos de vistoria em ERPs de locação (7Carros, LocaSmartPro…) |
| Substitutos | Prancheta, WhatsApp + fotos, Excel, PDF informal |
| Não-consumo | Locadoras pequenas que “assumem o prejuízo” |

### 3. Gaps que ninguém resolve bem
- Checklist digital ≠ **prova forense** que fecha contestação
- Pouca **comparação automática entrada × saída**
- Visão computacional ainda é feature, não **produto de evidência**
- Dados de dano ficam presos no PDF; **não viram input** de funilaria/seguro
- Concorrentes vendem “digitalizar prancheta”; poucos vendem “**reduzir R$ de disputa**”

### 4. White space prioritário
> **De “app de checklist” → “sistema de evidência de avaria que reduz prejuízo contestado”**, com IA + cadeia criptográfica + SVG como prova visual única.

Classificação: **oceano azul verdadeiro** no ângulo de evidência/disputa; **oceano vermelho** se competir só como “mais um checklist”.

---

## Ideias ranqueadas (7 lentes / máx. 35)

### 1) Pacote Forense de Contestação — **32/35** ✅ Top
**White space:** vender o fechamento da disputa, não o formulário.  
**Mecanismo:** SVG + foto GPS/timestamp + Gemini vision + hash SHA-256 + QR `/verify` + trilha de assinatura → “dossiê de prova” em 1 clique.  
**Scores:** Dor 5 · White space 5 · Mecanismo 5 · Defesa 4 · Viab. 5 · Captura 4 · Timing 4  
**Próximo experimento:** 8 entrevistas com gestores de locadora: “quanto perdeu no último trimestre por avaria contestada?” + mock do dossiê.

### 2) Diff Check-in × Check-out (IA) — **30/35** ✅ Top
**White space:** comparação automática de avarias entre retirada e devolução.  
**Mecanismo:** matching de peças SVG + visão nas fotos novas vs. baseline; alerta “novo dano / possível pré-existente”.  
**Scores:** Dor 5 · WS 4 · Mec. 5 · Def. 4 · Viab. 4 · Cap. 4 · Timing 4  
**Experimento:** Wizard of Oz em 10 devoluções — humano marca diff; medir tempo e % de concordância com gestor.

### 3) Orçamento Estruturado para Funilaria (do mapa → peças) — **27/35** ✅ Top
**White space:** laudo vira input de orçamento (peça + severidade + foto), não PDF morto.  
**Mecanismo:** mapa SVG → lista de peças/serviços sugeridos + link compartilhável para oficina.  
**Scores:** Dor 4 · WS 4 · Mec. 4 · Def. 3 · Viab. 4 · Cap. 4 · Timing 4  
**Experimento:** 5 oficinas recebem 10 laudos estruturados vs. PDF; perguntar se orçam mais rápido / aceitam pagar lead.

### 4) Score de Risco de Contestação — **25/35**
**White space:** priorizar vistorias “fracas” antes do cliente sair.  
**Mecanismo:** regras + ML leve (fotos faltando, peça crítica sem foto, assinatura remota pendente, GPS fraco).  
**Scores:** Dor 4 · WS 4 · Mec. 3 · Def. 3 · Viab. 4 · Cap. 3 · Timing 4  
**Experimento:** score rule-based em 50 laudos históricos; validar com 3 gestores se o ranking faz sentido.

### 5) API de Evidência para Seguradora / ERP — **24/35**
**White space:** Corporativo promete API; virar produto real (webhook + schema de dano).  
**Mecanismo:** evento `inspection.sealed` com JSON de peças, severidade, URLs assinadas, hash.  
**Scores:** Dor 4 · WS 3 · Mec. 3 · Def. 4 · Viab. 3 · Cap. 4 · Timing 3  
**Experimento:** 1 LOI com locadora/ERP pedindo só webhook de devolução.

### 6) Banco Proprietário de Avarias Rotuladas (moat de dados) — **23/35**
**White space:** dataset BR de peça×severidade×foto×resultado de disputa.  
**Mecanismo:** feedback loop (contestação ganha/perdida) treina visão e score.  
**Scores:** Dor 3 · WS 4 · Mec. 4 · Def. 5 · Viab. 3 · Cap. 2 · Timing 2  
**Nota:** apostar cedo demais = deserto de dados; só depois de volume B2B.

### 7) Calculadora de Prejuízo (aquisição, não produto core) — **21/35**
Já especificado em `docs/superpowers/specs/2026-07-11-loss-calculator-design.md`.  
Útil para GTM; **não é inovação de categoria** — tratar como motor de demanda para ideias 1–2.

### Arquivadas / desafiadas
- ❌ Marketplace geral de funilaria (liquidez dia 1)  
- ❌ “IA genérica no checklist” sem job de disputa  
- ❌ Competir head-on com Vexsoft só em features de checklist  

---

## Canvas — Top 3

## Ideia: Pacote Forense de Contestação

### 1. Problema
Cliente alega que o dano “já estava”; locadora não tem dossiê único e perde a cobrança.

### 2. Usuário / Comprador
Gestor de locadora/frota (paga Corporativo); vistoriador executa.

### 3. Workaround atual
Fotos no WhatsApp + checklist genérico + discussão por e-mail/telefone.

### 4. Insight de white space
Mercado vende digitalização da prancheta; quase ninguém vende **pacote de prova** amarrando mapa, foto, IA e integridade criptográfica.

### 5. Solução proposta
Botão “Gerar dossiê de contestação”: PDF + página pública `/verify` + timeline (entrada/saída) + resumo de IA por peça + hash.

### 6. Mecanismo único
Cadeia evidência = SVG posicionando a peça + metadados forenses da foto + visão Gemini + selo SHA-256 verificável por terceiros.

### 7. Por que se destaca
O substituto (WhatsApp) não prova integridade nem localiza a peça; checklists rivais raramente fecham o ciclo prova→cobrança.

### 8. Riscos
- Valor jurídico percebido ≠ valor jurídico real (não é laudo DETRAN)  
- Precisa linguagem cuidadosa (Ads já teve fricção)  
- Sem cases, B2B desconfia  

### 9. Hipóteses
1. Gestores pagam mais por “fechar disputa” do que por “checklist”  
2. Dossiê reduz tempo de contestação em ≥50%  
3. Hash/QR aumentam taxa de aceite do cliente  
4. Vision acelera descrição sem matar confiança  
5. Corporativo fecha com demo do dossiê, não do formulário  

### 10. Experimento 7–14 dias
Mock clicável do dossiê + 8 calls com locadoras; métrica: ≥5/8 dizem “pagaria a mais” ou pedem piloto.

---

## Ideia: Diff Check-in × Check-out (IA)

### 1. Problema
Comparar manualmente dezenas de fotos/peças entre retirada e devolução é lento e falho.

### 2. Usuário / Comprador
Operação de locadora no balcão de devolução; gestor valida cobrança.

### 3. Workaround atual
Olho humano lado a lado; às vezes nem há check-in decente.

### 4. Insight de white space
Poucos produtos tratam a vistoria como **par temporal** (baseline × retorno) com diff automático.

### 5. Solução proposta
Ao fechar devolução, o app mostra “novos danos”, “sem mudança”, “incerto — revisar”, com fotos lado a lado por peça SVG.

### 6. Mecanismo único
Modelo de peça (SVG IDs estáveis) + matching de visão nas fotos anexadas à mesma peça.

### 7. Por que se destaca
Transforma o SVG (já diferencial) em âncora de comparação — checklists de lista não têm esse grafo.

### 8. Riscos
Falsos positivos irritam operação; iluminação/ângulo ruins; precisa UX de revisão humana.

### 9. Hipóteses
1. Diff corta ≥5 min por devolução  
2. Gestores aceitam “assistido” (não 100% automático)  
3. Reduz esquecimento de cobrança de dano novo  
4. Aumenta adesão ao check-in completo (porque o diff depende dele)  
5. Vira feature âncora do Corporativo  

### 10. Experimento 7–14 dias
Concierge: 10 pares reais processados semi-manual; medir precisão e disposição a pagar piloto.

---

## Ideia: Orçamento Estruturado para Funilaria

### 1. Problema
Oficina recebe PDF/fotos bagunçadas e perde tempo interpretando o dano.

### 2. Usuário / Comprador
Oficina (Pro) e locadora que encaminha reparo (Corporativo).

### 3. Workaround atual
WhatsApp com álbum de fotos + ligação.

### 4. Insight de white space
O mapa de peças já é quase um BOM de funilaria — ninguém empacota isso como fluxo de orçamento.

### 5. Solução proposta
Export “pacote oficina”: lista de peças/severidade + fotos + link; opcional pedido de 2–3 orçamentos.

### 6. Mecanismo único
IDs de peça SVG → taxonomia de reparo; visão sugere gravidade; compartilhamento one-tap.

### 7. Por que se destaca
Encurta o gap laudo→orçamento; cria rede oficina↔locadora (switching cost).

### 8. Riscos
Virar marketplace cedo demais; taxonomia incompleta; oficinas não pagam se locadora já é o buyer.

### 9. Hipóteses
1. Oficinas orçam ≥30% mais rápido com pacote estruturado  
2. Locadoras querem isso no Corporativo  
3. Lead de oficina pode ser monetizado depois  
4. Não precisa marketplace no dia 1  
5. Melhora NPS do fluxo pós-avaria  

### 10. Experimento 7–14 dias
Enviar 10 pacotes manuais a oficinas parceiras; NPS do processo + “pagaria por leads assim?”.

---

## Plano de validação (próximas 2 semanas)

1. **Sinal de demanda (dias 1–7)**  
   - 8–12 entrevistas locadoras/frotas focadas em R$ de contestação  
   - Mostrar mock do Pacote Forense + Diff  
   - Meta: ≥60% relatam prejuízo mensal relevante e pedem piloto

2. **Prova de mecanismo (dias 5–12)**  
   - Diff Wizard-of-Oz em ≥10 devoluções  
   - Meta: precisão percebida ≥80% “útil com revisão”

3. **Prova de pagamento (dias 10–14)**  
   - Oferecer piloto Corporativo 30 dias amarrado ao dossiê/diff  
   - Meta: ≥1 LOI ou cartão/PIX Corporativo

4. **Decisão**  
   - **Go:** hipóteses 1–2 do Pacote Forense + Diff validadas → priorizar no roadmap  
   - **Pivot:** dor de disputa fraca → voltar a GTM checklist + calculadora  
   - **Kill:** ninguém paga além do Pro self-serve sem evidência de ROI

---

## Recomendação do mentor

**Foque 80% do roadmap de inovação no eixo evidência → disputa → cobrança** (ideias 1 e 2).  
Checklist sozinho é oceano vermelho. O SVG + hash + vision que vocês já têm são a base de um **produto de prova**, não só de formulário.

Próximo passo concreto: mock do dossiê de contestação + 8 calls esta semana.
