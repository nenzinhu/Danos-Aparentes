-- Torna o bucket de fotos de avarias privado (acesso só via download/signed URL + RLS).
-- Complementa policies já existentes (dono = primeiro segmento do path).

update storage.buckets
set public = false
where id = 'damage-photos';
