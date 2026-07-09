-- Renombrar dominio Pileta/piletas → InfraestructuraFisica/infraestructura_fisica

-- Paso 1: Enums
ALTER TYPE "public"."PiletaEstado" RENAME TO "InfraestructuraFisicaEstado";
ALTER TYPE "public"."PiletaTipo" RENAME TO "InfraestructuraFisicaTipo";

-- Paso 2: Catálogo tipo_pileta
ALTER TABLE "catalogos"."tipo_pileta" RENAME TO "tipo_infraestructura_fisica";
ALTER INDEX "catalogos"."tipo_pileta_pkey" RENAME TO "tipo_infraestructura_fisica_pkey";
ALTER INDEX "catalogos"."tipo_pileta_nombre_key" RENAME TO "tipo_infraestructura_fisica_nombre_key";

-- Paso 3: Tabla principal piletas
ALTER TABLE "public"."piletas" RENAME TO "infraestructura_fisica";

ALTER INDEX "public"."piletas_pkey" RENAME TO "infraestructura_fisica_pkey";
ALTER INDEX "public"."piletas_estado_idx" RENAME TO "infraestructura_fisica_estado_idx";
ALTER INDEX "public"."piletas_nombre_ubicacion_id_key" RENAME TO "infraestructura_fisica_nombre_ubicacion_id_key";
ALTER INDEX "public"."piletas_tipo_idx" RENAME TO "infraestructura_fisica_tipo_idx";
ALTER INDEX "public"."piletas_ubicacion_id_idx" RENAME TO "infraestructura_fisica_ubicacion_id_idx";

ALTER TABLE "public"."infraestructura_fisica" RENAME CONSTRAINT "piletas_ubicacion_id_fkey"
  TO "infraestructura_fisica_ubicacion_id_fkey";

-- Paso 4: FK catálogo en tabla principal
ALTER TABLE "public"."infraestructura_fisica" RENAME COLUMN "tipo_pileta_id" TO "tipo_infraestructura_fisica_id";
ALTER INDEX "public"."piletas_tipo_pileta_id_idx" RENAME TO "infraestructura_fisica_tipo_infraestructura_fisica_id_idx";
ALTER TABLE "public"."infraestructura_fisica" RENAME CONSTRAINT "piletas_tipo_pileta_id_fkey"
  TO "infraestructura_fisica_tipo_infraestructura_fisica_id_fkey";

-- Paso 5: Tablas dependientes

-- alevinaje
ALTER TABLE "public"."alevinaje" RENAME COLUMN "pileta_id" TO "infraestructura_fisica_id";
ALTER INDEX "public"."alevinaje_pileta_id_idx" RENAME TO "alevinaje_infraestructura_fisica_id_idx";
ALTER TABLE "public"."alevinaje" RENAME CONSTRAINT "alevinaje_pileta_id_fkey"
  TO "alevinaje_infraestructura_fisica_id_fkey";

-- alimentacion
ALTER TABLE "public"."alimentacion" RENAME COLUMN "pileta_id" TO "infraestructura_fisica_id";
ALTER TABLE "public"."alimentacion" RENAME CONSTRAINT "alimentacion_pileta_id_fkey"
  TO "alimentacion_infraestructura_fisica_id_fkey";

-- biometrias
ALTER TABLE "public"."biometrias" RENAME COLUMN "pileta_id" TO "infraestructura_fisica_id";
ALTER INDEX "public"."biometrias_pileta_id_idx" RENAME TO "biometrias_infraestructura_fisica_id_idx";
ALTER TABLE "public"."biometrias" RENAME CONSTRAINT "biometrias_pileta_id_fkey"
  TO "biometrias_infraestructura_fisica_id_fkey";

-- engorda
ALTER TABLE "public"."engorda" RENAME COLUMN "pileta_id" TO "infraestructura_fisica_id";
ALTER INDEX "public"."engorda_pileta_id_idx" RENAME TO "engorda_infraestructura_fisica_id_idx";
ALTER TABLE "public"."engorda" RENAME CONSTRAINT "engorda_pileta_id_fkey"
  TO "engorda_infraestructura_fisica_id_fkey";

-- inventario_alevines
ALTER TABLE "public"."inventario_alevines" RENAME COLUMN "pileta_id" TO "infraestructura_fisica_id";
ALTER INDEX "public"."inventario_alevines_pileta_id_idx" RENAME TO "inventario_alevines_infraestructura_fisica_id_idx";
ALTER TABLE "public"."inventario_alevines" RENAME CONSTRAINT "inventario_alevines_pileta_id_fkey"
  TO "inventario_alevines_infraestructura_fisica_id_fkey";

-- reproductores
ALTER TABLE "public"."reproductores" RENAME COLUMN "pileta_id" TO "infraestructura_fisica_id";
ALTER INDEX "public"."reproductores_pileta_id_idx" RENAME TO "reproductores_infraestructura_fisica_id_idx";
ALTER INDEX "public"."reproductores_pileta_id_activo_idx" RENAME TO "reproductores_infraestructura_fisica_id_activo_idx";
ALTER TABLE "public"."reproductores" RENAME CONSTRAINT "reproductores_pileta_id_fkey"
  TO "reproductores_infraestructura_fisica_id_fkey";

-- evento_cosecha
ALTER TABLE "public"."evento_cosecha" RENAME COLUMN "pileta_id" TO "infraestructura_fisica_id";
ALTER INDEX "public"."evento_cosecha_pileta_id_idx" RENAME TO "evento_cosecha_infraestructura_fisica_id_idx";
ALTER TABLE "public"."evento_cosecha" RENAME CONSTRAINT "evento_cosecha_pileta_id_fkey"
  TO "evento_cosecha_infraestructura_fisica_id_fkey";

