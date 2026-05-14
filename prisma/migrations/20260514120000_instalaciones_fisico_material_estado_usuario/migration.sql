-- AlterTable
ALTER TABLE "public"."instalaciones" ADD COLUMN "largo" DECIMAL(10,2),
ADD COLUMN "ancho" DECIMAL(10,2),
ADD COLUMN "altura" DECIMAL(10,2),
ADD COLUMN "material" VARCHAR(100),
ADD COLUMN "estado" VARCHAR(20) NOT NULL DEFAULT 'vacia',
ADD COLUMN "usuario_id" INTEGER;

-- CreateIndex
CREATE INDEX "instalaciones_usuario_id_idx" ON "public"."instalaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "instalaciones_estado_idx" ON "public"."instalaciones"("estado");

-- AddForeignKey
ALTER TABLE "public"."instalaciones"
  ADD CONSTRAINT "instalaciones_usuario_id_fkey"
  FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
