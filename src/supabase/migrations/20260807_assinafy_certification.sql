-- FASE: Certificação digital (Assinafy)
-- Adiciona colunas para vincular a vistoria a um documento certificado
-- (assinatura digital ICp-Brasil) e rastrear o status.

alter table if exists vehicle_inspections
  add column if not exists assinafy_document_id text default '',
  add column if not exists assinafy_assignment_id text default '',
  add column if not exists assinafy_signing_url text default '',
  add column if not exists assinafy_cert_status text default '',
  add column if not exists assinafy_signer_name text default '',
  add column if not exists assinafy_certified_at timestamptz;

create index if not exists idx_inspections_assinafy_doc
  on vehicle_inspections (assinafy_document_id)
  where assinafy_document_id is not null and assinafy_document_id <> '';
