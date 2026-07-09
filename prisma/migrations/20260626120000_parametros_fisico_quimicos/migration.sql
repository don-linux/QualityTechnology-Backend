-- Refactor parametros -> parametros_fisico_quimicos

ALTER TABLE "public"."parametros" RENAME TO "parametros_fisico_quimicos";

ALTER TABLE "public"."parametros_fisico_quimicos" RENAME COLUMN "temperatura" TO "temperatura_agua";
ALTER TABLE "public"."parametros_fisico_quimicos" RENAME COLUMN "nitritos" TO "nitrito";
ALTER TABLE "public"."parametros_fisico_quimicos" RENAME COLUMN "nitratos" TO "nitrato";

ALTER TABLE "public"."parametros_fisico_quimicos"
  ADD COLUMN "codigo" VARCHAR(24),
  ADD COLUMN "hora" TIME(6),
  ADD COLUMN "turno_muestreo" VARCHAR(20),
  ADD COLUMN "pileta_id" INTEGER,
  ADD COLUMN "temperatura_ambiente" DECIMAL(6, 2),
  ADD COLUMN "transparencia_sechhi" DECIMAL(10, 2),
  ADD COLUMN "coloracion_agua" VARCHAR(30);

UPDATE "public"."parametros_fisico_quimicos" pfq
SET "pileta_id" = pl.id
FROM "public"."piletas" pl
WHERE pfq."numero_estanque" = pl.id
  AND pfq."ubicacion_id" = pl."ubicacion_id";

UPDATE "public"."parametros_fisico_quimicos"
SET
  "hora" = TIME '08:00:00',
  "turno_muestreo" = 'Mañana',
  "coloracion_agua" = 'Agua transparente',
  "temperatura_ambiente" = 0
WHERE "hora" IS NULL;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY fecha ORDER BY id) AS rn
  FROM "public"."parametros_fisico_quimicos"
)
UPDATE "public"."parametros_fisico_quimicos" pfq
SET "codigo" = 'PFQ-' || to_char(pfq.fecha, 'YYYYMMDD') || '-' || LPAD(r.rn::text, 3, '0')
FROM ranked r
WHERE pfq.id = r.id;

ALTER TABLE "public"."parametros_fisico_quimicos"
  ALTER COLUMN "codigo" SET NOT NULL,
  ALTER COLUMN "hora" SET NOT NULL,
  ALTER COLUMN "turno_muestreo" SET NOT NULL,
  ALTER COLUMN "coloracion_agua" SET NOT NULL;

ALTER TABLE "public"."parametros_fisico_quimicos"
  ADD CONSTRAINT "parametros_fisico_quimicos_codigo_key" UNIQUE ("codigo");

ALTER TABLE "public"."parametros_fisico_quimicos"
  ADD CONSTRAINT "parametros_fisico_quimicos_pileta_id_fkey"
  FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "parametros_fisico_quimicos_pileta_id_idx"
  ON "public"."parametros_fisico_quimicos"("pileta_id");

CREATE INDEX "parametros_fisico_quimicos_fecha_idx"
  ON "public"."parametros_fisico_quimicos"("fecha" DESC);

ALTER TABLE "public"."parametros_fisico_quimicos" DROP COLUMN "numero_estanque";

UPDATE "public"."modulos"
SET "nombre" = 'Parametros Fisico Quimicos', "ruta" = '/parametros-fisico-quimicos'
WHERE "ruta" = '/parametros';
