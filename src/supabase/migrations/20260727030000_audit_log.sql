-- FASE 3: append-only audit_log with per-inspection (or global) hash chain.
-- Additive only (IF NOT EXISTS). Does not claim legal validity.

CREATE TABLE IF NOT EXISTS public.audit_log (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id text,
  tenant_id uuid,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id text NOT NULL,
  actor_type text NOT NULL DEFAULT 'user'
    CHECK (actor_type IN ('user', 'system', 'service')),
  event_type text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  ip text,
  user_agent text,
  device_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  previous_event_hash text NOT NULL DEFAULT '',
  event_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_inspection_ts
  ON public.audit_log (inspection_id, timestamp ASC, event_id ASC)
  WHERE inspection_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_global_ts
  ON public.audit_log (timestamp ASC, event_id ASC)
  WHERE inspection_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_user_ts
  ON public.audit_log (user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_event_type
  ON public.audit_log (event_type);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Owner can insert own events.
DROP POLICY IF EXISTS "insert_own_audit_events" ON public.audit_log;
CREATE POLICY "insert_own_audit_events" ON public.audit_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owner can read own events.
DROP POLICY IF EXISTS "select_own_audit_events" ON public.audit_log;
CREATE POLICY "select_own_audit_events" ON public.audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Company owner (manager) can read team members' events when team helpers exist.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_team_manager_of'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "manager_select_team_audit_events" ON public.audit_log';
    EXECUTE $pol$
      CREATE POLICY "manager_select_team_audit_events" ON public.audit_log
        FOR SELECT
        USING (public.is_team_manager_of(user_id))
    $pol$;
  END IF;
END $$;

-- No UPDATE / DELETE policies for authenticated clients.
-- Trigger hard-blocks mutations even for roles that bypass RLS incompletely.
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only — UPDATE/DELETE not allowed';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_update ON public.audit_log;
CREATE TRIGGER trg_prevent_audit_log_update
  BEFORE UPDATE ON public.audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_mutation();

DROP TRIGGER IF EXISTS trg_prevent_audit_log_delete ON public.audit_log;
CREATE TRIGGER trg_prevent_audit_log_delete
  BEFORE DELETE ON public.audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_mutation();
