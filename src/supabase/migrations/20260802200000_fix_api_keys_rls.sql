-- Fix RLS api_keys / webhook_subscriptions: tabela correta é team_members (não company_members).

DROP POLICY IF EXISTS "Acesso a chaves de API por empresa" ON public.api_keys;
CREATE POLICY "Acesso a chaves de API por empresa" ON public.api_keys
  FOR ALL USING (
    company_id IN (
      SELECT company_id
      FROM public.team_members
      WHERE user_id = auth.uid()
        AND status = 'accepted'
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
      SELECT company_id
      FROM public.team_members
      WHERE user_id = auth.uid()
        AND status = 'accepted'
    )
    OR company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );
