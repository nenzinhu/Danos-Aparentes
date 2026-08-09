-- FASE 5: ai_decisions — AI suggestion trail with immutable original payload.
-- Additive only. Human decision fills later; original_* never overwritten.

CREATE TABLE IF NOT EXISTS public.ai_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inspection_id text,
  damage_id text,
  part_name text,
  model text NOT NULL,
  model_version text NOT NULL DEFAULT '',
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  suggested_type text NOT NULL,
  suggested_severity text NOT NULL,
  suggested_description text NOT NULL DEFAULT '',
  confidence double precision,
  original_payload jsonb NOT NULL,
  human_decision text
    CHECK (human_decision IS NULL OR human_decision IN ('accept', 'edit', 'ignore')),
  human_type text,
  human_severity text,
  human_description text,
  final_type text,
  final_severity text,
  final_description text,
  decided_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_decisions_user_created
  ON public.ai_decisions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_decisions_inspection
  ON public.ai_decisions (inspection_id)
  WHERE inspection_id IS NOT NULL;

ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own_ai_decisions" ON public.ai_decisions;
CREATE POLICY "insert_own_ai_decisions" ON public.ai_decisions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_ai_decisions" ON public.ai_decisions;
CREATE POLICY "select_own_ai_decisions" ON public.ai_decisions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ai_decisions" ON public.ai_decisions;
CREATE POLICY "update_own_ai_decisions" ON public.ai_decisions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Block mutation of frozen original / suggestion columns.
CREATE OR REPLACE FUNCTION public.prevent_ai_decision_original_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.original_payload IS DISTINCT FROM OLD.original_payload
     OR NEW.suggested_type IS DISTINCT FROM OLD.suggested_type
     OR NEW.suggested_severity IS DISTINCT FROM OLD.suggested_severity
     OR NEW.suggested_description IS DISTINCT FROM OLD.suggested_description
     OR NEW.model IS DISTINCT FROM OLD.model
     OR NEW.model_version IS DISTINCT FROM OLD.model_version
     OR NEW.analyzed_at IS DISTINCT FROM OLD.analyzed_at
     OR NEW.confidence IS DISTINCT FROM OLD.confidence
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
  THEN
    RAISE EXCEPTION 'ai_decisions original suggestion columns are immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_ai_decision_original_mutation ON public.ai_decisions;
CREATE TRIGGER trg_prevent_ai_decision_original_mutation
  BEFORE UPDATE ON public.ai_decisions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_ai_decision_original_mutation();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_team_manager_of'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "manager_select_team_ai_decisions" ON public.ai_decisions';
    EXECUTE $pol$
      CREATE POLICY "manager_select_team_ai_decisions" ON public.ai_decisions
        FOR SELECT
        USING (public.is_team_manager_of(user_id))
    $pol$;
  END IF;
END $$;
