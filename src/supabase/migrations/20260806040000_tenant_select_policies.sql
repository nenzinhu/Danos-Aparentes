-- SELECT aditivo por tenant (preserva solo: tenant_id IS NULL + user_id = auth.uid()).
-- Não remove policies existentes de "own" / manager.

CREATE OR REPLACE FUNCTION public.is_member_of_tenant(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    p_tenant_id IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.companies c
        WHERE c.id = p_tenant_id AND c.owner_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.company_id = p_tenant_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'accepted'
      )
    );
$$;

-- vehicle_inspections
DROP POLICY IF EXISTS "select_tenant_inspections" ON public.vehicle_inspections;
CREATE POLICY "select_tenant_inspections" ON public.vehicle_inspections
  FOR SELECT USING (
    (tenant_id IS NOT NULL AND public.is_member_of_tenant(tenant_id))
    OR (tenant_id IS NULL AND user_id = auth.uid())
  );

-- audit_log
DROP POLICY IF EXISTS "select_tenant_audit_events" ON public.audit_log;
CREATE POLICY "select_tenant_audit_events" ON public.audit_log
  FOR SELECT USING (
    (tenant_id IS NOT NULL AND public.is_member_of_tenant(tenant_id))
    OR (tenant_id IS NULL AND user_id = auth.uid())
  );

-- audit_anchors
DROP POLICY IF EXISTS "select_tenant_audit_anchors" ON public.audit_anchors;
CREATE POLICY "select_tenant_audit_anchors" ON public.audit_anchors
  FOR SELECT USING (
    (tenant_id IS NOT NULL AND public.is_member_of_tenant(tenant_id))
    OR (tenant_id IS NULL AND user_id = auth.uid())
  );

-- vehicles already has team_select_tenant_vehicles; ensure solo path explicit
DROP POLICY IF EXISTS "select_solo_null_tenant_vehicles" ON public.vehicles;
CREATE POLICY "select_solo_null_tenant_vehicles" ON public.vehicles
  FOR SELECT USING (tenant_id IS NULL AND user_id = auth.uid());
