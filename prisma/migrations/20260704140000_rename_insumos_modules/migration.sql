-- Rename catalog: catalogos.insumos -> catalogos.catalogo_insumos
ALTER TABLE "catalogos"."insumos" RENAME TO "catalogo_insumos";
ALTER INDEX "catalogos"."insumos_pkey" RENAME TO "catalogo_insumos_pkey";
ALTER INDEX "catalogos"."insumos_codigo_key" RENAME TO "catalogo_insumos_codigo_key";
ALTER INDEX "catalogos"."insumos_cliente_id_idx" RENAME TO "catalogo_insumos_cliente_id_idx";
ALTER TABLE "catalogos"."catalogo_insumos" RENAME CONSTRAINT "insumos_cliente_id_fkey" TO "catalogo_insumos_cliente_id_fkey";

-- Rename movements: public.flujo_insumos -> public.inventario_insumos
ALTER TABLE "public"."flujo_insumos" RENAME TO "inventario_insumos";
ALTER INDEX "public"."flujo_insumos_ubicacion_id_idx" RENAME TO "inventario_insumos_ubicacion_id_idx";
ALTER INDEX "public"."flujo_insumos_usuario_id_idx" RENAME TO "inventario_insumos_usuario_id_idx";
ALTER INDEX "public"."flujo_insumos_codigo_idx" RENAME TO "inventario_insumos_codigo_idx";
ALTER INDEX "public"."flujo_insumos_traspaso_grupo_id_idx" RENAME TO "inventario_insumos_traspaso_grupo_id_idx";
ALTER TABLE "public"."inventario_insumos" RENAME CONSTRAINT "flujo_insumos_pkey" TO "inventario_insumos_pkey";
ALTER TABLE "public"."inventario_insumos" RENAME CONSTRAINT "flujo_insumos_ubicacion_id_fkey" TO "inventario_insumos_ubicacion_id_fkey";
ALTER TABLE "public"."inventario_insumos" RENAME CONSTRAINT "flujo_insumos_ubicacion_salida_id_fkey" TO "inventario_insumos_ubicacion_salida_id_fkey";
ALTER TABLE "public"."inventario_insumos" RENAME CONSTRAINT "flujo_insumos_ubicacion_entrada_id_fkey" TO "inventario_insumos_ubicacion_entrada_id_fkey";
ALTER TABLE "public"."inventario_insumos" RENAME CONSTRAINT "flujo_insumos_observacion_id_fkey" TO "inventario_insumos_observacion_id_fkey";
ALTER TABLE "public"."inventario_insumos" RENAME CONSTRAINT "flujo_insumos_usuario_id_fkey" TO "inventario_insumos_usuario_id_fkey";
ALTER TABLE "public"."inventario_insumos" RENAME CONSTRAINT "flujo_insumos_insumo_id_fkey" TO "inventario_insumos_insumo_id_fkey";

DROP INDEX IF EXISTS "public"."flujo_insumos_codigo_no_traspaso_key";
CREATE UNIQUE INDEX "inventario_insumos_codigo_no_traspaso_key"
  ON "public"."inventario_insumos"("codigo")
  WHERE "tipo_movimiento" <> 'traspaso';

-- RBAC: movimientos leaf module
UPDATE "public"."modulos"
SET "nombre" = 'Insumos',
    "ruta" = '/inventario-insumos'
WHERE "ruta" = '/flujo_insumos';

-- RBAC: catalog leaf module
INSERT INTO "public"."modulos" ("nombre", "ruta", "esta_activo")
VALUES ('Catálogo de insumos', '/catalogo-insumos', true)
ON CONFLICT ("ruta") DO UPDATE SET
  "nombre" = EXCLUDED."nombre",
  "esta_activo" = EXCLUDED."esta_activo";

-- Grant Inventarios parent to roles that had the movements leaf module
INSERT INTO "public"."roles_modulos" ("rol_id", "modulo_id")
SELECT rm."rol_id", inv."id"
FROM "public"."roles_modulos" rm
JOIN "public"."modulos" leaf ON leaf."id" = rm."modulo_id" AND leaf."ruta" = '/inventario-insumos'
JOIN "public"."modulos" inv ON inv."ruta" = '/inventarios'
ON CONFLICT DO NOTHING;
