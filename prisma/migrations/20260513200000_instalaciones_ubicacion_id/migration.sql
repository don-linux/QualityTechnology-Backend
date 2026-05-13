-- AlterTable
ALTER TABLE "public"."instalaciones" ADD COLUMN "ubicacion_id" INTEGER;

-- CreateIndex
CREATE INDEX "instalaciones_ubicacion_id_idx" ON "public"."instalaciones"("ubicacion_id");

-- AddForeignKey
ALTER TABLE "public"."instalaciones"
  ADD CONSTRAINT "instalaciones_ubicacion_id_fkey"
  FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
