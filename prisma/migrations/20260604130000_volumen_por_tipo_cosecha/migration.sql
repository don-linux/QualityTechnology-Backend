-- Volumen / contrapeso por tipo de cosecha.
-- Se agrega `incubacion.volumen_por_tipo` (JSONB) para capturar un valor de volumen/contrapeso
-- por cada tipo de cosecha seleccionado, ej. { "huevo": 100, "larva_saco": 50 }.
-- `huevos_ml` se mantiene como el total (suma) para trazabilidad y compatibilidad.

ALTER TABLE "public"."incubacion"
  ADD COLUMN IF NOT EXISTS "volumen_por_tipo" JSONB;

-- Backfill: registros existentes con un único tipo y un volumen total conocido pasan a
-- representar ese volumen como mapa { tipo: huevos_ml }.
UPDATE "public"."incubacion"
SET "volumen_por_tipo" = jsonb_build_object(("tipo_cosecha"[1])::text, "huevos_ml")
WHERE "volumen_por_tipo" IS NULL
  AND "huevos_ml" IS NOT NULL
  AND array_length("tipo_cosecha", 1) = 1;
