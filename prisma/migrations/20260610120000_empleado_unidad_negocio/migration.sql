-- AlterTable
ALTER TABLE "public"."empleados" ADD COLUMN "unidad_negocio_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."empleados"
  ADD CONSTRAINT "empleados_unidad_negocio_id_fkey"
  FOREIGN KEY ("unidad_negocio_id") REFERENCES "public"."unidades_negocio"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "empleados_unidad_negocio_id_idx" ON "public"."empleados"("unidad_negocio_id");
