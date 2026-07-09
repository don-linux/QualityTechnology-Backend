-- Campos del formulario Próximas Ventas (sin talla; pileta origen en registro)
ALTER TABLE "public"."lista_espera" ADD COLUMN "fecha_entrega" DATE;
ALTER TABLE "public"."lista_espera" ADD COLUMN "lugar_entrega" VARCHAR(150);
ALTER TABLE "public"."lista_espera" ADD COLUMN "unidad_produccion" VARCHAR(100);
ALTER TABLE "public"."lista_espera" ADD COLUMN "hora_embolsado" VARCHAR(10);
ALTER TABLE "public"."lista_espera" ADD COLUMN "hora_entrega" VARCHAR(10);
ALTER TABLE "public"."lista_espera" ADD COLUMN "encargado_venta" VARCHAR(150);
ALTER TABLE "public"."lista_espera" ADD COLUMN "pileta_origen_id" INTEGER;

ALTER TABLE "public"."lista_espera"
  ADD CONSTRAINT "lista_espera_pileta_origen_id_fkey"
  FOREIGN KEY ("pileta_origen_id") REFERENCES "public"."piletas"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "lista_espera_pileta_origen_id_idx" ON "public"."lista_espera"("pileta_origen_id");
CREATE INDEX "lista_espera_fecha_entrega_idx" ON "public"."lista_espera"("fecha_entrega");
