-- AlterTable
ALTER TABLE "public"."insumos" ADD COLUMN "pileta_id" INTEGER;

-- CreateIndex
CREATE INDEX "insumos_pileta_id_idx" ON "public"."insumos"("pileta_id");

-- AddForeignKey
ALTER TABLE "public"."insumos" ADD CONSTRAINT "insumos_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