-- eficiencia_reproductiva
ALTER TABLE "public"."eficiencia_reproductiva" RENAME COLUMN "pileta_id" TO "infraestructura_fisica_id";
ALTER TABLE "public"."eficiencia_reproductiva" RENAME COLUMN "pileta_origen_id" TO "infraestructura_fisica_origen_id";
ALTER TABLE "public"."eficiencia_reproductiva" RENAME COLUMN "dias_en_pileta" TO "dias_en_infraestructura_fisica";
ALTER INDEX "public"."eficiencia_reproductiva_pileta_id_idx" RENAME TO "eficiencia_reproductiva_infraestructura_fisica_id_idx";
ALTER INDEX "public"."eficiencia_reproductiva_pileta_id_lote_key" RENAME TO "eficiencia_reproductiva_infraestructura_fisica_id_lote_key";
ALTER INDEX "public"."eficiencia_reproductiva_pileta_origen_id_idx" RENAME TO "eficiencia_reproductiva_infraestructura_fisica_origen_id_idx";
ALTER TABLE "public"."eficiencia_reproductiva" RENAME CONSTRAINT "eficiencia_reproductiva_pileta_id_fkey"
  TO "eficiencia_reproductiva_infraestructura_fisica_id_fkey";
ALTER TABLE "public"."eficiencia_reproductiva" RENAME CONSTRAINT "eficiencia_reproductiva_pileta_origen_id_fkey"
  TO "eficiencia_reproductiva_infraestructura_fisica_origen_id_fkey";

-- lista_espera
ALTER TABLE "public"."lista_espera" RENAME COLUMN "pileta_origen_id" TO "infraestructura_fisica_origen_id";
ALTER INDEX "public"."lista_espera_pileta_origen_id_idx" RENAME TO "lista_espera_infraestructura_fisica_origen_id_idx";
ALTER TABLE "public"."lista_espera" RENAME CONSTRAINT "lista_espera_pileta_origen_id_fkey"
  TO "lista_espera_infraestructura_fisica_origen_id_fkey";

-- observacion
ALTER TABLE "public"."observacion" RENAME COLUMN "pileta_id" TO "infraestructura_fisica_id";
ALTER INDEX "public"."observacion_pileta_id_created_at_idx" RENAME TO "observacion_infraestructura_fisica_id_created_at_idx";
ALTER TABLE "public"."observacion" RENAME CONSTRAINT "observacion_pileta_id_fkey"
  TO "observacion_infraestructura_fisica_id_fkey";

-- parametros_fisico_quimicos
ALTER TABLE "public"."parametros_fisico_quimicos" RENAME COLUMN "pileta_id" TO "infraestructura_fisica_id";
ALTER INDEX "public"."parametros_fisico_quimicos_pileta_id_idx" RENAME TO "parametros_fisico_quimicos_infraestructura_fisica_id_idx";
ALTER TABLE "public"."parametros_fisico_quimicos" RENAME CONSTRAINT "parametros_fisico_quimicos_pileta_id_fkey"
  TO "parametros_fisico_quimicos_infraestructura_fisica_id_fkey";

-- recambios
ALTER TABLE "public"."recambios" RENAME COLUMN "pileta_id" TO "infraestructura_fisica_id";
ALTER TABLE "public"."recambios" RENAME CONSTRAINT "recambios_pileta_id_fkey"
  TO "recambios_infraestructura_fisica_id_fkey";

-- siembra (columnas sin sufijo _id)
ALTER TABLE "public"."siembra" RENAME COLUMN "pileta_origen" TO "infraestructura_fisica_origen";
ALTER TABLE "public"."siembra" RENAME COLUMN "pileta_destino" TO "infraestructura_fisica_destino";
ALTER INDEX "public"."siembra_pileta_origen_idx" RENAME TO "siembra_infraestructura_fisica_origen_idx";
ALTER INDEX "public"."siembra_pileta_destino_idx" RENAME TO "siembra_infraestructura_fisica_destino_idx";
ALTER TABLE "public"."siembra" RENAME CONSTRAINT "siembra_pileta_origen_fkey"
  TO "siembra_infraestructura_fisica_origen_fkey";
ALTER TABLE "public"."siembra" RENAME CONSTRAINT "siembra_pileta_destino_fkey"
  TO "siembra_infraestructura_fisica_destino_fkey";

-- Paso 6: RBAC (limpiar duplicados de intentos previos antes de renombrar rutas)
DELETE FROM "public"."roles_modulos" rm
USING "public"."modulos" m
WHERE rm.modulo_id = m.id
  AND m.ruta = '/infraestructura-fisica'
  AND EXISTS (SELECT 1 FROM "public"."modulos" WHERE ruta = '/piletas');

DELETE FROM "public"."modulos"
WHERE ruta = '/infraestructura-fisica'
  AND EXISTS (SELECT 1 FROM "public"."modulos" WHERE ruta = '/piletas');

DELETE FROM "public"."roles_modulos" rm
USING "public"."modulos" m
WHERE rm.modulo_id = m.id
  AND m.ruta = '/tipos-infraestructura-fisica'
  AND EXISTS (SELECT 1 FROM "public"."modulos" WHERE ruta = '/tipos-pileta');

DELETE FROM "public"."modulos"
WHERE ruta = '/tipos-infraestructura-fisica'
  AND EXISTS (SELECT 1 FROM "public"."modulos" WHERE ruta = '/tipos-pileta');

UPDATE "public"."modulos"
SET "nombre" = 'Infraestructura Física', "ruta" = '/infraestructura-fisica'
WHERE "ruta" = '/piletas';

UPDATE "public"."modulos"
SET "nombre" = 'Tipos de infraestructura física', "ruta" = '/tipos-infraestructura-fisica'
WHERE "ruta" = '/tipos-pileta';
