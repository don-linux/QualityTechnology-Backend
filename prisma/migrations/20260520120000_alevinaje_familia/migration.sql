-- Columna opcional para vínculo genético desde control reproductivo (antes en `lotes.familia`).
ALTER TABLE "public"."alevinaje" ADD COLUMN IF NOT EXISTS "familia" VARCHAR(60);
