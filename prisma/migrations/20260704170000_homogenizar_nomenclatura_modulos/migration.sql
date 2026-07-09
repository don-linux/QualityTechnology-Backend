-- Homogenizar RBAC: bitácora inventario alevines
UPDATE "public"."modulos"
SET "ruta" = '/inventario-alevines', "nombre" = 'Inventario Alevines'
WHERE "ruta" = '/inventario';

-- Renombrar tabla mantenimiento equipo (quitar prefijo bitacora_)
ALTER TABLE "public"."bitacora_mantenimiento_equipos" RENAME TO "mantenimiento_equipo_herramientas";

ALTER TABLE "public"."mantenimiento_equipo_herramientas"
  RENAME CONSTRAINT "bitacora_mantenimiento_equipos_pkey" TO "mantenimiento_equipo_herramientas_pkey";

ALTER TABLE "public"."mantenimiento_equipo_herramientas"
  RENAME CONSTRAINT "bitacora_mantenimiento_equipos_usuario_id_fkey" TO "mantenimiento_equipo_herramientas_usuario_id_fkey";

ALTER INDEX "public"."bitacora_mantenimiento_equipos_folio_key"
  RENAME TO "mantenimiento_equipo_herramientas_folio_key";

ALTER INDEX "public"."bitacora_mantenimiento_equipos_fecha_mantenimiento_idx"
  RENAME TO "mantenimiento_equipo_herramientas_fecha_mantenimiento_idx";

ALTER INDEX "public"."bitacora_mantenimiento_equipos_usuario_id_idx"
  RENAME TO "mantenimiento_equipo_herramientas_usuario_id_idx";
