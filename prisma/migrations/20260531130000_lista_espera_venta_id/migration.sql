-- Vincular próxima venta con venta/trazabilidad generada al registrar
ALTER TABLE "public"."lista_espera" ADD COLUMN "venta_id" INTEGER;

ALTER TABLE "public"."lista_espera"
  ADD CONSTRAINT "lista_espera_venta_id_fkey"
  FOREIGN KEY ("venta_id") REFERENCES "public"."ventas"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "lista_espera_venta_id_idx" ON "public"."lista_espera"("venta_id");
