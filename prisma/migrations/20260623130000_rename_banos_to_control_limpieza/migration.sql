-- Rename table banos -> control_limpieza (PostgreSQL renames indexes/constraints automatically)
ALTER TABLE "public"."banos" RENAME TO "control_limpieza";

ALTER TABLE "public"."control_limpieza" RENAME COLUMN "tipo_banio" TO "tipo_instalacion";

ALTER TABLE "public"."control_limpieza" DROP COLUMN "regadera";

UPDATE "public"."control_limpieza"
SET "tipo_instalacion" = CASE
  WHEN "tipo_instalacion" = 'Hombre' THEN 'Baño de Hombres'
  WHEN "tipo_instalacion" = 'Mujer' THEN 'Baño de Mujeres'
  ELSE "tipo_instalacion"
END;

UPDATE "public"."modulos"
SET "nombre" = 'Control de Limpieza', "ruta" = '/control-limpieza'
WHERE "ruta" = '/banos';
