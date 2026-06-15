-- Vincular movimientos de flujo de caja con ventas (pagos/abonos).
ALTER TABLE "public"."flujo_caja" ADD COLUMN "venta_id" INTEGER;

ALTER TABLE "public"."flujo_caja"
  ADD CONSTRAINT "flujo_caja_venta_id_fkey"
  FOREIGN KEY ("venta_id") REFERENCES "public"."ventas"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "flujo_caja_venta_id_idx" ON "public"."flujo_caja"("venta_id");
