# Score de Risco do Veículo — Design

> Status: aprovado para implementação (brainstorming). Data: 2026-08-29.

## Contexto

O produto já calcula, de forma pura e determinística (sem IA, sem I/O), dados
por veículo em `src/lib/vehicleEvidence/`:

- `groupReportsByVehicle` (`groupReports.ts`) — agrupa laudos por veículo,
  produz `VehicleHistorySummary` com `activeDamageCount`, `newDamagesOnLast`,
  `firstInspectedAt`, `lastInspectedAt`.
- `compareInspections` (`compareInspections.ts`) — comparação estrutural
  entre duas vistorias consecutivas do mesmo veículo, categorizando cada
  dano como `unchanged | new | removedOrRepaired | severityChanged | uncertain`.
- `computeFleetKpis` (`fleetKpis.ts`) — KPIs agregados da frota inteira.

Não existe hoje nenhum sinal por-veículo que resuma "esse veículo está
degradando?" de forma acionável para quem gerencia frota/locadora. A ideia
é agregar os sinais que já existem em uma nota única, explicável, sem
depender de novos dados nem de chamadas de IA.

## Objetivo

Dar a locadoras/frotas um sinal rápido (nota 0–100 + tier de cor) de risco
por veículo, calculado 100% a partir dos dados que a plataforma já coleta,
para orientar decisão de manutenção preventiva/aposentadoria de frota —
sem gerar custo de IA e funcionando offline (mesma filosofia de
`computeFleetKpis`).

## Fora de escopo

- Qualquer chamada a modelo de IA para ajustar pesos (fica para uma
  iteração futura, fora deste spec).
- Estimativa de custo de reparo.
- Comparação relativa a outras frotas/tenants (score é sempre absoluto,
  por veículo).
- Persistência em banco — o score é derivado em runtime a partir dos
  `SavedReport[]` já carregados, como os outros módulos de `vehicleEvidence/`.

## Arquitetura

Novo módulo puro `src/lib/vehicleEvidence/riskScore.ts`, mesmo padrão de
`fleetKpis.ts`: função síncrona, sem efeitos colaterais, testável isolada.

### Entrada

```typescript
export function computeVehicleRiskScore(
  summary: VehicleHistorySummary,
  nowMs: number = Date.now(),
): VehicleRiskScore
```

Recebe um `VehicleHistorySummary` (já produzido por `groupReportsByVehicle`,
que por sua vez já roda `compareInspections` internamente para popular
`newDamagesOnLast`). Para os fatores de reincidência por local, o módulo
roda `compareInspections` novamente sobre pares consecutivos de
`summary.reports` (mesmo padrão usado em `groupReports.ts`, via
`savedReportToInspection`) — não introduz uma nova fonte de dado.

### Saída

```typescript
export type RiskTier = 'green' | 'yellow' | 'red'
export type RiskConfidence = 'low' | 'high'

export interface RiskFactor {
  label: string        // ex: "Avaria grave — para-choque dianteiro"
  points: number        // negativo = penalidade, ex: -12
}

export interface VehicleRiskScore {
  score: number          // 0–100, inteiro
  tier: RiskTier
  confidence: RiskConfidence
  factors: RiskFactor[]  // ordenado por |points| desc, maior penalidade primeiro
}
```

### Fórmula

Começa em `100` e desconta:

1. **Severidade das avarias ativas** (última vistoria, `filterDamagesForPdf`
   já usado por `activeDamageCount`): `low: -3`, `medium: -6`, `high: -12`
   por avaria. Teto de desconto total deste fator: `-50` (evita zerar por
   volume bruto de avarias leves).
2. **Reincidência no mesmo local**: para cada par consecutivo de vistorias
   em `summary.reports`, rodar `compareInspections` e contar itens
   `severityChanged` ou `new` cujo `partLocationKey` já apareceu como dano
   em uma comparação anterior do mesmo veículo → `-10` por ocorrência,
   teto `-30`. Sinal de dano não reparado / possível problema estrutural.
3. **Velocidade de acúmulo**: `newDamagesOnLast` dividido pelos dias entre
   `reports[length-2].savedAt` e `reports[length-1].savedAt` (mínimo 1 dia
   para evitar divisão por zero/explosão). Se a taxa por dia ultrapassar um
   limiar (`> 0.5 dano novo/dia`), penalidade fixa `-8`. Só se aplica com
   `summary.reports.length >= 2`.
4. Resultado final: `Math.max(0, Math.min(100, 100 - Σ penalidades))`.

**Tiers**: `score >= 75 → green`, `40 <= score < 75 → yellow`, `< 40 → red`.

**Confidence**: `low` quando `summary.reports.length < 2` OU
`countEvidencePhotos` média por laudo for muito baixa (reaproveitar mesma
lógica de cobertura de `computeFleetKpis`/`evidencePct`, aplicada a este
veículo). Quando `confidence === 'low'`, os fatores 2 e 3 acima não se
aplicam (não há histórico suficiente) — só o fator 1 (severidade atual)
conta, e a UI deve deixar claro que a nota é preliminar.

`factors` deve conter uma entrada por penalidade aplicada, com `label`
legível em português (reaproveitando `partName`/`typeName` de
`DamageRecord` e a tradução de severidade já usada no PDF/`theme.ts`).

## UI

### Lista de veículos (`/app/vehicles`)

Badge compacto ao lado da placa: nota + ponto de cor (verde/amarelo/
vermelho), reaproveitando a paleta de severidade já definida em
`src/lib/pdf/theme.ts`. Tooltip/hover mostra os 2–3 fatores de maior peso.
Quando `confidence === 'low'`, o badge usa um estilo "outline"/esmaecido
em vez da cor sólida, com tooltip "Poucos dados — nota preliminar".

### Página de detalhe do veículo

Card "Score de Risco": nota grande, tier, lista completa de `factors`
(cada um com label + pontos), e uma nota de rodapé quando `confidence`
for `low`.

## Testes

`src/lib/vehicleEvidence/__tests__/riskScore.test.ts`, seguindo o padrão de
`fleetKpis.test.ts`/`compareInspections.test.ts` (fixtures de
`SavedReport`/`VehicleHistorySummary`, sem mocks de IO):

- Veículo sem avarias, 1 vistoria → `score: 100`, `tier: green`,
  `confidence: low` (poucos dados).
- Veículo com 1 avaria leve, 2+ vistorias, sem reincidência → desconto só
  do fator 1, `confidence: high`.
- Veículo com reincidência no mesmo `partLocationKey` em vistorias
  consecutivas → fator 2 aplicado, `tier` cai para `yellow`/`red` conforme
  o total.
- Veículo com muitas avarias graves → desconto do fator 1 respeita o teto
  de `-50` (não pode compor indefinidamente).
- Veículo com acúmulo rápido (`newDamagesOnLast` alto em poucos dias) →
  fator 3 aplicado.
- `factors` sempre ordenado por `|points|` desc.

## Auto-revisão do spec

- Sem "TBD"/placeholders — fórmula, tetos e limiares estão explícitos.
- Consistência: a saída (`VehicleRiskScore`) é usada de forma idêntica nos
  dois pontos de UI descritos; não há contradição entre arquitetura e UI.
- Escopo: um único módulo novo + 2 pontos de UI — cabe em um plano de
  implementação único, não precisa de decomposição.
- Ambiguidade: limiares numéricos (tetos, pesos, `0.5 dano/dia`) são
  valores iniciais razoáveis, não validados com dados reais de produção —
  marcados aqui como ajustáveis por config/constantes no topo do módulo
  (não hardcoded espalhado), para calibração futura sem redesenhar a
  arquitetura.
