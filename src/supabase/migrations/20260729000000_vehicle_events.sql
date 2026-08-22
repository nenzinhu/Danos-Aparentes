-- Migration: 20260729000000_vehicle_events.sql
-- Tabela de Eventos Genéricos do Veículo no Histórico Veicular Digital

CREATE TABLE IF NOT EXISTS public.vehicle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'OTHER',
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  photos TEXT[] DEFAULT '{}',
  documents JSONB DEFAULT '[]'::jsonb,
  inspection_id UUID,
  status TEXT DEFAULT 'completed',
  hash TEXT,
  signature JSONB
);

-- Índices de performance para busca por veículo e tenant
CREATE INDEX IF NOT EXISTS idx_vehicle_events_vehicle_date ON public.vehicle_events (vehicle_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_events_tenant_date ON public.vehicle_events (tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_events_type ON public.vehicle_events (type);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.vehicle_events ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para acesso isolado por tenant/usuário
DROP POLICY IF EXISTS "Permitir leitura de eventos por tenant" ON public.vehicle_events;
CREATE POLICY "Permitir leitura de eventos por tenant" ON public.vehicle_events
  FOR SELECT USING (
    tenant_id = COALESCE(auth.jwt() ->> 'company_id', 'user:' || auth.uid()::text)
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Permitir criacao de eventos por tenant" ON public.vehicle_events;
CREATE POLICY "Permitir criacao de eventos por tenant" ON public.vehicle_events
  FOR INSERT WITH CHECK (
    tenant_id = COALESCE(auth.jwt() ->> 'company_id', 'user:' || auth.uid()::text)
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Permitir atualizacao de eventos por tenant" ON public.vehicle_events;
CREATE POLICY "Permitir atualizacao de eventos por tenant" ON public.vehicle_events
  FOR UPDATE USING (
    tenant_id = COALESCE(auth.jwt() ->> 'company_id', 'user:' || auth.uid()::text)
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Permitir delecao de eventos por tenant" ON public.vehicle_events;
CREATE POLICY "Permitir delecao de eventos por tenant" ON public.vehicle_events
  FOR DELETE USING (
    tenant_id = COALESCE(auth.jwt() ->> 'company_id', 'user:' || auth.uid()::text)
    OR auth.role() = 'service_role'
  );
