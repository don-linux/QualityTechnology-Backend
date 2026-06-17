-- AlterTable
ALTER TABLE "public"."insumos" ADD COLUMN "tipo_movimiento" VARCHAR(10) NOT NULL DEFAULT 'ingreso';

-- Backfill: egresos vinculados a pileta antes del campo explicito
UPDATE "public"."insumos" SET "tipo_movimiento" = 'egreso' WHERE "pileta_id" IS NOT NULL;
