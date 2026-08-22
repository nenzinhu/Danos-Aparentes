-- FASE 19: audit_anchors — ancoragem periódica da ponta da cadeia de auditoria.
-- Cada âncora registra o event_hash mais recente (tip) de uma vistoria no momento
-- do sync, com carimbo de tempo do servidor (created_at) e, quando disponível,
-- provas de calendários OpenTimestamps. Não constitui validade jurídica garantida.

CREATE TABLE IF NOT EXISTS public.audit_anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid,
  inspection_id text NOT NULL,
  chain_tip_hash text NOT NULL,
  events_count integer NOT NULL DEFAULT 0,
  anchor_digest text NOT NULL,
  ots_proofs jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'recorded'
    CHECK (status IN ('recorded', 'pending_attestation', 'attested')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Idempotência: uma âncora por (vistoria, tip).
CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_anchors_inspection_tip
  ON public.audit_anchors (inspection_id, chain_tip_hash);

CREATE INDEX IF NOT EXISTS idx_audit_anchors_inspection_created
  ON public.audit_anchors (inspection_id, created_at DESC);

ALTER TABLE public.audit_anchors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own_audit_anchors" ON public.audit_anchors;
CREATE POLICY "insert_own_audit_anchors" ON public.audit_anchors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_audit_anchors" ON public.audit_anchors;
CREATE POLICY "select_own_audit_anchors" ON public.audit_anchors
  FOR SELECT
  USING (auth.uid() = user_id);

-- Sem políticas de UPDATE/DELETE para clientes autenticados.
-- Upgrade de provas OTS (pending → attested) é feito apenas via service role.
