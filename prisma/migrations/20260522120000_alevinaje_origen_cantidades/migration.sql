-- Origen breeders opcional + desglose de sexos + total manifestado por el usuario
ALTER TABLE "public"."alevinaje"
    ADD COLUMN "pileta_origen_reproductora_id" INTEGER,
    ADD COLUMN "machos" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "hembras" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "cantidad_total" INTEGER NOT NULL DEFAULT 0;

UPDATE "public"."alevinaje"
SET "cantidad_total" = "alevines_iniciales"
WHERE "cantidad_total" = 0;

ALTER TABLE "public"."alevinaje"
    ADD CONSTRAINT "alevinaje_pileta_origen_reproductora_id_fkey"
    FOREIGN KEY ("pileta_origen_reproductora_id")
    REFERENCES "public"."piletas" ("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

CREATE INDEX "alevinaje_pileta_origen_reproductora_id_idx"
    ON "public"."alevinaje" ("pileta_origen_reproductora_id");
