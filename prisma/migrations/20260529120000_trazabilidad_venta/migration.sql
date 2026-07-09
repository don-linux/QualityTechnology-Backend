-- Trazabilidad: egresos por venta (pileta_destino opcional + venta_id)
-- Lista de espera: persistir tipo de venta y granja

ALTER TABLE "public"."siembra" ALTER COLUMN "pileta_destino" DROP NOT NULL;

ALTER TABLE "public"."siembra" ADD COLUMN "venta_id" INTEGER;

ALTER TABLE "public"."siembra"
  ADD CONSTRAINT "siembra_venta_id_fkey"
  FOREIGN KEY ("venta_id") REFERENCES "public"."ventas"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "siembra_venta_id_idx" ON "public"."siembra"("venta_id");

ALTER TABLE "public"."lista_espera" ADD COLUMN "tipo_venta" VARCHAR(30);
ALTER TABLE "public"."lista_espera" ADD COLUMN "granja" VARCHAR(120);
