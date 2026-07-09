-- CreateTable
CREATE TABLE "catalogos"."tipo_instancia_pileta" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "tipo_instancia_pileta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_instancia_pileta_nombre_key" ON "catalogos"."tipo_instancia_pileta"("nombre");

-- AlterTable
ALTER TABLE "public"."piletas" ADD COLUMN "tipo_instancia" INTEGER;

-- CreateIndex
CREATE INDEX "piletas_tipo_instancia_idx" ON "public"."piletas"("tipo_instancia");

-- AddForeignKey
ALTER TABLE "public"."piletas" ADD CONSTRAINT "piletas_tipo_instancia_fkey" FOREIGN KEY ("tipo_instancia") REFERENCES "catalogos"."tipo_instancia_pileta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed inicial
INSERT INTO "catalogos"."tipo_instancia_pileta" ("nombre", "esta_activo", "updated_at")
VALUES
    ('Piscina', true, CURRENT_TIMESTAMP),
    ('Estanque', true, CURRENT_TIMESTAMP),
    ('Sanja', true, CURRENT_TIMESTAMP),
    ('Cubeta', true, CURRENT_TIMESTAMP),
    ('Hoya de presión', true, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;
