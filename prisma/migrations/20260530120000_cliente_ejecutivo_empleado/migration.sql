-- Vincular clientes con ejecutivo de ventas (empleado activo de RRHH)

ALTER TABLE "public"."clientes" ADD COLUMN "ejecutivo_empleado_id" INTEGER;

ALTER TABLE "public"."clientes"
  ADD CONSTRAINT "clientes_ejecutivo_empleado_id_fkey"
  FOREIGN KEY ("ejecutivo_empleado_id") REFERENCES "public"."empleados"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "clientes_ejecutivo_empleado_id_idx" ON "public"."clientes"("ejecutivo_empleado_id");
