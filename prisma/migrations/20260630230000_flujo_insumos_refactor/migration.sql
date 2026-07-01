-- Refactor: Recepcion de Insumos -> Flujo de insumos
-- Reemplaza la tabla estatica recepcion_insumos por el modulo dinamico flujo_insumos.

-- Drop legacy recepcion de insumos table (no se conservan datos)
DROP TABLE IF EXISTS "public"."recepcion_insumos" CASCADE;

-- Enums: tipo de movimiento y sentido del traspaso
CREATE TYPE "public"."TipoMovimientoInsumo" AS ENUM ('ingreso', 'egreso', 'traspaso');
CREATE TYPE "public"."TraspasoSentido" AS ENUM ('salida', 'entrada');

-- New flujo_insumos table
CREATE TABLE "public"."flujo_insumos" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "tipo_movimiento" "public"."TipoMovimientoInsumo" NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "insumo_id" INTEGER,
    "destino" VARCHAR(150),
    "responsable" VARCHAR(100),
    "ubicacion_salida_id" INTEGER,
    "ubicacion_entrada_id" INTEGER,
    "traspaso_sentido" "public"."TraspasoSentido",
    "traspaso_grupo_id" VARCHAR(40),
    "observacion_id" INTEGER,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "flujo_insumos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "flujo_insumos_ubicacion_id_idx" ON "public"."flujo_insumos"("ubicacion_id");
CREATE INDEX "flujo_insumos_usuario_id_idx" ON "public"."flujo_insumos"("usuario_id");
CREATE INDEX "flujo_insumos_codigo_idx" ON "public"."flujo_insumos"("codigo");
CREATE INDEX "flujo_insumos_traspaso_grupo_id_idx" ON "public"."flujo_insumos"("traspaso_grupo_id");

-- Folio unico para ingreso/egreso; los traspasos comparten folio entre su par de
-- filas (salida + entrada), por eso el indice unico excluye el tipo 'traspaso'.
CREATE UNIQUE INDEX "flujo_insumos_codigo_no_traspaso_key"
  ON "public"."flujo_insumos"("codigo")
  WHERE "tipo_movimiento" <> 'traspaso';

ALTER TABLE "public"."flujo_insumos" ADD CONSTRAINT "flujo_insumos_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."flujo_insumos" ADD CONSTRAINT "flujo_insumos_ubicacion_salida_id_fkey" FOREIGN KEY ("ubicacion_salida_id") REFERENCES "public"."ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."flujo_insumos" ADD CONSTRAINT "flujo_insumos_ubicacion_entrada_id_fkey" FOREIGN KEY ("ubicacion_entrada_id") REFERENCES "public"."ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."flujo_insumos" ADD CONSTRAINT "flujo_insumos_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "catalogos"."insumos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."flujo_insumos" ADD CONSTRAINT "flujo_insumos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."flujo_insumos" ADD CONSTRAINT "flujo_insumos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update RBAC module entry in-place
UPDATE "public"."modulos"
SET "nombre" = 'Flujo de insumos',
    "ruta" = '/flujo_insumos'
WHERE "ruta" = '/recepcion_insumos';
