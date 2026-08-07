-- Migração corretiva (auditada via supabase-postgres-best-practices):
-- 1) RLS em public.vehicles — hoje a tabela NÃO tem RLS nem policies no
--    schema base, e a migration de team citada em schema.sql (linha 422)
--    não existe no disco. Isso deixa os veículos de um usuário/tentant
--    visíveis a todos. Habilitamos RLS + policies no padrão das demais
--    tabelas (owner = user_id).
-- 2) Índices em tenant_id (vehicles, vehicle_inspections, report_hashes,
--    audit_log) e em report_hashes(user_id) — aceleram multi-tenancy e a
--    verificação pública de QR em volume, evitando seq scan.
--    Sem FK para companies (tabela inexistente no schema base, por design).
--
-- Tudo idempotente (if not exists / drop policy if exists) para rodar via
-- `npm run db:push` sem conflito.

-- ─── 1) RLS + policies em public.vehicles ───────────────────────────────────
alter table public.vehicles enable row level security;

drop policy if exists "select_own_vehicles" on public.vehicles;
create policy "select_own_vehicles" on public.vehicles
  for select using (auth.uid() = user_id);

drop policy if exists "insert_own_vehicles" on public.vehicles;
create policy "insert_own_vehicles" on public.vehicles
  for insert with check (auth.uid() = user_id);

drop policy if exists "update_own_vehicles" on public.vehicles;
create policy "update_own_vehicles" on public.vehicles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete_own_vehicles" on public.vehicles;
create policy "delete_own_vehicles" on public.vehicles
  for delete using (auth.uid() = user_id);

-- ─── 2) Índices de multi-tenancy e verificação ──────────────────────────────
create index if not exists idx_vehicles_tenant_id
  on public.vehicles (tenant_id) where tenant_id is not null;

create index if not exists idx_inspections_tenant_id
  on public.vehicle_inspections (tenant_id) where tenant_id is not null;

create index if not exists idx_report_hashes_user_id
  on public.report_hashes (user_id) where user_id is not null;

create index if not exists idx_report_hashes_plate
  on public.report_hashes (plate) where plate is not null;

create index if not exists idx_audit_log_tenant_id
  on public.audit_log (tenant_id) where tenant_id is not null;
