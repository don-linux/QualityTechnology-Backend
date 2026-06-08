-- Flujo de caja deja de separarse por ubicacion (Medellin, La Ceiba, etc.).
-- `ubicacion_id` pasa a ser opcional: los movimientos historicos conservan su
-- ubicacion, pero los nuevos ya no la requieren.
ALTER TABLE "public"."flujo_caja" ALTER COLUMN "ubicacion_id" DROP NOT NULL;

-- Relacion opcional: si se elimina una ubicacion, los movimientos quedan sin
-- ubicacion en lugar de bloquear el borrado (coherente con Prisma).
ALTER TABLE "public"."flujo_caja" DROP CONSTRAINT "flujo_caja_ubicacion_id_fkey";

ALTER TABLE "public"."flujo_caja" ADD CONSTRAINT "flujo_caja_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
