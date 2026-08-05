-- FASE 19: tenant-scoped audit dashboard queries (ops readiness)

CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_ts
  ON public.audit_log (tenant_id, timestamp DESC, event_id DESC)
  WHERE tenant_id IS NOT NULL;
