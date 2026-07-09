-- Remove Ingresos / Egresos de Insumos module
DELETE FROM "public"."roles_modulos"
WHERE "modulo_id" IN (SELECT "id" FROM "public"."modulos" WHERE "ruta" = '/insumos');

DELETE FROM "public"."modulos" WHERE "ruta" = '/insumos';

DROP TABLE IF EXISTS "public"."insumos" CASCADE;
