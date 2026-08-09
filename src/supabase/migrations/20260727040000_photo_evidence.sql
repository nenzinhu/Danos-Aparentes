-- FASE 4: photo_evidence — ORIGINAL bytes metadata (cloud).
-- Additive only. Binary originals may live in Storage; this table holds
-- evidence metadata + SHA-256. Optimized display paths stay in damage-photos.
-- Does not backfill legacy photos (deferred).

CREATE TABLE IF NOT EXISTS public.photo_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id text,
  damage_id text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mime_type text NOT NULL DEFAULT 'image/jpeg',
  byte_size bigint NOT NULL DEFAULT 0,
  width integer,
  height integer,
  sha256 text NOT NULL,
  optimized_sha256 text,
  optimized_storage_path text,
  original_storage_path text,
  captured_at timestamptz NOT NULL DEFAULT now(),
  gps_lat double precision,
  gps_lng double precision,
  gps_accuracy double precision,
  device text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photo_evidence_inspection
  ON public.photo_evidence (inspection_id)
  WHERE inspection_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_photo_evidence_user
  ON public.photo_evidence (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_photo_evidence_sha256
  ON public.photo_evidence (sha256);

ALTER TABLE public.photo_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own_photo_evidence" ON public.photo_evidence;
CREATE POLICY "insert_own_photo_evidence" ON public.photo_evidence
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_photo_evidence" ON public.photo_evidence;
CREATE POLICY "select_own_photo_evidence" ON public.photo_evidence
  FOR SELECT
  USING (auth.uid() = user_id);

-- Owner can update metadata paths after dual upload; never delete via client
-- (evidence retention). Soft-delete / admin purge = later phase.
DROP POLICY IF EXISTS "update_own_photo_evidence" ON public.photo_evidence;
CREATE POLICY "update_own_photo_evidence" ON public.photo_evidence
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_team_manager_of'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "manager_select_team_photo_evidence" ON public.photo_evidence';
    EXECUTE $pol$
      CREATE POLICY "manager_select_team_photo_evidence" ON public.photo_evidence
        FOR SELECT
        USING (public.is_team_manager_of(user_id))
    $pol$;
  END IF;
END $$;
