-- Nuevo tipo de pileta `incubacion` e inventario periódico (clon de alevinaje)

ALTER TYPE "public"."PiletaTipo" ADD VALUE 'incubacion';

CREATE TABLE "public"."incubacion" (
    "id" SERIAL NOT NULL,
    "pileta_id" INTEGER NOT NULL,
    "cantidad_total" INTEGER NOT NULL DEFAULT 0,
    "cantidad_alimento" INTEGER NOT NULL DEFAULT 0,
    "observacion_id" INTEGER,
    "biometria_id" INTEGER,
    "siembra_origen_id" INTEGER,
    "peso" INTEGER,

    CONSTRAINT "incubacion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "incubacion_pileta_id_idx" ON "public"."incubacion"("pileta_id");

ALTER TABLE "public"."incubacion" ADD CONSTRAINT "incubacion_biometria_id_fkey" FOREIGN KEY ("biometria_id") REFERENCES "public"."biometrias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."incubacion" ADD CONSTRAINT "incubacion_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."incubacion" ADD CONSTRAINT "incubacion_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."incubacion" ADD CONSTRAINT "incubacion_peso_fkey" FOREIGN KEY ("peso") REFERENCES "public"."historial_peso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."incubacion" ADD CONSTRAINT "incubacion_siembra_origen_id_fkey" FOREIGN KEY ("siembra_origen_id") REFERENCES "public"."siembra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
