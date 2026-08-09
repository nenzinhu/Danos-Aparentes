# Vehicle Evidence Platform — status (FASE 1–25)

## Entregue no código

| Fase | Tema |
|------|------|
| 1–3 | Domínio + migration `vehicles` |
| 4–8 | Hub UI, compare, review, offline, QR, PDF derivado |
| 9–12 | PDF endurecido, live compare, persistência, timeline |
| 13–16 | Backfill local, APIs, busca, IA assistiva |
| 17–20 | Merge remoto, decisões nuvem, deep-link, testes |
| 21 | Migrations aplicadas no projeto DanosAparentes |
| 22 | Hydrate laudos completos → IndexedDB |
| 23 | Escopo equipe/tenant nas APIs + hydrate via token |
| 24 | Hub link no shell + Comparar na aba Equipe + mapRemoteInspection no team-reports |

## Migrations (Supabase prod `zlgrydekoqcqyzvzbocn`)

- `20260728000000_vehicles.sql` ✅
- `20260728010000_vehicle_qr_vehicle_id.sql` ✅
- `20260728020000_inspection_comparisons.sql` ✅

## Deploy

Este workspace **não tem `.git`**. O app de produção é `nenzinhu/Danos-Aparentes` na Vercel (`danosaparentes`).

Para publicar estas fases:

1. Commitar/push desta árvore numa branch (ex.: `cursor/vehicle-evidence-platform`)
2. Abrir PR → preview Vercel
3. Merge em `main` → production

Preview recente do lab: PR #49 (`cursor/vehicle-evidence-lab-10f1`) — **só o lab**, sem estas fases de produção.

## Fora de escopo (proposital)

- Visão computacional / auto-criar danos
- Cobrança de sinistro
- Reescrita do PDF/vistoria core
