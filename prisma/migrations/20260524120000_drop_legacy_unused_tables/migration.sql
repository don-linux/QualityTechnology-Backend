-- Remove unused public tables (replaced by piletas fisicas + alevinaje)
DROP TABLE IF EXISTS "public"."lotes" CASCADE;
DROP TABLE IF EXISTS "public"."instalaciones" CASCADE;

-- Legacy RRHH / catalogos (superseded by public.empleados, public.departamentos, etc.)
DROP TABLE IF EXISTS "rrhh"."empleados" CASCADE;
DROP TABLE IF EXISTS "rrhh"."departamentos" CASCADE;
DROP TABLE IF EXISTS "catalogos"."estados" CASCADE;

-- Legacy seguridad (superseded by public.modulos, public.refresh_tokens, public.roles_modulos)
DROP TABLE IF EXISTS "seguridad"."roles_modulos" CASCADE;
DROP TABLE IF EXISTS "seguridad"."refresh_tokens" CASCADE;
DROP TABLE IF EXISTS "seguridad"."modulos" CASCADE;

DROP SCHEMA IF EXISTS "rrhh" CASCADE;
DROP SCHEMA IF EXISTS "seguridad" CASCADE;
