-- Rename table visitas -> control_visitas (PostgreSQL renames indexes/constraints automatically)
ALTER TABLE "public"."visitas" RENAME TO "control_visitas";

-- Update security module registry
UPDATE "public"."modulos"
SET "nombre" = 'Control de Visitas', "ruta" = '/control-visitas'
WHERE "ruta" = '/visitas';
