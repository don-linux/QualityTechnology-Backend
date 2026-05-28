-- CreateTable
CREATE TABLE "catalogos"."estado_conservacion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "estado_conservacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estado_conservacion_nombre_key" ON "catalogos"."estado_conservacion"("nombre");

-- AlterTable
ALTER TABLE "public"."piletas" ADD COLUMN "estado_conservacion_id" INTEGER;

-- CreateIndex
CREATE INDEX "piletas_estado_conservacion_id_idx" ON "public"."piletas"("estado_conservacion_id");

-- AddForeignKey
ALTER TABLE "public"."piletas" ADD CONSTRAINT "piletas_estado_conservacion_id_fkey" FOREIGN KEY ("estado_conservacion_id") REFERENCES "catalogos"."estado_conservacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed inicial
INSERT INTO "catalogos"."estado_conservacion" ("nombre", "esta_activo", "updated_at")
VALUES
    ('Excelente', true, CURRENT_TIMESTAMP),
    ('Bueno', true, CURRENT_TIMESTAMP),
    ('Regular', true, CURRENT_TIMESTAMP),
    ('Malo', true, CURRENT_TIMESTAMP),
    ('En reparación', true, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;
