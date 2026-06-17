-- CreateTable
CREATE TABLE "public"."ciclos_engorda" (
    "id" SERIAL NOT NULL,
    "pileta_id" INTEGER NOT NULL,
    "siembra_ingreso_id" INTEGER,
    "fecha_inicio" DATE NOT NULL,
    "fecha_cierre" DATE,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',
    "cantidad_inicial" INTEGER NOT NULL DEFAULT 0,
    "lote" VARCHAR(60),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ciclos_engorda_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "public"."engorda" ADD COLUMN "ciclo_id" INTEGER;

-- CreateIndex
CREATE INDEX "ciclos_engorda_pileta_id_idx" ON "public"."ciclos_engorda"("pileta_id");
CREATE INDEX "ciclos_engorda_estado_idx" ON "public"."ciclos_engorda"("estado");
CREATE INDEX "engorda_ciclo_id_idx" ON "public"."engorda"("ciclo_id");

-- AddForeignKey
ALTER TABLE "public"."ciclos_engorda" ADD CONSTRAINT "ciclos_engorda_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."ciclos_engorda" ADD CONSTRAINT "ciclos_engorda_siembra_ingreso_id_fkey" FOREIGN KEY ("siembra_ingreso_id") REFERENCES "public"."siembra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."engorda" ADD CONSTRAINT "engorda_ciclo_id_fkey" FOREIGN KEY ("ciclo_id") REFERENCES "public"."ciclos_engorda"("id") ON DELETE SET NULL ON UPDATE CASCADE;
