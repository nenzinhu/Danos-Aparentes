-- Duração do plano PIX (meses) pendente até confirmação do webhook

alter table public.subscriptions
  add column if not exists pending_months int default 0;

comment on column public.subscriptions.pending_months is
  'Meses a liberar quando o webhook PIX confirmar o pagamento; zerado após ativar.';
