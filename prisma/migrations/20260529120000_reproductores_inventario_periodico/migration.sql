-- Inventario reproductores: mismo modelo periódico que alevinaje / engorda

ALTER TABLE "public"."reproductores" RENAME TO "reproductores_old";

ALTER TABLE "public"."reproductores_old" RENAME CONSTRAINT "reproductores_pkey" TO "reproductores_old_pkey";
ALTER TABLE "public"."reproductores_old" RENAME CONSTRAINT "reproductores_biometria_id_fkey" TO "reproductores_old_biometria_id_fkey";
ALTER TABLE "public"."reproductores_old" RENAME CONSTRAINT "reproductores_observacion_id_fkey" TO "reproductores_old_observacion_id_fkey";
ALTER TABLE "public"."reproductores_old" RENAME CONSTRAINT "reproductores_pileta_id_fkey" TO "reproductores_old_pileta_id_fkey";
ALTER TABLE "public"."reproductores_old" RENAME CONSTRAINT "reproductores_siembra_id_fkey" TO "reproductores_old_siembra_id_fkey";
ALTER TABLE "public"."reproductores_old" RENAME CONSTRAINT "reproductores_usuario_id_fkey" TO "reproductores_old_usuario_id_fkey";
ALTER INDEX "public"."reproductores_familia_idx" RENAME TO "reproductores_old_familia_idx";
ALTER INDEX "public"."reproductores_linea_idx" RENAME TO "reproductores_old_linea_idx";
ALTER INDEX "public"."reproductores_pileta_id_key" RENAME TO "reproductores_old_pileta_id_key";
ALTER SEQUENCE "public"."reproductores_id_seq" RENAME TO "reproductores_old_id_seq";

CREATE TABLE "public"."reproductores" (
    "id" SERIAL NOT NULL,
    "pileta_id" INTEGER NOT NULL,
    "cantidad_total" INTEGER NOT NULL DEFAULT 0,
    "cantidad_alimento" INTEGER NOT NULL DEFAULT 0,
    "observacion_id" INTEGER,
    "biometria_id" INTEGER,
    "siembra_origen_id" INTEGER,
    "peso" INTEGER,

    CONSTRAINT "reproductores_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reproductores_pileta_id_idx" ON "public"."reproductores"("pileta_id");

ALTER TABLE "public"."reproductores"
    ADD CONSTRAINT "reproductores_pileta_id_fkey"
    FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."reproductores"
    ADD CONSTRAINT "reproductores_observacion_id_fkey"
    FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."reproductores"
    ADD CONSTRAINT "reproductores_biometria_id_fkey"
    FOREIGN KEY ("biometria_id") REFERENCES "public"."biometrias"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."reproductores"
    ADD CONSTRAINT "reproductores_siembra_origen_id_fkey"
    FOREIGN KEY ("siembra_origen_id") REFERENCES "public"."siembra"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."reproductores"
    ADD CONSTRAINT "reproductores_peso_fkey"
    FOREIGN KEY ("peso") REFERENCES "public"."historial_peso"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "public"."reproductores" (
    "pileta_id",
    "cantidad_total",
    "cantidad_alimento",
    "observacion_id",
    "biometria_id",
    "siembra_origen_id",
    "peso"
)
SELECT
    "pileta_id",
    COALESCE("machos", 0) + COALESCE("hembras", 0),
    0,
    "observacion_id",
    "biometria_id",
    "siembra_id",
    NULL
FROM "public"."reproductores_old";
