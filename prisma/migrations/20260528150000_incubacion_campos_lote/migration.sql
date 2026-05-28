-- Incubación: lote, huevos/ml y fechas en lugar de cantidad/alimento/peso

ALTER TABLE "public"."incubacion" DROP CONSTRAINT IF EXISTS "incubacion_peso_fkey";

ALTER TABLE "public"."incubacion" DROP COLUMN IF EXISTS "cantidad_total";
ALTER TABLE "public"."incubacion" DROP COLUMN IF EXISTS "cantidad_alimento";
ALTER TABLE "public"."incubacion" DROP COLUMN IF EXISTS "peso";

ALTER TABLE "public"."incubacion" ADD COLUMN "lote" VARCHAR(60) NOT NULL DEFAULT 'SIN-LOTE';
ALTER TABLE "public"."incubacion" ALTER COLUMN "lote" DROP DEFAULT;

ALTER TABLE "public"."incubacion" ADD COLUMN "huevos_ml" DECIMAL(10,2);
ALTER TABLE "public"."incubacion" ADD COLUMN "fecha_ingreso" DATE;
ALTER TABLE "public"."incubacion" ADD COLUMN "dias_en_pileta" INTEGER;
ALTER TABLE "public"."incubacion" ADD COLUMN "fecha_egreso" DATE;

CREATE INDEX "incubacion_lote_idx" ON "public"."incubacion"("lote");
CREATE UNIQUE INDEX "incubacion_pileta_id_lote_key" ON "public"."incubacion"("pileta_id", "lote");
