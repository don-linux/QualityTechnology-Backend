-- Evento de cosecha: hembras ovadas por desove.
-- Reproductores: contador de desoves y estado de ciclo (activo / agotado).

CREATE TYPE "public"."EstadoCicloReproductor" AS ENUM ('activo', 'agotado');

ALTER TABLE "public"."reproductores"
  ADD COLUMN IF NOT EXISTS "desovez" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "estado_ciclo" "public"."EstadoCicloReproductor" NOT NULL DEFAULT 'activo';

ALTER TABLE "public"."evento_cosecha"
  ADD COLUMN IF NOT EXISTS "hembras_ovadas" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "reproductores_estado_ciclo_idx"
  ON "public"."reproductores"("estado_ciclo");
