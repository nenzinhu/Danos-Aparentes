-- Migration: colunas e objetos adicionados em fases após o schema base.
-- Aplicada por `npm run db:push` após schema.sql, em ordem de nome.
-- Idempotente: todos os comandos usam IF NOT EXISTS / IF EXISTS.

-- ─── FASE 2: lineage de correções em vehicle_inspections ─────────────────────
-- (colunas já incluídas no CREATE TABLE do schema base; estes ALTER são
--  guardados aqui para bancos criados antes da FASE 2)
alter table vehicle_inspections add column if not exists public_code text default '';
alter table vehicle_inspections add column if not exists laudo_version int default 1;
alter table vehicle_inspections add column if not exists parent_inspection_id text;
alter table vehicle_inspections add column if not exists correction_reason text default '';
alter table vehicle_inspections add column if not exists corrected_by uuid;
alter table vehicle_inspections add column if not exists corrected_at timestamptz;
alter table vehicle_inspections add column if not exists issued_at timestamptz;
alter table vehicle_inspections add column if not exists issued_hash text default '';

alter table vehicle_inspections drop constraint if exists vehicle_inspections_status_check;
alter table vehicle_inspections
  add constraint vehicle_inspections_status_check
  check (status in ('draft', 'complete', 'issued', 'superseded', 'cancelled'));

create index if not exists idx_vehicle_inspections_parent
  on vehicle_inspections (parent_inspection_id)
  where parent_inspection_id is not null;

-- ─── FASE 2: campos de localização em report_hashes ─────────────────────────
alter table report_hashes add column if not exists geo_lat double precision;
alter table report_hashes add column if not exists geo_lng double precision;
alter table report_hashes add column if not exists geo_accuracy int;
alter table report_hashes add column if not exists geo_address text;

-- ─── FASE 3: nome e logo da empresa no recibo público ────────────────────────
alter table report_hashes add column if not exists company_name text default '';
alter table report_hashes add column if not exists company_logo text default '';

-- ─── FASE 4: versionamento de laudos (report_key / version) ─────────────────
-- Agrupa reemissões do mesmo laudo; sem isso reemitir criava hash desvinculado.
alter table report_hashes add column if not exists report_key text default '';
alter table report_hashes add column if not exists version int default 1;
create index if not exists report_hashes_report_key_idx on report_hashes (report_key, version);

-- ─── FASE 5: integrity-v2 (manifest SHA-256 em camadas) ─────────────────────
alter table report_hashes add column if not exists integrity_scheme text default '';
alter table report_hashes add column if not exists integrity_manifest jsonb;
alter table report_hashes add column if not exists final_hash text default '';

-- ─── FASE 6: lineage de correção no recibo público ──────────────────────────
alter table report_hashes add column if not exists correction_reason text default '';
alter table report_hashes add column if not exists supersedes_hash text default '';
alter table report_hashes add column if not exists inspection_id text default '';
alter table report_hashes add column if not exists public_code text default '';

-- ─── Optimized RLS policies (subquery em vez de chamada de função por linha) ──
-- Substitui as policies escalares do schema base por versões com (select auth.uid())
-- que o planner executa uma vez por query em vez de por linha.

do $$
begin
  drop policy if exists "select_own_inspections" on public.vehicle_inspections;
  create policy "select_own_inspections" on public.vehicle_inspections
    for select using ((select auth.uid()) = user_id);

  drop policy if exists "update_own_inspections" on public.vehicle_inspections;
  create policy "update_own_inspections" on public.vehicle_inspections
    for update using ((select auth.uid()) = user_id);

  drop policy if exists "delete_own_inspections" on public.vehicle_inspections;
  create policy "delete_own_inspections" on public.vehicle_inspections
    for delete using ((select auth.uid()) = user_id);

  drop policy if exists "select_own_damages" on public.damages;
  create policy "select_own_damages" on public.damages
    for select using ((select auth.uid()) = user_id);

  drop policy if exists "update_own_damages" on public.damages;
  create policy "update_own_damages" on public.damages
    for update using ((select auth.uid()) = user_id);

  drop policy if exists "delete_own_damages" on public.damages;
  create policy "delete_own_damages" on public.damages
    for delete using ((select auth.uid()) = user_id);
end $$;

-- ─── Índices adicionais de performance ───────────────────────────────────────
create index if not exists idx_inspections_user_updated
  on public.vehicle_inspections (user_id, updated_at desc);

create index if not exists idx_vehicle_inspections_plate_user
  on public.vehicle_inspections (user_id, plate);
