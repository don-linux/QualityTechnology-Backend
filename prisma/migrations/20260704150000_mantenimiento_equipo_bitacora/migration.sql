-- DropTable
DROP TABLE IF EXISTS "public"."mantenimientos";

-- CreateTable
CREATE TABLE "public"."bitacora_mantenimiento_equipos" (
    "id" SERIAL NOT NULL,
    "folio" VARCHAR(20) NOT NULL,
    "fecha_mantenimiento" DATE NOT NULL,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "bitacora_mantenimiento_equipos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bitacora_mantenimiento_equipos_folio_key" ON "public"."bitacora_mantenimiento_equipos"("folio");

-- CreateIndex
CREATE INDEX "bitacora_mantenimiento_equipos_fecha_mantenimiento_idx" ON "public"."bitacora_mantenimiento_equipos"("fecha_mantenimiento" DESC);

-- CreateIndex
CREATE INDEX "bitacora_mantenimiento_equipos_usuario_id_idx" ON "public"."bitacora_mantenimiento_equipos"("usuario_id");

-- AddForeignKey
ALTER TABLE "public"."bitacora_mantenimiento_equipos" ADD CONSTRAINT "bitacora_mantenimiento_equipos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
