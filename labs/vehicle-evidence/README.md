# Vehicle Evidence Lab

Protótipo **isolado** da evolução do Danos Aparentes para plataforma de evidência, histórico e comparação de estado do veículo.

> Não altera o app de produção em `src/`.
> Se validar bem, o domínio pode ser promovido para produção depois.

## O que tem

- Domínio puro: `Vehicle`, identidade de dano, `compareInspections`
- Store em memória + `localStorage` (simula offline)
- UI demo: lista de veículos → histórico → comparação + revisão humana
- Testes Vitest cobrindo os 12 casos do MVP

## Rodar

```bash
cd labs/vehicle-evidence
npm install
npm test
npm run dev
```

Abre em `http://localhost:5174`.

## Integrar depois (produção)

1. Copiar `src/domain/*` para o app principal (ex.: `src/lib/vehicleEvidence/`).
2. Migration aditiva: tabela `vehicles` + `vehicle_id` em `vehicle_inspections`.
3. UI em `/app/vehicles` reutilizando componentes existentes.
4. Eventos de auditoria no `audit_log` existente.
5. **Não** mutar laudos `issued`.

## Fora deste lab

- Detecção por IA / visão computacional
- PDF comparativo
- Reescrita do fluxo de vistoria atual
