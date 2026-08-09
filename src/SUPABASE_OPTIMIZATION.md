# Postgres Optimization Report (AvariasAPARENTES-PWA)

This audit applies guidelines from the **Postgres Best Practices** skill to the current Supabase schema.

## 1. RLS Policy Optimization (Critical)
**Impact:** ~100x faster RLS checks on large tables.

The current policies use `auth.uid() = user_id`. Postgres calls `auth.uid()` for every single row scanned. By wrapping it in a subquery, we ensure it's called once and cached for the duration of the query.

### Recommended Change
Replace:
```sql
create policy "select_own_inspections" on vehicle_inspections for select using (auth.uid() = user_id);
```
With:
```sql
create policy "select_own_inspections" on vehicle_inspections for select using ((select auth.uid()) = user_id);
```

## 2. Composite Indexes (High)
**Impact:** Faster dashboard loading and filtering.

The app frequently fetches inspections for a specific user, sorted by date. A composite index is more efficient than two separate indexes.

### Recommended Index
```sql
CREATE INDEX IF NOT EXISTS idx_inspections_user_updated 
ON public.vehicle_inspections (user_id, updated_at DESC);
```

## 3. Foreign Key Indexing (High)
**Impact:** Prevents sequential scans during joins and deletions.

The `damages` table is linked to `vehicle_inspections`. While an index on `inspection_id` exists, we should ensure the `user_id` column used in RLS is also indexed (which it is).

## 4. Query Plan Hygiene
Ensure all `UPDATE` policies also have a matching `SELECT` policy (Postgres requirement for visibility during update).

---

## SQL Optimization Script

```sql
-- 1. Optimize RLS Policies (Performance)
DO $$ 
BEGIN
  -- vehicle_inspections
  DROP POLICY IF EXISTS "select_own_inspections" ON vehicle_inspections;
  CREATE POLICY "select_own_inspections" ON vehicle_inspections FOR SELECT USING ((SELECT auth.uid()) = user_id);
  
  DROP POLICY IF EXISTS "update_own_inspections" ON vehicle_inspections;
  CREATE POLICY "update_own_inspections" ON vehicle_inspections FOR UPDATE USING ((SELECT auth.uid()) = user_id);

  DROP POLICY IF EXISTS "delete_own_inspections" ON vehicle_inspections;
  CREATE POLICY "delete_own_inspections" ON vehicle_inspections FOR DELETE USING ((SELECT auth.uid()) = user_id);

  -- damages
  DROP POLICY IF EXISTS "select_own_damages" ON damages;
  CREATE POLICY "select_own_damages" ON damages FOR SELECT USING ((SELECT auth.uid()) = user_id);

  DROP POLICY IF EXISTS "update_own_damages" ON damages;
  CREATE POLICY "update_own_damages" ON damages FOR UPDATE USING ((SELECT auth.uid()) = user_id);

  DROP POLICY IF EXISTS "delete_own_damages" ON damages;
  CREATE POLICY "delete_own_damages" ON damages FOR DELETE USING ((SELECT auth.uid()) = user_id);
END $$;

-- 2. Advanced Indexing
-- Faster user listing sorted by update date
CREATE INDEX IF NOT EXISTS idx_inspections_user_updated ON public.vehicle_inspections (user_id, updated_at DESC);

-- Faster search by plate (case-insensitive if needed, but here simple)
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_plate_user ON public.vehicle_inspections (user_id, plate);

-- 3. Maintenance
ANALYZE vehicle_inspections;
ANALYZE damages;
```
