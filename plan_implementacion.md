# Plano de Implementação — Conversão B2B Diamante

**Padrão:** excelência de conversão  
**Horizonte:** 90 dias (com P0 imediato)  
**Idioma dos artefatos:** português (pedido do parceiro)

---

## 1. Diagnóstico estrutural (Gates)

O problema aparente é “tráfego não converte”. O constraint real é outro:

> O visitante B2B precisa **clicar e usar**. Chat no WhatsApp é órbita de vendas; o produto precisa ser o chokepoint.

Hoje `/locadoras` já faz trial primário. `/oficinas`, `/frotas` e `/seguradoras` invertem a hierarquia (WhatsApp = primary). Isso otimiza conversa, não ativação.

Segunda falha: o produto já tem histórico/comparação/evidência no app, mas as landings ainda vendem “laudo digital” — ferramenta, não plataforma.

---

## 2. Norte de posicionamento

**Marca:** Danos Aparentes  
**Categoria:** Histórico e Sistema de Evidência Veicular  
**Promessa por vertical (mesma categoria, dor diferente):**

| Vertical | Dor em 1 linha | Prova |
|----------|----------------|-------|
| Locadoras | Discussão na devolução | Par retirada × devolução + hash/QR |
| Oficinas | “Já estava assim” na entrega | Entrada × saída no histórico |
| Frotas | Estado da frota em planilhas | Histórico por veículo, offline |
| Seguradoras | Avaria pré-existente | Laudo verificável + cadeia de evidência |

---

## 3. Arquitetura de conversão

```
Ads / SEO / WhatsApp outbound
        ↓
Landing B2B (1 CTA primário: trial)
        ↓
/app?mode=signup (+ UTMs)
        ↓
Primeira vistoria (ativação)
        ↓
Histórico do veículo (retenção / moat)
```

WhatsApp = secundário (Corporativo / dúvidas), nunca o único caminho acima da dobra.

---

## 4. Fases

### Fase 0 — P0 (este ciclo)
- Reordenar CTAs
- Copy de posicionamento + metadata
- Home subheadline
- Documentação de rota

### Fase 1 — Mensagem e prova (1–2 semanas)
- Bloco “Histórico por veículo” com visual antes/depois
- Sticky CTA mobile
- Paridade de CTA copy entre verticais

### Fase 2 — Medição (2–3 semanas)
- Eventos de funil no analytics existente (`trackLead` + novos)
- Dashboard simples: CTR CTA → signup → 1ª vistoria

### Fase 3 — Plataforma na superfície (30–90 dias)
- Página de produto “Histórico”
- Onboarding de ativação
- Testes A/B formais

---

## 5. Padrão diamante (qualidade)

- Sem cases inventados (já honesto nas landings — manter)
- Uma ação primária por seção de decisão
- Mobile-first: CTA visível sem scroll longo
- Message match com anúncios
- Zero regressão em UTMs/`trackLead`

---

## 6. Riscos de 2ª ordem

| Risco | Mitigação |
|-------|-----------|
| Trial sobe, ativação não | Onboarding + checklist 1ª vistoria |
| “Evidência” soa jurídico demais | Linguagem: prova documental forte, sem prometer sentença |
| Quatro landings divergem de novo | Constantes compartilhadas em `src/lib/b2bPositioning.ts` |

---

## 7. Cenários (12 meses)

- **Otimista (~35%):** histórico vira motivo de compra B2B; WhatsApp só fecha Corporativo.
- **Base (~50%):** conversão landing→signup sobe; ativação ainda é o próximo gargalo.
- **Pessimista (~15%):** tráfego frio; copy ajuda pouco sem message match de ads — priorizar P1 ads.

Aposta ótima: **P0 agora + medição de ativação na Fase 2.**
