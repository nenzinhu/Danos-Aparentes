-- 1. SQL Validation Triggers

-- Plate validation: Ensure 'plate' follows a basic Brazilian format (AAA0A00 or AAA0000)
-- Based on cleaned input (7 characters, no hyphens)
CREATE OR REPLACE FUNCTION public.validate_plate()
RETURNS TRIGGER AS $$
BEGIN
  -- Regex matches:
  -- 3 Letters [A-Z]{3}
  -- 1 Digit [0-9]
  -- 1 Letter or Digit [A-Z0-9] (Mercosul uses letter, old uses digit)
  -- 2 Digits [0-9]{2}
  IF NEW.plate !~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$' THEN
    RAISE EXCEPTION 'Invalid Brazilian plate format. Expected AAA0A00 or AAA0000.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_plate_trigger ON public.vehicle_inspections;
CREATE TRIGGER validate_plate_trigger
BEFORE INSERT OR UPDATE ON public.vehicle_inspections
FOR EACH ROW EXECUTE FUNCTION public.validate_plate();


-- Date validation: Ensure 'updated_at' is not in the future
-- Note: 'updated_at' in this app is stored as milliseconds (numeric)
CREATE OR REPLACE FUNCTION public.validate_not_future_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.updated_at > EXTRACT(EPOCH FROM NOW()) * 1000 THEN
    RAISE EXCEPTION 'Update date cannot be in the future.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vehicle_inspections
DROP TRIGGER IF EXISTS validate_date_inspections_trigger ON public.vehicle_inspections;
CREATE TRIGGER validate_date_inspections_trigger
BEFORE INSERT OR UPDATE ON public.vehicle_inspections
FOR EACH ROW EXECUTE FUNCTION public.validate_not_future_date();

-- Trigger for damages
DROP TRIGGER IF EXISTS validate_date_damages_trigger ON public.damages;
CREATE TRIGGER validate_date_damages_trigger
BEFORE INSERT OR UPDATE ON public.damages
FOR EACH ROW EXECUTE FUNCTION public.validate_not_future_date();


-- 2. Error Logging Table

CREATE TABLE IF NOT EXISTS public.sync_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  error_message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sync_errors ENABLE ROW LEVEL SECURITY;

-- Policies using subqueries for auth.uid() as per Best Practices
DROP POLICY IF EXISTS "Users can view their own sync errors" ON public.sync_errors;
CREATE POLICY "Users can view their own sync errors"
ON public.sync_errors
FOR SELECT
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own sync errors" ON public.sync_errors;
CREATE POLICY "Users can insert their own sync errors"
ON public.sync_errors
FOR INSERT
WITH CHECK (user_id = (SELECT auth.uid()));


-- 3. Storage Policy Audit
-- Review and ensure users can only access their own folders in 'damage-photos' bucket.
-- Folder name matches user_id.

-- Ensure the bucket exists (this might fail if already created via UI, so we catch or just assume)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('damage-photos', 'damage-photos', false)
-- ON CONFLICT (id) DO NOTHING;

-- SELECT: Users can only see objects in their own folder
DROP POLICY IF EXISTS "Users can view their own damage photos" ON storage.objects;
CREATE POLICY "Users can view their own damage photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'damage-photos' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- INSERT: Users can only upload to their own folder
DROP POLICY IF EXISTS "Users can upload their own damage photos" ON storage.objects;
CREATE POLICY "Users can upload their own damage photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'damage-photos' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- UPDATE: Users can only update objects in their own folder
DROP POLICY IF EXISTS "Users can update their own damage photos" ON storage.objects;
CREATE POLICY "Users can update their own damage photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'damage-photos' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- DELETE: Users can only delete objects in their own folder
DROP POLICY IF EXISTS "Users can delete their own damage photos" ON storage.objects;
CREATE POLICY "Users can delete their own damage photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'damage-photos' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
