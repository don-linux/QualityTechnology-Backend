-- Módulo 1: lote de reproductores | Módulo 2: evento de cosecha | Módulo 3: vínculo incubación
-- Idempotente: seguro si la migración falló a medias o se reintenta tras migrate resolve --rolled-back

DO $$ BEGIN
  CREATE TYPE "public"."TipoCosecha" AS ENUM ('huevo', 'larva_saco', 'alevin_nadando');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "public"."reproductores" ADD COLUMN IF NOT EXISTS "fecha_siembra" DATE;
ALTER TABLE "public"."reproductores" ADD COLUMN IF NOT EXISTS "lote_genetico" VARCHAR(120);

ALTER TABLE "public"."reproductores" ADD COLUMN IF NOT EXISTS "activo" BOOLEAN;
UPDATE "public"."reproductores" SET "activo" = true WHERE "activo" IS NULL;
ALTER TABLE "public"."reproductores" ALTER COLUMN "activo" SET DEFAULT true;
ALTER TABLE "public"."reproductores" ALTER COLUMN "activo" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "reproductores_activo_idx" ON "public"."reproductores"("activo");
CREATE INDEX IF NOT EXISTS "reproductores_pileta_id_activo_idx" ON "public"."reproductores"("pileta_id", "activo");

CREATE TABLE IF NOT EXISTS "public"."evento_cosecha" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(24) NOT NULL,
    "reproductor_id" INTEGER NOT NULL,
    "pileta_id" INTEGER NOT NULL,
    "fecha_cosecha" DATE NOT NULL,
    "tipo_cosecha" "public"."TipoCosecha" NOT NULL,
    "estadio_desarrollo" VARCHAR(80),
    "volumen_ml" DECIMAL(12,2),
    "observacion_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evento_cosecha_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "evento_cosecha_codigo_key" ON "public"."evento_cosecha"("codigo");
CREATE INDEX IF NOT EXISTS "evento_cosecha_pileta_id_idx" ON "public"."evento_cosecha"("pileta_id");
CREATE INDEX IF NOT EXISTS "evento_cosecha_reproductor_id_idx" ON "public"."evento_cosecha"("reproductor_id");
CREATE INDEX IF NOT EXISTS "evento_cosecha_fecha_cosecha_idx" ON "public"."evento_cosecha"("fecha_cosecha" DESC);

DO $$ BEGIN
  ALTER TABLE "public"."evento_cosecha"
    ADD CONSTRAINT "evento_cosecha_reproductor_id_fkey"
    FOREIGN KEY ("reproductor_id") REFERENCES "public"."reproductores"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."evento_cosecha"
    ADD CONSTRAINT "evento_cosecha_pileta_id_fkey"
    FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."evento_cosecha"
    ADD CONSTRAINT "evento_cosecha_observacion_id_fkey"
    FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "public"."incubacion" ADD COLUMN IF NOT EXISTS "evento_cosecha_id" INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS "incubacion_evento_cosecha_id_key" ON "public"."incubacion"("evento_cosecha_id");
CREATE INDEX IF NOT EXISTS "incubacion_evento_cosecha_id_idx" ON "public"."incubacion"("evento_cosecha_id");

DO $$ BEGIN
  ALTER TABLE "public"."incubacion"
    ADD CONSTRAINT "incubacion_evento_cosecha_id_fkey"
    FOREIGN KEY ("evento_cosecha_id") REFERENCES "public"."evento_cosecha"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DROP TABLE IF EXISTS "public"."control_reproductivo" CASCADE;
