-- Rename table fauna_nociva -> control_fauna_nociva (PostgreSQL renames indexes/constraints automatically)
ALTER TABLE "public"."fauna_nociva" RENAME TO "control_fauna_nociva";

-- Update security module registry
UPDATE "public"."modulos"
SET "nombre" = 'Control de Fauna Nociva', "ruta" = '/control-fauna-nociva'
WHERE "ruta" = '/fauna-nociva';
