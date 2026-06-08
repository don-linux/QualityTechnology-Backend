-- Campo de observaciones (texto libre) para movimientos de flujo de caja,
-- usado al registrar abonos/pagos de ventas y movimientos generales.
ALTER TABLE "public"."flujo_caja" ADD COLUMN "observaciones" VARCHAR(500);
