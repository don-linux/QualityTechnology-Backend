/*
  Warnings:

  - A unique constraint covering the columns `[biometria_id]` on the table `observacion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "alevinaje" ADD COLUMN     "siembra_origen_id" INTEGER;

-- AlterTable
ALTER TABLE "observacion" ADD COLUMN     "biometria_id" INTEGER,
ADD COLUMN     "pileta_id" INTEGER,
ADD COLUMN     "proceso" VARCHAR(80);

-- CreateIndex
CREATE UNIQUE INDEX "observacion_biometria_id_key" ON "observacion"("biometria_id");

-- CreateIndex
CREATE INDEX "observacion_pileta_id_created_at_idx" ON "observacion"("pileta_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "alevinaje" ADD CONSTRAINT "alevinaje_siembra_origen_id_fkey" FOREIGN KEY ("siembra_origen_id") REFERENCES "siembra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observacion" ADD CONSTRAINT "observacion_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "piletas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observacion" ADD CONSTRAINT "observacion_biometria_id_fkey" FOREIGN KEY ("biometria_id") REFERENCES "biometrias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
