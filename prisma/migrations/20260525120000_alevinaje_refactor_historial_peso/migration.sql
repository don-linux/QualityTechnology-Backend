-- Renombrar tabla legada y crear modelo vigente + historial de peso

ALTER TABLE "public"."alevinaje" RENAME TO "alevinaje_old";

CREATE TABLE "public"."historial_peso" (
    "id" SERIAL NOT NULL,
    "peso" DECIMAL(10, 3) NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_peso_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "historial_peso_fecha_idx" ON "public"."historial_peso"("fecha" DESC);

CREATE TABLE "public"."alevinaje" (
    "id" SERIAL NOT NULL,
    "pileta_id" INTEGER NOT NULL,
    "cantidad_total" INTEGER NOT NULL DEFAULT 0,
    "cantidad_alimento" INTEGER NOT NULL DEFAULT 0,
    "observacion_id" INTEGER,
    "biometria_id" INTEGER,
    "siembra_origen_id" INTEGER,
    "peso" INTEGER,

    CONSTRAINT "alevinaje_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "alevinaje_pileta_id_idx" ON "public"."alevinaje"("pileta_id");

ALTER TABLE "public"."alevinaje"
    ADD CONSTRAINT "alevinaje_pileta_id_fkey"
    FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."alevinaje"
    ADD CONSTRAINT "alevinaje_observacion_id_fkey"
    FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."alevinaje"
    ADD CONSTRAINT "alevinaje_biometria_id_fkey"
    FOREIGN KEY ("biometria_id") REFERENCES "public"."biometrias"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."alevinaje"
    ADD CONSTRAINT "alevinaje_siembra_origen_id_fkey"
    FOREIGN KEY ("siembra_origen_id") REFERENCES "public"."siembra"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."alevinaje"
    ADD CONSTRAINT "alevinaje_peso_fkey"
    FOREIGN KEY ("peso") REFERENCES "public"."historial_peso"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
