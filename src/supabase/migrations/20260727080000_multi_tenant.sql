-- FASE 12: tenant_id = companies.id (corporativo workspace). Solo users keep NULL.

ALTER TABLE public.vehicle_inspections
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

ALTER TABLE public.report_hashes
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_tenant
  ON public.vehicle_inspections (tenant_id)
  WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_report_hashes_tenant
  ON public.report_hashes (tenant_id)
  WHERE tenant_id IS NOT NULL;

-- Backfill from accepted team membership, then company owner.
UPDATE public.vehicle_inspections vi
SET tenant_id = tm.company_id
FROM public.team_members tm
WHERE tm.user_id = vi.user_id
  AND tm.status = 'accepted'
  AND vi.tenant_id IS NULL;

UPDATE public.vehicle_inspections vi
SET tenant_id = c.id
FROM public.companies c
WHERE c.owner_id = vi.user_id
  AND vi.tenant_id IS NULL;

UPDATE public.report_hashes rh
SET tenant_id = tm.company_id
FROM public.team_members tm
WHERE tm.user_id = rh.user_id
  AND tm.status = 'accepted'
  AND rh.tenant_id IS NULL;

UPDATE public.report_hashes rh
SET tenant_id = c.id
FROM public.companies c
WHERE c.owner_id = rh.user_id
  AND rh.tenant_id IS NULL;

UPDATE public.audit_log al
SET tenant_id = tm.company_id
FROM public.team_members tm
WHERE tm.user_id = al.user_id
  AND tm.status = 'accepted'
  AND al.tenant_id IS NULL;

UPDATE public.audit_log al
SET tenant_id = c.id
FROM public.companies c
WHERE c.owner_id = al.user_id
  AND al.tenant_id IS NULL;
