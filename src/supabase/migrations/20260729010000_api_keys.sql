-- Migration: 20260729010000_api_keys.sql
-- Tabela de Chaves de API Pública (API Keys) e Webhooks

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{read,write}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] DEFAULT '{inspection.created,vehicle.event_created}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_api_keys_company ON public.api_keys (company_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys (key_hash);
CREATE INDEX IF NOT EXISTS idx_webhook_company ON public.webhook_subscriptions (company_id);

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso a chaves de API por empresa" ON public.api_keys;
CREATE POLICY "Acesso a chaves de API por empresa" ON public.api_keys
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
    OR company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Acesso a webhooks por empresa" ON public.webhook_subscriptions;
CREATE POLICY "Acesso a webhooks por empresa" ON public.webhook_subscriptions
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
    OR company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );
