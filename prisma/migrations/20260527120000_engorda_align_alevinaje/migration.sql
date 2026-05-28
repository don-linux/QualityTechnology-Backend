-- Alinear tabla engorda con el modelo alevinaje:
-- cantidad_total, cantidad_alimento, peso (historial_peso), siembra_origen_id

ALTER TABLE "public"."engorda" RENAME COLUMN "cantidad" TO "cantidad_total";

ALTER TABLE "public"."engorda" ADD COLUMN "cantidad_alimento" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "public"."engorda" ADD COLUMN "peso" INTEGER;

ALTER TABLE "public"."engorda"
    ADD CONSTRAINT "engorda_peso_fkey"
    FOREIGN KEY ("peso") REFERENCES "public"."historial_peso"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."engorda" DROP CONSTRAINT IF EXISTS "engorda_siembra_id_fkey";
ALTER TABLE "public"."engorda" RENAME COLUMN "siembra_id" TO "siembra_origen_id";

ALTER TABLE "public"."engorda"
    ADD CONSTRAINT "engorda_siembra_origen_id_fkey"
    FOREIGN KEY ("siembra_origen_id") REFERENCES "public"."siembra"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."engorda" DROP CONSTRAINT IF EXISTS "engorda_usuario_id_fkey";
ALTER TABLE "public"."engorda" DROP COLUMN IF EXISTS "machos";
ALTER TABLE "public"."engorda" DROP COLUMN IF EXISTS "hembras";
ALTER TABLE "public"."engorda" DROP COLUMN IF EXISTS "talla_gr";
ALTER TABLE "public"."engorda" DROP COLUMN IF EXISTS "usuario_id";
ALTER TABLE "public"."engorda" DROP COLUMN IF EXISTS "created_at";
ALTER TABLE "public"."engorda" DROP COLUMN IF EXISTS "updated_at";

DROP INDEX IF EXISTS "public"."engorda_pileta_id_key";
CREATE INDEX IF NOT EXISTS "engorda_pileta_id_idx" ON "public"."engorda"("pileta_id");
