-- DropForeignKey
ALTER TABLE "siembra" DROP CONSTRAINT "siembra_pileta_destino_fkey";

-- AlterTable
ALTER TABLE "control_reproductivo" RENAME CONSTRAINT "alevinaje_old_pkey" TO "control_reproductivo_pkey";

-- AlterTable
ALTER TABLE "engorda" ALTER COLUMN "cantidad_total" SET DEFAULT 0;

-- RenameForeignKey
ALTER TABLE "control_reproductivo" RENAME CONSTRAINT "alevinaje_old_biometria_id_fkey" TO "control_reproductivo_biometria_id_fkey";

-- RenameForeignKey
ALTER TABLE "control_reproductivo" RENAME CONSTRAINT "alevinaje_old_observacion_id_fkey" TO "control_reproductivo_observacion_id_fkey";

-- RenameForeignKey
ALTER TABLE "control_reproductivo" RENAME CONSTRAINT "alevinaje_old_pileta_id_fkey" TO "control_reproductivo_pileta_id_fkey";

-- RenameForeignKey
ALTER TABLE "control_reproductivo" RENAME CONSTRAINT "alevinaje_old_pileta_origen_reproductora_id_fkey" TO "control_reproductivo_pileta_origen_reproductora_id_fkey";

-- RenameForeignKey
ALTER TABLE "control_reproductivo" RENAME CONSTRAINT "alevinaje_old_siembra_origen_id_fkey" TO "control_reproductivo_siembra_origen_id_fkey";

-- RenameForeignKey
ALTER TABLE "control_reproductivo" RENAME CONSTRAINT "alevinaje_old_usuario_id_fkey" TO "control_reproductivo_usuario_id_fkey";

-- AddForeignKey
ALTER TABLE "siembra" ADD CONSTRAINT "siembra_pileta_destino_fkey" FOREIGN KEY ("pileta_destino") REFERENCES "piletas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "alevinaje_old_fecha_idx" RENAME TO "control_reproductivo_fecha_idx";

-- RenameIndex
ALTER INDEX "alevinaje_old_lote_idx" RENAME TO "control_reproductivo_lote_idx";

-- RenameIndex
ALTER INDEX "alevinaje_old_pileta_id_lote_key" RENAME TO "control_reproductivo_pileta_id_lote_key";

-- RenameIndex
ALTER INDEX "alevinaje_old_pileta_origen_reproductora_id_idx" RENAME TO "control_reproductivo_pileta_origen_reproductora_id_idx";
