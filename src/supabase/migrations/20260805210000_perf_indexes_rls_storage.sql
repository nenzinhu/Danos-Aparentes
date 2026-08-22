-- Performance pass (supabase-postgres-best-practices):
-- 1) Index missing FK columns (CASCADE / JOINs)
-- 2) Composite / partial indexes for hot filters
-- 3) RLS: wrap auth.uid() in (select …) so it is evaluated once
-- 4) Storage: keep photos private; allow high-quality originals (no quality downgrade)
-- 5) Helpers: cache auth.uid() inside security-definer checks
-- Does NOT store photo bytes in Postgres — only Storage paths + metadata.

-- ─── Extensions (monitoring) ─────────────────────────────────────────────────
create extension if not exists pg_stat_statements;

-- ─── Missing FK indexes ──────────────────────────────────────────────────────
create index if not exists idx_ai_decisions_decided_by
  on public.ai_decisions (decided_by)
  where decided_by is not null;

create index if not exists idx_inspection_comparison_decisions_user
  on public.inspection_comparison_decisions (user_id);

create index if not exists idx_inspection_comparisons_tenant
  on public.inspection_comparisons (tenant_id)
  where tenant_id is not null;

create index if not exists idx_report_hashes_user
  on public.report_hashes (user_id);

create index if not exists idx_sync_errors_user
  on public.sync_errors (user_id);

create index if not exists idx_vehicle_inspections_reviewer
  on public.vehicle_inspections (reviewer_id)
  where reviewer_id is not null;

-- ─── Hot-path composites / partials ──────────────────────────────────────────
create index if not exists idx_vehicle_inspections_user_status_updated
  on public.vehicle_inspections (user_id, status, updated_at desc);

create index if not exists idx_vehicle_inspections_active_drafts
  on public.vehicle_inspections (user_id, updated_at desc)
  where status = 'draft';

create index if not exists idx_damages_inspection_view
  on public.damages (inspection_id, view);

create index if not exists idx_photo_evidence_damage
  on public.photo_evidence (damage_id)
  where damage_id is not null;

create index if not exists idx_ai_decisions_damage
  on public.ai_decisions (damage_id)
  where damage_id is not null;

create index if not exists idx_team_members_user_company_accepted
  on public.team_members (user_id, company_id)
  where status = 'accepted';

create index if not exists idx_team_members_company_accepted
  on public.team_members (company_id, user_id)
  where status = 'accepted';

