-- Fusión de Cosecha dentro de Incubación.
-- `incubacion` pasa a ser la tabla única del módulo Cosecha e Incubación: se le agregan los
-- datos del desove (tipo, hembras ovadas, estadio, fecha de cosecha), el estanque de
-- reproductores de origen, el lote/reproductor de origen y un código (folio del desove).
-- Los registros existentes se respaldan (backfill) desde `evento_cosecha`.

ALTER TABLE "public"."incubacion"
  ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(24),
  ADD COLUMN IF NOT EXISTS "pileta_origen_id" INTEGER,
  ADD COLUMN IF NOT EXISTS "reproductor_id" INTEGER,
  ADD COLUMN IF NOT EXISTS "tipo_cosecha" "public"."TipoCosecha",
  ADD COLUMN IF NOT EXISTS "estadio_desarrollo" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "hembras_ovadas" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "fecha_cosecha" DATE;

-- Backfill desde el evento de cosecha vinculado (si existe).
UPDATE "public"."incubacion" AS i
SET
  "codigo" = COALESCE(i."codigo", ec."codigo"),
  "pileta_origen_id" = COALESCE(i."pileta_origen_id", ec."pileta_id"),
  "reproductor_id" = COALESCE(i."reproductor_id", ec."reproductor_id"),
  "tipo_cosecha" = COALESCE(i."tipo_cosecha", ec."tipo_cosecha"),
  "estadio_desarrollo" = COALESCE(i."estadio_desarrollo", ec."estadio_desarrollo"),
  "hembras_ovadas" = CASE WHEN i."hembras_ovadas" = 0 THEN ec."hembras_ovadas" ELSE i."hembras_ovadas" END,
  "fecha_cosecha" = COALESCE(i."fecha_cosecha", ec."fecha_cosecha")
FROM "public"."evento_cosecha" AS ec
WHERE i."evento_cosecha_id" = ec."id";

-- Índice único del código (permite múltiples NULL).
CREATE UNIQUE INDEX IF NOT EXISTS "incubacion_codigo_key" ON "public"."incubacion"("codigo");

CREATE INDEX IF NOT EXISTS "incubacion_pileta_origen_id_idx" ON "public"."incubacion"("pileta_origen_id");
CREATE INDEX IF NOT EXISTS "incubacion_reproductor_id_idx" ON "public"."incubacion"("reproductor_id");

-- Llaves foráneas idempotentes.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'incubacion_pileta_origen_id_fkey') THEN
    ALTER TABLE "public"."incubacion"
      ADD CONSTRAINT "incubacion_pileta_origen_id_fkey"
      FOREIGN KEY ("pileta_origen_id") REFERENCES "public"."piletas"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'incubacion_reproductor_id_fkey') THEN
    ALTER TABLE "public"."incubacion"
      ADD CONSTRAINT "incubacion_reproductor_id_fkey"
      FOREIGN KEY ("reproductor_id") REFERENCES "public"."reproductores"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
