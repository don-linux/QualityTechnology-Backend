-- Lote genético en inventario periódico de alevinaje (heredado de incubación o manual).

ALTER TABLE "public"."alevinaje" ADD COLUMN IF NOT EXISTS "lote" VARCHAR(60);

CREATE INDEX IF NOT EXISTS "alevinaje_lote_idx" ON "public"."alevinaje"("lote" ASC);
