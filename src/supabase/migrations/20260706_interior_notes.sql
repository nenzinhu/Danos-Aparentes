-- Observações e fotos do interior do veículo — campo de texto livre + fotos,
-- sem diagrama clicável (não existe arte SVG de interior). Mesma tabela e
-- policies de vehicle_inspections já cobrem essas colunas novas.

ALTER TABLE public.vehicle_inspections
  ADD COLUMN IF NOT EXISTS interior_notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS interior_photos text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interior_photo_notes text[] NOT NULL DEFAULT '{}';
