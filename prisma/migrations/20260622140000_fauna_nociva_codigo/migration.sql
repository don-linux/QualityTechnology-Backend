-- AlterTable: add codigo column (nullable for backfill)
ALTER TABLE "public"."fauna_nociva" ADD COLUMN "codigo" VARCHAR(30);

-- Backfill existing rows with FN-SIGLA-YYYYMMDD-NNN per granja and day
WITH ranked AS (
  SELECT
    fn.id,
    fn.ubicacion_id,
    fn.fecha,
    ROW_NUMBER() OVER (
      PARTITION BY fn.ubicacion_id, fn.fecha
      ORDER BY fn.id
    ) AS rn,
    CASE
      WHEN LOWER(u.nombre) LIKE '%ceiba%' THEN 'GAC'
      WHEN LOWER(u.nombre) LIKE '%medell%' THEN 'GAM'
      ELSE 'GAX'
    END AS sigla
  FROM "public"."fauna_nociva" fn
  INNER JOIN "public"."ubicacion" u ON u.id = fn.ubicacion_id
)
UPDATE "public"."fauna_nociva" fn
SET "codigo" = 'FN-' || r.sigla || '-' || to_char(r.fecha, 'YYYYMMDD') || '-' || LPAD(r.rn::text, 3, '0')
FROM ranked r
WHERE fn.id = r.id;

-- Enforce NOT NULL and uniqueness
ALTER TABLE "public"."fauna_nociva" ALTER COLUMN "codigo" SET NOT NULL;

CREATE UNIQUE INDEX "fauna_nociva_codigo_key" ON "public"."fauna_nociva"("codigo");
