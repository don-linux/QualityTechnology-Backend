-- DropTable
DROP TABLE IF EXISTS "public"."plagas";

-- CreateTable
CREATE TABLE "public"."fauna_nociva" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "area_instalacion_id" INTEGER,
    "fauna_detectada_id" INTEGER,
    "evidencia_fauna_id" INTEGER,
    "estado_trampa_id" INTEGER,
    "condicion_malla" VARCHAR(20),
    "accion_correctiva_id" INTEGER,
    "responsable" VARCHAR(100),
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "fauna_nociva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fauna_nociva_ubicacion_id_idx" ON "public"."fauna_nociva"("ubicacion_id");

-- CreateIndex
CREATE INDEX "fauna_nociva_area_instalacion_id_idx" ON "public"."fauna_nociva"("area_instalacion_id");

-- CreateIndex
CREATE INDEX "fauna_nociva_usuario_id_idx" ON "public"."fauna_nociva"("usuario_id");

-- AddForeignKey
ALTER TABLE "public"."fauna_nociva" ADD CONSTRAINT "fauna_nociva_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fauna_nociva" ADD CONSTRAINT "fauna_nociva_area_instalacion_id_fkey" FOREIGN KEY ("area_instalacion_id") REFERENCES "catalogos"."areas_instalacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fauna_nociva" ADD CONSTRAINT "fauna_nociva_fauna_detectada_id_fkey" FOREIGN KEY ("fauna_detectada_id") REFERENCES "catalogos"."faunas_detectadas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fauna_nociva" ADD CONSTRAINT "fauna_nociva_evidencia_fauna_id_fkey" FOREIGN KEY ("evidencia_fauna_id") REFERENCES "catalogos"."evidencias_fauna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fauna_nociva" ADD CONSTRAINT "fauna_nociva_estado_trampa_id_fkey" FOREIGN KEY ("estado_trampa_id") REFERENCES "catalogos"."estados_trampa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fauna_nociva" ADD CONSTRAINT "fauna_nociva_accion_correctiva_id_fkey" FOREIGN KEY ("accion_correctiva_id") REFERENCES "catalogos"."acciones_correctivas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fauna_nociva" ADD CONSTRAINT "fauna_nociva_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update module route for fauna nociva
UPDATE "public"."modulos"
SET "nombre" = 'Fauna Nociva', "ruta" = '/fauna-nociva'
WHERE "ruta" = '/plagas';
