-- Alinear control_reproductivo con inventario periódico (alevinaje/engorda):
-- cantidad_total, cantidad_alimento, peso (historial_peso), siembra_origen_id

DROP INDEX IF EXISTS "public"."control_reproductivo_fecha_idx";
DROP INDEX IF EXISTS "public"."control_reproductivo_lote_idx";
DROP INDEX IF EXISTS "public"."control_reproductivo_pileta_id_lote_key";
DROP INDEX IF EXISTS "public"."control_reproductivo_pileta_origen_reproductora_id_idx";

ALTER TABLE "public"."control_reproductivo" DROP CONSTRAINT IF EXISTS "control_reproductivo_pileta_origen_reproductora_id_fkey";
ALTER TABLE "public"."control_reproductivo" DROP CONSTRAINT IF EXISTS "control_reproductivo_usuario_id_fkey";

ALTER TABLE "public"."control_reproductivo" ADD COLUMN IF NOT EXISTS "cantidad_alimento" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "public"."control_reproductivo" ADD COLUMN IF NOT EXISTS "peso" INTEGER;

ALTER TABLE "public"."control_reproductivo"
    ADD CONSTRAINT "control_reproductivo_peso_fkey"
    FOREIGN KEY ("peso") REFERENCES "public"."historial_peso"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "pileta_origen_reproductora_id";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "fecha";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "lote";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "familia";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "huevos_ml";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "ovadas";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "machos";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "hembras";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "alevines_iniciales";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "mortalidad";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "mortalidad_porcentaje";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "usuario_id";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "created_at";
ALTER TABLE "public"."control_reproductivo" DROP COLUMN IF EXISTS "updated_at";

CREATE INDEX IF NOT EXISTS "control_reproductivo_pileta_id_idx" ON "public"."control_reproductivo"("pileta_id");
