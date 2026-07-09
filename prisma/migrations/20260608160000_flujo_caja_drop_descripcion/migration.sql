-- Se elimina la columna `descripcion` de flujo_caja: queda sustituida por
-- `observaciones` como unico campo de texto libre del movimiento (pagos de
-- venta y movimientos generales).
ALTER TABLE "public"."flujo_caja" DROP COLUMN "descripcion";