-- ─── Helper: auth.uid() once inside security definer ─────────────────────────
create or replace function public.is_team_manager_of(p_report_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
  select exists (
    select 1
    from public.team_members tm
    join public.companies c on c.id = tm.company_id
    where tm.user_id = p_report_user_id
      and tm.status = 'accepted'
      and c.owner_id = (select auth.uid())
  );
$$;

create or replace function public.user_has_active_subscription(p_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_status text;
  v_trial_ends_at timestamptz;
  v_expires_at timestamptz;
begin
  select status, trial_ends_at, expires_at
    into v_status, v_trial_ends_at, v_expires_at
  from public.subscriptions
  where user_id = p_user_id;

  if not found then
    return false;
  end if;

  if v_status = 'active' then
    return true;
  end if;

  if v_status = 'active_pix' and v_expires_at is not null and v_expires_at > now() then
    return true;
  end if;

  if v_status = 'trialing' and v_trial_ends_at > now() then
    return true;
  end if;

  return false;
end;
$$;

-- ─── RLS: (select auth.uid()) pattern on remaining tables ────────────────────
do $$
begin
  -- ai_decisions
  drop policy if exists "insert_own_ai_decisions" on public.ai_decisions;
  create policy "insert_own_ai_decisions" on public.ai_decisions
    for insert with check ((select auth.uid()) = user_id);

  drop policy if exists "select_own_ai_decisions" on public.ai_decisions;
  create policy "select_own_ai_decisions" on public.ai_decisions
    for select using ((select auth.uid()) = user_id);

  drop policy if exists "update_own_ai_decisions" on public.ai_decisions;
  create policy "update_own_ai_decisions" on public.ai_decisions
    for update
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

  -- audit_log
  drop policy if exists "insert_own_audit_events" on public.audit_log;
  create policy "insert_own_audit_events" on public.audit_log
    for insert with check ((select auth.uid()) = user_id);

  drop policy if exists "select_own_audit_events" on public.audit_log;
  create policy "select_own_audit_events" on public.audit_log
    for select using ((select auth.uid()) = user_id);

  -- photo_evidence
  drop policy if exists "insert_own_photo_evidence" on public.photo_evidence;
  create policy "insert_own_photo_evidence" on public.photo_evidence
    for insert with check ((select auth.uid()) = user_id);

  drop policy if exists "select_own_photo_evidence" on public.photo_evidence;
  create policy "select_own_photo_evidence" on public.photo_evidence
    for select using ((select auth.uid()) = user_id);

  drop policy if exists "update_own_photo_evidence" on public.photo_evidence;
  create policy "update_own_photo_evidence" on public.photo_evidence
    for update
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

  -- vehicles
  drop policy if exists "select_own_vehicles" on public.vehicles;
  create policy "select_own_vehicles" on public.vehicles
    for select using ((select auth.uid()) = user_id);

  drop policy if exists "insert_own_vehicles" on public.vehicles;
  create policy "insert_own_vehicles" on public.vehicles
    for insert with check ((select auth.uid()) = user_id);

  drop policy if exists "update_own_vehicles" on public.vehicles;
  create policy "update_own_vehicles" on public.vehicles
    for update
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

  drop policy if exists "team_select_tenant_vehicles" on public.vehicles;
  create policy "team_select_tenant_vehicles" on public.vehicles
    for select using (
      tenant_id is not null
      and exists (
        select 1 from public.team_members tm
        where tm.user_id = (select auth.uid())
          and tm.company_id = vehicles.tenant_id
          and tm.status = 'accepted'
      )
    );

  -- inspection_comparisons
  drop policy if exists "select_own_comparisons" on public.inspection_comparisons;
  create policy "select_own_comparisons" on public.inspection_comparisons
    for select using ((select auth.uid()) = user_id);

  drop policy if exists "insert_own_comparisons" on public.inspection_comparisons;
  create policy "insert_own_comparisons" on public.inspection_comparisons
    for insert with check ((select auth.uid()) = user_id);

  drop policy if exists "update_own_comparisons" on public.inspection_comparisons;
  create policy "update_own_comparisons" on public.inspection_comparisons
    for update
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

  -- inspection_comparison_decisions
  drop policy if exists "select_own_comparison_decisions" on public.inspection_comparison_decisions;
  create policy "select_own_comparison_decisions" on public.inspection_comparison_decisions
    for select using ((select auth.uid()) = user_id);

  drop policy if exists "insert_own_comparison_decisions" on public.inspection_comparison_decisions;
  create policy "insert_own_comparison_decisions" on public.inspection_comparison_decisions
    for insert with check ((select auth.uid()) = user_id);

  drop policy if exists "update_own_comparison_decisions" on public.inspection_comparison_decisions;
  create policy "update_own_comparison_decisions" on public.inspection_comparison_decisions
    for update
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

  -- vehicle_qr_tokens
  drop policy if exists "owner_manages_own_qr_tokens" on public.vehicle_qr_tokens;
  create policy "owner_manages_own_qr_tokens" on public.vehicle_qr_tokens
    for all
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

  -- subscriptions
  drop policy if exists "select_own_subscription" on public.subscriptions;
  create policy "select_own_subscription" on public.subscriptions
    for select using ((select auth.uid()) = user_id);
end $$;

-- ─── Storage: private buckets, high-quality originals allowed ────────────────
-- Photos stay in Storage (not bytea). Limit ~20MB keeps originals usable.
update storage.buckets
set
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
where id in ('damage-photos', 'document-photos');

-- document-photos RLS: auth.uid() once
do $$
begin
  drop policy if exists "select_own_document_photos" on storage.objects;
  create policy "select_own_document_photos" on storage.objects
    for select using (
      bucket_id = 'document-photos'
      and (storage.foldername(name))[1] = ((select auth.uid())::text)
    );

  drop policy if exists "insert_own_document_photos" on storage.objects;
  create policy "insert_own_document_photos" on storage.objects
    for insert with check (
      bucket_id = 'document-photos'
      and (storage.foldername(name))[1] = ((select auth.uid())::text)
    );

  drop policy if exists "delete_own_document_photos" on storage.objects;
  create policy "delete_own_document_photos" on storage.objects
    for delete using (
      bucket_id = 'document-photos'
      and (storage.foldername(name))[1] = ((select auth.uid())::text)
    );
end $$;

-- ─── Planner stats ───────────────────────────────────────────────────────────
analyze public.vehicle_inspections;
analyze public.damages;
analyze public.photo_evidence;
analyze public.ai_decisions;
analyze public.vehicles;
analyze public.audit_log;
analyze public.team_members;
analyze public.subscriptions;
analyze public.inspection_comparisons;
analyze public.inspection_comparison_decisions;
analyze public.report_hashes;
analyze public.sync_errors;
