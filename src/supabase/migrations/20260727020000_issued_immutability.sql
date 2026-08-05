-- FASE 2: imutabilidade de laudos emitidos + metadados de correção/versionamento.
-- Additive only (IF NOT EXISTS). Does not claim legal validity.

-- Expand status domain (keep draft/complete for backwards compat).
ALTER TABLE public.vehicle_inspections
  DROP CONSTRAINT IF EXISTS vehicle_inspections_status_check;

ALTER TABLE public.vehicle_inspections
  ADD CONSTRAINT vehicle_inspections_status_check
  CHECK (status IN ('draft', 'complete', 'issued', 'superseded', 'cancelled'));

ALTER TABLE public.vehicle_inspections
  ADD COLUMN IF NOT EXISTS public_code text DEFAULT '',
  ADD COLUMN IF NOT EXISTS laudo_version int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_inspection_id text,
  ADD COLUMN IF NOT EXISTS correction_reason text DEFAULT '',
  ADD COLUMN IF NOT EXISTS corrected_by uuid,
  ADD COLUMN IF NOT EXISTS corrected_at timestamptz,
  ADD COLUMN IF NOT EXISTS issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS issued_hash text DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_parent
  ON public.vehicle_inspections (parent_inspection_id)
  WHERE parent_inspection_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_public_code
  ON public.vehicle_inspections (public_code)
  WHERE public_code IS NOT NULL AND public_code <> '';

-- Correction / lineage metadata on the public verify receipt (report_hashes).
ALTER TABLE public.report_hashes
  ADD COLUMN IF NOT EXISTS correction_reason text DEFAULT '',
  ADD COLUMN IF NOT EXISTS supersedes_hash text DEFAULT '',
  ADD COLUMN IF NOT EXISTS inspection_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS public_code text DEFAULT '';

-- Block destructive updates to issued / superseded / cancelled snapshots.
-- Allowed: status transition issued → superseded (and writing correction metadata
-- on that transition). Content columns (owner, plate, signatures, geo, …) stay frozen.
CREATE OR REPLACE FUNCTION public.prevent_issued_inspection_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IN ('issued', 'superseded', 'cancelled') THEN
    IF OLD.status = 'issued' AND NEW.status = 'superseded' THEN
      -- Allow lock release to superseded; freeze content fields.
      IF NEW.owner IS DISTINCT FROM OLD.owner
         OR NEW.phone IS DISTINCT FROM OLD.phone
         OR NEW.brand IS DISTINCT FROM OLD.brand
         OR NEW.plate IS DISTINCT FROM OLD.plate
         OR NEW.general_notes IS DISTINCT FROM OLD.general_notes
         OR NEW.ref IS DISTINCT FROM OLD.ref
         OR NEW.inspector_signature IS DISTINCT FROM OLD.inspector_signature
         OR NEW.client_signature IS DISTINCT FROM OLD.client_signature
         OR NEW.geo_lat IS DISTINCT FROM OLD.geo_lat
         OR NEW.geo_lng IS DISTINCT FROM OLD.geo_lng
         OR NEW.issued_hash IS DISTINCT FROM OLD.issued_hash
         OR NEW.public_code IS DISTINCT FROM OLD.public_code
         OR NEW.laudo_version IS DISTINCT FROM OLD.laudo_version
         OR NEW.parent_inspection_id IS DISTINCT FROM OLD.parent_inspection_id
      THEN
        RAISE EXCEPTION 'issued inspection content is immutable (only status→superseded allowed)';
      END IF;
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'inspection status % is immutable — create a correction (new version)', OLD.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_issued_inspection_mutation ON public.vehicle_inspections;
CREATE TRIGGER trg_prevent_issued_inspection_mutation
  BEFORE UPDATE ON public.vehicle_inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_issued_inspection_mutation();

-- Damages belonging to a locked inspection cannot be inserted/updated/deleted.
CREATE OR REPLACE FUNCTION public.prevent_issued_damage_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_status text;
  v_inspection_id text;
BEGIN
  v_inspection_id := COALESCE(NEW.inspection_id, OLD.inspection_id);
  SELECT status INTO v_status
    FROM public.vehicle_inspections
   WHERE id = v_inspection_id;

  IF v_status IN ('issued', 'superseded', 'cancelled') THEN
    RAISE EXCEPTION 'damages of % inspection % are immutable', v_status, v_inspection_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_issued_damage_mutation ON public.damages;
CREATE TRIGGER trg_prevent_issued_damage_mutation
  BEFORE INSERT OR UPDATE OR DELETE ON public.damages
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_issued_damage_mutation();
