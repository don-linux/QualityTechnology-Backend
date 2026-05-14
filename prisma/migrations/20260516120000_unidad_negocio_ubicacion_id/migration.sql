-- Link business units to physical location (catalog `ubicacion`).
ALTER TABLE "public"."unidades_negocio" ADD COLUMN "ubicacion_id" INTEGER;

CREATE INDEX "unidades_negocio_ubicacion_id_idx" ON "public"."unidades_negocio"("ubicacion_id");

ALTER TABLE "public"."unidades_negocio"
  ADD CONSTRAINT "unidades_negocio_ubicacion_id_fkey"
  FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
