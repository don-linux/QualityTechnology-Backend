-- Campos de catálogo de cliente: RFC, UdN, localidad y estado
ALTER TABLE "public"."clientes" ADD COLUMN "rfc" VARCHAR(20);
ALTER TABLE "public"."clientes" ADD COLUMN "localidad" VARCHAR(150);
ALTER TABLE "public"."clientes" ADD COLUMN "estado" VARCHAR(100);
ALTER TABLE "public"."clientes" ADD COLUMN "unidad_negocio_id" INTEGER;

ALTER TABLE "public"."clientes"
  ADD CONSTRAINT "clientes_unidad_negocio_id_fkey"
  FOREIGN KEY ("unidad_negocio_id") REFERENCES "public"."unidades_negocio"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "clientes_unidad_negocio_id_idx" ON "public"."clientes"("unidad_negocio_id");
