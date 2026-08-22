-- Lifecycle e-mails (welcome + trial ending) — flags idempotentes no próprio subscription.
alter table public.subscriptions
  add column if not exists welcome_email_sent_at timestamptz,
  add column if not exists trial_ending_email_sent_at timestamptz;

comment on column public.subscriptions.welcome_email_sent_at is 'SMTP welcome enviado (idempotente)';
comment on column public.subscriptions.trial_ending_email_sent_at is 'Aviso de fim de trial enviado (idempotente)';
