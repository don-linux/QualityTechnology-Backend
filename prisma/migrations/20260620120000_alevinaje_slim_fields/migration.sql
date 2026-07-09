-- Alevinaje: solo cantidad, lote y talla (sin cantidad_alimento ni observacion_id).

ALTER TABLE "public"."alevinaje" DROP CONSTRAINT IF EXISTS "alevinaje_observacion_id_fkey";

ALTER TABLE "public"."alevinaje" DROP COLUMN IF EXISTS "observacion_id";
ALTER TABLE "public"."alevinaje" DROP COLUMN IF EXISTS "cantidad_alimento";
