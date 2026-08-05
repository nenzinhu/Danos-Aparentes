-- FASE 6: review gate before issue (human checkpoint).
-- Additive only. Does not claim legal validity.

ALTER TABLE public.vehicle_inspections
  ADD COLUMN IF NOT EXISTS reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS review_content_hash text DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_reviewed_at
  ON public.vehicle_inspections (reviewed_at)
  WHERE reviewed_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.prevent_issue_without_review()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'issued'
     AND (OLD.status IS DISTINCT FROM 'issued')
     AND OLD.reviewed_at IS NULL THEN
    RAISE EXCEPTION 'inspection cannot be issued without human review (reviewed_at required)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_issue_without_review ON public.vehicle_inspections;
CREATE TRIGGER trg_prevent_issue_without_review
  BEFORE UPDATE ON public.vehicle_inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_issue_without_review();
