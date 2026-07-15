-- API de saída (plano Corporativo): chaves de API por empresa para ERP/CRM.
-- A chave em texto claro só é exibida uma vez na criação; no banco fica
-- apenas o hash SHA-256 (hex) + prefixo para identificação na UI.

CREATE TABLE IF NOT EXISTS public.company_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Padrão',
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_company_api_keys_hash
  ON public.company_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_company_api_keys_company
  ON public.company_api_keys(company_id)
  WHERE revoked_at IS NULL;

ALTER TABLE public.company_api_keys ENABLE ROW LEVEL SECURITY;

-- Dono da empresa gerencia as próprias chaves (client direto / painel).
DROP POLICY IF EXISTS "owner_manages_company_api_keys" ON public.company_api_keys;
CREATE POLICY "owner_manages_company_api_keys" ON public.company_api_keys
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE owner_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    company_id IN (SELECT id FROM public.companies WHERE owner_id = (SELECT auth.uid()))
  );
