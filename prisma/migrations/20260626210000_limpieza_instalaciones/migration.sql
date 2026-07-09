-- Drop legacy recambios module
DROP TABLE IF EXISTS "public"."recambios" CASCADE;

-- Enum for cleaning type
CREATE TYPE "public"."TipoLimpiezaInstalacion" AS ENUM ('desinfeccion', 'recambio');

-- New limpieza_instalaciones table
CREATE TABLE "public"."limpieza_instalaciones" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "infraestructura_fisica_id" INTEGER NOT NULL,
    "tipo_limpieza" "public"."TipoLimpiezaInstalacion" NOT NULL,
    "porcentaje_recambio_agua" DECIMAL(5,2),
    "desinfectante_utilizado" VARCHAR(500) NOT NULL,
    "encargado" VARCHAR(120) NOT NULL,
    "observacion_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "limpieza_instalaciones_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "limpieza_instalaciones_ubicacion_id_idx" ON "public"."limpieza_instalaciones"("ubicacion_id");
CREATE INDEX "limpieza_instalaciones_infraestructura_fisica_id_idx" ON "public"."limpieza_instalaciones"("infraestructura_fisica_id");
CREATE INDEX "limpieza_instalaciones_usuario_id_idx" ON "public"."limpieza_instalaciones"("usuario_id");
CREATE INDEX "limpieza_instalaciones_fecha_idx" ON "public"."limpieza_instalaciones"("fecha" DESC);

ALTER TABLE "public"."limpieza_instalaciones" ADD CONSTRAINT "limpieza_instalaciones_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."limpieza_instalaciones" ADD CONSTRAINT "limpieza_instalaciones_infraestructura_fisica_id_fkey" FOREIGN KEY ("infraestructura_fisica_id") REFERENCES "public"."infraestructura_fisica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."limpieza_instalaciones" ADD CONSTRAINT "limpieza_instalaciones_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."limpieza_instalaciones" ADD CONSTRAINT "limpieza_instalaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update RBAC module entry in-place
UPDATE "public"."modulos"
SET "nombre" = 'Limpieza y desinfeccion de instalaciones',
    "ruta" = '/limpieza-instalaciones'
WHERE "ruta" = '/recambios';
