-- FASE 11: persistência de comparações derivadas (não muta laudos issued).

CREATE TABLE IF NOT EXISTS public.inspection_comparisons (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  vehicle_id text REFERENCES public.vehicles(id) ON DELETE SET NULL,
  previous_inspection_id text NOT NULL,
  current_inspection_id text NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inspection_comparisons_distinct_pair
    CHECK (previous_inspection_id <> current_inspection_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inspection_comparisons_pair
  ON public.inspection_comparisons (user_id, previous_inspection_id, current_inspection_id);

CREATE INDEX IF NOT EXISTS idx_inspection_comparisons_vehicle
  ON public.inspection_comparisons (vehicle_id, created_at DESC)
  WHERE vehicle_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.inspection_comparison_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id text NOT NULL REFERENCES public.inspection_comparisons(id) ON DELETE CASCADE,
  identity_key text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('accept', 'edit', 'ignore')),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  justification text,
  category text,
  decided_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comparison_id, identity_key)
);

CREATE INDEX IF NOT EXISTS idx_comparison_decisions_comparison
  ON public.inspection_comparison_decisions (comparison_id);

ALTER TABLE public.inspection_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_comparison_decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_comparisons" ON public.inspection_comparisons;
CREATE POLICY "select_own_comparisons" ON public.inspection_comparisons
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_comparisons" ON public.inspection_comparisons;
CREATE POLICY "insert_own_comparisons" ON public.inspection_comparisons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_comparisons" ON public.inspection_comparisons;
CREATE POLICY "update_own_comparisons" ON public.inspection_comparisons
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_comparison_decisions" ON public.inspection_comparison_decisions;
CREATE POLICY "select_own_comparison_decisions" ON public.inspection_comparison_decisions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_comparison_decisions" ON public.inspection_comparison_decisions;
CREATE POLICY "insert_own_comparison_decisions" ON public.inspection_comparison_decisions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_comparison_decisions" ON public.inspection_comparison_decisions;
CREATE POLICY "update_own_comparison_decisions" ON public.inspection_comparison_decisions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_team_manager_of'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "manager_select_team_comparisons" ON public.inspection_comparisons';
    EXECUTE $pol$
      CREATE POLICY "manager_select_team_comparisons" ON public.inspection_comparisons
        FOR SELECT USING (public.is_team_manager_of(user_id))
    $pol$;
    EXECUTE 'DROP POLICY IF EXISTS "manager_select_team_comparison_decisions" ON public.inspection_comparison_decisions';
    EXECUTE $pol$
      CREATE POLICY "manager_select_team_comparison_decisions" ON public.inspection_comparison_decisions
        FOR SELECT USING (public.is_team_manager_of(user_id))
    $pol$;
  END IF;
END $$;
