-- Migração: índices de sincronização.
-- Aditivo e não-destrutivo: apenas cria índices que aceleram o flush de sync
-- (ordernação/filtro por updated_at) e a busca de laudos por vehicle_id.
-- Roda após schema.sql + migrations anteriores via `npm run db:push`.

-- Sync ordena/queue por updated_at; índice evita scan full-table em volumes grandes.
create index if not exists idx_inspections_updated_at
  on public.vehicle_inspections (updated_at desc);

create index if not exists idx_damages_updated_at
  on public.damages (updated_at desc);

-- Join laudo -> vehicle (histórico agrupado) ganha cobertura de índice.
create index if not exists idx_inspections_vehicle_id
  on public.vehicle_inspections (vehicle_id) where vehicle_id is not null;

-- Nota (revisão de arquitetura, NÃO aplicado aqui):
-- public.vehicles.tenant_id está sem FK por design — a tabela `companies`
-- ainda não existe no schema base (ver comentário em schema.sql). Quando
-- `companies` for criada, adicionar:
--   alter table public.vehicles
--     add constraint fk_vehicles_tenant foreign key (tenant_id)
--     references public.companies(id) on delete set null;
