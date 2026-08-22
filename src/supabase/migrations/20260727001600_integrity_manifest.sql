-- Integrity-v2 layered SHA-256 manifest alongside existing v1 hash PK.
-- Additive only: PK `hash` (32-hex QR /verify key) is unchanged.

alter table report_hashes add column if not exists integrity_scheme text default '';
alter table report_hashes add column if not exists integrity_manifest jsonb;
alter table report_hashes add column if not exists final_hash text default '';

-- Allow the authenticated author to backfill pdf_hash after PDF bytes exist.
drop policy if exists "update_own_hash" on report_hashes;
create policy "update_own_hash" on report_hashes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
